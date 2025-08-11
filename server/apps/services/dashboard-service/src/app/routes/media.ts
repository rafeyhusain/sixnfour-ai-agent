import { FastifyInstance, FastifyRequest } from 'fastify';
import { db } from '@dashboard-service/sdk/db';
import { WingError } from '@awing/wingerror';
import { Medias } from '@awing/marketing-db';
import path = require('path');
import fs = require('fs/promises');

export default async function (fastify: FastifyInstance) {
  // List all media
  fastify.get('/media/list', async function (request: FastifyRequest) {
    try {
      const media = db.medias.records();
      return WingError.ok(media, 'Media retrieved successfully');
    } catch (error) {
      return WingError.error(error);
    }
  });

  // Get single media by ID
  fastify.get('/media/get', async function (request: FastifyRequest) {
    try {
      const { id } = request.query as { id?: string };
      
      if (!id) {
        return WingError.badRequest('Media ID is required');
      }

      const media = db.medias.records();
      const foundMedia = media.find(m => m.id === id);
      
      if (!foundMedia) {
        return WingError.notFound('Media not found');
      }

      return WingError.ok(foundMedia, 'Media retrieved successfully');
    } catch (error) {
      return WingError.error(error);
    }
  });

  // Create new media
  fastify.post('/media/create', async function (request: FastifyRequest) {
    try {
      const mediaData = request.body as Partial<Medias>;
      
      if (!mediaData.url) {
        return WingError.badRequest('Media URL is required');
      }

      const mediaId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const newMedia = new Medias(db, 'media.json');
      newMedia.id = mediaId;
      newMedia.url = mediaData.url;
      newMedia.type = mediaData.type || 'image';
      newMedia.tags = mediaData.tags || [];
      newMedia.created = new Date().toISOString();

      db.medias.set(newMedia);
      db.medias.save();
      return WingError.ok(newMedia, 'Media created successfully');
    } catch (error) {
      return WingError.error(error);
    }
  });

  // Update media
  fastify.put('/media/update', async function (request: FastifyRequest) {
    try {
      const { id } = request.query as { id?: string };
      const updateData = request.body as Partial<Medias>;
      
      if (!id) {
        return WingError.badRequest('Media ID is required');
      }

      const existingMedia = db.medias.get(id);
      if (!existingMedia) {
        return WingError.notFound('Media not found');
      }

      // Update the existing media object
      Object.assign(existingMedia, updateData);
      db.medias.setRow(id, existingMedia);
      db.medias.save();
      return WingError.ok(existingMedia, 'Media updated successfully');
    } catch (error) {
      return WingError.error(error);
    }
  });

  // Delete media
  fastify.delete('/media/delete', async function (request: FastifyRequest) {
    try {
      const { id } = request.query as { id?: string };
      
      if (!id) {
        return WingError.badRequest('Media ID is required');
      }

      const existingMedia = db.medias.get(id);
      if (!existingMedia) {
        return WingError.notFound('Media not found');
      }

      // Delete the actual file if it exists
      try {
        const filePath = path.join(db.dbPath, Medias.UPLOADS_FOLDER, path.basename(existingMedia.url));
        await fs.unlink(filePath);
      } catch (fileError) {
        // File might not exist, which is okay
        console.warn('File not found for deletion:', fileError);
      }

      db.medias.delete(id);
      db.medias.save();
      return WingError.ok(existingMedia, 'Media deleted successfully');
    } catch (error) {
      return WingError.error(error);
    }
  });

  // Upload media file
  fastify.post('/media/upload', async function (request: FastifyRequest) {
    try {
      // For now, we'll handle file uploads through a different approach
      // This endpoint will accept file data in the request body
      const fileData = request.body as any;
      
      if (!fileData || !fileData.filename || !fileData.data) {
        return WingError.badRequest('File data is required');
      }

      const fileName = `${Date.now()}-${fileData.filename}`;
      const filePath = path.join(db.dbPath, Medias.UPLOADS_FOLDER, fileName);
      
      // Save file to uploads folder (assuming data is base64 encoded)
      const buffer = Buffer.from(fileData.data, 'base64');
      await fs.writeFile(filePath, buffer);
      
      // Determine file type
      const fileType = fileData.mimetype && fileData.mimetype.startsWith('image/') ? 'image' : 'video';
      
      const mediaId = fileName;
      const newMedia = new Medias(db, 'media.json');
      newMedia.id = mediaId;
      newMedia.url = fileName;
      newMedia.type = fileType;
      newMedia.tags = [];
      newMedia.created = new Date().toISOString();

      db.medias.set(newMedia);
      db.medias.save();
      return WingError.ok(newMedia, 'Media uploaded successfully');
    } catch (error) {
      return WingError.error(error);
    }
  });

  // Search media by tags
  fastify.get('/media/search', async function (request: FastifyRequest) {
    try {
      const { tags } = request.query as { tags?: string };
      
      const media = await db.medias.records();
      
      if (!tags) {
        return WingError.ok(media, 'All media retrieved successfully');
      }

      const searchTags = tags.split(',').map(tag => tag.trim().toLowerCase());
      const filteredMedia = media.filter(m => 
        m.tags.some(tag => searchTags.includes(tag.toLowerCase()))
      );

      return WingError.ok(filteredMedia, 'Filtered media retrieved successfully');
    } catch (error) {
      return WingError.error(error);
    }
  });
}
