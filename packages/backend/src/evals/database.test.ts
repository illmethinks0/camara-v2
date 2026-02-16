import { afterAll, describe, expect, it } from 'vitest';
import { PrismaClient } from '@prisma/client';

const runDbTests = process.env.RUN_DB_TESTS === 'true';
const describeDb = runDbTests ? describe : describe.skip;

const prisma = new PrismaClient();

describeDb('Database Connection', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('connects to database', async () => {
    const result = await prisma.$queryRaw`SELECT 1 as ok`;
    expect(Array.isArray(result)).toBe(true);
  });

  it('can query users table', async () => {
    const rows = await prisma.$queryRawUnsafe<Array<{ count: number }>>('SELECT COUNT(*)::int AS count FROM users');
    expect(typeof rows[0]?.count).toBe('number');
  });

  it('can query courses table', async () => {
    const rows = await prisma.$queryRawUnsafe<Array<{ count: number }>>(
      'SELECT COUNT(*)::int AS count FROM courses'
    );
    expect(typeof rows[0]?.count).toBe('number');
  });
});
