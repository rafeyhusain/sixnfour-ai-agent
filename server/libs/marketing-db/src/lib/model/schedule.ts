import { JsonTable } from "@awing/wingdb";
import { MarketingDb } from "../marketing-db";
import { ScheduleStatus } from "../contracts/schedule-status";

export class Schedule extends JsonTable<Schedule> {
    id: string;
    description: string;
    cron: string;
    url: string;
    status: ScheduleStatus;

    constructor(public db: MarketingDb, fileName: string) {
        super(db, fileName);
    }

    public instantiate(raw: any): Schedule {
        const instance = new Schedule(this.db, this.fileName);
        Object.assign(instance, raw);
        return instance;
    }

    record(row: Schedule): Record<string, any> {
        return {
            id: row.id,
            description: row.description,
            cron: row.cron,
            url: row.url,
            status: row.status,
        };
    }
} 