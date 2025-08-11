import { JsonTable } from "@awing/wingdb";
import { MarketingDb } from "../marketing-db";
import { Frequency } from "../contracts/frequency";

export class CampaignType extends JsonTable<CampaignType> {
    id: string;
    description: string;
    lead: number;
    style: Frequency;

    constructor(public db: MarketingDb, fileName: string) {
        super(db, fileName);
    }

    public instantiate(raw: any): CampaignType {
        const instance = new CampaignType(this.db, this.fileName);
        Object.assign(instance, raw);
        return instance;
    }

    record(row: CampaignType): Record<string, any> {
        return {
            id: row.id,
            description: row.description,
            lead: row.lead,
            style: row.style,
        };
    }
} 