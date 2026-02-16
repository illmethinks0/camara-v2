import { beforeEach, describe, expect, it, vi } from 'vitest';
import { login, logout, refreshToken, register } from './camaraApi';

global.fetch = vi.fn();

describe('camaraApi auth client', () => {
  let storage: Record<string, string>;

  beforeEach(() => {
    vi.resetAllMocks();
    storage = {};

    vi.spyOn(global.localStorage, 'getItem').mockImplementation((key: string) => storage[key] ?? null);
    vi.spyOn(global.localStorage, 'setItem').mockImplementation((key: string, value: string) => {
      storage[key] = value;
    });
    vi.spyOn(global.localStorage, 'removeItem').mockImplementation((key: string) => {
      delete storage[key];
    });
  });

  it('register stores returned tokens', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        data: {
          user: { id: 'u1', email: 'test@example.com', name: 'Test User' },
          tokens: {
            accessToken: 'access-1',
            refreshToken: 'refresh-1',
            expiresIn: 3600,
          },
        },
      }),
    });

    const result = await register({
      email: 'test@example.com',
      name: 'Test User',
      password: 'SecurePassword123!',
    });

    expect(result.success).toBe(true);
    expect(storage.accessToken).toBe('access-1');
    expect(storage.refreshToken).toBe('refresh-1');
    expect(fetch).toHaveBeenCalledWith('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        name: 'Test User',
        password: 'SecurePassword123!',
      }),
    });
  });

  it('login stores returned tokens', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        data: {
          user: { id: 'u1', email: 'test@example.com', name: 'Test User' },
          tokens: {
            accessToken: 'access-2',
            refreshToken: 'refresh-2',
            expiresIn: 3600,
          },
        },
      }),
    });

    const result = await login({ email: 'test@example.com', password: 'SecurePassword123!' });

    expect(result.success).toBe(true);
    expect(storage.accessToken).toBe('access-2');
    expect(storage.refreshToken).toBe('refresh-2');
    expect(fetch).toHaveBeenCalledWith('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'SecurePassword123!' }),
    });
  });

  it('refreshToken sends refresh token and rotates stored tokens', async () => {
    storage.refreshToken = 'refresh-old';

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        data: {
          accessToken: 'access-new',
          refreshToken: 'refresh-new',
          expiresIn: 3600,
        },
      }),
    });

    const result = await refreshToken();

    expect(result.success).toBe(true);
    expect(storage.accessToken).toBe('access-new');
    expect(storage.refreshToken).toBe('refresh-new');
    expect(fetch).toHaveBeenCalledWith('/api/v1/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: 'refresh-old' }),
    });
  });

  it('refreshToken returns terminal error if token missing', async () => {
    const result = await refreshToken();

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('NO_REFRESH_TOKEN');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('logout clears local tokens and sends auth header when token exists', async () => {
    storage.accessToken = 'access-logout';
    storage.refreshToken = 'refresh-logout';

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: { success: true } }),
    });

    const result = await logout();

    expect(result.success).toBe(true);
    expect(storage.accessToken).toBeUndefined();
    expect(storage.refreshToken).toBeUndefined();
    expect(fetch).toHaveBeenCalledWith('/api/v1/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer access-logout',
      },
      body: JSON.stringify({ refreshToken: 'refresh-logout' }),
    });
  });
});
