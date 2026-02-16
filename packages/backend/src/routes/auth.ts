import { FastifyInstance } from 'fastify';
import rateLimit from '@fastify/rate-limit';
import { z } from 'zod';
import { Role } from '../core/domain.js';
import { isOk } from '../core/result.js';
import { authenticateRequest } from '../middleware/auth.js';
import { authService } from '../services/auth.js';

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(12),
  role: Role.optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

const logoutSchema = z.object({
  refreshToken: z.string().optional(),
});

export async function authRoutes(app: FastifyInstance) {
  await app.register(rateLimit, {
    max: 20,
    timeWindow: '15 minutes',
  });

  app.post('/register', async (request, reply) => {
    const parsed = registerSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Solicitud invalida',
          context: parsed.error.flatten(),
        },
        recoverability: 'terminal',
      });
    }

    const result = await authService.register(parsed.data);
    if (!isOk(result)) {
      return reply.status(result.error.code === 'DB_UNIQUE_VIOLATION' ? 409 : 400).send({
        error: result.error,
        recoverability: result.recoverability,
      });
    }

    return reply.send({
      data: {
        user: result.data.user,
        tokens: {
          accessToken: result.data.accessToken,
          refreshToken: result.data.refreshToken,
          expiresIn: result.data.expiresIn,
        },
      },
    });
  });

  app.post('/login', async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Solicitud invalida',
          context: parsed.error.flatten(),
        },
        recoverability: 'terminal',
      });
    }

    const result = await authService.login(parsed.data);
    if (!isOk(result)) {
      return reply.status(401).send({
        error: result.error,
        recoverability: result.recoverability,
      });
    }

    return reply.send({
      data: {
        user: result.data.user,
        tokens: {
          accessToken: result.data.accessToken,
          refreshToken: result.data.refreshToken,
          expiresIn: result.data.expiresIn,
        },
      },
    });
  });

  app.post('/refresh', async (request, reply) => {
    const parsed = refreshSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Solicitud invalida',
          context: parsed.error.flatten(),
        },
        recoverability: 'terminal',
      });
    }

    const result = await authService.refresh(parsed.data.refreshToken);
    if (!isOk(result)) {
      return reply.status(401).send({
        error: result.error,
        recoverability: result.recoverability,
      });
    }

    return reply.send({
      data: {
        accessToken: result.data.accessToken,
        refreshToken: result.data.refreshToken,
        expiresIn: result.data.expiresIn,
      },
    });
  });

  app.post('/logout', async (request, reply) => {
    const parsed = logoutSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Solicitud invalida',
          context: parsed.error.flatten(),
        },
        recoverability: 'terminal',
      });
    }

    await authService.logout(parsed.data.refreshToken ?? '');
    return reply.send({ data: { success: true } });
  });

  app.get('/me', { preHandler: [authenticateRequest] }, async (request, reply) => {
    if (!request.user) {
      return reply.status(401).send({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Autenticacion requerida',
        },
        recoverability: 'terminal',
      });
    }

    return reply.send({ data: { user: request.user } });
  });
}
