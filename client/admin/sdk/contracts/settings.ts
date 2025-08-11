
export type OllamaSettings = {
    baseUrl: string;
    timeout: number;
    maxRetries: number;
};

export type FacebookSettings = {
    pageId: string;
    pageAccessToken: string;
    maxRetries: number;
    timeout: number;
    apiNumber: string;
};

export type InstagramSettings = {
    userId: string;
    accessToken: string;
    maxRetries: number;
    apiNumber: string;
};

export type TiktokSettings = {
    accessToken: string;
    clientKey: string;
    openId: string;
    maxRetries: number;
};

export class Settings {
    id: string;
    description: string;
    value: string;
} 