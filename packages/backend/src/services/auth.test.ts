import { beforeEach, describe, expect, it } from 'vitest';
import { isErr, isOk } from '../core/result.js';
import { camaraStore } from './camaraStore.js';
import { authService } from './auth.js';

describe('Auth Service', () => {
  beforeEach(() => {
    camaraStore.resetForTests();
  });

  it('rejects short passwords on register', async () => {
    const result = await authService.register({
      email: 'new@example.com',
      name: 'Nuevo Usuario',
      password: 'short',
    });

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.code).toBe('VALIDATION_ERROR');
    }
  });

  it('logs in seeded admin with demo credentials', async () => {
    const result = await authService.login({
      email: 'admin@camara-menorca.es',
      password: 'CamaraMenorca2025',
    });

    expect(isOk(result)).toBe(true);
    if (isOk(result)) {
      expect(result.data.user.role).toBe('administrator');
      expect(result.data.accessToken).toBeTruthy();
      expect(result.data.refreshToken).toBeTruthy();
    }
  });

  it('fails login on bad password', async () => {
    const result = await authService.login({
      email: 'admin@camara-menorca.es',
      password: 'incorrecta',
    });

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.code).toBe('INVALID_CREDENTIALS');
    }
  });

  it('rejects invalid refresh token', async () => {
    const result = await authService.refresh('invalid-token');

    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.code).toBe('UNAUTHORIZED');
    }
  });

  it('logout resolves even with invalid token', async () => {
    const result = await authService.logout('invalid-token');
    expect(isOk(result)).toBe(true);
  });
});
