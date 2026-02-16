import { describe, test, expect, beforeEach, afterEach } from 'bun:test';

const BASE_URL = 'http://localhost:3000';

describe('Project API - CRUD Operations', () => {
  let projectIds: number[] = [];

  afterEach(async () => {
    for (const id of projectIds) {
      try {
        await fetch(`${BASE_URL}/api/project/${id}`, { method: 'DELETE' });
      } catch {}
    }
    projectIds = [];
  });

  test('POST /api/project/create - creates project with valid name', async () => {
    const response = await fetch(`${BASE_URL}/api/project/create`, {
      method: 'POST',
      body: new URLSearchParams({ name: 'My Video Project' }),
    });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.message).toBe('Project created successfully');
    expect(data.project).toBeDefined();
    expect(data.project.name).toBe('My Video Project');
    expect(data.project.userId).toBe(1);
    expect(data.project.videoId).toBeNull();
    projectIds.push(data.project.id);
  });

  test('POST /api/project/create - creates multiple projects', async () => {
    const names = ['Project A', 'Project B', 'Project C'];
    
    for (const name of names) {
      const response = await fetch(`${BASE_URL}/api/project/create`, {
        method: 'POST',
        body: new URLSearchParams({ name }),
      });
      expect(response.status).toBe(200);
      const data = await response.json();
      projectIds.push(data.project.id);
    }

    const listResponse = await fetch(`${BASE_URL}/api/project`);
    const projects = await listResponse.json();
    
    for (const name of names) {
      expect(projects.some((p: any) => p.name === name)).toBe(true);
    }
  });

  test('GET /api/project - returns all projects for user', async () => {
    const response = await fetch(`${BASE_URL}/api/project`);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThanOrEqual(0);
  });

  test('GET /api/project - projects have correct structure', async () => {
    const response = await fetch(`${BASE_URL}/api/project/create`, {
      method: 'POST',
      body: new URLSearchParams({ name: 'Structure Test' }),
    });
    const created = await response.json();
    projectIds.push(created.project.id);

    const listResponse = await fetch(`${BASE_URL}/api/project`);
    const projects = await listResponse.json();
    const project = projects.find((p: any) => p.id === created.project.id);
    
    expect(project).toBeDefined();
    expect(typeof project.id).toBe('number');
    expect(typeof project.name).toBe('string');
    expect(typeof project.userId).toBe('number');
    expect(project.video).toBeNull();
  });

  test('DELETE /api/project/:id - returns success message', async () => {
    const createResponse = await fetch(`${BASE_URL}/api/project/create`, {
      method: 'POST',
      body: new URLSearchParams({ name: 'To Delete' }),
    });
    const { project } = await createResponse.json();

    const deleteResponse = await fetch(`${BASE_URL}/api/project/${project.id}`, {
      method: 'DELETE',
    });
    expect(deleteResponse.status).toBe(200);
    const data = await deleteResponse.json();
    expect(data.message).toBe('Project deleted successfully');
  });

  test('DELETE /api/project/:id - deleted project not in list', async () => {
    const createResponse = await fetch(`${BASE_URL}/api/project/create`, {
      method: 'POST',
      body: new URLSearchParams({ name: 'Temp Project' }),
    });
    const { project } = await createResponse.json();

    await fetch(`${BASE_URL}/api/project/${project.id}`, { method: 'DELETE' });

    const listResponse = await fetch(`${BASE_URL}/api/project`);
    const projects = await listResponse.json();
    expect(projects.find((p: any) => p.id === project.id)).toBeUndefined();
  });

  test('DELETE /api/project/:id - deleting non-existent returns 200', async () => {
    const response = await fetch(`${BASE_URL}/api/project/99999`, {
      method: 'DELETE',
    });
    expect(response.status).toBe(200);
  });
});

