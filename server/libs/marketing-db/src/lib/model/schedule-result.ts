import { Campaign } from "./campaign";

export class ScheduleResult {
    campaign: Campaign;
    success: boolean;
    errors: string[];

    constructor(campaign: Campaign) {
        this.campaign = campaign;
        this.errors = [];
    }

    toString(): string {
        const obj = {
            campaign: this.campaign.id,
            success: this.success,
            errors: this.errors
        };
        return JSON.stringify(obj, null, 2);
    }
}