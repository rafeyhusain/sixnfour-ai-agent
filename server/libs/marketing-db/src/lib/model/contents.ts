import { FolderEntry, FolderTable } from "@awing/wingdb";
import { MarketingDb } from "../marketing-db";
import path = require("path");
import { Content } from "./content";

// each Content is a folder named with the campaign-id under 
// db/contents/<campaign-id>/<yyyy-mm-dd>
export class Contents extends FolderTable<Content> {
    constructor(public db: MarketingDb, folder: string) {
        super(db, folder);
    }

    public instantiate(raw: FolderEntry): Content {
        const folder = path.join(this.folder, raw.key);
        const instance = new Content(this.db, folder);
        Object.assign(instance, raw);
        return instance;
    }
} 