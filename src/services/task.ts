import { taskRepository } from '../adapters/db.js';
import { Result, ok, err } from '../core/result.js';
import { Task, TaskStatus, ErrorCodes } from '../core/domain.js';

// Error type
export interface TaskError {
  code: string;
  message: string;
  context?: Record<string, unknown>;
}

// Task service
export const taskService = {
  // Create task
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
  }): Promise<Result<Task, TaskError>> {
    // Validate title
    if (!data.title || data.title.length < 1) {
      return err(
        {
          code: ErrorCodes.VALIDATION_ERROR,
          message: 'Title is required',
        },
        'terminal'
      );
    }

    // Validate priority
    if (data.priority !== undefined && (data.priority < 0 || data.priority > 3)) {
      return err(
        {
          code: ErrorCodes.VALIDATION_ERROR,
          message: 'Priority must be between 0 and 3',
        },
        'terminal'
      );
    }

    return taskRepository.create(data);
  },

  // Get task by ID
  async getById(id: string): Promise<Result<Task, TaskError>> {
    const result = await taskRepository.findById(id);

    if (result.ok === false) {
      return err(result.error, result.recoverability);
    }

    if (!result.data) {
      return err(
        {
          code: ErrorCodes.DB_RECORD_NOT_FOUND,
          message: `Task ${id} not found`,
        },
        'terminal'
      );
    }

    return ok(result.data);
  },

  // Update task
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
  ): Promise<Result<Task, TaskError>> {
    // Check if task exists
    const existingResult = await taskRepository.findById(id);

    if (existingResult.ok === false) {
      return err(existingResult.error, existingResult.recoverability);
    }

    if (!existingResult.data) {
      return err(
        {
          code: ErrorCodes.DB_RECORD_NOT_FOUND,
          message: `Task ${id} not found`,
        },
        'terminal'
      );
    }

    // Validate status transition
    if (data.status) {
      const validTransitions: Record<TaskStatus, TaskStatus[]> = {
        pending: ['in_progress', 'blocked'],
        in_progress: ['done', 'blocked', 'pending'],
        done: ['in_progress'],
        blocked: ['pending', 'in_progress'],
      };

      const currentStatus = existingResult.data.status;
      if (!validTransitions[currentStatus].includes(data.status)) {
        return err(
          {
            code: ErrorCodes.BUSINESS_RULE_VIOLATION,
            message: `Invalid status transition from ${currentStatus} to ${data.status}`,
          },
          'terminal'
        );
      }
    }

    return taskRepository.update(id, data);
  },

  // Delete task
  async delete(id: string): Promise<Result<void, TaskError>> {
    const result = await taskRepository.delete(id);

    if (result.ok === false) {
      return err(result.error, result.recoverability);
    }

    return ok(undefined);
  },

  // List tasks
  async list(params?: {
    status?: Task['status'];
    assigneeId?: string;
    lane?: Task['lane'];
    risk?: Task['risk'];
  }): Promise<Result<Task[], TaskError>> {
    return taskRepository.findMany(params);
  },

  // Get ready tasks (top-level pending tasks)
  async getReady(): Promise<Result<Task[], TaskError>> {
    return taskRepository.findReady();
  },
};