describe('Project API - Input Validation', () => {
  test('POST /api/project/create - rejects empty name', async () => {
    const response = await fetch(`${BASE_URL}/api/project/create`, {
      method: 'POST',
      body: new URLSearchParams({ name: '' }),
    });
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Name is required');
  });

  test('POST /api/project/create - rejects missing name', async () => {
    const response = await fetch(`${BASE_URL}/api/project/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({}),
    });
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Name is required');
  });

  test('POST /api/project/create - handles special characters', async () => {
    const specialNames = [
      'Project with spaces',
      'Project-with-dashes',
      'Project_underscores',
      'Project & Ampersand',
    ];

    for (const name of specialNames) {
      const response = await fetch(`${BASE_URL}/api/project/create`, {
        method: 'POST',
        body: new URLSearchParams({ name }),
      });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.project.name).toBe(name);
      
      await fetch(`${BASE_URL}/api/project/${data.project.id}`, { method: 'DELETE' });
    }
  }, 10000);

  test('POST /api/project/create - handles very long name', async () => {
    const longName = 'A'.repeat(1000);
    const response = await fetch(`${BASE_URL}/api/project/create`, {
      method: 'POST',
      body: new URLSearchParams({ name: longName }),
    });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.project.name).toBe(longName);
    
    await fetch(`${BASE_URL}/api/project/${data.project.id}`, { method: 'DELETE' });
  });
});

describe('Video API', () => {
  test('GET /api/video/:id - non-existent video returns 404', async () => {
    const response = await fetch(`${BASE_URL}/api/video/999999`);
    expect(response.status).toBe(404);
  });

  test('GET /api/video/:id - invalid id format handled', async () => {
    const response = await fetch(`${BASE_URL}/api/video/abc`);
    expect([400, 404, 500]).toContain(response.status);
  });

  test('GET /api/video/0 - handles zero id', async () => {
    const response = await fetch(`${BASE_URL}/api/video/0`);
    expect([400, 404, 500]).toContain(response.status);
  });

  test('GET /api/video/negative - handles negative id', async () => {
    const response = await fetch(`${BASE_URL}/api/video/-1`);
    expect([400, 404, 500]).toContain(response.status);
  });
});

describe('CORS Headers', () => {
  test('GET request includes CORS headers', async () => {
    const response = await fetch(`${BASE_URL}/api/project`);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Methods')).toBeDefined();
    expect(response.headers.get('Access-Control-Allow-Headers')).toBeDefined();
  });

  test('POST request includes CORS headers', async () => {
    const response = await fetch(`${BASE_URL}/api/project/create`, {
      method: 'POST',
      body: new URLSearchParams({ name: 'CORS Test' }),
    });
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    
    await fetch(`${BASE_URL}/api/project/${(await response.json()).project.id}`, { method: 'DELETE' });
  });

  test('DELETE request includes CORS headers', async () => {
    const createResponse = await fetch(`${BASE_URL}/api/project/create`, {
      method: 'POST',
      body: new URLSearchParams({ name: 'CORS Delete Test' }),
    });
    const { project } = await createResponse.json();
    
    const deleteResponse = await fetch(`${BASE_URL}/api/project/${project.id}`, {
      method: 'DELETE',
    });
    expect(deleteResponse.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });

  test('OPTIONS request returns CORS headers', async () => {
    const response = await fetch(`${BASE_URL}/api/project`, { method: 'OPTIONS' });
    expect(response.status).toBe(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Methods')).toContain('GET');
    expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
    expect(response.headers.get('Access-Control-Allow-Methods')).toContain('DELETE');
    expect(response.headers.get('Access-Control-Allow-Methods')).toContain('OPTIONS');
  });
});

describe('API Content Types', () => {
  test('GET /api/project returns JSON', async () => {
    const response = await fetch(`${BASE_URL}/api/project`);
    expect(response.headers.get('Content-Type')).toBe('application/json');
  });

  test('POST /api/project/create returns JSON', async () => {
    const response = await fetch(`${BASE_URL}/api/project/create`, {
      method: 'POST',
      body: new URLSearchParams({ name: 'Content Type Test' }),
    });
    expect(response.headers.get('Content-Type')).toBe('application/json');
    const data = await response.json();
    expect(data.project).toBeDefined();
    
    await fetch(`${BASE_URL}/api/project/${data.project.id}`, { method: 'DELETE' });
  });

  test('Error responses are JSON', async () => {
    const response = await fetch(`${BASE_URL}/api/project/create`, {
      method: 'POST',
      body: new URLSearchParams({ name: '' }),
    });
    expect(response.headers.get('Content-Type')).toBe('application/json');
    const data = await response.json();
    expect(data.error).toBeDefined();
  });
});

describe('API Error Handling', () => {
  test('Unknown endpoint returns 404', async () => {
    const response = await fetch(`${BASE_URL}/api/unknown`);
    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toBe('Not Found');
  });

  test('Wrong method returns 404', async () => {
    const response = await fetch(`${BASE_URL}/api/project`, {
      method: 'PUT',
    });
    expect(response.status).toBe(404);
  });

  test('Malformed request body handled', async () => {
    const response = await fetch(`${BASE_URL}/api/project/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{ invalid json',
    });
    expect([400, 500]).toContain(response.status);
  });
});

