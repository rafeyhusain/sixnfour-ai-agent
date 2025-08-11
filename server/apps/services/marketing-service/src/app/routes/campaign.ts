import { FastifyInstance } from 'fastify';
import { agent } from '@marketing-service/sdk/agent';
import { Campaign } from '@awing/marketing-db';
import { WingResponse, WingError } from '@awing/wingerror';
import { logger } from '@marketing-service/sdk/logger';

export default async function (fastify: FastifyInstance) {
  fastify.post('/campaign/create', async (req, reply) => {
    try {
      const campaign = req.body as Campaign;
      if (!campaign) {
        const res = WingError.badRequest('Missing campaign');
        reply.code(400).send(res);
        return;
      }
      const response: WingResponse = await agent.create(campaign);
      reply.send(response);
    } catch (err) {
      logger.error('Error creating campaign:', err);
      const res = WingError.error(err);
      reply.code(500).send(res);
    }
  });

  fastify.post('/campaign/update', async (req, reply) => {
    try {
      const campaign = req.body as Campaign;
      if (!campaign || !campaign.id) {
        const res = WingError.badRequest('Missing campaign or campaign ID');
        reply.code(400).send(res);
        return;
      }

      const res = await agent.update(campaign);
      reply.send(res);
    } catch (err) {
      logger.error('Error updating campaign:', err);
      const res = WingError.error(err);
      reply.code(500).send(res);
    }
  });

  fastify.post('/campaign/delete', async (req, reply) => {
    try {
      const campaign = req.body as Campaign;
      if (!campaign || !campaign.id) {
        const res = WingError.badRequest('Missing campaign or campaign ID');
        reply.code(400).send(res);
        return;
      }

      const res = await agent.delete(campaign.id);
      reply.send(res);
    } catch (err) {
      logger.error('Error deleting campaign:', err);
      const res = WingError.error(err);
      reply.code(500).send(res);
    }
  });

  fastify.get('/campaign/get', async (req, reply) => {
    try {
      const { id } = req.query as { id: string };
      
      if (!id) {
        const res = WingError.badRequest('Missing campaign ID');
        reply.code(400).send(res);
        return;
      }

      const res = WingError.ok(agent.db.campaigns.recordById(id));
      reply.send(res);
    } catch (err) {
      logger.error('Error getting campaign:', err);
      const res = WingError.error(err);
      reply.code(500).send(res);
    }
  });

  fastify.get('/campaign/list', async (req, reply) => {
    try {
      const campaigns = agent.db.campaigns.records();
      const res = WingError.ok(campaigns);
      reply.send(res);
    } catch (err) {
      logger.error('Error listing campaigns:', err);
      const res = WingError.error(err);
      reply.code(500).send(res);
    }
  });
}

