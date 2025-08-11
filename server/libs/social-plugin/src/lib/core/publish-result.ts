import { PlatformType } from "../platform-factory";
import { SocialResponse } from "./social-response";

export class PublishResult {
    success: boolean;
    results: Record<PlatformType, SocialResponse>;
    errors: Record<PlatformType, string>;
    totalAttempts: number;
    successfulPlatforms: PlatformType[];
    failedPlatforms: PlatformType[];

    constructor() {
        this.results = {} as Record<PlatformType, SocialResponse>;
        this.errors = {} as Record<PlatformType, string>;
        this.successfulPlatforms = [];
        this.failedPlatforms = [];
        this.totalAttempts = 0;
    }

    toString(): string {
        return JSON.stringify(this, null, 2);
    }
}