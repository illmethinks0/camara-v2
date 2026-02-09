import { FastifyInstance } from 'fastify';
import { authService, verifyAccessToken } from '../services/auth.js';
import { httpBoundary } from '../adapters/http.js';
import { z } from 'zod';
import rateLimit from '@fastify/rate-limit';

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(12),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const refreshSchema = z.object({
  refreshToken: z.string(),
});

// Auth routes
export async function authRoutes(app: FastifyInstance) {
  // Register rate limiter for auth endpoints
  await app.register(rateLimit, {
    max: 5,
    timeWindow: '15 minutes',
    errorResponseBuilder: (req, context) => ({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Rate limit exceeded. Retry after ${context.after}`,
      },
      recoverability: 'retryable',
    }),
  });

  // POST /auth/register
  app.post('/register', async (request, reply) => {
    const parseResult = registerSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          context: parseResult.error.errors,
        },
        recoverability: 'terminal',
      });
    }

    await httpBoundary(
      () => authService.register(parseResult.data),
      reply
    );
  });

  // POST /auth/login
  app.post('/login', async (request, reply) => {
    const parseResult = loginSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          context: parseResult.error.errors,
        },
        recoverability: 'terminal',
      });
    }

    await httpBoundary(
      () => authService.login(parseResult.data),
      reply
    );
  });

  // POST /auth/refresh
  app.post('/refresh', async (request, reply) => {
    const parseResult = refreshSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          context: parseResult.error.errors,
        },
        recoverability: 'terminal',
      });
    }

    await httpBoundary(
      () => authService.refresh(parseResult.data.refreshToken),
      reply
    );
  });

  // POST /auth/logout
  app.post('/logout', async (request, reply) => {
    const parseResult = refreshSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          context: parseResult.error.errors,
        },
        recoverability: 'terminal',
      });
    }

    await httpBoundary(
      () => authService.logout(parseResult.data.refreshToken),
      reply
    );
  });
}
