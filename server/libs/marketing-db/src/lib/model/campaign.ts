import { JsonTable } from "@awing/wingdb";
import { MarketingDb } from "../marketing-db";
import { Post } from "./post";
import { IRecurrence, Recurrence, WingDate } from "@awing/wingdate";
import { TaskStatus } from "../contracts";
import { CampaignTask } from "./campaign-task";

export class Campaign extends JsonTable<Campaign> {
    id: string = "";
    name: string = "";
    theme: string = "";
    start: string;
    end: string;
    channels: string[];
    lead: number;
    color: string = "";
    medias?: string[];
    recurrence?: {
        frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
        interval?: number;
        byDay?: string[];
        count?: number;
        until?: string;
    }

    constructor(public db: MarketingDb, fileName: string) {
        super(db, fileName);
    }

    public instantiate(raw: any): Campaign {
        const instance = new Campaign(this.db, this.fileName);
        Object.assign(instance, raw);
        return instance;
    }

    record(row: Campaign): Record<string, any> {
        return {
            id: row.id,
            name: row.name,
            theme: row.theme,
            start: row.start,
            end: row.end,
            channels: row.channels,
            lead: row.lead,
            color: row.color,
            medias: row.medias,
            recurrence: row.recurrence,
        };
    }

    get recurring(): boolean {
        return this.recurrence !== undefined;
    }

    get recur(): Recurrence {
        return new Recurrence(this.recurrence as IRecurrence);
    }

    get onetime(): boolean {
        return this.recurrence === undefined;
    }

    get startDate(): WingDate {
        return new WingDate(this.start);
    }

    get endDate(): WingDate {
        return new WingDate(this.end);
    }

    get scheduleDate(): WingDate {
        const result = this.date(TaskStatus.Scheduled);
        return result;
    }

    get generateDate(): WingDate {
        const result = this.date(TaskStatus.Generated);
        return result;
    }

    get publishDate(): WingDate {
        const result = this.date(TaskStatus.Published);
        return result;
    }

    leadFor(status: TaskStatus): number {
        switch (status) {
            case TaskStatus.Scheduled:
                return this.lead + 30;
            case TaskStatus.Generated:
                return this.lead - 15;
            case TaskStatus.Published:
                return this.lead;
            default:
                throw new Error(`Invalid status: ${status}`);
        }
    }

    date(status: TaskStatus): WingDate {
        const lead = this.leadFor(status);
        const isoDate = this.startDate.date.minus({ days: lead }).toISO();
        return new WingDate(isoDate);
    }

    isDue(status: TaskStatus): boolean {
        const date = this.date(status);
        const lead = this.leadFor(status);
        const result = this.due(date, lead);
        return result;
    }

    /**
     * Returns true if content should be scheduled for content generation today.
     * For onetime campaigns, checks if generateDate is today or earlier.
     * For recurring campaigns, checks if today matches a due date in the recurrence pattern minus lead days.
     */
    due(date: WingDate, lead: number): boolean {
        const today = WingDate.now();
        if (this.onetime) {
            // For onetime, generateDate is the date content should be generated
            return today.gte(date.ISO);
        } else if (this.recurrence) {
            // For recurring, check if today is a due date for content generation
            // We need to check if today + lead days matches a recurrence event
            const recur = this.recur;
            // The date for which content should be generated today
            const eventDate = today.date.plus({ days: lead }).toISO();
            // Is eventDate a due date in the recurrence?
            return this.startDate.due(recur, eventDate);
        }
        return false;
    }

    async getPost(campaign: string, event: Date): Promise<Post> {
        const path = Post.getPathByEvent(campaign, event);

        const post = new Post(this.db, path);
        await post?.load();

        return post;
    }

    task(lead: number): CampaignTask {
        return this.db.campaignTasks.get(CampaignTask.taskId(this.id, lead));
    }
    
    hasTask(lead: number): boolean {
        return this.task(lead) !== undefined;
    }

    get tasks(): CampaignTask[] {
        return this.db.campaignTasks.filter({ campaign: this.id });
    }
} 