describe('Static Files', () => {
  test('GET / returns index.html', async () => {
    const response = await fetch(`${BASE_URL}/`);
    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toContain('<!DOCTYPE html>');
    expect(text).toContain('<html');
  });

  test('GET /index.html returns HTML', async () => {
    const response = await fetch(`${BASE_URL}/index.html`);
    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toContain('<!DOCTYPE html>');
  });

  test('GET /favicon.ico returns icon', async () => {
    const response = await fetch(`${BASE_URL}/favicon.ico`);
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('image/x-icon');
  });

  test('GET /index.js returns JavaScript', async () => {
    const response = await fetch(`${BASE_URL}/index.js`);
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/javascript');
  });

  test('GET /index.css returns CSS', async () => {
    const response = await fetch(`${BASE_URL}/index.css`);
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/css');
  });

  test('GET /nonexistent returns 404', async () => {
    const response = await fetch(`${BASE_URL}/nonexistent`);
    expect(response.status).toBe(404);
  });
});

describe('Concurrent Operations', () => {
  test('concurrent project creation', async () => {
    const promises = Array.from({ length: 5 }, (_, i) =>
      fetch(`${BASE_URL}/api/project/create`, {
        method: 'POST',
        body: new URLSearchParams({ name: `Concurrent ${i}` }),
      })
    );
    
    const responses = await Promise.all(promises);
    responses.forEach(r => expect(r.status).toBe(200));
    
    const data = await Promise.all(responses.map(r => r.json()));
    const ids = data.map(d => d.project.id);
    
    const listResponse = await fetch(`${BASE_URL}/api/project`);
    const projects = await listResponse.json();
    
    ids.forEach(id => {
      expect(projects.some((p: any) => p.id === id)).toBe(true);
    });
    
    for (const id of ids) {
      await fetch(`${BASE_URL}/api/project/${id}`, { method: 'DELETE' });
    }
  }, 15000);

  test('concurrent project deletion', async () => {
    const ids: number[] = [];
    
    for (let i = 0; i < 3; i++) {
      const response = await fetch(`${BASE_URL}/api/project/create`, {
        method: 'POST',
        body: new URLSearchParams({ name: `Delete Test ${i}` }),
      });
      const data = await response.json();
      ids.push(data.project.id);
    }
    
    const deletePromises = ids.map(id =>
      fetch(`${BASE_URL}/api/project/${id}`, { method: 'DELETE' })
    );
    
    const responses = await Promise.all(deletePromises);
    responses.forEach(r => expect(r.status).toBe(200));
    
    const listResponse = await fetch(`${BASE_URL}/api/project`);
    const projects = await listResponse.json();
    
    ids.forEach(id => {
      expect(projects.some((p: any) => p.id === id)).toBe(false);
    });
  }, 15000);
});
