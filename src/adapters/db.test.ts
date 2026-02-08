import { describe, it, expect } from 'vitest';
import { dbOperation, userRepository, taskRepository } from './db.js';
import { isOk, isErr } from '../core/result.js';

describe('Database Adapter', () => {
  describe('dbOperation wrapper', () => {
    it('should return ok for successful operations', async () => {
      const result = await dbOperation(async () => 'success');
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).toBe('success');
      }
    });

    it('should return err for failed operations', async () => {
      const result = await dbOperation(async () => {
        throw new Error('DB error');
      });
      expect(isErr(result)).toBe(true);
    });
  });

  describe('User Repository', () => {
    it('should have findById method', () => {
      expect(typeof userRepository.findById).toBe('function');
    });

    it('should have create method', () => {
      expect(typeof userRepository.create).toBe('function');
    });

    it('should return Result type from findById', async () => {
      // This will fail since DB isn't set up, but tests the interface
      const result = await userRepository.findById('test-id');
      expect(typeof result.ok).toBe('boolean');
    });
  });

  describe('Task Repository', () => {
    it('should have findById method', () => {
      expect(typeof taskRepository.findById).toBe('function');
    });

    it('should have create method', () => {
      expect(typeof taskRepository.create).toBe('function');
    });

    it('should have findReady method', () => {
      expect(typeof taskRepository.findReady).toBe('function');
    });
  });
});
