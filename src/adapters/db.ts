import { PrismaClient, Prisma } from '@prisma/client';
import { Result, ok, err } from '../core/result.js';
import { User, Task, ErrorCodes } from '../core/domain.js';

// Database error type
export interface DatabaseError {
  code: string;
  message: string;
  context?: Record<string, unknown>;
}

// Singleton Prisma client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Database boundary adapter - wraps all DB operations in Result
export async function dbOperation<T>(
  operation: () => Promise<T>
): Promise<Result<T, DatabaseError>> {
  try {
    const result = await operation();
    return ok(result);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Map Prisma errors to our error codes
      const errorMap: Record<string, string> = {
        P2002: ErrorCodes.DB_UNIQUE_VIOLATION,
        P2025: ErrorCodes.DB_RECORD_NOT_FOUND,
        P2003: ErrorCodes.DB_RECORD_NOT_FOUND,
      };

      return err(
        {
          code: errorMap[error.code] || ErrorCodes.DB_CONNECTION_FAILED,
          message: error.message,
          context: { prismaCode: error.code, meta: error.meta },
        },
        error.code === 'P1001' || error.code === 'P1002' ? 'retryable' : 'terminal'
      );
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
      return err(
        {
          code: ErrorCodes.DB_CONNECTION_FAILED,
          message: 'Database connection failed',
          context: { original: String(error) },
        },
        'retryable'
      );
    }

    return err(
      {
        code: ErrorCodes.DB_CONNECTION_FAILED,
        message: 'Unknown database error',
        context: { original: String(error) },
      },
      'retryable'
    );
  }
}

// User repository
export const userRepository = {
  async findById(id: string): Promise<Result<User | null, DatabaseError>> {
    return dbOperation(() =>
      prisma.user.findUnique({
        where: { id },
      })
    );
  },

  async findByEmail(email: string): Promise<Result<User | null, DatabaseError>> {
    return dbOperation(() =>
      prisma.user.findUnique({
        where: { email },
      })
    );
  },

  async create(data: {
    email: string;
    name: string;
    passwordHash: string;
    role?: 'user' | 'admin';
  }): Promise<Result<User, DatabaseError>> {
    return dbOperation(() =>
      prisma.user.create({
        data: {
          ...data,
          role: data.role || 'user',
        },
      })
    );
  },

  async update(
    id: string,
    data: Partial<Pick<User, 'name' | 'email' | 'role'>>
  ): Promise<Result<User, DatabaseError>> {
    return dbOperation(() =>
      prisma.user.update({
        where: { id },
        data,
      })
    );
  },

  async softDelete(id: string): Promise<Result<User, DatabaseError>> {
    return dbOperation(() =>
      prisma.user.update({
        where: { id },
        data: { deletedAt: new Date() },
      })
    );
  },

  async findMany(params?: {
    role?: 'user' | 'admin';
    deleted?: boolean;
  }): Promise<Result<User[], DatabaseError>> {
    return dbOperation(() =>
      prisma.user.findMany({
        where: {
          role: params?.role,
          deletedAt: params?.deleted === false ? null : undefined,
        },
      })
    );
  },
};

// Task repository
export const taskRepository = {
  async findById(id: string): Promise<Result<Task | null, DatabaseError>> {
    return dbOperation(() =>
      prisma.task.findUnique({
        where: { id },
        include: { assignee: true, children: true },
      })
    );
  },

  async create(data: {
    title: string;
    description: string;
    priority?: number;
    assigneeId?: string;
    parentId?: string;
    tags?: string[];
    deliverables?: string[];
    evals?: string[];
    lane?: Task['lane'];
    risk?: Task['risk'];
    diffEstimate?: Task['diffEstimate'];
  }): Promise<Result<Task, DatabaseError>> {
    return dbOperation(() =>
      prisma.task.create({
        data: {
          ...data,
          priority: data.priority ?? 2,
          lane: data.lane ?? 'backend',
          risk: data.risk ?? 'low',
          diffEstimate: data.diffEstimate ?? 'small',
          tags: data.tags ?? [],
          deliverables: data.deliverables ?? [],
          evals: data.evals ?? [],
        },
      })
    );
  },

  async update(
    id: string,
    data: Partial<
      Pick<
        Task,
        | 'title'
        | 'description'
        | 'status'
        | 'priority'
        | 'assigneeId'
        | 'tags'
        | 'deliverables'
        | 'evals'
      >
    >
  ): Promise<Result<Task, DatabaseError>> {
    return dbOperation(() =>
      prisma.task.update({
        where: { id },
        data,
      })
    );
  },

  async delete(id: string): Promise<Result<Task, DatabaseError>> {
    return dbOperation(() =>
      prisma.task.delete({
        where: { id },
      })
    );
  },

  async findMany(params?: {
    status?: Task['status'];
    assigneeId?: string;
    lane?: Task['lane'];
    risk?: Task['risk'];
  }): Promise<Result<Task[], DatabaseError>> {
    return dbOperation(() =>
      prisma.task.findMany({
        where: {
          status: params?.status,
          assigneeId: params?.assigneeId,
          lane: params?.lane,
          risk: params?.risk,
        },
        include: { assignee: true },
        orderBy: { createdAt: 'desc' },
      })
    );
  },

  async findReady(): Promise<Result<Task[], DatabaseError>> {
    return dbOperation(() =>
      prisma.task.findMany({
        where: {
          status: 'pending',
          parentId: null, // Top-level tasks
        },
        include: { assignee: true },
        orderBy: { priority: 'asc' },
      })
    );
  },
};
