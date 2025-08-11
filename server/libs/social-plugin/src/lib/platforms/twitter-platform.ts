import { Media } from '../core/media';
import { SocialCore, SocialPlatformConfig } from '../core/social-core';
import { SocialResponse } from '../core/social-response';
import { SocialPost } from '../core/social-post';
import { Logger } from '@awing/pino-plugin';

export interface TwitterConfig extends SocialPlatformConfig {
  bearerToken?: string;
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  accessTokenSecret?: string;
}

interface TwitterTweetResponse {
  data: {
    id: string;
    text: string;
  };
  errors?: Array<{
    message: string;
    code: string;
  }>;
}

interface TwitterMediaResponse {
  media_id_string: string;
  errors?: Array<{
    message: string;
    code: string;
  }>;
}

export class TwitterPlatform extends SocialCore {
  private bearerToken: string;
  private apiKey: string;
  private apiSecret: string;
  private accessToken: string;
  private accessTokenSecret: string;

  constructor(config: TwitterConfig, logger?: ReturnType<typeof Logger>) {
    super(config, logger);
    this.bearerToken = config.bearerToken || '';
    this.apiKey = config.apiKey || '';
    this.apiSecret = config.apiSecret || '';
    this.accessToken = config.accessToken || '';
    this.accessTokenSecret = config.accessTokenSecret || '';
    
    if (!this.bearerToken) {
      throw new Error(`${this.platform} bearer token is required`);
    }
  }

  async publish(post: SocialPost): Promise<SocialResponse> {
    try {
      this.validatePost(post);
      this.logger.info(`Publishing to ${this.platform}...`);

      const text = this.formatText(post);
      const mediaIds = await this.uploadMedia(post.medias);

      const tweetData: any = {
        text,
      };

      if (mediaIds.length > 0) {
        tweetData.media = {
          media_ids: mediaIds,
        };
      }

      const response = await this.post<TwitterTweetResponse>(
        'https://api.twitter.com/2/tweets',
        tweetData,
        {
          headers: {
            'Authorization': `Bearer ${this.bearerToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = response.data;
      
      if (result.errors) {
        throw new Error(`${this.platform} API error: ${result.errors[0].message}`);
      }

      return this.success(result.data.id, `https://twitter.com/user/status/${result.data.id}`);

    } catch (error) {
      return this.error(error);
    }
  }

  protected async uploadSingleMedia(media: Media): Promise<string> {
    try {
      // First, download the media
      const mediaBlob = await this.fetchMediaAsBlob(media.url);
      
      // Upload to Twitter
      const response = await this.post<TwitterMediaResponse>(
        'https://upload.twitter.com/1.1/media/upload.json',
        new URLSearchParams({
          media_category: 'tweet_image',
          media_data: await this.blobToBase64(mediaBlob),
        }),
        {
          headers: {
            'Authorization': `Bearer ${this.bearerToken}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const result = response.data;
      
      if (result.errors) {
        throw new Error(`Twitter media upload error: ${result.errors[0].message}`);
      }

      return result.media_id_string;
    } catch (error) {
      this.logger.error(`Failed to upload media to ${this.platform}`, error);
      throw error;
    }
  }

  private async fetchMediaAsBlob(mediaUrl: string): Promise<Blob> {
    const response = await this.get(mediaUrl, {
      responseType: 'blob',
    });
    return response.data as Blob;
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    const arrayBuffer = await blob.arrayBuffer();
    return Buffer.from(arrayBuffer).toString('base64');
  }

  private formatText(post: SocialPost): string {
    let text = post.message;

    // Twitter has a 280 character limit
    if (text.length > 280) {
      text = text.substring(0, 277) + '...';
    }
    
    return text;
  }

  get platform(): string {
    return 'twitter';
  }
} 