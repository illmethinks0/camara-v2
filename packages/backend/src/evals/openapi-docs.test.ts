import { afterAll, beforeAll, describe, expect, it } from 'vitest';
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

  it('serves OpenAPI JSON', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/v1/docs/json' });
    expect(response.statusCode).toBe(200);

    const body = JSON.parse(response.body);
    expect(body.openapi).toBeDefined();
    expect(body.paths).toBeDefined();
  });

  it('documents core CAMARA routes', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/v1/docs/json' });
    const body = JSON.parse(response.body);
    const paths: string[] = Object.keys(body.paths);

    expect(paths.some((path) => path.startsWith('/api/v1/auth/login'))).toBe(true);
    expect(paths.some((path) => path.startsWith('/api/v1/participants'))).toBe(true);
    expect(paths.some((path) => path.startsWith('/api/v1/annexes/batch-export'))).toBe(true);
    expect(paths.some((path) => path.startsWith('/api/v1/dashboards/admin'))).toBe(true);
  });

  it('serves Swagger UI', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/v1/docs' });
    expect([200, 302]).toContain(response.statusCode);
  });
});
