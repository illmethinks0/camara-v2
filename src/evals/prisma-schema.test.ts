import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';

describe('Prisma Database Schema', () => {
  it('should have prisma/schema.prisma', () => {
    expect(existsSync('prisma/schema.prisma')).toBe(true);
  });

  it('should define User model', () => {
    const content = readFileSync('prisma/schema.prisma', 'utf-8');
    expect(content).toContain('model User');
    expect(content).toContain('email');
    expect(content).toContain('passwordHash');
  });

  it('should define Task model', () => {
    const content = readFileSync('prisma/schema.prisma', 'utf-8');
    expect(content).toContain('model Task');
    expect(content).toContain('title');
    expect(content).toContain('status');
  });

  it('should have database URL in schema', () => {
    const content = readFileSync('prisma/schema.prisma', 'utf-8');
    expect(content).toContain('datasource db');
    expect(content).toContain('provider = "postgresql"');
  });
});
