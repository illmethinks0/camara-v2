import { z } from 'zod';

export const Role = z.enum(['administrator', 'instructor', 'participant']);
export type Role = z.infer<typeof Role>;

export const PhaseType = z.enum(['diagnostic', 'training', 'completion']);
export type PhaseType = z.infer<typeof PhaseType>;

export const AnnexType = z.enum(['annex_2', 'annex_3', 'annex_5']);
export type AnnexType = z.infer<typeof AnnexType>;

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: Role;
  name: string;
}

export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  DB_CONNECTION_FAILED: 'DB_CONNECTION_FAILED',
  DB_RECORD_NOT_FOUND: 'DB_RECORD_NOT_FOUND',
  DB_UNIQUE_VIOLATION: 'DB_UNIQUE_VIOLATION',
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
  EXTERNAL_TIMEOUT: 'EXTERNAL_TIMEOUT',
  EXTERNAL_ERROR: 'EXTERNAL_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  NOT_IMPLEMENTED: 'NOT_IMPLEMENTED',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];
