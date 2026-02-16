/**
 * CAMARA v2 API Client (auth + session helpers)
 */

import type {
  AuthTokens,
  APIResult,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenResponse,
} from '../types/camara';

const API_BASE_URL = '/api/v1';

const getAccessToken = (): string | null => localStorage.getItem('accessToken');

const getRefreshToken = (): string | null => localStorage.getItem('refreshToken');

const setTokens = (tokens: AuthTokens): void => {
  localStorage.setItem('accessToken', tokens.accessToken);
  localStorage.setItem('refreshToken', tokens.refreshToken);
};

const clearTokens = (): void => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

const createHeaders = (includeAuth = false): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
};

const parseResponse = async <T>(response: Response): Promise<APIResult<T>> => {
  try {
    const payload = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: payload.error || {
          code: 'UNKNOWN_ERROR',
          message: 'Error desconocido',
          recoverability: 'terminal',
        },
      };
    }

    return {
      success: true,
      data: (payload.data ?? payload) as T,
    };
  } catch {
    return {
      success: false,
      error: {
        code: 'PARSE_ERROR',
        message: 'No se pudo procesar la respuesta del servidor',
        recoverability: 'terminal',
      },
    };
  }
};

const handleError = (error: unknown): APIResult<never> => {
  if (error instanceof Error && error.message.includes('Network')) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Error de red. Comprueba tu conexion e intentalo de nuevo.',
        recoverability: 'retryable',
      },
    };
  }

  return {
    success: false,
    error: {
      code: 'UNKNOWN_ERROR',
      message: 'Ocurrio un error inesperado',
      recoverability: 'terminal',
    },
  };
};

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

    if (result.success && result.data?.tokens) {
      setTokens(result.data.tokens);
    }

    return result;
  } catch (error) {
    return handleError(error);
  }
};

export const login = async (request: LoginRequest): Promise<APIResult<LoginResponse>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(request),
    });

    const result = await parseResponse<LoginResponse>(response);

    if (result.success && result.data?.tokens) {
      setTokens(result.data.tokens);
    }

    return result;
  } catch (error) {
    return handleError(error);
  }
};

export const refreshToken = async (): Promise<APIResult<RefreshTokenResponse>> => {
  const refresh = getRefreshToken();

  if (!refresh) {
    clearTokens();
    return {
      success: false,
      error: {
        code: 'NO_REFRESH_TOKEN',
        message: 'No hay refresh token disponible',
        recoverability: 'terminal',
      },
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({ refreshToken: refresh }),
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

export const logout = async (): Promise<APIResult<void>> => {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify({ refreshToken: getRefreshToken() ?? '' }),
    });
  } catch {
    // best effort logout
  }

  clearTokens();
  return { success: true };
};

export const isAuthenticated = (): boolean => Boolean(getAccessToken());
