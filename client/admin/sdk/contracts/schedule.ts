import { ScheduleStatus } from "./schedule-status";

export class Schedule {
    id: string = "";
    description: string = "";
    cron: string = "";
    url: string = "";
    status: ScheduleStatus;
} 