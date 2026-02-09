/**
 * CAMARA v2 API Client
 * Implementation to satisfy TDD tests
 */

import type {
  AuthTokens,
  APIResult,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenResponse,
  GetTasksResponse,
  GetTaskResponse,
  CreateTaskRequest,
  CreateTaskResponse,
  UpdateTaskRequest,
  UpdateTaskResponse,
} from '../types/camara';

const API_BASE_URL = '/api/v1';

/**
 * Gets the stored access token
 */
const getAccessToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

/**
 * Gets the stored refresh token
 */
const getRefreshToken = (): string | null => {
  return localStorage.getItem('refreshToken');
};

/**
 * Stores authentication tokens
 */
const setTokens = (tokens: AuthTokens): void => {
  localStorage.setItem('accessToken', tokens.accessToken);
  localStorage.setItem('refreshToken', tokens.refreshToken);
};

/**
 * Clears authentication tokens
 */
const clearTokens = (): void => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

/**
 * Creates standard headers with authorization if token exists
 */
const createHeaders = (includeAuth: boolean = false): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

/**
 * Parses API response and returns standardized result
 */
const parseResponse = async <T>(response: Response): Promise<APIResult<T>> => {
  try {
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || {
          code: 'UNKNOWN_ERROR',
          message: 'An unknown error occurred',
          recoverability: 'terminal',
        },
      };
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'PARSE_ERROR',
        message: 'Failed to parse response',
        recoverability: 'terminal',
      },
    };
  }
};

/**
 * Handles network and other errors
 */
const handleError = (error: unknown): APIResult<never> => {
  if (error instanceof Error) {
    if (error.message.includes('Network')) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Network error. Please check your connection and try again.',
          recoverability: 'retryable',
        },
      };
    }
  }

  return {
    success: false,
    error: {
      code: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred',
      recoverability: 'terminal',
    },
  };
};

// ==================== AUTHENTICATION ====================

/**
 * Register a new user
 */
export const register = async (
  request: RegisterRequest
): Promise<APIResult<RegisterResponse>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(request),
    });

    const result = await parseResponse<RegisterResponse>(response);

    if (result.success && result.data) {
      setTokens(result.data.tokens);
    }

    return result;
  } catch (error) {
    return handleError(error);
  }
};

/**
 * Login with credentials
 */
export const login = async (
  request: LoginRequest
): Promise<APIResult<LoginResponse>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(request),
    });

    const result = await parseResponse<LoginResponse>(response);

    if (result.success && result.data) {
      setTokens(result.data.tokens);
    }

    return result;
  } catch (error) {
    return handleError(error);
  }
};

/**
 * Refresh access token
 */
export const refreshToken = async (): Promise<APIResult<RefreshTokenResponse>> => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    clearTokens();
    return {
      success: false,
      error: {
        code: 'NO_REFRESH_TOKEN',
        message: 'No refresh token available',
        recoverability: 'terminal',
      },
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({ refreshToken }),
    });

    const result = await parseResponse<RefreshTokenResponse>(response);

    if (result.success && result.data) {
      setTokens({
        accessToken: result.data.accessToken,
        refreshToken: result.data.refreshToken,
        expiresIn: result.data.expiresIn,
      });
    } else {
      clearTokens();
    }

    return result;
  } catch (error) {
    clearTokens();
    return handleError(error);
  }
};

/**
 * Logout user
 */
export const logout = async (): Promise<APIResult<void>> => {
  const token = getAccessToken();

  if (token) {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: createHeaders(true),
      });
    } catch (error) {
      // Ignore errors during logout
    }
  }

  clearTokens();
  return { success: true };
};

// ==================== TASKS ====================

/**
 * Get all tasks
 */
export const getTasks = async (): Promise<APIResult<GetTasksResponse>> => {
  const token = getAccessToken();

  if (!token) {
    return {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
        recoverability: 'terminal',
      },
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'GET',
      headers: createHeaders(true),
    });

    return await parseResponse<GetTasksResponse>(response);
  } catch (error) {
    return handleError(error);
  }
};

/**
 * Get a single task by ID
 */
export const getTaskById = async (id: string): Promise<APIResult<GetTaskResponse>> => {
  const token = getAccessToken();

  if (!token) {
    return {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
        recoverability: 'terminal',
      },
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'GET',
      headers: createHeaders(true),
    });

    return await parseResponse<GetTaskResponse>(response);
  } catch (error) {
    return handleError(error);
  }
};

/**
 * Create a new task
 */
export const createTask = async (
  request: CreateTaskRequest
): Promise<APIResult<CreateTaskResponse>> => {
  const token = getAccessToken();

  if (!token) {
    return {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
        recoverability: 'terminal',
      },
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify(request),
    });

    return await parseResponse<CreateTaskResponse>(response);
  } catch (error) {
    return handleError(error);
  }
};

/**
 * Update an existing task
 */
export const updateTask = async (
  id: string,
  request: UpdateTaskRequest
): Promise<APIResult<UpdateTaskResponse>> => {
  const token = getAccessToken();

  if (!token) {
    return {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
        recoverability: 'terminal',
      },
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PATCH',
      headers: createHeaders(true),
      body: JSON.stringify(request),
    });

    return await parseResponse<UpdateTaskResponse>(response);
  } catch (error) {
    return handleError(error);
  }
};

/**
 * Delete a task
 */
export const deleteTask = async (id: string): Promise<APIResult<void>> => {
  const token = getAccessToken();

  if (!token) {
    return {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
        recoverability: 'terminal',
      },
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: createHeaders(true),
    });

    return await parseResponse<void>(response);
  } catch (error) {
    return handleError(error);
  }
};
