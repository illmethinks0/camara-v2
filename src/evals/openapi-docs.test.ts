import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createApp } from '../index.js';

describe('API Documentation', () => {
  let app: Awaited<ReturnType<typeof createApp>>;

  beforeAll(async () => {
    app = await createApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should serve OpenAPI JSON spec', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/docs/json',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.openapi).toBeDefined();
    expect(body.info).toBeDefined();
    expect(body.paths).toBeDefined();
  });

  it('should serve Swagger UI', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/docs',
    });

    // Swagger UI redirects to index.html (302)
    expect([200, 302]).toContain(response.statusCode);
  });

  it('should document health endpoint', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/docs/json',
    });

    const body = JSON.parse(response.body);
    expect(body.paths['/health']).toBeDefined();
    expect(body.paths['/health'].get).toBeDefined();
  });

  it('should document auth endpoints', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/docs/json',
    });

    const body = JSON.parse(response.body);
    expect(body.paths['/api/v1/auth/register']).toBeDefined();
    expect(body.paths['/api/v1/auth/login']).toBeDefined();
  });

  it('should have paths defined', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/docs/json',
    });

    const body = JSON.parse(response.body);
    expect(body.paths).toBeDefined();
    expect(Object.keys(body.paths).length).toBeGreaterThan(0);
  });
});
