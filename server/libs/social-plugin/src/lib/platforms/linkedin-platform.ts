import { Media } from '../core/media';
import { SocialCore, SocialPlatformConfig } from '../core/social-core';
import { SocialResponse } from '../core/social-response';
import { SocialPost } from '../core/social-post';
import { Logger } from '@awing/pino-plugin';

export interface LinkedInConfig extends SocialPlatformConfig {
  accessToken?: string;
  organizationId?: string;
  userId?: string;
  clientId?: string;
  clientSecret?: string;
}

interface LinkedInPostResponse {
  id: string;
  error?: {
    message: string;
    code: number;
  };
}

export class LinkedInPlatform extends SocialCore {
  private accessToken: string;
  private organizationId?: string;
  private userId?: string;

  constructor(config: LinkedInConfig, logger?: ReturnType<typeof Logger>) {
    super(config, logger);
    this.accessToken = config.accessToken || '';
    this.organizationId = config.organizationId;
    this.userId = config.userId;
    
    if (!this.accessToken) {
      throw new Error(`${this.platform} access token is required`);
    }
  }

  async publish(post: SocialPost): Promise<SocialResponse> {
    try {
      this.validatePost(post);
      this.logger.info(`Publishing to ${this.platform}...`);

      const author = this.organizationId ? `urn:li:organization:${this.organizationId}` : `urn:li:person:${this.userId}`;
      const content = post.message;

      const postData: any = {
        author: author,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: content,
            },
            shareMediaCategory: post.medias.hasMedia ? 'IMAGE' : 'NONE',
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      };

      if (post.medias.hasMedia) {
        postData.specificContent['com.linkedin.ugc.ShareContent'].media = [...post.medias].map(media => ({
          status: 'READY',
          description: { text: 'Image' },
          media: media.url,
          title: { text: 'Image' },
        }));
      }

      const response = await this.post<LinkedInPostResponse>(
        'https://api.linkedin.com/v2/ugcPosts',
        postData,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0',
          },
        }
      );

      const result = response.data;
      
      if (result.error) {
        throw new Error(`${this.platform} API error: ${result.error.message}`);
      }

      return this.success(result.id, `https://linkedin.com/feed/update/${result.id}`);

    } catch (error) {
      return this.error(error);
    }
  }

  protected async uploadSingleMedia(media: Media): Promise<string> {
    try {
      // LinkedIn uses direct URLs for media, so we return the URL as the ID
      // In a real implementation, you might need to upload to LinkedIn's media service first
      return media.url;
    } catch (error) {
      this.logger.error(`Failed to upload media to ${this.platform}`, error);
      throw error;
    }
  }

  get platform(): string {
    return 'linkedin';
  }
} 