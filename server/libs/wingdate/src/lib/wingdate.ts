export function wingdate(): string {
  return 'wingdate';
}

import { DateTime, DateTimeUnit } from "luxon";
import { Recurrence } from './recurrence';

export class WingDate {
  ISO: string;
  zone: string;
  date: DateTime;

  constructor(dateISO: string, userTimeZone?: string) {
    this.ISO = dateISO;
    this.zone = WingDate.userZone(userTimeZone);
    this.date = DateTime.fromISO(this.ISO, { zone: this.zone });
  }

  get UTC(): string {
    return WingDate.toUTC(this.ISO);
  }

  static userZone(userTimeZone?: string): string {
    return userTimeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  
  static now(userTimeZone?: string): WingDate {
    return new WingDate(DateTime.now().toISO(), userTimeZone);
  }

  static toUTC(dateISO: string, userTimeZone?: string): string {
    const dt = new WingDate(dateISO, userTimeZone);
    return dt.UTC;
  }

  static toISO(utcISO: string, userTimeZone?: string): string {
    const dt = new WingDate(utcISO, "utc");
    return dt.date.setZone(WingDate.userZone(userTimeZone)).toISO({ suppressMilliseconds: true });
  }

  static format(
    utcISO: string,
    userTimeZone?: string,
    format: string = "yyyy-LL-dd HH:mm ZZZZ"
  ): string {
    const dt = new WingDate(utcISO, "utc");
    return dt.date.setZone(WingDate.userZone(userTimeZone)).toFormat(format);
  }

  static toWingDate2(dateISO: string, userTimeZone?: string): WingDate {
    return new WingDate(dateISO, userTimeZone);
  }

  static toISO2(date: Date, userTimeZone?: string): string {
    return WingDate.fromJSDate(date, userTimeZone).date.toISO({ suppressMilliseconds: true });
  }

  static toWingDate(date: Date | DateTime, userTimeZone?: string): WingDate {
    if (date instanceof Date) {
      return WingDate.fromJSDate(date, userTimeZone);
    } else {
      return new WingDate(date.toISO(), userTimeZone);
    }
  }

  static fromJSDate(date: Date, userTimeZone?: string): WingDate {
    const zone = WingDate.userZone(userTimeZone);
    const dateTime = DateTime.fromJSDate(date, { zone });
    return new WingDate(dateTime.toISO(), zone);
  }

  eq(dateISO: string, userTimeZone?: string): boolean {
    const dt = new WingDate(dateISO, userTimeZone);
    return this.date.toMillis() === dt.date.toMillis();
  }

  neq(dateISO: string, userTimeZone?: string): boolean {
    return !this.eq(dateISO, userTimeZone);
  }

  gt(dateISO: string, userTimeZone?: string): boolean {
    const dt = new WingDate(dateISO, userTimeZone);
    return this.date.toMillis() > dt.date.toMillis();
  }

  gte(dateISO: string, userTimeZone?: string): boolean {
    const dt = new WingDate(dateISO, userTimeZone);
    return this.date.toMillis() >= dt.date.toMillis();
  }

  lt(dateISO: string, userTimeZone?: string): boolean {
    const dt = new WingDate(dateISO, userTimeZone);
    return this.date.toMillis() < dt.date.toMillis();
  }

  lte(dateISO: string, userTimeZone?: string): boolean {
    const dt = new WingDate(dateISO, userTimeZone);
    return this.date.toMillis() <= dt.date.toMillis();
  }

  all(recurrence: Recurrence): WingDate[] {
    if (recurrence) {
      const rule = recurrence.rule(this.ISO); 
      const dates = rule.all(); 
      return this.map(dates, this.zone);
    }
    
    return [];
  }

  within(recurrence: Recurrence, unit: DateTimeUnit = 'month', includeDates: boolean = true): WingDate[] {
    const end = this.date.endOf(unit).toISO({ suppressMilliseconds: true });
    return this.between(recurrence, end, includeDates);
  }

  between(recurrence: Recurrence, endDate: string, includeDates: boolean = true): WingDate[] {
    if (recurrence) {
      const rule = recurrence.rule(this.ISO); 
      const start = this.date.toJSDate(); 
      const end = new WingDate(endDate, this.zone).date.toJSDate();
      const dates = rule.between(start, end, includeDates); 
      return this.map(dates, this.zone);
    }
    
    return [];
  }

  map(dates: Date[], userTimeZone?: string):  WingDate[] {
    return dates.map(date => new WingDate(date.toISOString(), userTimeZone));
  }

  sameTime(date: string | WingDate, userTimeZone?: string): boolean {
    let other: WingDate = this.toWingDate(date, userTimeZone);
    return (
      this.date.hour === other.date.hour &&
      this.date.minute === other.date.minute &&
      this.date.second === other.date.second
    );
  }

  overdue(date: string | WingDate, userTimeZone?: string): boolean {
    let other: WingDate = this.toWingDate(date, userTimeZone);
    return this.date.toMillis() >= other.date.toMillis();
  }

  toWingDate(date: string | WingDate, userTimeZone?: string): WingDate {
    let other: WingDate;
    if (typeof date === 'string') {
      other = new WingDate(date, userTimeZone);
    } else {
      other = date;
    }
    return other;
  }

  due(recurrence: Recurrence, date: string | WingDate, userTimeZone?: string): boolean {
    if (!recurrence) {
      return false;
    }
    
    let other: WingDate = this.toWingDate(date, userTimeZone);

    const occurrences = this.all(recurrence);
    
    return occurrences.some(occ => 
      occ.date.toMillis() === other.date.toMillis()
    );
  }
}
