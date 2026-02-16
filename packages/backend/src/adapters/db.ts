import { Result, err, ok } from '../core/result.js';
import { ErrorCodes } from '../core/domain.js';
import { camaraStore } from '../services/camaraStore.js';

export interface DatabaseError {
  code: string;
  message: string;
  context?: Record<string, unknown>;
}

export async function dbOperation<T>(operation: () => Promise<T> | T): Promise<Result<T, DatabaseError>> {
  try {
    const result = await operation();
    return ok(result);
  } catch (error) {
    return err(
      {
        code: ErrorCodes.DB_CONNECTION_FAILED,
        message: 'Operacion de datos fallida',
        context: { original: String(error) },
      },
      'retryable'
    );
  }
}

export const userRepository = {
  async findById(id: string) {
    return dbOperation(async () => camaraStore.getUserById(id) ?? null);
  },

  async findByEmail(email: string) {
    return dbOperation(async () => camaraStore.getUserByEmail(email) ?? null);
  },

  async create(data: {
    email: string;
    name: string;
    passwordHash: string;
    role?: 'administrator' | 'instructor' | 'participant';
  }) {
    return dbOperation(async () =>
      camaraStore.createAuthUser({
        email: data.email,
        name: data.name,
        passwordHash: data.passwordHash,
        role: data.role,
      })
    );
  },
};

export const courseRepository = {
  async list() {
    return dbOperation(async () => camaraStore.listCourses());
  },
};

export const participantRepository = {
  async listForUser(user: { userId: string; email: string; role: 'administrator' | 'instructor' | 'participant'; name: string }) {
    return dbOperation(async () => camaraStore.listParticipants(user));
  },
};
