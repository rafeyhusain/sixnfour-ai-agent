import Fastify from 'fastify';
import { app } from './app/app';
import { Logger } from '@awing/pino-plugin'
import { agent } from '@dashboard-service/sdk/agent';
import { config } from '@awing/config-plugin';

const logger = Logger(config.serviceName);

// Instantiate Fastify with some config
const server = Fastify({
  logger: true,
});

// Register your application as a normal plugin.
server.register(app);

async function start() {
  try {
    await server.listen({ port: config.port, host: config.host });
    logger.info(`${config.serviceName} started: http://${config.host}:${config.port}`);

    await agent.start().catch((err) => {
      logger.error('Failed to start marketing-agent:', err);
    });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();