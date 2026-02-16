import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../index.js';

describe('HTTP Routes', () => {
  let app: Awaited<ReturnType<typeof createApp>>;

  beforeAll(async () => {
    app = await createApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns health status', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.status).toBe('ok');
    expect(body.timestamp).toBeDefined();
    expect(body.version).toBeDefined();
  });

  it('rejects registration with invalid payload', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'test@example.com',
        name: 'Test User',
        password: 'short',
      },
    });

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects refresh without token', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/refresh',
      payload: {},
    });

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('requires auth for /auth/me', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
    });

    expect(response.statusCode).toBe(401);
    const body = JSON.parse(response.body);
    expect(body.error.code).toBe('UNAUTHORIZED');
  });
});
