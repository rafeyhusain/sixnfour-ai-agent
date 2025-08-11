import { FastifyInstance, FastifyRequest } from 'fastify';
import { db } from '@marketing-service/sdk/db';
import { WingError } from '@awing/wingerror';

export default async function (fastify: FastifyInstance) {
  fastify.get('/db/reload', async function (request: FastifyRequest) {
    try {
      await db.reload();
      return WingError.ok('Database loaded successfully');
    } catch (error) {
      return WingError.error(error);
    }
  });

  fastify.get('/table/list', async function (request: FastifyRequest) {
    try {
      const tables = await db.tableNames();
      return WingError.ok(tables, 'Tables retrieved successfully');
    } catch (error) {
      return WingError.error(error);
    }
  });

  fastify.get('/table/get', async function (request: FastifyRequest) {
    try {
      const { name } = request.query as { name?: string };
      
      if (!name) {
        return WingError.badRequest('Table name is required');
      }

      const data = await db.get(name);
      return WingError.ok(data, 'Table data retrieved successfully');
    } catch (error) {
      return WingError.error(error);
    }
  });

  fastify.post('/table/set', async function (request: FastifyRequest) {
    try {
      const { name, json } = request.body as { name?: string, json?: string };
      
      if (!name) {
        return WingError.badRequest('Table name is required');
      }

      if (!json) {
        return WingError.badRequest('JSON data is required');
      }

      const result = await db.set(name, json);
      return WingError.ok(result, 'Table data set successfully');
    } catch (error) {
      return WingError.error(error);
    }
  });
}
