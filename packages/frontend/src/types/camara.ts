/**
 * CAMARA v2 API Types
 */

export interface User {
  id: string;
  email: string;
  name: string;
  role?: 'administrator' | 'instructor' | 'participant' | 'admin' | 'user';
  createdAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface APIError {
  code: string;
  message: string;
  recoverability: 'retryable' | 'terminal';
}

export interface APIResult<T> {
  success: boolean;
  data?: T;
  error?: APIError;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface RegisterResponse {
  user: User;
  tokens: AuthTokens;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
