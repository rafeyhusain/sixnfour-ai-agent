import Fastify from 'fastify';
import { app } from './app/app';
import { Logger } from '@awing/pino-plugin'

const serviceName = 'auth-service';
const logger = Logger(serviceName);

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 5000;

// Instantiate Fastify with some config
const server = Fastify({
  logger: true,
});

// Register your application as a normal plugin.
server.register(app);

async function start() {
  try {
    await server.listen({ port, host });
    logger.info(`${serviceName} started: http://${host}:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();
