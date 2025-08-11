import { Media } from '../core/media';
import { SocialCore, SocialPlatformConfig } from '../core/social-core';
import { SocialResponse } from '../core/social-response';
import { SocialPost } from '../core/social-post';
import { Logger } from '@awing/pino-plugin';

export interface TikTokConfig extends SocialPlatformConfig {
  accessToken?: string;
  clientKey?: string;
  clientSecret?: string;
  openId?: string;
}

interface TikTokUploadResponse {
  data: {
    upload_url: string;
  };
  error?: {
    message: string;
    code: number;
  };
}

export class TikTokPlatform extends SocialCore {
  private accessToken: string;
  private clientKey: string;
  private openId: string;

  constructor(config: TikTokConfig, logger?: ReturnType<typeof Logger>) {
    super(config, logger);
    this.accessToken = config.accessToken || '';
    this.clientKey = config.clientKey || '';
    this.openId = config.openId || '';
    
    if (!this.accessToken || !this.clientKey) {
      throw new Error(`${this.platform} access token and client key are required`);
    }
  }

  async publish(post: SocialPost): Promise<SocialResponse> {
    try {
      this.validatePost(post);
      this.logger.info(`Publishing to ${this.platform}...`);

      // TikTok requires video content
      if (!post.medias.hasVideo) {
        throw new Error(`${this.platform} requires video content for posts`);
      }

      const videoUrl = post.medias[0]; // TikTok typically uses one video per post
      const description = post.message;

      // First, create the video post
      const response = await this.post<TikTokUploadResponse>(
        'https://open.tiktokapis.com/v2/video/upload/',
        {
          post_info: {
            title: description,
            privacy_level: 'SELF_ONLY', // or 'PUBLIC', 'MUTUAL_FOLLOW_FRIENDS'
            disable_duet: false,
            disable_comment: false,
            disable_stitch: false,
            video_cover_timestamp_ms: 0,
          },
          source_info: {
            source: 'FILE_UPLOAD',
            video_size: 0, // Will be calculated by TikTok
            chunk_size: 0, // Will be calculated by TikTok
            total_chunk_count: 1,
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = response.data;
      
      if (result.error) {
        throw new Error(`${this.platform} API error: ${result.error.message}`);
      }

      // Upload the video file
      const videoBlob = await this.fetchVideoAsBlob(videoUrl);
      const uploadResponse = await this.put(
        `https://open.tiktokapis.com/v2/video/upload/${result.data.upload_url}`,
        videoBlob,
        {
          headers: {
            'Content-Type': 'video/mp4',
          },
        }
      );

      if (uploadResponse.status !== 200) {
        throw new Error('Failed to upload video to TikTok');
      }

      return this.success(result.data.upload_url, `https://tiktok.com/@${this.openId}/video/${result.data.upload_url}`);

    } catch (error) {
      return this.error(error);
    }
  }

  protected async uploadSingleMedia(media: Media): Promise<string> {
    try {
      // For TikTok, we return the video URL as the ID since we handle upload separately
      return media.url;
    } catch (error) {
      this.logger.error(`Failed to upload media to ${this.platform}`, error);
      throw error;
    }
  }

  get platform(): string {
    return 'tiktok';
  }

  private async fetchVideoAsBlob(videoUrl: string): Promise<Blob> {
    const response = await this.get(videoUrl, {
      responseType: 'blob',
    });
    return response.data as Blob;
  }
} 