import { FastifyInstance, FastifyRequest } from 'fastify';
import { db } from '@dashboard-service/sdk/db';
import { WingError } from '@awing/wingerror';

export default async function (fastify: FastifyInstance) {
  fastify.get('/content/campaign/list', async function (request: FastifyRequest) {
    try {
      const records = db.campaigns.records();
      return WingError.ok(records, 'Campaigns retrieved successfully');
    } catch (error) {
      return WingError.error(error);
    }
  });

  fastify.get('/content/campaign/event/list', async function (request: FastifyRequest) {
    try {
      const { campaign } = request.query as { campaign: string };

      if (!campaign) {
        return WingError.badRequest('Campaign parameter is required');
      }

      const events = db.contents.get(campaign);
      await events.load();
      const records = events.records();
      return WingError.ok(records, 'Campaign events retrieved successfully');
    } catch (error) {
      return WingError.error(error);
    }
  });

  fastify.get('/content/campaign/post/list', async function (request: FastifyRequest) {
    try {
      const { campaign, event } = request.query as { campaign: string, event?: Date };

      if (!campaign) {
        return WingError.badRequest('Campaign parameter is required');
      }

      const post = await db.campaigns.getPost(campaign, new Date(event));
      const records = post.records()
      return WingError.ok(records, 'Campaign post retrieved successfully');
    } catch (error) {
      return WingError.error(error);
    }
  });
}
