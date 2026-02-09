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
    const uniqueEmail = `db-test-${Date.now()}@example.com`;
    const user = await prisma.user.create({
      data: {
        email: uniqueEmail,
        name: 'Test User',
        passwordHash: 'hashedpassword',
      },
    });

    expect(user.id).toBeDefined();
    expect(user.email).toBe(uniqueEmail);

    // Cleanup
    await prisma.user.delete({ where: { id: user.id } });
  });

  it('should create and retrieve a task', async () => {
    const uniqueTitle = `Test Task ${Date.now()}-${Math.random()}`;
    const task = await prisma.task.create({
      data: {
        title: uniqueTitle,
        description: 'Test Description',
        diffEstimate: 'small',
      },
    });

    expect(task.id).toBeDefined();
    expect(task.title).toBe(uniqueTitle);
    expect(task.status).toBe('pending');

    // Cleanup - wrapped in try/catch in case already deleted
    try {
      await prisma.task.delete({ where: { id: task.id } });
    } catch {
      // Task may have been cleaned up by another test
    }
  });
});
