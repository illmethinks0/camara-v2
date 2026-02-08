import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import { authRoutes } from './routes/auth.js';
import { taskRoutes } from './routes/tasks.js';

// Create app
export function createApp() {
  const app = Fastify({
    logger: true,
  });

  // Register plugins
  app.register(cors, {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  app.register(cookie);

  // Health check
  app.get('/health', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  });

  // API routes
  app.register(authRoutes, { prefix: '/api/v1/auth' });
  app.register(taskRoutes, { prefix: '/api/v1/tasks' });

  return app;
}

// Start server
async function main() {
  const app = createApp();
  const port = parseInt(process.env.PORT || '3000');
  const host = process.env.HOST || '0.0.0.0';

  try {
    await app.listen({ port, host });
    console.log(`Server listening on ${host}:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
