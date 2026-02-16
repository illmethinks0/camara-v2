import { FastifyReply, FastifyRequest } from 'fastify';
import { Role } from '../core/domain.js';
import { isOk } from '../core/result.js';
import { verifyAccessToken } from '../services/auth.js';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      userId: string;
      email: string;
      role: Role;
      name: string;
    };
  }
}

export async function authenticateRequest(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
  const cookieToken = request.cookies.access_token;
  const token = bearerToken || cookieToken;

  if (!token) {
    return reply.status(401).send({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Token de acceso requerido',
      },
      recoverability: 'terminal',
    });
  }

  const verification = verifyAccessToken(token);

  if (!isOk(verification)) {
    return reply.status(401).send({
      error: verification.error,
      recoverability: verification.recoverability,
    });
  }

  request.user = verification.data;
}

export function requireRole(...allowedRoles: Role[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.status(401).send({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Autenticacion requerida',
        },
        recoverability: 'terminal',
      });
    }

    if (!allowedRoles.includes(request.user.role)) {
      return reply.status(403).send({
        error: {
          code: 'FORBIDDEN',
          message: 'No tienes permisos para este recurso',
        },
        recoverability: 'terminal',
      });
    }
  };
}
