import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { userRepository, prisma } from '../adapters/db.js';
import { Result, ok, err } from '../core/result.js';
import { User, UserRole, ErrorCodes } from '../core/domain.js';

// Error types
export interface AuthError {
  code: string;
  message: string;
  context?: Record<string, unknown>;
}

// Token payload
export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

// Config
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_ACCESS_EXPIRY = parseInt(process.env.JWT_ACCESS_EXPIRY || '900'); // 15 min
const JWT_REFRESH_EXPIRY = parseInt(process.env.JWT_REFRESH_EXPIRY || '604800'); // 7 days
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12');

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

// Verify password
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generate tokens
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_ACCESS_EXPIRY });
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId, tokenId: crypto.randomUUID() }, JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRY,
  });
}

// Verify token
export function verifyAccessToken(token: string): Result<TokenPayload, AuthError> {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return ok(payload);
  } catch (error) {
    return err(
      {
        code: ErrorCodes.UNAUTHORIZED,
        message: 'Invalid or expired token',
      },
      'terminal'
    );
  }
}

// Auth service
export const authService = {
  // Register new user
  async register(data: {
    email: string;
    name: string;
    password: string;
  }): Promise<Result<{ user: User; accessToken: string; refreshToken: string }, AuthError>> {
    // Validate password
    if (data.password.length < 12) {
      return err(
        {
          code: ErrorCodes.VALIDATION_ERROR,
          message: 'Password must be at least 12 characters',
        },
        'terminal'
      );
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const userResult = await userRepository.create({
      email: data.email,
      name: data.name,
      passwordHash,
    });

    if (userResult.ok === false) {
      if (userResult.error.code === ErrorCodes.DB_UNIQUE_VIOLATION) {
        return err(
          {
            code: ErrorCodes.VALIDATION_ERROR,
            message: 'Email already exists',
          },
          'terminal'
        );
      }
      return err(userResult.error, userResult.recoverability);
    }

    const user = userResult.data;

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
    });

    const refreshToken = generateRefreshToken(user.id);
    const refreshTokenHash = await bcrypt.hash(refreshToken, BCRYPT_ROUNDS);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshTokenHash,
        expiresAt: new Date(Date.now() + JWT_REFRESH_EXPIRY * 1000),
      },
    });

    return ok({ user, accessToken, refreshToken });
  },

  // Login
  async login(data: {
    email: string;
    password: string;
  }): Promise<Result<{ user: User; accessToken: string; refreshToken: string }, AuthError>> {
    // Find user
    const userResult = await userRepository.findByEmail(data.email);

    if (userResult.ok === false) {
      return err(userResult.error, userResult.recoverability);
    }

    const user = userResult.data;

    if (!user || user.deletedAt) {
      return err(
        {
          code: ErrorCodes.INVALID_CREDENTIALS,
          message: 'Invalid email or password',
        },
        'terminal'
      );
    }

    // Verify password
    const isValid = await verifyPassword(data.password, user.passwordHash);

    if (!isValid) {
      return err(
        {
          code: ErrorCodes.INVALID_CREDENTIALS,
          message: 'Invalid email or password',
        },
        'terminal'
      );
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
    });

    const refreshToken = generateRefreshToken(user.id);
    const refreshTokenHash = await bcrypt.hash(refreshToken, BCRYPT_ROUNDS);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshTokenHash,
        expiresAt: new Date(Date.now() + JWT_REFRESH_EXPIRY * 1000),
      },
    });

    return ok({ user, accessToken, refreshToken });
  },

  // Refresh access token
  async refresh(refreshToken: string): Promise<Result<{ accessToken: string; refreshToken: string }, AuthError>> {
    // Verify refresh token
    let payload: { userId: string; tokenId: string };
    try {
      payload = jwt.verify(refreshToken, JWT_SECRET) as { userId: string; tokenId: string };
    } catch {
      return err(
        {
          code: ErrorCodes.UNAUTHORIZED,
          message: 'Invalid refresh token',
        },
        'terminal'
      );
    }

    // Find stored refresh token
    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        userId: payload.userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!storedToken) {
      return err(
        {
          code: ErrorCodes.UNAUTHORIZED,
          message: 'Refresh token not found or expired',
        },
        'terminal'
      );
    }

    // Verify token hash
    const isValid = await bcrypt.compare(refreshToken, storedToken.tokenHash);

    if (!isValid) {
      return err(
        {
          code: ErrorCodes.UNAUTHORIZED,
          message: 'Invalid refresh token',
        },
        'terminal'
      );
    }

    // Get user
    const userResult = await userRepository.findById(payload.userId);

    if (userResult.ok === false || !userResult.data) {
      return err(
        {
          code: ErrorCodes.UNAUTHORIZED,
          message: 'User not found',
        },
        'terminal'
      );
    }

    const user = userResult.data;

    // Revoke old token
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    // Generate new tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
    });

    const newRefreshToken = generateRefreshToken(user.id);
    const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, BCRYPT_ROUNDS);

    // Store new refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: newRefreshTokenHash,
        expiresAt: new Date(Date.now() + JWT_REFRESH_EXPIRY * 1000),
      },
    });

    return ok({ accessToken, refreshToken: newRefreshToken });
  },

  // Logout
  async logout(refreshToken: string): Promise<Result<void, AuthError>> {
    try {
      // Find and revoke token
      const storedTokens = await prisma.refreshToken.findMany({
        where: {
          revokedAt: null,
        },
      });

      for (const token of storedTokens) {
        if (await bcrypt.compare(refreshToken, token.tokenHash)) {
          await prisma.refreshToken.update({
            where: { id: token.id },
            data: { revokedAt: new Date() },
          });
          return ok(undefined);
        }
      }

      return ok(undefined); // Token not found is still successful logout
    } catch (error) {
      return err({
        code: ErrorCodes.DB_CONNECTION_FAILED,
        message: 'Database error during logout',
        context: { original: String(error) },
      }, 'retryable');
    }
  },
};
