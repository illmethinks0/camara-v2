/**
 * API Client Integration Tests for CAMARA v2
 * TDD: Tests written before implementation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  login,
  register,
  refreshToken,
  logout,
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getTaskById
} from './camaraApi';
import type { User, Task } from '../types/camara';

// Mock fetch globally
global.fetch = vi.fn();

describe('CAMARA v2 API Client', () => {
  // Use a real storage object that persists across calls
  let storage: Record<string, string> = {};

  beforeEach(() => {
    vi.resetAllMocks();
    storage = {};

    // Mock localStorage with actual storage behavior
    vi.spyOn(global.localStorage, 'getItem').mockImplementation((key: string) => storage[key] ?? null);
    vi.spyOn(global.localStorage, 'setItem').mockImplementation((key: string, value: string) => {
      storage[key] = value;
    });
    vi.spyOn(global.localStorage, 'removeItem').mockImplementation((key: string) => {
      delete storage[key];
    });
    vi.spyOn(global.localStorage, 'clear').mockImplementation(() => {
      storage = {};
    });
  });

  describe('Authentication', () => {
    describe('register', () => {
      it('should successfully register a new user', async () => {
        const mockUser: User = {
          id: 'user-1',
          email: 'test@example.com',
          name: 'Test User',
          createdAt: new Date().toISOString(),
        };

        const mockResponse = {
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: {
              user: mockUser,
              tokens: {
                accessToken: 'test-access-token',
                refreshToken: 'test-refresh-token',
                expiresIn: 3600,
              },
            },
          }),
        };

        (fetch as any).mockResolvedValueOnce(mockResponse);

        const result = await register({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        });

        expect(result.success).toBe(true);
        expect(result.data?.user).toEqual(mockUser);
        expect(result.data?.tokens.accessToken).toBe('test-access-token');
        expect(fetch).toHaveBeenCalledWith('/api/v1/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123',
            name: 'Test User',
          }),
        });
      });

      it('should handle registration errors', async () => {
        const mockResponse = {
          ok: false,
          status: 400,
          json: () => Promise.resolve({
            success: false,
            error: {
              code: 'EMAIL_EXISTS',
              message: 'Email already registered',
              recoverability: 'terminal',
            },
          }),
        };

        (fetch as any).mockResolvedValueOnce(mockResponse);

        const result = await register({
          email: 'existing@example.com',
          password: 'password123',
          name: 'Test User',
        });

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe('EMAIL_EXISTS');
        expect(result.error?.recoverability).toBe('terminal');
      });
    });

    describe('login', () => {
      it('should successfully login with valid credentials', async () => {
        const mockResponse = {
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: {
              user: {
                id: 'user-1',
                email: 'test@example.com',
                name: 'Test User',
              },
              tokens: {
                accessToken: 'valid-access-token',
                refreshToken: 'valid-refresh-token',
                expiresIn: 3600,
              },
            },
          }),
        };

        (fetch as any).mockResolvedValueOnce(mockResponse);

        const result = await login({
          email: 'test@example.com',
          password: 'password123',
        });

        expect(result.success).toBe(true);
        expect(result.data?.tokens.accessToken).toBe('valid-access-token');
      });

      it('should handle invalid credentials', async () => {
        const mockResponse = {
          ok: false,
          status: 401,
          json: () => Promise.resolve({
            success: false,
            error: {
              code: 'INVALID_CREDENTIALS',
              message: 'Invalid email or password',
              recoverability: 'terminal',
            },
          }),
        };

        (fetch as any).mockResolvedValueOnce(mockResponse);

        const result = await login({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe('INVALID_CREDENTIALS');
      });

      it('should store tokens in localStorage on successful login', async () => {
        const mockResponse = {
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: {
              user: { id: 'user-1', email: 'test@example.com', name: 'Test' },
              tokens: {
                accessToken: 'token-123',
                refreshToken: 'refresh-456',
                expiresIn: 3600,
              },
            },
          }),
        };

        (fetch as any).mockResolvedValueOnce(mockResponse);

        await login({ email: 'test@example.com', password: 'pass' });

        expect(localStorage.getItem('accessToken')).toBe('token-123');
        expect(localStorage.getItem('refreshToken')).toBe('refresh-456');
      });
    });

    describe('refreshToken', () => {
      it('should refresh access token with valid refresh token', async () => {
        localStorage.setItem('refreshToken', 'valid-refresh-token');

        const mockResponse = {
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: {
              accessToken: 'new-access-token',
              refreshToken: 'new-refresh-token',
              expiresIn: 3600,
            },
          }),
        };

        (fetch as any).mockResolvedValueOnce(mockResponse);

        const result = await refreshToken();

        expect(result.success).toBe(true);
        expect(result.data?.accessToken).toBe('new-access-token');
        expect(localStorage.getItem('accessToken')).toBe('new-access-token');
      });

      it('should handle refresh token failure', async () => {
        localStorage.setItem('refreshToken', 'invalid-token');

        const mockResponse = {
          ok: false,
          status: 401,
          json: () => Promise.resolve({
            success: false,
            error: {
              code: 'INVALID_REFRESH_TOKEN',
              message: 'Refresh token is invalid or expired',
              recoverability: 'terminal',
            },
          }),
        };

        (fetch as any).mockResolvedValueOnce(mockResponse);

        const result = await refreshToken();

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe('INVALID_REFRESH_TOKEN');
        expect(localStorage.getItem('accessToken')).toBeNull();
        expect(localStorage.getItem('refreshToken')).toBeNull();
      });
    });

    describe('logout', () => {
      it('should successfully logout and clear tokens', async () => {
        localStorage.setItem('accessToken', 'token');
        localStorage.setItem('refreshToken', 'refresh');

        const mockResponse = {
          ok: true,
          json: () => Promise.resolve({ success: true }),
        };

        (fetch as any).mockResolvedValueOnce(mockResponse);

        const result = await logout();

        expect(result.success).toBe(true);
        expect(localStorage.getItem('accessToken')).toBeNull();
        expect(localStorage.getItem('refreshToken')).toBeNull();
      });
    });
  });

  describe('Tasks API', () => {
    beforeEach(() => {
      localStorage.setItem('accessToken', 'test-token');
    });

    describe('getTasks', () => {
      it('should fetch all tasks with authorization', async () => {
        const mockTasks: Task[] = [
          { id: 'task-1', title: 'Task 1', status: 'todo', createdAt: '2024-01-01' },
          { id: 'task-2', title: 'Task 2', status: 'done', createdAt: '2024-01-02' },
        ];

        const mockResponse = {
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: { tasks: mockTasks },
          }),
        };

        (fetch as any).mockResolvedValueOnce(mockResponse);

        const result = await getTasks();

        expect(result.success).toBe(true);
        expect(result.data?.tasks).toHaveLength(2);
        expect(fetch).toHaveBeenCalledWith('/api/v1/tasks', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          },
        });
      });

      it('should handle unauthorized access', async () => {
        localStorage.removeItem('accessToken');

        const result = await getTasks();

        expect(result.success).toBe(false);
        expect(result.error?.code).toBe('UNAUTHORIZED');
      });
    });

    describe('createTask', () => {
      it('should create a new task', async () => {
        const newTask = { title: 'New Task', description: 'Description' };
        const mockResponse = {
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: {
              task: {
                id: 'task-new',
                ...newTask,
                status: 'todo',
                createdAt: '2024-01-03',
              },
            },
          }),
        };

        (fetch as any).mockResolvedValueOnce(mockResponse);

        const result = await createTask(newTask);

        expect(result.success).toBe(true);
        expect(result.data?.task.title).toBe('New Task');
        expect(fetch).toHaveBeenCalledWith('/api/v1/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          },
          body: JSON.stringify(newTask),
        });
      });
    });

    describe('updateTask', () => {
      it('should update an existing task', async () => {
        const updates = { title: 'Updated Task', status: 'done' as const };
        const mockResponse = {
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: {
              task: {
                id: 'task-1',
                title: 'Updated Task',
                status: 'done',
                description: 'Original description',
                createdAt: '2024-01-01',
              },
            },
          }),
        };

        (fetch as any).mockResolvedValueOnce(mockResponse);

      const result = await updateTask('task-1', updates);

      expect(result.success).toBe(true);
      expect(result.data?.task.title).toBe('Updated Task');
      expect(result.data?.task.status).toBe('done');
      });
    });

    describe('deleteTask', () => {
      it('should delete a task', async () => {
        const mockResponse = {
          ok: true,
          json: () => Promise.resolve({ success: true }),
        };

        (fetch as any).mockResolvedValueOnce(mockResponse);

        const result = await deleteTask('task-1');

        expect(result.success).toBe(true);
        expect(fetch).toHaveBeenCalledWith('/api/v1/tasks/task-1', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          },
        });
      });
    });

    describe('getTaskById', () => {
      it('should fetch a single task by ID', async () => {
        const mockResponse = {
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: {
              task: {
                id: 'task-1',
                title: 'Task 1',
                status: 'todo',
                createdAt: '2024-01-01',
              },
            },
          }),
        };

        (fetch as any).mockResolvedValueOnce(mockResponse);

        const result = await getTaskById('task-1');

        expect(result.success).toBe(true);
        expect(result.data?.task.id).toBe('task-1');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      (fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await login({ email: 'test@test.com', password: 'pass' });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NETWORK_ERROR');
      expect(result.error?.recoverability).toBe('retryable');
    });

    it('should handle server errors (5xx)', async () => {
      // Set access token for authenticated request
      localStorage.setItem('accessToken', 'test-token');

      const mockResponse = {
        ok: false,
        status: 500,
        json: () => Promise.resolve({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Internal server error',
            recoverability: 'retryable',
          },
        }),
      };

      (fetch as any).mockResolvedValueOnce(mockResponse);

      const result = await getTasks();

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INTERNAL_ERROR');
      expect(result.error?.recoverability).toBe('retryable');
    });

    it('should handle parsing errors', async () => {
      // Set access token for authenticated request
      localStorage.setItem('accessToken', 'test-token');

      const mockResponse = {
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON')),
      };

      (fetch as any).mockResolvedValueOnce(mockResponse);

      const result = await getTasks();

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('PARSE_ERROR');
    });
  });
});
