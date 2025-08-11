import { CampaignTask, MarketingDb, Frequency, TaskStatus, Post, JobId } from '@awing/marketing-db';
import { Logger } from '@awing/pino-plugin';
import { SocialPlugin, PlatformConfig, SocialPost, PublishResult } from '@awing/social-plugin'
import { WingError, WingResponse } from '@awing/wingerror';

export class ContentPublisher {
    id = JobId.Publish;
    private socialPlugin: SocialPlugin;
    private logger: ReturnType<typeof Logger>;

    constructor(private db: MarketingDb, public sample: boolean = false) {
        this.logger = Logger(this.constructor.name);
    }

    async load() {
        const platformConfig: PlatformConfig = {
            facebook: {
                pageId: this.db.settings.facebook.pageId,
                pageAccessToken: this.db.settings.facebook.pageAccessToken,
                maxRetries: this.db.settings.facebook.maxRetries,
                timeout: this.db.settings.facebook.timeout,
                apiNumber: this.db.settings.facebook.apiNumber,
                enabled: this.db.settings.facebook.enabled
            },
            instagram: {
                userId: this.db.settings.instagram.userId,
                accessToken: this.db.settings.instagram.accessToken,
                maxRetries: this.db.settings.instagram.maxRetries,
                apiNumber: this.db.settings.instagram.apiNumber,
                enabled: this.db.settings.instagram.enabled
            },
            // tiktok: {
            //     accessToken: this.db.settings.tiktok.accessToken,
            //     clientKey: this.db.settings.tiktok.clientKey,
            //     openId: this.db.settings.tiktok.openId,
            //     maxRetries: this.db.settings.tiktok.maxRetries,
            // },
        };

        this.socialPlugin = new SocialPlugin({
            platforms: platformConfig,
            logger: this.logger, // Optional custom logger
        });

        this.setupEventListeners();
    }

    async publishAll(): Promise<WingResponse[]> {
        let responses: WingResponse[] = [];
        let response: WingResponse;

        try {
            const tasks = await this.db.campaignTasks.filter({ status: TaskStatus.Generated });

            if (!tasks || tasks.length === 0) {
                response = WingError.noContent('There are no scheduled tasks to publish content');
                responses.push(response);
            } else {
                for (const task of tasks) {
                    response = await this.publish(task);

                    if (response) {
                        responses.push(response);
                    }
                }
            }
        } catch (error) {
            response = WingError.error(error);
            responses.push(response);
            this.logger.error('publishAll Error:', error);
        }

        return responses;
    }

    async publishById(id: string): Promise<WingResponse> {
        const task = this.db.campaignTasks.get(id);

        return await this.publish(task);
    }

    async publish(task: CampaignTask): Promise<WingResponse> {
        try {
            const due = this.isDue(task, TaskStatus.Published);

            if (due) {
                await task.loadContents();
                let post = task.contents.posts.get(task.id);
                const result = await this.publishContent(post);

                if (result.success) {
                    await task.markPublished();
                    const message = `Published content for task ${task.id} successfully`;
                    this.logger.info(message);
                    return WingError.ok(result, message);
                } else {
                    const message = `Published content for task ${task.id} failed`;
                    this.logger.failed(message);
                    return WingError.failed(message, result.data);
                }
            }

            const message = `Task ${task.id} is not due for publishing`;
            this.logger.info(message);
            return WingError.noContent(message);
        } catch (error) {
            this.logger.error('publish Error:', error);
            return WingError.error(error);
        }
    }

    async publishContent(draftPost: Post): Promise<{ success: boolean; data?: any }> {
        let post: SocialPost;
        let result: PublishResult;

        if (this.sample) {
            post = SocialPost.sample(false, 0, 1);

            this.logger.info2("Published", { post: post });

            result = new PublishResult();
            result.success = false;
        }
        else {
            post = new SocialPost(
                draftPost.content,
                draftPost.resolvedMediaUrls,
                draftPost.hashtags
            );

            result = await this.socialPlugin.publish(post);
        }

        return {
            success: result.success,
            data: result
        };
    }

    isDue(task: CampaignTask, status: TaskStatus): boolean {
        if (this.sample) {
            return true;
        }

        const result = task.isDue(status);

        return result;
    }

    private setupEventListeners(): void {
        // Use removeAllListeners to ensure clean state, then add listeners
        this.socialPlugin.removeAllListeners('platform:success');
        this.socialPlugin.removeAllListeners('platform:error');
        this.socialPlugin.removeAllListeners('publish:complete');

        // Listen for successful publishes
        this.socialPlugin.on('platform:success', (data) => {
            this.logger.info(`✅ Successfully published to ${data.platform}:`, data.response.postId);
        });

        // Listen for failed publishes
        this.socialPlugin.on('platform:error', (data) => {
            this.logger.info(`❌ Failed to publish to ${data.platform}:`, data.error.message);
        });

        // Listen for complete publish operations
        this.socialPlugin.on('publish:complete', (result) => {
            this.logger.info2('📊 Publish operation completed:', {
                totalPlatforms: Object.keys(result.results).length,
                successful: result.successfulPlatforms.length,
                failed: result.failedPlatforms.length,
            });
        });
    }
}
