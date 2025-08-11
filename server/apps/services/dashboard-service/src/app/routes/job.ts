import { FastifyInstance } from 'fastify';
import { agent } from '@marketing-service/sdk/agent';
import { JobId, OperationId } from '@awing/marketing-db';
import { WingError, WingResponse } from '@awing/wingerror';
import { logger } from '@marketing-service/sdk/logger';

export default async function (fastify: FastifyInstance) {
  fastify.get('/job/start', async (req, reply) => {
    const { id } = req.query as { id: string };

    if (!id) {
      const res = WingError.badRequest('Missing job id');
      reply.code(400).send(res);
      return;
    }

    let response: WingResponse[];
    try {
      switch (id) {
        case JobId.Schedule:
          response = await agent.scheduleAll();
          break;
        case JobId.Generate:
          response = await agent.generateAll();
          break;
        case JobId.Publish:
          response = await agent.publishAll();
          break;
        default:
          response = [WingError.badRequest('Invalid job id')];
      }
    } catch (err) {
      logger.error('Error running job:', err);
      response = [WingError.error(err)];
    }
    reply.send(response);
  });

  fastify.get('/job/manager/do', async (req, reply) => {
    const { id } = req.query as { id: string };

    if (!id) {
      const res = WingError.badRequest('Missing operation id');
      reply.code(400).send(res);
      return;
    }

    let response: WingResponse = WingError.ok('Operation completed');

    try {
      switch (id) {
        case OperationId.Start:
          await agent.jobManager.start();
          break;
        case OperationId.Stop:
          await agent.jobManager.stop();
          break;
          case OperationId.Restart:
          await agent.jobManager.restart();
          break;
        default:
          response = WingError.badRequest('Invalid operation id');
      }
    } catch (err) {
      logger.error('Error running job:', err);
      response = WingError.error(err);
    }
    reply.send(response);
  });
}
