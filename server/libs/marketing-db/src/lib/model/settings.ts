import { JsonTable } from "@awing/wingdb";
import { MarketingDb } from "../marketing-db";
import { FacebookSettings, InstagramSettings, OllamaSettings, TiktokSettings } from "../contracts/settings";

export class Settings extends JsonTable<Settings> {
    id: string;
    description: string;
    value: string;

    private _ollama: OllamaSettings;
    
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
                baseUrl: String(this.get('ollama:baseUrl')?.value ?? 'http://localhost:11434'),
                timeout: Number(this.get('ollama:timeout')?.value ?? 60000),
                maxRetries: Number(this.get('ollama:maxRetries')?.value ?? 2),
                enabled: Boolean(this.get('ollama:enabled')?.value ?? true),
            };
        }
        return this._ollama;
    }
    private _facebook: FacebookSettings;
    private _instagram: InstagramSettings;
    private _tiktok: TiktokSettings;

    get facebook(): FacebookSettings {
        if (!this._facebook) {
            this._facebook = {
                pageId: String(this.get('facebook:pageId')?.value ?? 'your-page-id'),
                pageAccessToken: String(this.get('facebook:pageAccessToken')?.value ?? 'your-page-access-token'),
                maxRetries: Number(this.get('facebook:maxRetries')?.value ?? 3),
                timeout: Number(this.get('facebook:timeout')?.value ?? 30000),
                apiNumber: String(this.get('facebook:apiNumber')?.value ?? 'v23.0'),
                enabled: Boolean(this.get('facebook:enabled')?.value ?? true),
            };
        }
        return this._facebook;
    }

    get instagram(): InstagramSettings {
        if (!this._instagram) {
            this._instagram = {
                userId: String(this.get('instagram:userId')?.value ?? 'your-user-id'),
                accessToken: String(this.get('instagram:accessToken')?.value ?? 'your-instagram-access-token'),
                maxRetries: Number(this.get('instagram:maxRetries')?.value ?? 3),
                apiNumber: String(this.get('instagram:apiNumber')?.value ?? 'v23.0'),
                enabled: Boolean(this.get('instagram:enabled')?.value ?? true),
            };
        }
        return this._instagram;
    }

    get tiktok(): TiktokSettings {
        if (!this._tiktok) {
            this._tiktok = {
                accessToken: String(this.get('tiktok:accessToken')?.value ?? 'your-tiktok-access-token'),
                clientKey: String(this.get('tiktok:clientKey')?.value ?? 'your-client-key'),
                openId: String(this.get('tiktok:openId')?.value ?? 'your-open-id'),
                maxRetries: Number(this.get('tiktok:maxRetries')?.value ?? 3),
                enabled: Boolean(this.get('tiktok:enabled')?.value ?? true),
            };
        }
        return this._tiktok;
    }
} 