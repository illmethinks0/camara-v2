import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import { authRoutes } from './routes/auth.js';
import { registerSwagger } from './plugins/swagger.js';

// Create app
export async function createApp() {
  const app = Fastify({
    logger: true,
  });

  // Register plugins
  app.register(cors, {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  app.register(cookie);

  // Register swagger
  await registerSwagger(app);

  // Health check
  app.get('/health', {
    schema: {
      description: 'Health check endpoint',
      tags: ['Health'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
            version: { type: 'string' },
          },
        },
      },
    },
  }, async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  });

  // API routes
  app.register(authRoutes, { prefix: '/api/v1/auth' });

  return app;
}

// Start server
async function main() {
  const app = await createApp();
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
