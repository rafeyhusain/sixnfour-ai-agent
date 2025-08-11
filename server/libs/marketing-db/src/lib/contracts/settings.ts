
export type OllamaSettings = {
    baseUrl: string;
    timeout: number;
    maxRetries: number;
    enabled: boolean;
};

export type FacebookSettings = {
    pageId: string;
    pageAccessToken: string;
    maxRetries: number;
    timeout: number;
    apiNumber: string;
    enabled: boolean;
};

export type InstagramSettings = {
    userId: string;
    accessToken: string;
    maxRetries: number;
    apiNumber: string;
    enabled: boolean;
};

export type TiktokSettings = {
    accessToken: string;
    clientKey: string;
    openId: string;
    maxRetries: number;
    enabled: boolean;
};

export class Settings {
    id: string;
    description: string;
    value: string;
} 