import { SchedulerPlugin } from '@awing/scheduler-plugin';
import { Campaign, CampaignTask, JobId, MarketingDb, TaskStatus } from '@awing/marketing-db';
import { Logger } from '@awing/pino-plugin';
import { WingError, WingResponse } from '@awing/wingerror';

export class ContentScheduler {
    id = JobId.Schedule;
    private logger: ReturnType<typeof Logger>;
    private db: MarketingDb;
    private shouldSave: boolean = false;

    constructor(db: MarketingDb, public sample: boolean = false) {
        this.logger = Logger(this.constructor.name);
        this.db = db;
    }

    async load() {
    }

    async create(campaign: Campaign): Promise<WingResponse> {
        try {
            this.db.campaigns.set(campaign);
            await this.db.campaigns.save();

            const response = await this.scheduleCampaign(campaign);
            this.logger.success(`Successfully created campaign: [${campaign.id}]`);
            return response;
        } catch (error) {
            this.logger.error('create campaign Error:', error);
            return WingError.error(error);
        }
    }

    async update(campaign: Campaign): Promise<WingResponse> {
        try {
            const result = this.db.campaigns.update(campaign.id, campaign);
            await this.db.campaigns.save();
            return WingError.ok({ ids: result }, 'Successfully updated campaign');
        } catch (error) {
            this.logger.error('update campaign Error:', error);
            return WingError.error(error);
        }
    }

    async delete(campaignId: string): Promise<WingResponse> {
        try {
            const campaignIds = this.db.campaigns.delete(campaignId);
            await this.db.campaigns.save();

            const campaignTaskIds = this.db.campaignTasks.delete({ campaign: campaignId });
            await this.db.campaignTasks.save();

            return WingError.ok({ campaigns: campaignIds, campaignTasks: campaignTaskIds }, 'Successfully deleted campaign and tasks');
        } catch (error) {
            this.logger.error('delete campaign Error:', error);
            return WingError.error(error);
        }
    }

    async scheduleAll(): Promise<WingResponse[]> {
        let responses: WingResponse[] = [];
        let response: WingResponse;

        try {
            responses = await this.scheduleCampaigns(new Date());

            return responses;
        } catch (error) {
            response = WingError.error(error);
            responses.push(response);
            this.logger.error('scheduleAll Error:', error);
        }

        return responses;
    }

    async scheduleCampaigns(date: Date): Promise<WingResponse[]> {
        const responses: WingResponse[] = [];

        for (const campaign of this.db.campaigns) {
            const result = await this.scheduleCampaign(campaign);

            responses.push(result);
        }

        return responses;
    }

    async scheduleCampaign(campaign: Campaign): Promise<WingResponse> {
        try {
            const response = await this.scheduleTasks(campaign);

            if (this.shouldSave) {
                this.shouldSave = false;
                await this.db.campaignTasks.save();
                this.logger.success(`Successfully scheduled tasks for [${campaign.id}]`);
            }
            
            return response;
        } catch (error) {
            return WingError.error(error);
        }
    }

    async scheduleTasks(campaign: Campaign): Promise<WingResponse> {
        const taskDetails: Record<string, any>[] = [];

        for (let i = campaign.lead; i >= 0; i--) {

            const task = campaign.task(i);

            if (!task) {
                const task = await this.db.campaignTasks.createTask(campaign, i);

                const result = this.db.campaignTasks.set(task);

                if (result) {
                    this.shouldSave = true;
                    
                    // Add task creation details to the array
                    taskDetails.push({
                        id: task.id,
                        campaign: task.campaign,
                        lead: task.lead,
                        status: task.status,
                        scheduled: task.scheduled,
                        created: true
                    });
                }
            } else {
                taskDetails.push({
                    message: 'Task not scheduled, as it already exists',
                    id: task.id,
                    campaign: task.campaign,
                    lead: task.lead,
                    status: task.status,
                    scheduled: task.scheduled,
                    created: false
                });
            }
        }

        return WingError.created(campaign.id, 'Campaign scheduled successfully', { tasks: taskDetails });
    }
} 