import { EventEmitter } from 'events';
import { SocialCore, SocialPlatformConfig } from './core/social-core';
import { SocialResponse } from './core/social-response';
import { PlatformFactory, PlatformType, PlatformConfig } from './platform-factory';
import { SocialPost } from './core/social-post';
import { PublishResult } from './core/publish-result';
import { Logger } from '@awing/pino-plugin';

export interface SocialPluginConfig {
  platforms: PlatformConfig;
  logger: ReturnType<typeof Logger>;
  retryAttempts?: number;
  retryDelay?: number;
}

export class SocialPlugin extends EventEmitter {
  private platforms: Map<PlatformType, SocialCore>;
  private logger: ReturnType<typeof Logger>;

  constructor(config: SocialPluginConfig) {
    super();
    this.platforms = PlatformFactory.createPlatforms(config.platforms, config.logger);
    this.logger = config.logger;
    this.setupEventListeners();
  }

  /**
   * Publish a post to all configured platforms
   */
  async publish(post: SocialPost): Promise<PublishResult> {
    const result = new PublishResult();

    this.logger.info(`Publishing post to ${this.platforms.size} platforms`);

    for (const [platformType, platform] of this.platforms) {
      try {
        result.totalAttempts++;
        this.logger.info(`Publishing to ${platformType} (attempt ${result.totalAttempts})`);

        const response = await platform.publish(post);
        result.results[platformType] = response;

        if (response.success) {
          result.successfulPlatforms.push(platformType);
          this.logger.info(`Successfully published to ${platformType}`);
        } else {
          result.failedPlatforms.push(platformType);
          result.errors[platformType] = response.error || 'Unknown error';
          this.logger.failed(`Failed to publish to ${platformType}: ${response.error}`);
        }

      } catch (error) {
        result.totalAttempts++;
        result.failedPlatforms.push(platformType);
        result.errors[platformType] = error.message;
        this.logger.error(`Exception publishing to ${platformType}: ${error.message}`, error);
        
        const response = new SocialResponse();

        response.success = false;
        response.error = error.message;
        response.platform = platformType;
        response.timestamp = new Date();

        result.results[platformType] = response;
      }
    }

    result.success = result.successfulPlatforms.length > 0;

    this.emit('publish:complete', result);
    return result;
  }

  /**
   * Publish to a specific platform
   */
  async publishToPlatform(platformType: PlatformType, post: SocialPost): Promise<SocialResponse> {
    const platform = this.platforms.get(platformType);
    
    if (!platform) {
      throw new Error(`Platform ${platformType} is not configured`);
    }

    return this.publishWithRetry(platform, post, platformType);
  }

  /**
   * Publish with retry logic
   */
  private async publishWithRetry(
    platform: SocialCore,
    post: SocialPost,
    platformType: PlatformType,
    attempt: number = 1
  ): Promise<SocialResponse> {
    try {
      return await platform.publish(post);
    } catch (error) {
      if (attempt < platform.config.maxRetries) {
        this.logger.warn(`Retrying ${platformType} publish (attempt ${attempt + 1}/${platform.config.maxRetries})`);
        await this.delay(platform.config.retryDelay * attempt); // Exponential backoff
        return this.publishWithRetry(platform, post, platformType, attempt + 1);
      }
      
      throw error;
    }
  }

  /**
   * Add a platform dynamically
   */
  addPlatform(platformType: PlatformType, config: SocialPlatformConfig): void {
    try {
      const platform = PlatformFactory.createPlatform(platformType, config, this.logger);
      this.platforms.set(platformType, platform);
      this.setupPlatformEventListeners(platform, platformType);
      this.logger.info(`Added platform: ${platformType}`);
    } catch (error) {
      this.logger.error(`Failed to add platform ${platformType}: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Remove a platform
   */
  removePlatform(platformType: PlatformType): boolean {
    const removed = this.platforms.delete(platformType);
    if (removed) {
      this.logger.info(`Removed platform: ${platformType}`);
    }
    return removed;
  }

  /**
   * Get all configured platforms
   */
  getConfiguredPlatforms(): PlatformType[] {
    return Array.from(this.platforms.keys());
  }

  /**
   * Get platform instance
   */
  getPlatform(platformType: PlatformType): SocialCore | undefined {
    return this.platforms.get(platformType);
  }

  /**
   * Check if platform is configured
   */
  isPlatformConfigured(platformType: PlatformType): boolean {
    return this.platforms.has(platformType);
  }

  /**
   * Get available platforms (all supported platforms)
   */
  getAvailablePlatforms(): PlatformType[] {
    return PlatformFactory.getAvailablePlatforms();
  }

  /**
   * Validate post for all platforms
   */
  validatePost(post: SocialPost): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Basic validation
    if (!post.content || post.content.trim().length === 0) {
      errors.push('Post content cannot be empty');
    }

    if (post.content && post.content.length > 5000) {
      errors.push('Post content exceeds maximum length (5000 characters)');
    }

    if (post.medias.count > 10) {
      errors.push('Too many media files (maximum 10)');
    }

    // Platform-specific validation
    for (const [platformType, platform] of this.platforms) {
      try {
        platform['validatePost'](post);
      } catch (error) {
        errors.push(`${platformType}: ${error.message}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Setup event listeners for all platforms
   */
  private setupEventListeners(): void {
    for (const [platformType, platform] of this.platforms) {
      this.setupPlatformEventListeners(platform, platformType);
    }
  }

  /**
   * Setup event listeners for a specific platform
   */
  private setupPlatformEventListeners(platform: SocialCore, platformType: PlatformType): void {
    platform.on('publish:success', (response: SocialResponse) => {
      this.emit('platform:success', { platform: platformType, response });
    });

    platform.on('publish:error', (data: { error: Error; platform: string }) => {
      this.emit('platform:error', { platform: platformType, error: data.error });
    });
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
