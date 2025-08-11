import { JsonTable, FolderTable } from "@awing/wingdb";
import { MarketingDb } from "../marketing-db";
import path = require("path");
import { Media } from "../core/media";

export class Medias extends JsonTable<Medias> {
    id: string = "";
    url: string = "";
    type: "image" | "video" = "image";
    tags: string[] = [];
    created: string = "";
    
    static UPLOADS_FOLDER = 'dist/uploads';

    constructor(public db: MarketingDb, fileName: string) {
        super(db, fileName);
    }

    public instantiate(raw: any): Medias {
        const instance = new Medias(this.db, this.fileName);
        Object.assign(instance, raw);
        return instance;
    }

    record(row: Medias): Record<string, any> {
        return {
            id: row.id,
            url: row.url,
            type: row.type,
            tags: row.tags,
            created: row.created,
        };
    }
    
    static async ensureFolder(db: MarketingDb): Promise<void> {
        const folder = path.join(db.dbPath, Medias.UPLOADS_FOLDER);
        await FolderTable.createFolder(folder);
    }

    get media() {
        return new Media(this.url, '');
    }

    get resolvedUrl() {
        const media = this.media;

        if (media.isFileName) {
            // Use environment variable for base URL or default to localhost
            const baseUrl = process.env.SERVICE_URL || 'http://localhost:5001';
            return `${baseUrl}/uploads/${this.url}`;
        } else {
            return this.url;
        }
    }
} 