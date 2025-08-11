import { RRule } from "rrule";

export interface IRecurrence {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'hourly' | 'minutely' | 'secondly';
    interval?: number;
    byDay?: string[];
    count?: number;
    until?: string;
}

export class Recurrence implements IRecurrence {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'hourly' | 'minutely' | 'secondly';
    interval?: number;
    byDay?: string[];
    count?: number;
    until?: string;

    constructor(recurrence: IRecurrence) {
        if (recurrence) {
        this.frequency = recurrence.frequency;
        this.interval = recurrence.interval;
        this.byDay = recurrence.byDay;
        this.count = recurrence.count;
        this.until = recurrence.until;
        }
    }

    options(startDate: string): any {
        const options: any = {
            freq: {
                daily: RRule.DAILY,
                weekly: RRule.WEEKLY,
                monthly: RRule.MONTHLY,
                yearly: RRule.YEARLY,
                hourly: RRule.HOURLY,
                minutely: RRule.MINUTELY,
                secondly: RRule.SECONDLY,
            }[this.frequency],
            dtstart: new Date(startDate),
            interval: this.interval || 1,
        };

        if (this.byDay) {
            const weekdayMap: { [key: string]: any } = {
                MO: RRule.MO,
                TU: RRule.TU,
                WE: RRule.WE,
                TH: RRule.TH,
                FR: RRule.FR,
                SA: RRule.SA,
                SU: RRule.SU,
            };
            options.byweekday = this.byDay.map((d: string) => weekdayMap[d.toUpperCase()]);
        }
        if (this.count) {
            options.count = this.count;
        }
        if (this.until) {
            options.until = new Date(this.until);
        }
        return options;
    }

    rule(startDate: string): RRule {
        const rule = new RRule(this.options(startDate));

        return rule;
    }
}