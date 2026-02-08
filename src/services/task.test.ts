import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { taskService } from '../services/task.js';
import { prisma } from '../adapters/db.js';
import { isOk, isErr } from '../core/result.js';

// Clean up database before each test
beforeEach(async () => {
  await prisma.task.deleteMany();
});

// Disconnect after all tests
afterAll(async () => {
  await prisma.$disconnect();
});

describe('TaskService', () => {
  describe('create', () => {
    it('should create a task with valid data', async () => {
      const result = await taskService.create({
        title: 'Test Task',
        description: 'Test description',
      });

      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.title).toBe('Test Task');
        expect(result.data.status).toBe('pending');
      }
    });

    it('should reject empty title', async () => {
      const result = await taskService.create({
        title: '',
        description: 'Test',
      });

      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.code).toBe('VALIDATION_ERROR');
      }
    });

    it('should reject invalid priority', async () => {
      const result = await taskService.create({
        title: 'Test',
        description: 'Test',
        priority: 5, // Invalid
      });

      expect(isErr(result)).toBe(true);
    });
  });

  describe('getById', () => {
    it('should return task if found', async () => {
      const createResult = await taskService.create({
        title: 'Test Task',
        description: 'Test',
      });

      if (!isOk(createResult)) throw new Error('Failed to create task');

      const getResult = await taskService.getById(createResult.data.id);
      expect(isOk(getResult)).toBe(true);
    });

    it('should return error if not found', async () => {
      const result = await taskService.getById('00000000-0000-0000-0000-000000000000');
      expect(isErr(result)).toBe(true);
    });
  });

  describe('update', () => {
    it('should update task status', async () => {
      const createResult = await taskService.create({
        title: 'Test',
        description: 'Test',
      });

      if (!isOk(createResult)) throw new Error('Failed to create');

      const updateResult = await taskService.update(createResult.data.id, {
        status: 'in_progress',
      });

      expect(isOk(updateResult)).toBe(true);
    });

    it('should reject invalid status transition', async () => {
      const createResult = await taskService.create({
        title: 'Test',
        description: 'Test',
      });

      if (!isOk(createResult)) throw new Error('Failed to create');

      // First move to done
      await taskService.update(createResult.data.id, { status: 'in_progress' });
      await taskService.update(createResult.data.id, { status: 'done' });

      // Then try invalid transition from done to pending
      const updateResult = await taskService.update(createResult.data.id, {
        status: 'pending',
      });

      expect(isErr(updateResult)).toBe(true);
    });
  });

  describe('list', () => {
    it('should list all tasks', async () => {
      await taskService.create({ title: 'Task 1', description: 'Desc 1' });
      await taskService.create({ title: 'Task 2', description: 'Desc 2' });

      const result = await taskService.list();
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data.length).toBe(2);
      }
    });

    it('should filter by status', async () => {
      const createResult = await taskService.create({
        title: 'Test',
        description: 'Test',
      });

      if (isOk(createResult)) {
        await taskService.update(createResult.data.id, { status: 'in_progress' });
      }

      const result = await taskService.list({ status: 'in_progress' });
      expect(isOk(result) && result.data.length).toBe(1);
    });
  });
});
