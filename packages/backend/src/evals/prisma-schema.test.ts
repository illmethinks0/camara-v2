import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';

describe('Prisma Schema - CAMARA', () => {
  it('has prisma/schema.prisma', () => {
    expect(existsSync('prisma/schema.prisma')).toBe(true);
  });

  it('defines required CAMARA models', () => {
    const schema = readFileSync('prisma/schema.prisma', 'utf8');

    const requiredModels = [
      'model User',
      'model Course',
      'model Participant',
      'model InstructorAssignment',
      'model Phase',
      'model Annex',
      'model Signature',
      'model AttendanceRecord',
      'model AuditLog',
    ];

    for (const modelName of requiredModels) {
      expect(schema).toContain(modelName);
    }
  });

  it('uses postgresql datasource', () => {
    const schema = readFileSync('prisma/schema.prisma', 'utf8');
    expect(schema).toContain('provider = "postgresql"');
  });
});
