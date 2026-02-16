import { describe, expect, it, vi } from 'vitest';
import { authenticateRequest, requireRole } from './auth.js';

describe('Authentication middleware', () => {
  it('authenticateRequest returns 401 when token missing', async () => {
    const request = { headers: {}, cookies: {} } as any;
    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    } as any;

    await authenticateRequest(request, reply);

    expect(reply.status).toHaveBeenCalledWith(401);
    expect(reply.send).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'UNAUTHORIZED' }),
      })
    );
  });

  it('requireRole returns 403 for unauthorized role', async () => {
    const request = {
      user: {
        userId: 'u1',
        email: 'instructor@example.com',
        role: 'instructor',
      },
    } as any;
    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    } as any;

    const guard = requireRole('administrator');
    await guard(request, reply);

    expect(reply.status).toHaveBeenCalledWith(403);
    expect(reply.send).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'FORBIDDEN' }),
      })
    );
  });

  it('requireRole allows authorized role', async () => {
    const request = {
      user: {
        userId: 'u1',
        email: 'admin@example.com',
        role: 'administrator',
      },
    } as any;
    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    } as any;

    const guard = requireRole('administrator');
    await guard(request, reply);

    expect(reply.status).not.toHaveBeenCalled();
  });
});
