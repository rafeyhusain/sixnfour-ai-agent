export class Campaign {
    id: string = "";
    name: string = "";
    theme: string = "";
    start: string = "";
    end: string = "";
    channels: string[] = [];
    lead: number = 0;
    color: string = "";
    medias?: string[] = [];
    recurrence?: {
        frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
        interval?: number;
        byDay?: string[];
        count?: number;
        until?: string;
    };
}
