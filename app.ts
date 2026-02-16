import "./dist/index.html" with { type: "file" };
import "./dist/index.js" with { type: "file" };
import "./dist/index.css" with { type: "file" };
import "./dist/fa-brands-400.ttf" with { type: "file" };
import "./dist/fa-brands-400.woff2" with { type: "file" };
import "./dist/fa-regular-400.ttf" with { type: "file" };
import "./dist/fa-regular-400.woff2" with { type: "file" };
import "./dist/fa-solid-900.ttf" with { type: "file" };
import "./dist/fa-solid-900.woff2" with { type: "file" };
import "./dist/fa-v4compatibility.ttf" with { type: "file" };
import "./dist/fa-v4compatibility.woff2" with { type: "file" };
import "./dist/favicon.ico" with { type: "file" };
import "./dist/android-chrome-192x192.png" with { type: "file" };
import "./dist/android-chrome-512x512.png" with { type: "file" };
import "./dist/apple-touch-icon.png" with { type: "file" };
import "./dist/favicon-16x16.png" with { type: "file" };
import "./dist/favicon-32x32.png" with { type: "file" };
import "./dist/site.webmanifest" with { type: "file" };

import { serve, embeddedFiles } from "bun";
import { Database } from "bun:sqlite";

const db = new Database("cleanedit.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    userId INTEGER DEFAULT 1,
    videoId INTEGER
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fileName TEXT NOT NULL,
    filePath TEXT NOT NULL,
    userId INTEGER DEFAULT 1,
    durationFPS INTEGER NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS tracks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    projectId INTEGER NOT NULL,
    FOREIGN KEY (projectId) REFERENCES projects(id)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS segments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    start REAL NOT NULL,
    end REAL NOT NULL,
    removed INTEGER DEFAULT 0,
    trackId INTEGER NOT NULL,
    FOREIGN KEY (trackId) REFERENCES tracks(id)
  )
