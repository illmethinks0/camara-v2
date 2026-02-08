import { z } from 'zod';

// User domain model
export const UserRole = z.enum(['user', 'admin']);
export type UserRole = z.infer<typeof UserRole>;

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  role: UserRole,
  passwordHash: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

export type User = z.infer<typeof UserSchema>;

// Task domain model
export const TaskStatus = z.enum(['pending', 'in_progress', 'done', 'blocked']);
export type TaskStatus = z.infer<typeof TaskStatus>;

export const TaskLane = z.enum(['frontend', 'backend', 'data', 'auth', 'qa', 'devops']);
export type TaskLane = z.infer<typeof TaskLane>;

export const TaskRisk = z.enum(['low', 'med', 'high']);
export type TaskRisk = z.infer<typeof TaskRisk>;

export const TaskDiffEstimate = z.enum(['very_small', 'small', 'medium', 'large']);
export type TaskDiffEstimate = z.infer<typeof TaskDiffEstimate>;

export const TaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string(),
  status: TaskStatus,
  priority: z.number().int().min(0).max(3),
  assigneeId: z.string().uuid().nullable(),
  parentId: z.string().uuid().nullable(),
  tags: z.array(z.string()),
  deliverables: z.array(z.string()),
  evals: z.array(z.string()),
  lane: TaskLane,
  risk: TaskRisk,
  diffEstimate: TaskDiffEstimate,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Task = z.infer<typeof TaskSchema>;

// API Error codes
export const ErrorCodes = {
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  
  // Auth
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  
  // Database
  DB_CONNECTION_FAILED: 'DB_CONNECTION_FAILED',
  DB_RECORD_NOT_FOUND: 'DB_RECORD_NOT_FOUND',
  DB_UNIQUE_VIOLATION: 'DB_UNIQUE_VIOLATION',
  
  // Business logic
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
  
  // External
  EXTERNAL_TIMEOUT: 'EXTERNAL_TIMEOUT',
  EXTERNAL_ERROR: 'EXTERNAL_ERROR',
  
  // Generic
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  NOT_IMPLEMENTED: 'NOT_IMPLEMENTED',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];
