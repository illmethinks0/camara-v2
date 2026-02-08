import { describe, it, expect } from 'vitest';
import { prisma } from '../adapters/db.js';

describe('Database Connection', () => {
  it('should connect to database', async () => {
    // Simple query to test connection
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it('should have User table', async () => {
    const count = await prisma.user.count();
    expect(typeof count).toBe('number');
  });

  it('should have Task table', async () => {
    const count = await prisma.task.count();
    expect(typeof count).toBe('number');
  });

  it('should create and retrieve a user', async () => {
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'hashedpassword',
      },
    });

    expect(user.id).toBeDefined();
    expect(user.email).toBe('test@example.com');

    // Cleanup
    await prisma.user.delete({ where: { id: user.id } });
  });

  it('should create and retrieve a task', async () => {
    const task = await prisma.task.create({
      data: {
        title: 'Test Task',
        description: 'Test Description',
        diffEstimate: 'small',
      },
    });

    expect(task.id).toBeDefined();
    expect(task.title).toBe('Test Task');
    expect(task.status).toBe('pending');

    // Cleanup
    await prisma.task.delete({ where: { id: task.id } });
  });
});
