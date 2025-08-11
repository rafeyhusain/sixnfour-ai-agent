import { EventEmitter } from 'events';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { SocialPost } from './social-post';
import { Medias } from './medias';
import { Media } from './media';
import { SocialResponse } from './social-response';
import { Logger } from '@awing/pino-plugin';

export interface SocialPlatformConfig {
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
  enabled?: boolean;
}

export abstract class SocialCore extends EventEmitter {
  public config: SocialPlatformConfig;
  protected logger: ReturnType<typeof Logger>;
  protected maxRetries: number;
  protected retryDelay: number;
  protected httpClient: AxiosInstance;

  constructor(config: SocialPlatformConfig, logger?: ReturnType<typeof Logger>) {
    super();
    this.config = config;
    this.logger = logger;
    this.maxRetries = config.maxRetries || 1;
    this.retryDelay = config.maxRetries || 1000;
    this.setupHttpClient();
  }

  get platform(): string {
    return 'unknown';
  }

  /**
   * Setup HTTP client with axios
   */
  private setupHttpClient(): void {
    this.httpClient = axios.create({
      timeout: this.config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for logging
    this.httpClient.interceptors.request.use(
      (config) => {
        this.logger.info2(`Making request to ${config.url}`, {
          method: config.method,
          headers: config.headers,
        });
        return config;
      },
      (error) => {
        this.logger.error('HTTP Request Error', { error: error.message });
        return Promise.reject(error);
      }
    );

    // Add response interceptor for logging
    this.httpClient.interceptors.response.use(
      (response) => {
        this.logger.info2(`Request successful: ${response.status}`, {
          status: response.status,
          statusText: response.statusText,
          url: response.config.url,
        });
        return response;
      },
      (error) => {
        this.logger.failed2('HTTP Response Error', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          error: error.message,
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * Abstract method that must be implemented by each platform
   */
  abstract publish(post: SocialPost): Promise<SocialResponse>;

  /**
   * Common HTTP request method with retry logic using axios
   */
  protected async makeRequest<T>(
    url: string,
    options: AxiosRequestConfig = {},
    retryCount: number = 0
  ): Promise<AxiosResponse<T>> {
    try {
      this.logger.info(`Making request to ${url} (attempt ${retryCount + 1})`);

      const response = await this.httpClient.request<T>({
        url,
        ...options,
      });

      this.logger.info(`Request successful: ${response.status}`);
      return response;
    } catch (error) {
      this.logger.error(`Request failed`, error);

      if (retryCount < this.maxRetries) {
        this.logger.info(`Retrying in ${this.retryDelay}ms...`);
        await this.delay(this.retryDelay);
        return this.makeRequest<T>(url, options, retryCount + 1);
      }

      throw error;
    }
  }

  /**
   * Convenience method for GET requests
   */
  protected async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.makeRequest<T>(url, { ...config, method: 'GET' });
  }

  /**
   * Convenience method for POST requests
   */
  protected async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.makeRequest<T>(url, { ...config, method: 'POST', data });
  }

  /**
   * Convenience method for PUT requests
   */
  protected async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.makeRequest<T>(url, { ...config, method: 'PUT', data });
  }

  /**
   * Convenience method for DELETE requests
   */
  protected async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.makeRequest<T>(url, { ...config, method: 'DELETE' });
  }

  /**
   * Delay utility for retry mechanism
   */
  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Validate post content
   */
  protected validatePost(post: SocialPost): void {
    if (!this.config.enabled) {
      throw new Error(`Skipped [${this.platform}] call — disabled in settings`);
    }

    if (post.empty) {
      throw new Error('Post content cannot be empty');
    }

    if (post.content.length > 5000) {
      throw new Error('Post content exceeds maximum length of (maximum: 5000 characters)');
    }

    if (post.medias.count > 10) {
      throw new Error('Too many media files (maximum: 10 files)');
    }
  }

  /**
   * Upload media files
   */
  protected async uploadMedia(medias: Medias): Promise<string[]> {
    const uploadedIds: string[] = [];

    for (const media of medias ?? []) {
      try {
        this.logger.info(`Uploading media: ${media}`);
        // This is a placeholder - each platform will implement its own upload logic
        const mediaId = await this.uploadSingleMedia(media);
        uploadedIds.push(mediaId);
      } catch (error) {
        this.logger.error(`Failed to upload media ${media}`, error);
        throw error;
      }
    }

    return uploadedIds;
  }

  /**
   * Abstract method for uploading single media file
   */
  protected abstract uploadSingleMedia(media: Media): Promise<string>;

  /**
   * Handle rate limiting
   */
  protected async handleRateLimit(retryAfter?: number): Promise<void> {
    const delay = retryAfter || 60 * 1000; // Default 1 minute
    this.logger.warn(`Rate limited. Waiting ${delay}ms before retry.`);
    await this.delay(delay);
  }

  /**
   * Log success
   */
  protected success(postId: string, url: string): SocialResponse {
    const response = new SocialResponse();
    
    response.success = true;
    response.postId = postId;
    response.url = url;
    response.platform = this.platform;
    response.timestamp = new Date();

    this.logger.info(`Successfully published to ${this.platform}: ${postId}`);
    this.emit('publish:success', response);

    return response;
  }

  /**
   * Log error
   */
  protected error(error: any): SocialResponse {
    if (error.response) {
      this.logger.error(`${this.platform} API request failed:`, {
        status: error.response.status,
        statusText: error.response.statusText,
        url: error.config?.url,
        method: error.config?.method,
        data: error.response.data,
      });
    } else {
      this.logger.error(`Failed to publish to ${this.platform}: ${error.message}`, {
        message: error.message,
        stack: error.stack,
      });
    }

    this.emit('publish:error', { error, platform: this.platform });

    const response = new SocialResponse();
    response.success = false;
    response.error = error.message;
    response.platform = this.platform;
    response.timestamp = new Date();

    return response;
  }
} 