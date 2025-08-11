import Fastify from 'fastify';
import { app } from './app/app';
import { agent } from '@marketing-service/sdk/agent';
import { logger } from '@marketing-service/sdk/logger';

const serviceName = 'marketing-service';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 5002;

// Instantiate Fastify with some config
const server = Fastify({
  logger: true
});

// Register your application as a normal plugin.
server.register(app);

async function start() {
  try {
    await server.listen({ port, host });

    logger.info(`${serviceName} started: http://${host}:${port}`);

    // await agent.start().catch((err) => {
    //   logger.error('Failed to start marketing-agent:', err);
    // });
  } catch (err) {
    logger.error('Failed to start marketing-service', err);
    process.exit(1);
  }
}

start();