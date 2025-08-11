import { LlmResult } from "@awing/llm-plugin";
import { PublishResult } from "@awing/social-plugin";
import { ScheduleResult } from "@awing/marketing-db";

export class Response<T> {
    success: boolean;
    data: T;
    messages: string[];

    toString(): string {
        return JSON.stringify({
            success: this.success,
            data: this.data,
            messages: this.messages
        }, null, 2);
    }

    static instance<T>(success: boolean, message: string): Response<T> {
        const result = new Response<T>();
        result.success = success;
        result.messages = [message];
        return result;
    }

    static success<T>(data: T, messages: string[] = []): Response<T> {
        const result = new Response<T>();
        result.success = true;
        result.data = data;
        result.messages = messages;
        return result;
    }

    static failed<T>(messages: string[] = [], data?: T): Response<T> {
        const result = new Response<T>();
        result.success = false;
        result.data = data as T;
        result.messages = messages;
        return result;
    }
}

export class PublishResponse extends Response<PublishResult> {
}

export class GenerateResponse extends Response<LlmResult> {
}

export class ScheduleResponse extends Response<ScheduleResult> {
}