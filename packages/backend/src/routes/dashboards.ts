import { FastifyInstance } from 'fastify';
import { authenticateRequest } from '../middleware/auth.js';
import { camaraStore, StoreError } from '../services/camaraStore.js';

function handleStoreError(reply: any, error: unknown) {
  if (error instanceof StoreError) {
    return reply.status(error.statusCode).send({
      error: {
        code: error.code,
        message: error.message,
      },
      recoverability: 'terminal',
    });
  }

  return reply.status(500).send({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Error interno del servidor',
    },
    recoverability: 'retryable',
  });
}

function userOr401(request: any, reply: any) {
  if (!request.user) {
    reply.status(401).send({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Autenticacion requerida',
      },
      recoverability: 'terminal',
    });
    return null;
  }

  return request.user;
}

export async function dashboardRoutes(app: FastifyInstance) {
  app.get('/admin', { preHandler: [authenticateRequest] }, async (request, reply) => {
    const user = userOr401(request, reply);
    if (!user) return;

    try {
      const dashboard = camaraStore.getAdminDashboard(user);
      return reply.send({ data: dashboard });
    } catch (error) {
      return handleStoreError(reply, error);
    }
  });

  app.get('/instructor', { preHandler: [authenticateRequest] }, async (request, reply) => {
    const user = userOr401(request, reply);
    if (!user) return;

    try {
      const dashboard = camaraStore.getInstructorDashboard(user);
      return reply.send({ data: dashboard });
    } catch (error) {
      return handleStoreError(reply, error);
    }
  });

  app.get('/participant', { preHandler: [authenticateRequest] }, async (request, reply) => {
    const user = userOr401(request, reply);
    if (!user) return;

    try {
      const dashboard = camaraStore.getParticipantDashboard(user);
      return reply.send({ data: dashboard });
    } catch (error) {
      return handleStoreError(reply, error);
    }
  });
}
