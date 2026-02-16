import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authenticateRequest, requireRole } from '../middleware/auth.js';
import { AnnexType } from '../core/domain.js';
import { camaraStore, StoreError } from '../services/camaraStore.js';

const participantCreateSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  idNumber: z.string().min(3),
  email: z.string().email(),
  phone: z.string().min(5),
  courseId: z.string().min(1),
  createLogin: z.boolean().optional(),
});

const participantUpdateSchema = z
  .object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    email: z.string().email().optional(),
    phone: z.string().min(5).optional(),
    courseId: z.string().min(1).optional(),
    currentPhase: z.enum(['diagnostic', 'training', 'completion']).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Debe incluir al menos un campo para actualizar',
  });

const phaseProgressSchema = z.object({
  override: z.boolean().optional(),
});

const annexGenerateSchema = z.object({
  type: z.union([z.literal(2), z.literal(3), z.literal(5)]).optional(),
  override: z.boolean().optional(),
});

const attendanceCreateSchema = z.object({
  sessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  hours: z.number().min(0.5).max(12),
  notes: z.string().max(500).optional(),
});

const paramsSchema = z.object({
  id: z.string().min(1),
});

function annexTypeFromNumber(type?: 2 | 3 | 5): AnnexType | undefined {
  if (type === 2) return 'annex_2';
  if (type === 3) return 'annex_3';
  if (type === 5) return 'annex_5';
  return undefined;
}

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

export async function participantRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [authenticateRequest] }, async (request, reply) => {
    const user = userOr401(request, reply);
    if (!user) return;

    try {
      return reply.send({ data: { participants: camaraStore.listParticipants(user) } });
    } catch (error) {
      return handleStoreError(reply, error);
    }
  });

  app.post('/', { preHandler: [authenticateRequest, requireRole('administrator')] }, async (request, reply) => {
    const user = userOr401(request, reply);
    if (!user) return;

    const parsed = participantCreateSchema.safeParse(request.body);
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

    try {
      const participant = camaraStore.createParticipant(user, parsed.data);
      return reply.status(201).send({ data: { participant } });
    } catch (error) {
      return handleStoreError(reply, error);
    }
  });

  app.get('/:id', { preHandler: [authenticateRequest] }, async (request, reply) => {
    const user = userOr401(request, reply);
    if (!user) return;

    const parsedParams = paramsSchema.safeParse(request.params);
    if (!parsedParams.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'ID de participante invalido',
        },
        recoverability: 'terminal',
      });
    }

    try {
      const participant = camaraStore.getParticipant(user, parsedParams.data.id);
      return reply.send({ data: { participant } });
    } catch (error) {
      return handleStoreError(reply, error);
    }
  });

  app.patch('/:id', { preHandler: [authenticateRequest, requireRole('administrator')] }, async (request, reply) => {
    const user = userOr401(request, reply);
    if (!user) return;

    const parsedParams = paramsSchema.safeParse(request.params);
    const parsedBody = participantUpdateSchema.safeParse(request.body);

    if (!parsedParams.success || !parsedBody.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Solicitud invalida',
          context: parsedBody.success ? undefined : parsedBody.error.flatten(),
        },
        recoverability: 'terminal',
      });
    }

    try {
      const participant = camaraStore.updateParticipant(user, parsedParams.data.id, parsedBody.data);
      return reply.send({ data: { participant } });
    } catch (error) {
      return handleStoreError(reply, error);
    }
  });

  app.get('/:id/phase', { preHandler: [authenticateRequest] }, async (request, reply) => {
    const user = userOr401(request, reply);
    if (!user) return;

    const parsedParams = paramsSchema.safeParse(request.params);
    if (!parsedParams.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'ID de participante invalido',
        },
        recoverability: 'terminal',
      });
    }

    try {
      const phases = camaraStore.getParticipantPhase(user, parsedParams.data.id);
      return reply.send({ data: { phases } });
    } catch (error) {
      return handleStoreError(reply, error);
    }
  });

  app.post('/:id/phase/progress', { preHandler: [authenticateRequest] }, async (request, reply) => {
    const user = userOr401(request, reply);
    if (!user) return;

    const parsedParams = paramsSchema.safeParse(request.params);
    const parsedBody = phaseProgressSchema.safeParse(request.body ?? {});

    if (!parsedParams.success || !parsedBody.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Solicitud invalida',
        },
        recoverability: 'terminal',
      });
    }

    try {
      const result = camaraStore.progressPhase(user, parsedParams.data.id, parsedBody.data.override ?? false);
      return reply.send({ data: result });
    } catch (error) {
      return handleStoreError(reply, error);
    }
  });

  app.post('/:id/annexes/generate', { preHandler: [authenticateRequest] }, async (request, reply) => {
    const user = userOr401(request, reply);
    if (!user) return;

    const parsedParams = paramsSchema.safeParse(request.params);
    const parsedBody = annexGenerateSchema.safeParse(request.body ?? {});

    if (!parsedParams.success || !parsedBody.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Solicitud invalida',
        },
        recoverability: 'terminal',
      });
    }

    try {
      const annex = camaraStore.generateAnnex(
        user,
        parsedParams.data.id,
        annexTypeFromNumber(parsedBody.data.type),
        parsedBody.data.override ?? false
      );
      return reply.status(201).send({ data: { annex } });
    } catch (error) {
      return handleStoreError(reply, error);
    }
  });

  app.get('/:id/annexes', { preHandler: [authenticateRequest] }, async (request, reply) => {
    const user = userOr401(request, reply);
    if (!user) return;

    const parsedParams = paramsSchema.safeParse(request.params);
    if (!parsedParams.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'ID de participante invalido',
        },
        recoverability: 'terminal',
      });
    }

    try {
      const annexes = camaraStore.listParticipantAnnexes(user, parsedParams.data.id);
      return reply.send({ data: { annexes } });
    } catch (error) {
      return handleStoreError(reply, error);
    }
  });

  app.post('/:id/attendance', { preHandler: [authenticateRequest] }, async (request, reply) => {
    const user = userOr401(request, reply);
    if (!user) return;

    const parsedParams = paramsSchema.safeParse(request.params);
    const parsedBody = attendanceCreateSchema.safeParse(request.body);

    if (!parsedParams.success || !parsedBody.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Solicitud invalida',
          context: parsedBody.success ? undefined : parsedBody.error.flatten(),
        },
        recoverability: 'terminal',
      });
    }

    try {
      const attendance = camaraStore.markAttendance(user, parsedParams.data.id, parsedBody.data);
      return reply.status(201).send({ data: { attendance } });
    } catch (error) {
      return handleStoreError(reply, error);
    }
  });

  app.get('/:id/attendance', { preHandler: [authenticateRequest] }, async (request, reply) => {
    const user = userOr401(request, reply);
    if (!user) return;

    const parsedParams = paramsSchema.safeParse(request.params);
    if (!parsedParams.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'ID de participante invalido',
        },
        recoverability: 'terminal',
      });
    }

    try {
      const attendance = camaraStore.listAttendance(user, parsedParams.data.id);
      return reply.send({ data: { attendance } });
    } catch (error) {
      return handleStoreError(reply, error);
    }
  });
}
