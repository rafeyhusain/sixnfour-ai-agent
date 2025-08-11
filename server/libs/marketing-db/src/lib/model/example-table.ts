import { JsonTable } from "@awing/wingdb";
import { MarketingDb } from "../marketing-db";

export class ExampleTable extends JsonTable<ExampleTable> {
    id: string;
    value: string;

    constructor(public db: MarketingDb, fileName: string) {
        super(db, fileName);
    }

    instantiate(raw: any): ExampleTable {
        const instance = new ExampleTable(this.db, this.fileName);
        Object.assign(instance, raw);
        return instance;
    }

    record(row: ExampleTable): Record<string, any> {
        return {
            id: row.id,
            value: row.value,
        };
    }
} 