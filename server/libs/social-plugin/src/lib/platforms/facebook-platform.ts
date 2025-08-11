import { Media } from '../core/media';
import { SocialCore, SocialPlatformConfig } from '../core/social-core';
import { SocialResponse } from '../core/social-response';
import { SocialPost } from '../core/social-post';
import FormData = require('form-data');
import * as fs from 'fs';
import { Logger } from '@awing/pino-plugin';

export interface FacebookConfig extends SocialPlatformConfig {
  pageId?: string;
  appId?: string;
  appSecret?: string;
  userAccessToken?: string;
  pageAccessToken?: string;
  apiNumber?: string;
  enabled?: boolean;
}

interface FacebookPostResponse {
  id: string;
  error?: {
    message: string;
    code: number;
  };
}

interface FacebookMediaResponse {
  id: string;
  error?: {
    message: string;
    code: number;
  };
}

export class FacebookPlatform extends SocialCore {
  private pageId: string;
  private accessToken: string;
  private apiNumber: string;
  private enabled: boolean;

  constructor(config: FacebookConfig, logger?: ReturnType<typeof Logger>) {
    super(config, logger);
    this.pageId = config.pageId || '';
    this.apiNumber = config.apiNumber || 'v23.0';
    this.accessToken = config.pageAccessToken || config.userAccessToken || '';
    this.enabled = config.enabled || true;

    this.validateConfiguration();
  }

  private validateConfiguration(): void {
    if (!this.enabled) {
      throw new Error(`Skipped [${this.platform}] call — disabled in settings`);
    }

    if (!this.accessToken) {
      throw new Error(`${this.platform} access token is required`);
    }
  }

  async publish(post: SocialPost): Promise<SocialResponse> {
    try {
      this.validatePost(post);
      this.logger.info(`Publishing to ${this.platform}...`);

      const message = post.message;

      let result: FacebookPostResponse;
      const mediaIds: string[] = [];

      for (const media of post.medias) {
        if (media.isVideo) {
          result = await this.uploadVideo(media, message);
        } else {
          const mediaId = await this.uploadPhoto(media);
          mediaIds.push(mediaId);
        }
      }

      if (post.medias.isTextPost || post.medias.hasImage) {
        const postData: any = {
          message,
          access_token: this.accessToken,
        };

        if (mediaIds.length > 0) {
          postData.attached_media = mediaIds.map(id => ({ media_fbid: id }));
        }

        const response = await this.post<FacebookPostResponse>(
          `https://graph.facebook.com/${this.apiNumber}/${this.pageId}/feed`,
          postData
        );

        result = response.data;

        if (result.error) {
          throw new Error(`${this.platform} API error: ${result.error.message}`);
        }
      }

      return this.success(result.id, `https://facebook.com/${result.id}`);

    } catch (error) {
      return this.error(error);
    }
  }
  
  protected override validatePost(post: SocialPost): void {
    super.validatePost(post);
  }

  protected async uploadSingleMedia(media: Media): Promise<string> {
    throw new Error("Use this.uploadPhoto this.uploadVideo instead");
  }

  protected async uploadPhoto(media: Media): Promise<string> {
    try {
      const form = this.getFormData(media, false);
      const headers = form.getHeaders();

      this.logger.info2(`Uploading photo to ${this.platform}:`, {
        endpoint: `https://graph.facebook.com/${this.apiNumber}/${this.pageId}/photos`,
        url: media.url,
        headers,
      });

      const response = await this.post<FacebookMediaResponse>(
        `https://graph.facebook.com/${this.apiNumber}/${this.pageId}/photos`,
        form,
        { headers }
      );

      const result = response.data;

      if (result.error) {
        throw new Error(`Facebook photo upload error: ${result.error.message}`);
      }

      return result.id;
    } catch (error: any) {
      this.logger.error(`${this.platform} uploadPhoto error:`, {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: media.url,
      });
      throw error;
    }
  }

  protected async uploadVideo(media: Media, description?: string): Promise<FacebookMediaResponse> {
    try {
      const form = this.getFormData(media, true, description);
      const headers = form.getHeaders();

      this.logger.info2(`Uploading video to ${this.platform}:`, {
        endpoint: `https://graph.facebook.com/${this.apiNumber}/${this.pageId}/videos`,
        url: media.url,
        description,
        headers,
      });

      const response = await this.post<FacebookMediaResponse>(
        `https://graph.facebook.com/${this.apiNumber}/${this.pageId}/videos`,
        form,
        { headers }
      );

      const result = response.data;

      if (result.error) {
        throw new Error(`Facebook video upload error: ${result.error.message}`);
      }

      return result;
    } catch (error: any) {
      this.logger.error(`${this.platform} uploadVideo error:`, {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: media.url,
      });
      throw error;
    }
  }

  private getFormData(media: Media, published: boolean, description?: string) {
    const form = new FormData();
    form.append('access_token', this.accessToken);
    form.append('published', published ? 'true' : 'false');

    if (description) {
      form.append('description', description);
    }

    if (media.isWebUrl) {
      form.append('file_url', media.url);
    } else {
      form.append('source', fs.createReadStream(media.debugUrl));
    }

    return form;
  }

  get platform(): string {
    return 'facebook';
  }
} 