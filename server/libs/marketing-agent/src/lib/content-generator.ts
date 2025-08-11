import { LlmPlugin, LlmPluginConfig, LlmRequest, LlmResult, OllamaConfig } from '@awing/llm-plugin'
import { CampaignTask, JobId, MarketingDb, TaskStatus } from '@awing/marketing-db';
import { Logger } from '@awing/pino-plugin';
import { WingError, WingResponse } from '@awing/wingerror';

export class ContentGenerator {
    id = JobId.Generate;
    private config: LlmPluginConfig;
    private llmPlugin: LlmPlugin;
    private logger: ReturnType<typeof Logger>;

    constructor(private db: MarketingDb, public sample: boolean = false) {
        this.logger = Logger(this.constructor.name);
    }

    async load() {
        this.config = {
            provider: 'ollama',
            config: {
                name: 'ollama',
                baseUrl: this.db.settings.ollama.baseUrl,
                timeout: this.db.settings.ollama.timeout,
                maxRetries: this.db.settings.ollama.maxRetries,
                enabled: this.db.settings.ollama.enabled
            } as OllamaConfig,
        };

        this.llmPlugin = new LlmPlugin(this.config);
    }

    async generateAll(): Promise<WingResponse[]> {
        let responses: WingResponse[] = [];
        let response: WingResponse;

        try {
            const tasks = await this.db.campaignTasks.filter({ status: TaskStatus.Scheduled });

            if (!tasks || tasks.length === 0) {
                response = WingError.noContent('There are no scheduled tasks to generate content');
                responses.push(response);
            } else {
                for (const task of tasks) {
                    response = await this.generate(task);

                    if (response) {
                        responses.push(response);
                    }
                }
            }
        } catch (error) {
            response = WingError.error(error);
            responses.push(response);
            this.logger.error('generateAll Error:', error);
        }

        return responses;
    }

    async generateById(id: string): Promise<WingResponse> {
        const task = this.db.campaignTasks.get(id);

        return await this.generate(task);
    }

    async generate(task: CampaignTask): Promise<WingResponse> {
        try {
            let request = this.getRequest(task);

            const result = await this.generateContent(task, request);

            if (result) {
                await task.markGenerated(result.content);
            }

            const message = `Generated content for task ${task.id} successfully`;
            this.logger.info(message);
            return WingError.ok(result, message);

        } catch (err) {
            this.logger.error('generate Error:', err);
            return WingError.error(err);
        }
    }

    async generateContent(task: CampaignTask, request: LlmRequest): Promise<LlmResult> {
        let result: LlmResult;

        try {
            if (this.isDue(task, TaskStatus.Generated)) {
                result = await this.llmPlugin.ask(request, this.sample);

                if (this.sample) {
                    result.content = result.content
                        .replace('{id}', task.id)
                        .replace('{caption}', task.campaign_.theme);
                }
                this.logger.info2('LLM Response:', { content: result.content });
            }

            return result;
        } catch (error) {
            this.logger.error('generateContent Error:', error);
            throw error;
        }
    }

    getRequest(task: CampaignTask): LlmRequest {
        return {
            prompt: task.prompt,
            model: 'llama3.2:latest',
            temperature: 0.8,
            maxTokens: 200,
            systemPrompt: task.systemPrompt
        };
    }

    isDue(task: CampaignTask, status: TaskStatus): boolean {
        if (this.sample) {
            return true;
        }

        const result = task.isDue(status);

        return result;
    }
}
