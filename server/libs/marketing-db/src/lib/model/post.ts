import { JsonTable } from "@awing/wingdb";
import { MarketingDb } from "../marketing-db";
import path = require("path");
import { Content } from "./content";

export class Post extends JsonTable<Post> {
    id: string;
    caption: string;
    body: string;
    hashtags: string[];
    mediaUrls: string[];

    constructor(public db: MarketingDb, fileName: string) {
        super(db, fileName);
    }

    instantiate(raw: any): Post {
        const instance = new Post(this.db, this.fileName);
        Object.assign(instance, raw);
        return instance;
    }

    record(row: Post): Record<string, any> {
        return {
            id: row.id,
            caption: row.caption,
            body: row.body,
            hashtags: row.hashtags,
            mediaUrls: row.mediaUrls,
        };
    }

    get content(): string {
        return `${this.caption}\n\n${this.body}`
    }

    static getPathByEvent(campaign: string, event: Date): string {
        const folder = Content.getPathByEvent(campaign, event); 
        return Post.getPath(folder);
    }

    static getPath(folder: string): string {
        return path.join(folder, 'posts.json');
    }

    get resolvedMediaUrls(): string[] {
        if (!this.mediaUrls) return [];

        return this.mediaUrls.map(url => {
            if (typeof url === 'number' || (/^\d+$/).test(url)) {

                const media = this.db.medias.get(url);

                if (media) {
                    return media.resolvedUrl;
                } else {
                    throw new Error(`Media ${url} not found`);
                }
            }

            return url;
        });
    }
} 