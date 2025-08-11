export class SocialResponse {
    success: boolean;
    postId?: string;
    url?: string;
    error?: string;
    platform: string;
    timestamp: Date;

    toString(): string {
        return JSON.stringify({
            success: this.success,
            postId: this.postId,
            url: this.url,
            error: this.error,
            platform: this.platform,
            timestamp: this.timestamp
        }, null, 2);
    }
}
