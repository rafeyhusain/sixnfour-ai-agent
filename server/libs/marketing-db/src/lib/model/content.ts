import { FolderTable } from "@awing/wingdb";
import { MarketingDb } from "../marketing-db";
import { Post } from "..";
import path = require("path");

export class Content extends FolderTable<Content> {
    posts: Post;
    static CONTENTS_FOLDER = 'contents';

    constructor(public db: MarketingDb, folder: string) {
        super(db, folder);
    }

    public instantiate(raw: any): Content {
        const folder = path.join(this.folder, raw);
        const instance = new Content(this.db, folder);
        Object.assign(instance, raw);
        return instance;
    }

    get postFilePath(): string {
        const path = Post.getPath(this.folder);
        
        return path;
    }

    async load(): Promise<void> {
        await super.load(true);
        this.posts = new Post(this.db, this.postFilePath);
        await this.posts.load(true);
    }
    
    static get dateFolderNow (): string {
        return new Date().toISOString().slice(0, 10);
    }

    static getPathByEvent(campaign: string, event: Date): string {
        return Content.getPath(campaign, event.toISOString().slice(0, 10));
    }
    
    static getPath(campaign: string, folder: string): string {
        return path.join(Content.CONTENTS_FOLDER, campaign, folder);
    }

    static async ensureFolder(db: MarketingDb): Promise<void> {
        const folder = path.join(db.dbPath, Content.CONTENTS_FOLDER);
        await FolderTable.createFolder(folder);
    }
} 