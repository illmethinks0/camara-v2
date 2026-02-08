import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyAccessToken } from '../services/auth.js';
import { isOk } from '../core/result.js';

// Extend FastifyRequest to include user
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      userId: string;
      email: string;
      role: string;
    };
  }
}

// Authentication middleware
export async function authenticateRequest(
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Get token from Authorization header or cookie
  const authHeader = request.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') 
    ? authHeader.slice(7) 
    : request.cookies.access_token;

  if (!token) {
    return reply.status(401).send({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Access token required',
      },
      recoverability: 'terminal',
    });
  }

  // Verify token
  const result = verifyAccessToken(token);

  if (!isOk(result)) {
    return reply.status(401).send({
      error: result.error,
      recoverability: result.recoverability,
    });
  }

  // Attach user to request
  request.user = result.data;
}

// Require specific role
export function requireRole(...allowedRoles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.status(401).send({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
        recoverability: 'terminal',
      });
    }

    if (!allowedRoles.includes(request.user.role)) {
      return reply.status(403).send({
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions',
        },
        recoverability: 'terminal',
      });
    }
  };
}
