import { describe, it, expect } from 'vitest';
import { ok, err, isOk, isErr, unwrapOr, map, flatMap } from '../core/result.js';

describe('Railway Result Pattern', () => {
  describe('ok', () => {
    it('should create a success result with data', () => {
      const result = ok(42);
      expect(result.ok).toBe(true);
      expect(result.data).toBe(42);
    });

    it('should work with complex data', () => {
      const data = { id: '1', name: 'Test' };
      const result = ok(data);
      expect(result.ok).toBe(true);
      expect(result.data).toEqual(data);
    });
  });

  describe('err', () => {
    it('should create an error result with terminal recoverability by default', () => {
      const error = { code: 'TEST_ERROR', message: 'Test error' };
      const result = err(error);
      expect(result.ok).toBe(false);
      expect(result.error).toEqual(error);
      expect(result.recoverability).toBe('terminal');
    });

    it('should support retryable errors', () => {
      const error = { code: 'NETWORK_ERROR', message: 'Network failed' };
      const result = err(error, 'retryable');
      expect(result.ok).toBe(false);
      expect(result.recoverability).toBe('retryable');
    });
  });

  describe('isOk', () => {
    it('should return true for success results', () => {
      expect(isOk(ok(42))).toBe(true);
    });

    it('should return false for error results', () => {
      expect(isOk(err({ code: 'ERROR', message: 'Error' }))).toBe(false);
    });
  });

  describe('isErr', () => {
    it('should return true for error results', () => {
      expect(isErr(err({ code: 'ERROR', message: 'Error' }))).toBe(true);
    });

    it('should return false for success results', () => {
      expect(isErr(ok(42))).toBe(false);
    });
  });

  describe('unwrapOr', () => {
    it('should return data for success', () => {
      expect(unwrapOr(ok(42), 0)).toBe(42);
    });

    it('should return fallback for error', () => {
      const error = { code: 'ERROR', message: 'Error' };
      expect(unwrapOr(err(error), 0)).toBe(0);
    });
  });

  describe('map', () => {
    it('should transform success values', () => {
      const result = map(ok(21), (x) => x * 2);
      expect(isOk(result) && result.data).toBe(42);
    });

    it('should pass through errors unchanged', () => {
      const error = { code: 'ERROR', message: 'Error' };
      const result = map(err<number, typeof error>(error), (x) => x * 2);
      expect(isErr(result) && result.error).toEqual(error);
    });
  });

  describe('flatMap', () => {
    it('should chain successful operations', () => {
      const result = flatMap(ok(21), (x) => ok(x * 2));
      expect(isOk(result) && result.data).toBe(42);
    });

    it('should short-circuit on first error', () => {
      const error = { code: 'FIRST_ERROR', message: 'First' };
      const result = flatMap(err<number, typeof error>(error), () =>
        err({ code: 'SECOND_ERROR', message: 'Second' })
      );
      expect(isErr(result) && result.error.code).toBe('FIRST_ERROR');
    });
  });

  describe('Error structure', () => {
    it('should have required error fields', () => {
      const error = { code: 'TEST', message: 'Test', context: { detail: 'info' } };
      const result = err(error);
      expect(isErr(result) && result.error.code).toBe('TEST');
      expect(isErr(result) && result.error.message).toBe('Test');
      expect(isErr(result) && result.error.context).toEqual({ detail: 'info' });
    });
  });
});
