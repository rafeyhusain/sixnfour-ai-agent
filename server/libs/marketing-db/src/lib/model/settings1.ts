import { JsonTable1 } from "@awing/wingdb";
import { MarketingDb } from "../marketing-db";
import { FacebookSettings, InstagramSettings, OllamaSettings, TiktokSettings } from "../contracts/settings";

export class Settings extends JsonTable1<Settings> {
    id: string;
    description: string;
    value: string;

    private _ollama: OllamaSettings;
    private _facebook: FacebookSettings;
    private _instagram: InstagramSettings;
    private _tiktok: TiktokSettings;

    constructor(public db: MarketingDb, fileName: string) {
        super(db, fileName);
    }

    public instantiate(raw: any): Settings {
        const instance = new Settings(this.db, this.fileName);
        Object.assign(instance, raw);
        return instance;
    }

    record(row: Settings): Record<string, any> {
        return {
            id: row.id,
            description: row.description,
            value: row.value,
        };
    }

    get ollama(): OllamaSettings {
        if (!this._ollama) {
            this._ollama = {
                baseUrl: this.get('ollama:baseUrl', 'http://localhost:11434'),
                timeout: this.get('ollama:timeout', 60000),
                maxRetries: this.get('ollama:maxRetries', 2),
                enabled: this.get('ollama:enabled', true),
            };
        }
        return this._ollama;
    }
    
    get facebook(): FacebookSettings {
        if (!this._facebook) {
            this._facebook = {
                pageId: this.get('facebook:pageId', 'your-page-id'),
                pageAccessToken: this.get('facebook:pageAccessToken', 'your-page-access-token'),
                maxRetries: this.get('facebook:maxRetries', 3),
                timeout: this.get('facebook:timeout', 30000),
                apiNumber: this.get('facebook:apiNumber', 'v23.0'),
                enabled: this.get('facebook:enabled', true),
            };
        }
        return this._facebook;
    }
    
    get instagram(): InstagramSettings {
        if (!this._instagram) {
            this._instagram = {
                userId: this.get('instagram:userId', 'your-user-id'),
                accessToken: this.get('instagram:accessToken', 'your-instagram-access-token'),
                maxRetries: this.get('instagram:maxRetries', 3),
                apiNumber: this.get('instagram:apiNumber', 'v23.0'),
                enabled: this.get('instagram:enabled', true),
            };
        }
        return this._instagram;
    }
    
    get tiktok(): TiktokSettings {
        if (!this._tiktok) {
            this._tiktok = {
                accessToken: this.get('tiktok:accessToken', 'your-tiktok-access-token'),
                clientKey: this.get('tiktok:clientKey', 'your-client-key'),
                openId: this.get('tiktok:openId', 'your-open-id'),
                maxRetries: this.get('tiktok:maxRetries', 3),
                enabled: this.get('tiktok:enabled', true),
            };
        }
        return this._tiktok;
    }
} 