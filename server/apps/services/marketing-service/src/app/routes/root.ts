import { FastifyInstance } from 'fastify';

export default async function (fastify: FastifyInstance) {
  fastify.get('/', async function () {
    return { message: 'Hello marketing-service' };
  });

  fastify.get('/ping', async function () {
    const now = new Date().toISOString();
    const message =  `Ping marketing-service ${now}`;

    console.log(message);

    return { message: message };
  });
}
