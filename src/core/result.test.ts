import { describe, it, expect } from 'vitest';
import { ok, err, isOk, isErr, unwrapOr, map, flatMap } from './result.js';

describe('Result', () => {
  describe('ok', () => {
    it('should create a success result', () => {
      const result = ok(42);
      expect(result.ok).toBe(true);
      expect(result.data).toBe(42);
    });
  });

  describe('err', () => {
    it('should create an error result', () => {
      const error = { code: 'TEST_ERROR', message: 'Test error' };
      const result = err(error);
      expect(result.ok).toBe(false);
      expect(result.error).toEqual(error);
      expect(result.recoverability).toBe('terminal');
    });

    it('should support retryable errors', () => {
      const error = { code: 'NETWORK_ERROR', message: 'Network failed' };
      const result = err(error, 'retryable');
      expect(result.recoverability).toBe('retryable');
    });
  });

  describe('isOk', () => {
    it('should return true for success results', () => {
      expect(isOk(ok(42))).toBe(true);
      expect(isOk(err({ code: 'ERROR', message: 'Error' }))).toBe(false);
    });
  });

  describe('isErr', () => {
    it('should return true for error results', () => {
      expect(isErr(err({ code: 'ERROR', message: 'Error' }))).toBe(true);
      expect(isErr(ok(42))).toBe(false);
    });
  });

  describe('unwrapOr', () => {
    it('should return data for success', () => {
      expect(unwrapOr(ok(42), 0)).toBe(42);
    });

    it('should return fallback for error', () => {
      expect(unwrapOr(err({ code: 'ERROR', message: 'Error' }), 0)).toBe(0);
    });
  });

  describe('map', () => {
    it('should transform success values', () => {
      const result = map(ok(21), (x) => x * 2);
      expect(isOk(result) && result.data).toBe(42);
    });

    it('should pass through errors', () => {
      const error = { code: 'ERROR', message: 'Error' };
      const result = map(err(error), (x: number) => x * 2);
      expect(isErr(result) && result.error).toEqual(error);
    });
  });

  describe('flatMap', () => {
    it('should chain successful operations', () => {
      const result = flatMap(ok(21), (x) => ok(x * 2));
      expect(isOk(result) && result.data).toBe(42);
    });

    it('should short-circuit on error', () => {
      const error = { code: 'ERROR', message: 'Error' };
      const result = flatMap(err<number, typeof error>(error), (x) => ok(x * 2));
      expect(isErr(result) && result.error).toEqual(error);
    });
  });
});
