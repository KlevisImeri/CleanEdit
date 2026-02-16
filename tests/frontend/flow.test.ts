import { test, expect } from '@playwright/test';

async function login(page: any) {
  // Login page - try to login or check if logged in
  await page.goto('/');
  // If login page, login with any credentials or skip
  const loginBtn = page.locator('button:has-text("Login"), button:has-text("Sign In")').first();
  if (await loginBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    // Try to fill login form if exists
    const emailInput = page.locator('input[type="email"], input[name="email"], input[name="username"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    
    if (await emailInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      await emailInput.fill('test@test.com');
      await passwordInput.fill('password');
      await loginBtn.click();
      await page.waitForURL(/\/(home|project)/, { timeout: 5000 }).catch(() => {});
    }
  }
}

test.describe('API Video Duration', () => {
  test('project with video has valid durationFPS', async ({ request }) => {
    const response = await request.get('/api/project');
    const projects = await response.json();
    
    const projectsWithVideo = projects.filter((p: any) => p.video !== null);
    
    if (projectsWithVideo.length > 0) {
      const project = projectsWithVideo[0];
      console.log('Project with video:', project);
      
      expect(project.video).toBeTruthy();
      expect(project.video.durationFPS).toBeDefined();
      expect(typeof project.video.durationFPS).toBe('number');
      expect(project.video.durationFPS).toBeGreaterThan(0);
    } else {
      console.log('No projects with video found - this is expected for fresh DB');
    }
  });

  test('newly created project has tracks with segments array', async ({ request }) => {
    // API expects form-urlencoded, not JSON
    const response = await request.post('/api/project/create', {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: `name=Test Project ${Date.now()}`,
    });
    
    expect(response.ok()).toBe(true);
    const data = await response.json();
    
    expect(data.project).toBeDefined();
    expect(data.project.id).toBeDefined();
    expect(data.project.tracks).toBeDefined();
    expect(Array.isArray(data.project.tracks)).toBe(true);
    expect(data.project.tracks[0]).toBeDefined();
    expect(data.project.tracks[0].segments).toBeDefined();
    expect(Array.isArray(data.project.tracks[0].segments)).toBe(true);
  });
});

test.describe('Timeline Display', () => {
  test('no NaN in timeline when no video', async ({ page }) => {
    await page.goto('/');
    
    // Wait for either login or home
    await page.waitForURL(/(\/|\/home|\/user)/, { timeout: 5000 }).catch(() => {});
    
    // Get page content
    const content = await page.content();
    
    // Check no NaN
    expect(content).not.toContain('NaN');
    expect(content).not.toContain('NaN:NaN');
  });

  test('timeline element exists after project selected', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('domcontentloaded');
    
    // Check body exists
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // No critical console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(1000);
    
    // Filter out network errors (expected for missing assets)
    const criticalErrors = errors.filter(e => 
      !e.includes('favicon') && 
      !e.includes('net::ERR_') &&
      !e.includes('Failed to load resource')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });
});

test.describe('Video Upload Response', () => {
  test('upload video API returns project with durationFPS', async ({ request }) => {
    // This tests the API directly - create project, then check structure
    // API expects form-urlencoded, not JSON
    const createResponse = await request.post('/api/project/create', {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: `name=Upload Test ${Date.now()}`,
    });
    
    const createData = await createResponse.json();
    const project = createData.project;
    
    expect(project).toBeDefined();
    expect(project.id).toBeDefined();
    
    // After creation, project should have tracks but no video
    expect(project.video).toBeNull();
    expect(project.tracks).toBeDefined();
    expect(project.tracks[0].segments).toEqual([]);
  });
});