`);

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".ico": "image/x-icon",
  ".webmanifest": "application/manifest+json",
};

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const server = serve({
  port: 3000,
  fetch(req) {
    const url = new URL(req.url);
    console.log(`${req.method} ${url.pathname}`);

    if (url.pathname.startsWith("/api/")) {
      return handleApiRequest(req);
    }

    let path = url.pathname;
    if (path === "/") path = "/index.html";

    const cleanPath = path.slice(1);

    for (const blob of embeddedFiles) {
      if (blob.name === cleanPath) {
        const ext = cleanPath.split(".").pop() || "";
        const contentType = MIME_TYPES[`.${ext}`] || "application/octet-stream";
        return new Response(blob, {
          headers: { "Content-Type": contentType },
        });
      }
    }

    return new Response("Not Found", { status: 404 });
  },
});

function handleApiRequest(req: Request): Response {
  const url = new URL(req.url);
  const path = url.pathname;

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    if (path === "/api/project" && req.method === "GET") {
      return getProjects(req);
    }
    if (path === "/api/project/create" && req.method === "POST") {
      return createProject(req);
    }
    if (path.match(/^\/api\/project\/\d+$/) && req.method === "DELETE") {
      const id = path.split("/").pop();
      return deleteProject(req, Number(id));
    }
    if (path === "/api/video/uploadvideo" && req.method === "POST") {
      return uploadVideo(req);
    }
    if (path.match(/^\/api\/video\/\d+$/) && req.method === "GET") {
      const id = path.split("/").pop();
      return getVideo(req, Number(id));
    }
    if (path === "/api/user/login" && req.method === "POST") {
      return login(req);
    }
    if (path === "/api/user/signup" && req.method === "POST") {
      return signup(req);
    }
    if (path === "/api/user/validate-token" && req.method === "POST") {
      return validateToken(req);
    }
  } catch (e) {
    console.error("API Error:", e);
    return jsonResponse({ error: String(e) }, 500);
  }

  return jsonResponse({ error: "Not Found" }, 404);
}

function jsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
    },
  });
}

function login(req: Request): Response {
  return jsonResponse({ token: "dummy-token", username: "user" });
}

function signup(req: Request): Response {
  return jsonResponse({ message: "User registered successfully" });
}

function validateToken(req: Request): Response {
  return jsonResponse({ username: "user" });
}

function getProjects(req: Request): Response {
  const projects = db.query(`
    SELECT p.id, p.name, p.userId, p.videoId, v.id as vid, v.fileName, v.durationFPS,
           t.id as trackId, s.id as segId, s.start, s.end, s.removed
    FROM projects p
    LEFT JOIN videos v ON p.videoId = v.id
    LEFT JOIN tracks t ON t.projectId = p.id
    LEFT JOIN segments s ON s.trackId = t.id
    WHERE p.userId = 1
  `).all();
  
  // Group results by project
  const projectMap = new Map();
  
  for (const row of projects) {
    const pid = row.id;
    if (!projectMap.has(pid)) {
      projectMap.set(pid, {
        id: row.id,
        name: row.name,
        userId: row.userId,
        videoId: row.videoId,
        video: row.fileName ? { id: row.vid, fileName: row.fileName, durationFPS: row.durationFPS } : null,
        tracks: [],
      });
    }
    
    const proj = projectMap.get(pid);
    
    // Add track if not exists
    if (row.trackId !== null) {
      let track = proj.tracks.find((t: any) => t.id === row.trackId);
      if (!track) {
        track = { id: row.trackId, segments: [] };
        proj.tracks.push(track);
      }
      
      // Add segment if not exists
      if (row.segId !== null) {
        const seg = {
          id: row.segId,
          start: row.start,
          end: row.end,
          removed: Boolean(row.removed),
        };
        // Avoid duplicates
        if (!track.segments.find((s: any) => s.id === seg.id)) {
          track.segments.push(seg);
        }
      }
    }
    
    // Ensure at least one empty track for projects without video
    if (proj.tracks.length === 0) {
      proj.tracks = [{ segments: [] }];
    }
  }
  
  return jsonResponse(Array.from(projectMap.values()));
}

async function createProject(req: Request): Response {
  let name = '';
  
  const contentType = req.headers.get('Content-Type') || '';
  
  if (contentType.includes('application/x-www-form-urlencoded')) {
    const formData = await req.formData();
    name = (formData.get("name") as string) || '';
  }

  if (!name || name.trim() === '') {
    return jsonResponse({ error: "Name is required" }, 400);
  }

  const result = db.query(
    "INSERT INTO projects (name, userId) VALUES (?, 1) RETURNING id"
  ).get(name) as { id: number };

  const project = {
    id: result.id,
    name,
    userId: 1,
    videoId: null,
    video: null,
    tracks: [{ segments: [] }],
  };

  return jsonResponse({ message: "Project created successfully", project });
}

function deleteProject(req: Request, id: number): Response {
  db.query("DELETE FROM projects WHERE id = ? AND userId = 1").run(id);
  return jsonResponse({ message: "Project deleted successfully" });
}

async function uploadVideo(req: Request): Response {
  const formData = await req.formData();
  const video = formData.get("video") as File;
  const durationFPS = Number(formData.get("durationFPS"));
  const projectId = Number(formData.get("projectId"));

  if (!video || video.size === 0) {
    return jsonResponse({ error: "Video file is required" }, 400);
  }

  if (!durationFPS || durationFPS <= 0) {
    return jsonResponse({ error: "Invalid duration" }, 400);
  }

  const videosDir = "./videos";
  await Bun.write(`${videosDir}/${video.name}`, video);

  const videoResult = db.query(
    "INSERT INTO videos (fileName, filePath, userId, durationFPS) VALUES (?, ?, 1, ?) RETURNING id"
  ).get(video.name, `${videosDir}/${video.name}`, durationFPS) as { id: number };

  const videoId = videoResult.id;

  const trackResult = db.query(
    "INSERT INTO tracks (projectId) VALUES (?) RETURNING id"
  ).get(projectId) as { id: number };

  const trackId = trackResult.id;

  db.query(
    "INSERT INTO segments (start, end, removed, trackId) VALUES (0, ?, 0, ?)"
  ).run(durationFPS, trackId);

  db.query("UPDATE projects SET videoId = ? WHERE id = ?").run(videoId, projectId);

  // Get the track and segment we just created
  const trackData = db.query(`
    SELECT t.id as trackId, s.id as segId, s.start, s.end, s.removed
    FROM tracks t
    LEFT JOIN segments s ON s.trackId = t.id
    WHERE t.projectId = ?
  `).all(projectId) as any[];

  const tracks: any[] = [];
  for (const row of trackData) {
    let track = tracks.find(t => t.id === row.trackId);
    if (!track) {
      track = { id: row.trackId, segments: [] };
      tracks.push(track);
    }
    if (row.segId !== null) {
      track.segments.push({
        id: row.segId,
        start: row.start,
        end: row.end,
        removed: Boolean(row.removed),
      });
    }
  }
  
  if (tracks.length === 0) {
    tracks.push({ segments: [] });
  }

  const project = db.query(`
    SELECT p.*, v.id as videoId, v.fileName, v.durationFPS
    FROM projects p
    LEFT JOIN videos v ON p.videoId = v.id
    WHERE p.id = ?
  `).get(projectId) as any;

  const responseProject = {
    id: project.id,
    name: project.name,
    userId: project.userId,
    videoId: project.videoId,
    video: project.fileName ? { id: project.videoId, fileName: project.fileName, durationFPS: project.durationFPS } : null,
    tracks,
  };

  return jsonResponse({ project: responseProject });
}

function getVideo(req: Request, id: number): Response {
  const video = db.query(
    "SELECT * FROM videos WHERE id = ? AND userId = 1"
  ).get(id) as { id: number; filePath: string } | undefined;

  if (!video) {
    return jsonResponse({ error: "Video not found" }, 404);
  }

  const file = Bun.file(video.filePath);
  if (!file.exists) {
    return jsonResponse({ error: "Video file not found" }, 404);
  }

  return new Response(file, {
    headers: {
      "Content-Type": "video/mp4",
    },
  });
}

console.log(`Server running at http://localhost:${server.port}`);
