import { FastifyRequest, FastifyReply } from 'fastify';
import { Result, isOk, isErr } from '../core/result.js';
import { ErrorCodes } from '../core/domain.js';

// HTTP error response
export interface HttpError {
  code: string;
  message: string;
  context?: Record<string, unknown>;
}

// HTTP boundary adapter
export async function httpBoundary<T>(
  handler: () => Promise<Result<T, any>>,
  reply: FastifyReply
): Promise<void> {
  try {
    const result = await handler();

    if (isOk(result)) {
      reply.send(result.data);
    } else {
      const error = result.error;
      const statusCode = mapErrorToStatusCode(error.code);

      reply.status(statusCode).send({
        error: {
          code: error.code,
          message: error.message,
          context: error.context,
        },
        recoverability: result.recoverability,
      });
    }
  } catch (error) {
    // This should never happen if all code uses Result
    console.error('Unexpected error:', error);
    reply.status(500).send({
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'Internal server error',
      },
      recoverability: 'retryable',
    });
  }
}

// Map error codes to HTTP status codes
function mapErrorToStatusCode(errorCode: string): number {
  const errorMap: Record<string, number> = {
    [ErrorCodes.VALIDATION_ERROR]: 400,
    [ErrorCodes.INVALID_INPUT]: 400,
    [ErrorCodes.UNAUTHORIZED]: 401,
    [ErrorCodes.FORBIDDEN]: 403,
    [ErrorCodes.INVALID_CREDENTIALS]: 401,
    [ErrorCodes.DB_RECORD_NOT_FOUND]: 404,
    [ErrorCodes.DB_UNIQUE_VIOLATION]: 409,
    [ErrorCodes.BUSINESS_RULE_VIOLATION]: 422,
    [ErrorCodes.NOT_IMPLEMENTED]: 501,
    [ErrorCodes.INTERNAL_ERROR]: 500,
    [ErrorCodes.DB_CONNECTION_FAILED]: 503,
    [ErrorCodes.EXTERNAL_TIMEOUT]: 504,
    [ErrorCodes.EXTERNAL_ERROR]: 502,
  };

  return errorMap[errorCode] || 500;
}
