/**
 * Railway Result Type - Core of the architecture
 * All boundary crossings MUST return Result<T, E>
 */

export interface Error {
  code: string;
  message: string;
  context?: Record<string, unknown>;
}

export type Result<T, E extends Error = Error> =
  | { ok: true; data: T }
  | { ok: false; error: E; recoverability: 'retryable' | 'terminal' };

// Helper functions
export function ok<T>(data: T): Result<T> {
  return { ok: true, data };
}

export function err<E extends Error>(
  error: E,
  recoverability: 'retryable' | 'terminal' = 'terminal'
): Result<never, E> {
  return { ok: false, error, recoverability };
}

// Type guards
export function isOk<T, E extends Error>(result: Result<T, E>): result is { ok: true; data: T } {
  return result.ok;
}

export function isErr<T, E extends Error>(
  result: Result<T, E>
): result is { ok: false; error: E; recoverability: 'retryable' | 'terminal' } {
  return !result.ok;
}

// Unwrap with fallback
export function unwrapOr<T, E extends Error>(result: Result<T, E>, fallback: T): T {
  return isOk(result) ? result.data : fallback;
}

// Unwrap or throw (for tests only - never use in production code)
export function unwrap<T, E extends Error>(result: Result<T, E>): T {
  if (isErr(result)) {
    throw new Error(`Unwrapped error: ${result.error.message}`);
  }
  return result.data;
}

// Map over result
export function map<T, U, E extends Error>(
  result: Result<T, E>,
  fn: (data: T) => U
): Result<U, E> {
  if (isOk(result)) {
    return ok(fn(result.data)) as Result<U, E>;
  }
  return result;
}

// Chain results
export function flatMap<T, U, E extends Error>(
  result: Result<T, E>,
  fn: (data: T) => Result<U, E>
): Result<U, E> {
  if (isOk(result)) {
    return fn(result.data);
  }
  return result as Result<U, E>;
}
