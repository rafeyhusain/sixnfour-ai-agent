import { Media } from '../core/media';
import { SocialCore, SocialPlatformConfig } from '../core/social-core';
import { SocialResponse } from '../core/social-response';
import { SocialPost } from '../core/social-post';
import { Logger } from '@awing/pino-plugin';

export interface InstagramConfig extends SocialPlatformConfig {
  userId?: string;
  accessToken?: string;
  clientId?: string;
  clientSecret?: string;
  apiNumber?: string;
  enabled?: boolean;
}

interface InstagramContainerResponse {
  id: string;
  error?: {
    message: string;
    code: number;
  };
}

interface InstagramPublishResponse {
  id: string;
  error?: {
    message: string;
    code: number;
  };
}

export class InstagramPlatform extends SocialCore {
  private userId: string;
  private accessToken: string;
  private apiNumber: string;
  private enabled: boolean;

  constructor(config: InstagramConfig, logger?: ReturnType<typeof Logger>) {
    super(config, logger);
    this.userId = config.userId || '';
    this.apiNumber = config.apiNumber || 'v23.0';
    this.accessToken = config.accessToken || '';
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
    
    if (!this.userId) {
      throw new Error(`${this.platform} user ID is required`);
    }
    
    // Validate that userId is a numeric ID, not a username
    if (isNaN(Number(this.userId))) {
      throw new Error(`Instagram user ID must be a numeric ID, not a username. Current value: "${this.userId}". Please use your Instagram Business Account ID. You can find this in your Facebook Business Manager or Instagram Business Account settings.`);
    }
    
    // Check if userId looks like a placeholder
    const userId = this.userId.toLocaleLowerCase();
    if (userId.includes('your_') || userId.includes('your-')) {
      throw new Error(`Instagram user ID is not configured. Current value: "${this.userId}". Please set your Instagram Business Account ID in the settings.`);
    }
    
    this.logger.info(`${this.platform} platform configured with userId: ${this.userId}`);
  }

  async publish(post: SocialPost): Promise<SocialResponse> {
    try {
      this.validatePost(post);
      this.logger.info(`Publishing to ${this.platform}...`);

      // 1. Init
      let containerId: string;
      let mediaContainerIds: string[] = [];

      // 2. Upload media (image/video)
      for (const media of post.medias) {
        let containerResp;

        if (!media.isWebUrl) {
          throw new Error(`Instagram expects URL must be on a public http or https server. Invalid url: ${media.url}`);    
        }

        if (media.isImage) {
          containerResp = await this.createImageContainer(post, media);
        } else {
          containerResp = await this.createVideoContainer(post, media);
        }

        mediaContainerIds.push(containerResp.id);
      }

      // 3. If carousel, create carousel container
      if (post.medias.isCarousel) {
        const carouselResp = await this.createCarouselContainer(mediaContainerIds, post.message);
        containerId = carouselResp.id;
      } else {
        containerId = mediaContainerIds[0];
      }

      // 4. Poll status until ready
      const ready = await this.pollContainerStatus(containerId);
      if (!ready) {
        throw new Error(`${this.platform} media container not ready for publishing.`);
      }

      // 5. Publish the container
      const response = await this.post<InstagramPublishResponse>(
        `https://graph.facebook.com/${this.apiNumber}/${this.userId}/media_publish`,
        {
          creation_id: containerId,
          access_token: this.accessToken,
        }
      );
      const result = response.data;
      if (result.error) {
        throw new Error(`${this.platform} publish error: ${result.error.message}`);
      }
      return this.success(result.id, `https://instagram.com/p/${result.id}`);
    } catch (error) {
      return this.error(error);
    }
  }

  protected override validatePost(post: SocialPost): void {
    super.validatePost(post);

    if (!post.medias.hasMedia) {
      throw new Error(`${this.platform} requires at least one media file for posts`);
    }
  }

  protected async uploadSingleMedia(media: Media): Promise<string> {
    try {
      const response = await this.post<InstagramContainerResponse>(
        `https://graph.facebook.com/${this.apiNumber}/${this.userId}/media`,
        {
          image_url: media.url,
          access_token: this.accessToken,
          published: false,
        }
      );

      const result = response.data;
      
      if (result.error) {
        throw new Error(`${this.platform} media upload error: ${result.error.message}`);
      }

      return result.id;
    } catch (error) {
      this.logger.error(`Failed to upload media to ${this.platform}:`, error);
      throw error;
    }
  }

  private async createImageContainer(post: SocialPost, media: Media) {
    try {
      const payload: any = {
        image_url: media.url,
        caption: post.message,
        access_token: this.accessToken,
      };
      if (media.altText) payload.alt_text = media.altText;
      if (post.medias.isCarousel) payload.is_carousel_item = true;
      
      this.logger.info(`Creating image container for ${this.platform} with userId: ${this.userId}`);
      
      const resp = await this.post<InstagramContainerResponse>(
        `https://graph.facebook.com/${this.apiNumber}/${this.userId}/media`,
        payload
      );
      
      if (resp.data.error) {
        throw new Error(`${this.platform} API error: ${resp.data.error.message} (Code: ${resp.data.error.code})`);
      }
      
      return resp.data;
    } catch (error) {
      if (error.response?.status === 400) {
        throw new Error(`Instagram API 400 error: Please check your Instagram Business Account ID (${this.userId}) and access token. Error: ${error.message}`);
      }
      throw error;
    }
  }

  private async createVideoContainer(post: SocialPost, media: Media) {
    const payload: any = {
      video_url: media.url,
      caption: post.message,
      access_token: this.accessToken,
      media_type: 'REELS',
    };
    if (post.medias.isCarousel) payload.is_carousel_item = true;
    
    // For large videos, resumable upload is required (not implemented here for brevity)
    // https://developers.facebook.com/docs/instagram-api/guides/content-publishing#resumable-video-upload
    const resp = await this.post<InstagramContainerResponse>(
      `https://graph.facebook.com/${this.apiNumber}/${this.userId}/media`,
      payload
    );
    if (resp.data.error) throw new Error(resp.data.error.message);
    return resp.data;
  }

  private async createCarouselContainer(children: string[], caption: string) {
    const payload: any = {
      media_type: 'CAROUSEL',
      children: children.join(','),
      caption,
      access_token: this.accessToken,
    };
    const resp = await this.post<InstagramContainerResponse>(
      `https://graph.facebook.com/${this.apiNumber}/${this.userId}/media`,
      payload
    );
    if (resp.data.error) throw new Error(resp.data.error.message);
    return resp.data;
  }

  private async pollContainerStatus(containerId: string, maxTries = 5, intervalMs = 60000): Promise<boolean> {
    for (let i = 0; i < maxTries; i++) {
      const resp = await this.get<any>(
        `https://graph.facebook.com/${this.apiNumber}/${containerId}?fields=status_code&access_token=${this.accessToken}`
      );
      const status = resp.data.status_code;
      if (status === 'FINISHED' || status === 'PUBLISHED') return true;
      if (status === 'ERROR' || status === 'EXPIRED') return false;
      await this.delay(intervalMs);
    }
    return false;
  }

  get platform(): string {
    return 'instagram';
  }
} 