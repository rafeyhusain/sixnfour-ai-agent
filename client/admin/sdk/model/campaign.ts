import { CalendarEvent } from "@/components/wingui/wing-calendar/calendar/calendar-types";
import { Campaign as CampaignPoco } from "../contracts/campaign";
import { CampaignTask } from "../contracts/campaign-task";
import { DashboardService } from "../services/dashboard-service";
import { RRule } from "rrule";

export class Campaign extends CampaignPoco {

    constructor(campaign?: CampaignPoco) {
        super();
        if (campaign) {
            Object.assign(this, campaign);
        }
    }

    toEvent(): CalendarEvent {
        const event: CalendarEvent = {
            id: this.id + '-' + new Date(this.start).toISOString(),
            title: this.name,
            color: this.color,
            start: new Date(this.start),
            end: new Date(this.end)
        }

        return event;
    }

    async refreshEvents(currentEvents: CalendarEvent[]): Promise<CalendarEvent[]> {
        const campaignTasks = await DashboardService.getTable<CampaignTask>('campaign-tasks');

        // Get the current date for the calendar view
        const currentDate = new Date();

        // Get updated events for this specific campaign
        const updatedCampaignEvents = await this.getEvents(currentDate, campaignTasks);

        // Remove old events for this campaign and add the new ones
        const filteredEvents = currentEvents.filter(event => !event.id.startsWith(this.id));
        const newEvents = [...filteredEvents, ...updatedCampaignEvents];

        return newEvents;
    }

    async getEvents(date: Date, campaignTasks: CampaignTask[]): Promise<CalendarEvent[]> {
        const startDate = new Date(date);
        const endDate = new Date(date);
        startDate.setDate(startDate.getDate() - 60);
        endDate.setDate(startDate.getDate() + 60);

        const events: CalendarEvent[] = [];

        let dates: Date[] = [];
        if (this.recurrence) {
            // Map recurrence to rrule options
            const options: any = {
                freq: {
                    daily: RRule.DAILY,
                    weekly: RRule.WEEKLY,
                    monthly: RRule.MONTHLY,
                    yearly: RRule.YEARLY,
                }[this.recurrence.frequency],
                dtstart: new Date(this.start),
                interval: this.recurrence.interval || 1,
            };
            if (this.recurrence.byDay) {
                // Helper to map string days to RRule weekdays
                const weekdayMap: { [key: string]: any } = {
                    MO: RRule.MO,
                    TU: RRule.TU,
                    WE: RRule.WE,
                    TH: RRule.TH,
                    FR: RRule.FR,
                    SA: RRule.SA,
                    SU: RRule.SU,
                };
                options.byweekday = this.recurrence.byDay.map((d: string) => weekdayMap[d.toUpperCase()]);
            }
            if (this.recurrence.count) {
                options.count = this.recurrence.count;
            }
            if (this.recurrence.until) {
                options.until = new Date(this.recurrence.until);
            }
            const rule = new RRule(options);
            dates = rule.between(startDate, endDate, true);
        } else {
            // No recurrence, just the start date if in range
            const s = new Date(this.start);
            if (s >= startDate && s <= endDate) {
                dates = [s];
            }
        }

        for (const d of dates) {
            // Find a campaignTask for this campaign and date
            const task = campaignTasks.find(t => t.campaign === this.id &&
                [t.scheduled, t.generated, t.published].some(ts => ts && new Date(ts).toDateString() === d.toDateString())
            );
            let title = this.name;
            if (task) {
                title += ' - ' + task.status;
            }
            events.push({
                id: this.id + '-' + d.toISOString(),
                title,
                color: d < new Date() ? 'grey' : this.getColor(task),
                start: d,
                end: d,
            });
        }

        return events;
    }

    getColor(task: CampaignTask | undefined): string {
        return this.color;

        // if (!task) {
        //   return 'grey';
        // }
        // if (task.status === 'scheduled') {
        //   return campaign.color;
        // }
        // if (task.status === 'generated') {
        //   return 'yellow';
        // }
        // if (task.status === 'published') {
        //   return 'green';
        // }
        // return 'grey';
    }

    static readonly SOCIAL_CHANNELS = [
        'Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'TikTok',
        'YouTube', 'Pinterest', 'Snapchat', 'Reddit', 'WhatsApp', 'Telegram'
    ];

    static readonly DAYS_OF_WEEK = [
        { code: 'SU', label: 'S', tooltip: 'Sunday' },
        { code: 'MO', label: 'M', tooltip: 'Monday' },
        { code: 'TU', label: 'T', tooltip: 'Tuesday' },
        { code: 'WE', label: 'W', tooltip: 'Wednesday' },
        { code: 'TH', label: 'T', tooltip: 'Thursday' },
        { code: 'FR', label: 'F', tooltip: 'Friday' },
        { code: 'SA', label: 'S', tooltip: 'Saturday' }
    ];

    static toKebabCase(str: string): string {
        return str
            .replace(/[^a-zA-Z0-9 ]/g, '')
            .trim()
            .replace(/\s+/g, '-')
            .toLowerCase();
    }

    static isEndBeforeStart(start: string, end: string): boolean {
        if (!start || !end) return false;
        return new Date(end) < new Date(start);
    }

    static getCampaignId(eventId: string): string {
        return eventId.slice(0, -25);
    }

    clone(): Campaign {
        const cloned = new Campaign();
        Object.assign(cloned, this);
        return cloned;
    }
}
