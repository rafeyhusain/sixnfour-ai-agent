import { TaskStatus } from './task-status';

export class CampaignTask {
    id: string = "";
    campaign: string = "";
    lead: number = 0;
    status: TaskStatus = TaskStatus.Pending;
    folder: string = "";
    error: Record<string, any> = {};
    scheduled: string = "";
    generated: string = "";
    published: string = "";
} 