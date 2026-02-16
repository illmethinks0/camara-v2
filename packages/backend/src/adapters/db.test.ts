import { describe, expect, it } from 'vitest';
import { courseRepository, dbOperation, participantRepository, userRepository } from './db.js';
import { isErr, isOk } from '../core/result.js';

describe('Database Adapter', () => {
  describe('dbOperation', () => {
    it('returns ok for successful operations', async () => {
      const result = await dbOperation(async () => 'ok');
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).toBe('ok');
      }
    });

    it('returns err for failing operations', async () => {
      const result = await dbOperation(async () => {
        throw new Error('boom');
      });
      expect(isErr(result)).toBe(true);
    });
  });

  describe('Repositories', () => {
    it('user repository exposes findByEmail', () => {
      expect(typeof userRepository.findByEmail).toBe('function');
    });

    it('course repository exposes list', () => {
      expect(typeof courseRepository.list).toBe('function');
    });

    it('participant repository exposes listForUser', () => {
      expect(typeof participantRepository.listForUser).toBe('function');
    });
  });
});
