import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createApp } from '../index.js';
import { prisma } from '../adapters/db.js';

describe('HTTP Routes', () => {
  let app: ReturnType<typeof createApp>;

  beforeAll(async () => {
    app = createApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
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
  });

  describe('Auth Routes', () => {
    it('should reject registration with short password', async () => {
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

    it('should register a new user', async () => {
      const email = `test-${Date.now()}@example.com`;
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          email,
          name: 'Test User',
          password: 'SecurePassword123!',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.user).toBeDefined();
      expect(body.accessToken).toBeDefined();
      expect(body.refreshToken).toBeDefined();

      // Cleanup
      await prisma.user.delete({ where: { id: body.user.id } });
    });

    it('should login with valid credentials', async () => {
      // First register
      const email = `test-${Date.now()}@example.com`;
      const registerResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          email,
          name: 'Test User',
          password: 'SecurePassword123!',
        },
      });

      expect(registerResponse.statusCode).toBe(200);

      // Then login
      const loginResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email,
          password: 'SecurePassword123!',
        },
      });

      expect(loginResponse.statusCode).toBe(200);
      const body = JSON.parse(loginResponse.body);
      expect(body.accessToken).toBeDefined();

      // Cleanup
      const registerBody = JSON.parse(registerResponse.body);
      await prisma.user.delete({ where: { id: registerBody.user.id } });
    });
  });

  describe('Task Routes', () => {
    let authToken: string;
    let userId: string;

    beforeAll(async () => {
      // Register and login to get token
      const email = `task-test-${Date.now()}@example.com`;
      const registerResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          email,
          name: 'Task Test User',
          password: 'SecurePassword123!',
        },
      });

      const body = JSON.parse(registerResponse.body);
      authToken = body.accessToken;
      userId = body.user.id;
    });

    afterAll(async () => {
      // Cleanup user
      if (userId) {
        await prisma.user.delete({ where: { id: userId } }).catch(() => {});
      }
    });

    it('should create a task', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/tasks',
        payload: {
          title: 'Test Task',
          description: 'Test Description',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.id).toBeDefined();
      expect(body.title).toBe('Test Task');

      // Cleanup
      await prisma.task.delete({ where: { id: body.id } });
    });

    it('should list tasks', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/tasks',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
    });

    it('should get ready tasks', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/tasks/ready',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
    });
  });
});
