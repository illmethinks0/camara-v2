import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { camaraStore } from './camaraStore.js';
import { Result, err, ok } from '../core/result.js';
import { AuthenticatedUser, ErrorCodes, Role } from '../core/domain.js';

export interface AuthError {
  code: string;
  message: string;
  context?: Record<string, unknown>;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: Role;
  name: string;
}

interface RefreshTokenRecord {
  token: string;
  userId: string;
  expiresAt: number;
  revokedAt?: number;
}

const JWT_SECRET = process.env.JWT_SECRET || 'camara-demo-secret-change-me';
const ACCESS_EXPIRY_SECONDS = Number(process.env.JWT_ACCESS_EXPIRY ?? '900');
const REFRESH_EXPIRY_SECONDS = Number(process.env.JWT_REFRESH_EXPIRY ?? '604800');
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS ?? '12');

const refreshTokenStore = new Map<string, RefreshTokenRecord>();

function issueAccessToken(user: AuthenticatedUser): string {
  const payload: TokenPayload = {
    userId: user.userId,
    email: user.email,
    role: user.role,
    name: user.name,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_EXPIRY_SECONDS,
  });
}

function issueRefreshToken(userId: string): string {
  const tokenId = crypto.randomUUID();
  const token = jwt.sign(
    {
      userId,
      tokenId,
      kind: 'refresh',
    },
    JWT_SECRET,
    {
      expiresIn: REFRESH_EXPIRY_SECONDS,
    }
  );

  refreshTokenStore.set(tokenId, {
    token,
    userId,
    expiresAt: Date.now() + REFRESH_EXPIRY_SECONDS * 1000,
  });

  return token;
}

function parseRefreshToken(token: string): { userId: string; tokenId: string } {
  const payload = jwt.verify(token, JWT_SECRET) as { userId: string; tokenId: string; kind?: string };

  if (!payload.tokenId || payload.kind !== 'refresh') {
    throw new Error('Invalid refresh token kind');
  }

  return {
    userId: payload.userId,
    tokenId: payload.tokenId,
  };
}

export function verifyAccessToken(token: string): Result<TokenPayload, AuthError> {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return ok(payload);
  } catch {
    return err(
      {
        code: ErrorCodes.UNAUTHORIZED,
        message: 'Token de acceso invalido o expirado',
      },
      'terminal'
    );
  }
}

export const authService = {
  async register(data: {
    email: string;
    name: string;
    password: string;
    role?: Role;
  }): Promise<
    Result<
      {
        user: AuthenticatedUser;
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
      },
      AuthError
    >
  > {
    if (data.password.length < 12) {
      return err(
        {
          code: ErrorCodes.VALIDATION_ERROR,
          message: 'La contrasena debe tener al menos 12 caracteres',
        },
        'terminal'
      );
    }

    try {
      const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);
      const user = camaraStore.createAuthUser({
        email: data.email,
        name: data.name,
        passwordHash,
        role: data.role,
      });

      const accessToken = issueAccessToken(user);
      const refreshToken = issueRefreshToken(user.userId);

      return ok({
        user,
        accessToken,
        refreshToken,
        expiresIn: ACCESS_EXPIRY_SECONDS,
      });
    } catch (error) {
      if (error instanceof Error && /registrado/i.test(error.message)) {
        return err(
          {
            code: ErrorCodes.DB_UNIQUE_VIOLATION,
            message: error.message,
          },
          'terminal'
        );
      }

      return err(
        {
          code: ErrorCodes.INTERNAL_ERROR,
          message: 'No se pudo registrar el usuario',
        },
        'retryable'
      );
    }
  },

  async login(data: {
    email: string;
    password: string;
  }): Promise<
    Result<
      {
        user: AuthenticatedUser;
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
      },
      AuthError
    >
  > {
    const userRecord = camaraStore.getUserByEmail(data.email);

    if (!userRecord) {
      return err(
        {
          code: ErrorCodes.INVALID_CREDENTIALS,
          message: 'Credenciales invalidas',
        },
        'terminal'
      );
    }

    const valid = await camaraStore.verifyPassword(userRecord, data.password);
    if (!valid) {
      return err(
        {
          code: ErrorCodes.INVALID_CREDENTIALS,
          message: 'Credenciales invalidas',
        },
        'terminal'
      );
    }

    const user = camaraStore.toAuthUser(userRecord);
    const accessToken = issueAccessToken(user);
    const refreshToken = issueRefreshToken(user.userId);

    return ok({
      user,
      accessToken,
      refreshToken,
      expiresIn: ACCESS_EXPIRY_SECONDS,
    });
  },

  async refresh(refreshToken: string): Promise<Result<{ accessToken: string; refreshToken: string; expiresIn: number }, AuthError>> {
    try {
      const payload = parseRefreshToken(refreshToken);
      const record = refreshTokenStore.get(payload.tokenId);

      if (!record || record.token !== refreshToken || record.revokedAt || record.expiresAt < Date.now()) {
        return err(
          {
            code: ErrorCodes.UNAUTHORIZED,
            message: 'Refresh token invalido o expirado',
          },
          'terminal'
        );
      }

      record.revokedAt = Date.now();

      const user = camaraStore.getUserById(payload.userId);
      if (!user) {
        return err(
          {
            code: ErrorCodes.UNAUTHORIZED,
            message: 'Usuario no encontrado',
          },
          'terminal'
        );
      }

      const authUser = camaraStore.toAuthUser(user);
      const newAccessToken = issueAccessToken(authUser);
      const newRefreshToken = issueRefreshToken(authUser.userId);

      return ok({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: ACCESS_EXPIRY_SECONDS,
      });
    } catch {
      return err(
        {
          code: ErrorCodes.UNAUTHORIZED,
          message: 'Refresh token invalido o expirado',
        },
        'terminal'
      );
    }
  },

  async logout(refreshToken: string): Promise<Result<void, AuthError>> {
    try {
      if (!refreshToken) {
        return ok(undefined);
      }

      const payload = parseRefreshToken(refreshToken);
      const record = refreshTokenStore.get(payload.tokenId);
      if (record) {
        record.revokedAt = Date.now();
      }

      return ok(undefined);
    } catch {
      return ok(undefined);
    }
  },
};
