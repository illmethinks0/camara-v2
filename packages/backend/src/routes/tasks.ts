import { FastifyInstance } from 'fastify';
import { taskService } from '../services/task.js';
import { httpBoundary } from '../adapters/http.js';
import { z } from 'zod';
import { TaskLane, TaskRisk, TaskDiffEstimate } from '../core/domain.js';

// Validation schemas
const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  priority: z.number().int().min(0).max(3).optional(),
  assigneeId: z.string().uuid().optional(),
  parentId: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
  deliverables: z.array(z.string()).optional(),
  evals: z.array(z.string()).optional(),
  lane: z.enum(['frontend', 'backend', 'data', 'auth', 'qa', 'devops']).optional(),
  risk: z.enum(['low', 'med', 'high']).optional(),
  diffEstimate: z.enum(['very_small', 'small', 'medium', 'large']).optional(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'done', 'blocked']).optional(),
  priority: z.number().int().min(0).max(3).optional(),
  assigneeId: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
  deliverables: z.array(z.string()).optional(),
  evals: z.array(z.string()).optional(),
}).partial();

const taskIdSchema = z.object({
  id: z.string().uuid(),
});

// Task routes
export async function taskRoutes(app: FastifyInstance) {
  // GET /tasks
  app.get('/', async (request, reply) => {
    const { status, assigneeId, lane, risk } = request.query as any;
    
    await httpBoundary(
      () => taskService.list({ status, assigneeId, lane, risk }),
      reply
    );
  });

  // GET /tasks/ready
  app.get('/ready', async (request, reply) => {
    await httpBoundary(
      () => taskService.getReady(),
      reply
    );
  });

  // GET /tasks/:id
  app.get('/:id', async (request, reply) => {
    const parseResult = taskIdSchema.safeParse(request.params);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid task ID',
          context: parseResult.error.errors,
        },
        recoverability: 'terminal',
      });
    }

    await httpBoundary(
      () => taskService.getById(parseResult.data.id),
      reply
    );
  });

  // POST /tasks
  app.post('/', async (request, reply) => {
    const parseResult = createTaskSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          context: parseResult.error.errors,
        },
        recoverability: 'terminal',
      });
    }

    await httpBoundary(
      () => taskService.create(parseResult.data),
      reply
    );
  });

  // PATCH /tasks/:id
  app.patch('/:id', async (request, reply) => {
    const idParseResult = taskIdSchema.safeParse(request.params);
    if (!idParseResult.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid task ID',
          context: idParseResult.error.errors,
        },
        recoverability: 'terminal',
      });
    }

    const bodyParseResult = updateTaskSchema.safeParse(request.body);
    if (!bodyParseResult.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          context: bodyParseResult.error.errors,
        },
        recoverability: 'terminal',
      });
    }

    await httpBoundary(
      () => taskService.update(idParseResult.data.id, bodyParseResult.data),
      reply
    );
  });

  // DELETE /tasks/:id
  app.delete('/:id', async (request, reply) => {
    const parseResult = taskIdSchema.safeParse(request.params);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid task ID',
          context: parseResult.error.errors,
        },
        recoverability: 'terminal',
      });
    }

    await httpBoundary(
      () => taskService.delete(parseResult.data.id),
      reply
    );
  });
}
