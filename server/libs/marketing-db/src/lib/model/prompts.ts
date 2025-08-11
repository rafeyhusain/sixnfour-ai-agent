import { FileTable } from "@awing/wingdb";
import { MarketingDb } from "../marketing-db";

export class Prompts extends FileTable {
    constructor(public db: MarketingDb, folder: string) {
        super(db, folder, '.txt');
    }

    public instantiate(raw: any): Prompts {
        const instance = new Prompts(this.db, this.folder);
        Object.assign(instance, raw);
        return instance;
    }
} 