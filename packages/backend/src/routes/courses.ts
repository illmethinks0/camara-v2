import { FastifyInstance } from 'fastify';
import { camaraStore } from '../services/camaraStore.js';

export async function courseRoutes(app: FastifyInstance) {
  app.get('/', async (_request, reply) => {
    return reply.send({ data: { courses: camaraStore.listCourses() } });
  });
}
