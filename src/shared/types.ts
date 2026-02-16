export interface Segment {
  id: number;
  start: number;
  end: number;
  removed: boolean;
}

export interface Track {
  segments: Segment[];
}

export interface Video {
  id: number;
  fileName: string;
  durationFPS: number;
}

export interface Project {
  id: number;
  name: string;
  userId?: number;
  videoId?: number;
  video?: Video | null;
  tracks?: Track[];
}

export interface ApiProject {
  Id: number;
  Name: string;
  UserId: number;
  VideoId?: number;
  Video?: { Id: number; FileName: string } | null;
  Tracks?: Track[];
}

export interface CreateProjectResponse {
  message: string;
  project: ApiProject;
}

export interface DeleteProjectResponse {
  message: string;
}

export interface UploadVideoResponse {
  project: ApiProject;
}
