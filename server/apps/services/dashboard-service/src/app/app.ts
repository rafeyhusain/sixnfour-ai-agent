import * as path from 'path';
import { FastifyInstance } from 'fastify';
import AutoLoad from '@fastify/autoload';
import fastifyStatic from '@fastify/static';
import { config } from '@awing/config-plugin';

/* eslint-disable-next-line */
export interface AppOptions {}

export async function app(fastify: FastifyInstance, opts: AppOptions) {
  // Register static file serving for uploads with public access
  fastify.register(fastifyStatic, {
    root: config.uploads.absPath,
    prefix: `/${config.uploadsName}/`,
    decorateReply: false,
    schemaHide: true,
    list: true,
    // Allow public access to uploads
    allowedPath: (pathName: string) => {
      // Allow all files in uploads directory
      return true;
    }
  });
  
  // Also register without prefix for testing (optional)
  fastify.register(fastifyStatic, {
    root: config.uploads.absPath,
    prefix: '/',
    decorateReply: false,
    schemaHide: true,
    allowedPath: (pathName: string) => {
      // Only allow access to uploads subdirectory
      return pathName.startsWith(`/${config.uploadsName}/`);
    }
  });

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: { ...opts },
  });

  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: { ...opts },
  });
}
