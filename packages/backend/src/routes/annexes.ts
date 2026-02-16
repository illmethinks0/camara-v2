import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authenticateRequest } from '../middleware/auth.js';
import { camaraStore, StoreError } from '../services/camaraStore.js';

const paramsSchema = z.object({
  id: z.string().min(1),
});

const signatureCreateSchema = z
  .object({
    typedName: z.string().min(1).max(120).optional(),
    signatureDataUrl: z.string().max(20000).optional(),
  })
  .refine((data) => Boolean(data.typedName || data.signatureDataUrl), {
    message: 'Debe incluir typedName o signatureDataUrl',
  });

const batchExportSchema = z.object({
  participantIds: z.array(z.string().min(1)).optional(),
  annexIds: z.array(z.string().min(1)).optional(),
  signedOnly: z.boolean().optional(),
});

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

export async function annexRoutes(app: FastifyInstance) {
  app.get('/:id', { preHandler: [authenticateRequest] }, async (request, reply) => {
    const user = userOr401(request, reply);
    if (!user) return;

    const params = paramsSchema.safeParse(request.params);
    if (!params.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'ID de anexo invalido',
        },
        recoverability: 'terminal',
      });
    }

    try {
      const annex = camaraStore.getAnnex(user, params.data.id);
      return reply.send({ data: { annex } });
    } catch (error) {
      return handleStoreError(reply, error);
    }
  });

  app.get('/:id/download', { preHandler: [authenticateRequest] }, async (request, reply) => {
    const user = userOr401(request, reply);
    if (!user) return;

    const params = paramsSchema.safeParse(request.params);
    if (!params.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'ID de anexo invalido',
        },
        recoverability: 'terminal',
      });
    }

    try {
      const download = camaraStore.getAnnexDownload(user, params.data.id);
      return reply
        .header('Content-Type', 'application/pdf')
        .header('Content-Disposition', `attachment; filename="${download.fileName}"`)
        .send(download.buffer);
    } catch (error) {
      return handleStoreError(reply, error);
    }
  });

  app.post('/:id/signatures', { preHandler: [authenticateRequest] }, async (request, reply) => {
    const user = userOr401(request, reply);
    if (!user) return;

    const params = paramsSchema.safeParse(request.params);
    const body = signatureCreateSchema.safeParse(request.body);

    if (!params.success || !body.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Solicitud invalida',
          context: body.success ? undefined : body.error.flatten(),
        },
        recoverability: 'terminal',
      });
    }

    try {
      const signature = camaraStore.addSignature(user, params.data.id, body.data);
      return reply.status(201).send({ data: { signature } });
    } catch (error) {
      return handleStoreError(reply, error);
    }
  });

  app.get('/:id/signatures', { preHandler: [authenticateRequest] }, async (request, reply) => {
    const user = userOr401(request, reply);
    if (!user) return;

    const params = paramsSchema.safeParse(request.params);
    if (!params.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'ID de anexo invalido',
        },
        recoverability: 'terminal',
      });
    }

    try {
      const signatures = camaraStore.listSignatures(user, params.data.id);
      return reply.send({ data: { signatures } });
    } catch (error) {
      return handleStoreError(reply, error);
    }
  });

  app.post('/batch-export', { preHandler: [authenticateRequest] }, async (request, reply) => {
    const user = userOr401(request, reply);
    if (!user) return;

    const body = batchExportSchema.safeParse(request.body ?? {});
    if (!body.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Solicitud invalida',
          context: body.error.flatten(),
        },
        recoverability: 'terminal',
      });
    }

    try {
      const result = camaraStore.batchExportAnnexes(user, body.data);
      return reply
        .header('Content-Type', 'application/zip')
        .header('Content-Disposition', `attachment; filename="${result.fileName}"`)
        .send(result.buffer);
    } catch (error) {
      return handleStoreError(reply, error);
    }
  });
}
