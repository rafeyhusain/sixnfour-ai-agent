import { JsonTable } from "@awing/wingdb";
import { MarketingDb } from "../marketing-db";
import { TaskStatus } from '../contracts/task-status';
import { Campaign } from "./campaign";
import { Content } from "./content";

export class CampaignTask extends JsonTable<CampaignTask> {
    id: string = "";
    campaign: string = "";
    lead: number;
    status: TaskStatus;
    folder: string = "";
    error: Record<string, any>;
    scheduled: string = "";
    generated: string = "";
    published: string = "";

    contents: Content;

    constructor(public db: MarketingDb, fileName: string) {
        super(db, fileName);
    }
    
    public instantiate(raw: any): CampaignTask {
        const instance = new CampaignTask(this.db, this.fileName);
        Object.assign(instance, raw);
        return instance;
    }

    record(row: CampaignTask): Record<string, any> {
        return {
            id: row.id,
            campaign: row.campaign,
            lead: row.lead,
            status: row.status,
            folder: row.folder,
            error: row.error,
            scheduled: row.scheduled,
            generated: row.generated,
            published: row.published,
        };
    }

    async loadContents(): Promise<void> {
        if (!this.contents) {
            this.contents = new Content(this.db, this.contentFolder);
            await this.contents.load();
        }
    }

    get campaign_ (): Campaign {
        return this.db.campaigns.get(this.campaign) as Campaign;
    }

    get prompt (): string {
        return this.campaign_.theme;
    }

    get systemPrompt (): string {
        let prompt = this.db.prompts.get('text');

        if (prompt) {
            prompt = prompt
            .replace('{campaign-task-id}', this.id)
            .replace('{campaign-event}', this.campaign_.name)
            .replace('{campaign-media-urls}', JSON.stringify(this.campaign_.medias))
        }

        return prompt;
    }

    get contentFolder (): string {
        return Content.getPath(this.campaign, this.folder);
    }

    hasTask(campaign: Campaign, lead: number): boolean {
        return this.db.campaignTasks.get(CampaignTask.taskId(campaign.id, lead)) !== undefined;
    }

    static taskId(campaignId: string, lead: number): string {
        return `${campaignId}:d-${lead}`;
    }

    async createTask(campaign: Campaign, lead: number): Promise<CampaignTask> {
        const instance = this.instantiate({
            id: CampaignTask.taskId(campaign.id, lead),
            campaign: campaign.id,
            lead: lead,
            folder: "",
            status: TaskStatus.Scheduled,
            scheduled: new Date().toISOString(),
            generated: "",
            published: ""
        });

        return instance;
    }

    async markScheduled(): Promise<boolean> {
        this.status = TaskStatus.Scheduled;
        this.scheduled = new Date().toISOString();

        await this.db.campaignTasks.saveRow(this.id, this, true);

        return true;
    }

    async markGenerated(content: string): Promise<boolean> {
        this.folder = Content.dateFolderNow;
        await this.loadContents();

        this.contents.posts.add(content);
        await this.contents.posts.save();

        this.status = TaskStatus.Generated;
        this.generated = new Date().toISOString();

        await this.db.campaignTasks.saveRow(this.id, this, false);

        return true;
    }

    async markPublished(): Promise<boolean> {
        this.status = TaskStatus.Published;
        this.published = new Date().toISOString();

        await this.db.campaignTasks.saveRow(this.id, this, false);

        return true;
    }

    canMark(status: TaskStatus): boolean {
        switch (status) {
            case TaskStatus.Scheduled:
                return this.status === TaskStatus.Pending;
            case TaskStatus.Generated:
                return this.status === TaskStatus.Scheduled;
            case TaskStatus.Published:
                return this.status === TaskStatus.Generated;
            default:
                throw new Error(`Invalid status: ${status}`);
        }
    }

    isDue(status: TaskStatus): boolean { 
        if (!this.canMark(status)) {
            return false;
        }

        return true;

        //return this.campaign_.isDue(status);
    }
} 