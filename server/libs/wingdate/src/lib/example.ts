import { WingDate } from "./wingdate";
import { Recurrence } from "./recurrence";

export class Example {
    static constructWingDate() {
        const date1 = new WingDate('2024-06-01T12:00:00Z');
        const date2 = new WingDate('2024-06-01T15:00:00+03:00', 'Europe/Moscow');
        console.log('Constructed:', date1, date2);
    }

    static compareDates() {
        const date1 = new WingDate('2024-06-01T12:00:00Z');
        const date2 = new WingDate('2024-06-01T15:00:00+03:00', 'Europe/Moscow');
        console.log('eq:', date1.eq('2024-06-01T12:00:00Z'));
        console.log('neq:', date1.neq('2024-06-01T13:00:00Z'));
        console.log('gt:', date2.gt('2024-06-01T10:00:00Z'));
        console.log('gte:', date2.gte('2024-06-01T15:00:00+03:00'));
        console.log('lt:', date1.lt('2024-06-01T13:00:00Z'));
        console.log('lte:', date1.lte('2024-06-01T12:00:00Z'));
    }

    static utcAndIsoConversions() {
        const date2 = new WingDate('2024-06-01T15:00:00+03:00', 'Europe/Moscow');
        console.log('UTC:', date2.UTC);
        console.log('toUTC:', WingDate.toUTC('2024-06-01T15:00:00+03:00', 'Europe/Moscow'));
        console.log('toISO:', WingDate.toISO('2024-06-01T12:00:00Z', 'Europe/Moscow'));
    }

    static formatting() {
        console.log('format:', WingDate.format('2024-06-01T12:00:00Z', 'Europe/Moscow', 'yyyy-MM-dd HH:mm'));
    }

    static recurrenceUsage() {
        const date1 = new WingDate('2024-06-01T12:00:00Z');
        const recurrence = new Recurrence({ frequency: 'daily', interval: 1, count: 3 });
        const allDates = date1.all(recurrence);
        console.log('all recurrence dates:', allDates.map(d => d.ISO));
        const withinDates = date1.within(recurrence, 'month');
        console.log('within month recurrence dates:', withinDates.map(d => d.ISO));
        const betweenDates = date1.between(recurrence, '2024-06-10T12:00:00Z');
        console.log('between recurrence dates:', betweenDates.map(d => d.ISO));
    }

    static sameTimeAndIsDueNow() {
        const date1 = new WingDate('2024-06-01T12:00:00Z');
        const date3 = new WingDate('2024-06-01T12:00:00Z');
        const recurrence = new Recurrence({ frequency: 'yearly', interval: 1, count: 3 });
        console.log('sameTime:', date1.sameTime(date3));
        console.log('isDueNow:', date1.due(recurrence, date3));
    }

    static all() {
        const date1 = new WingDate('2024-06-01T12:00:00Z');
        const recurrence = new Recurrence({ frequency: 'daily', interval: 1, count: 3 });
        console.log('all:', date1.all(recurrence));
    }

    static between() {
        const date1 = new WingDate('2024-06-01T12:00:00Z');
        const date2 = new WingDate('2024-06-01T12:00:00Z');

        const recurrence = new Recurrence({ frequency: 'yearly', interval: 1, count: 3 });
        console.log('between:', date1.between(recurrence, date2.ISO));
    }

    static due() {
        const date1 = new WingDate('2024-06-01T12:00:00Z');
        const date2 = new WingDate('2026-06-01T12:00:00Z');
        const date3 = new WingDate('2028-06-01T12:00:00Z');

        const recurrence = new Recurrence({ frequency: 'yearly', interval: 1, count: 3 });
        console.log(`due: [${date2.ISO}]`, date1.due(recurrence, date2));
        console.log(`due: [${date3.ISO}]`, date1.due(recurrence, date3));
    }
}

export async function runExamples(): Promise<void> {
    // Example.constructWingDate();
    // Example.compareDates();
    // Example.utcAndIsoConversions();
    // Example.formatting();
    // Example.recurrenceUsage();
    // Example.sameTimeAndIsDueNow();
    //Example.all();
    //Example.between();
    Example.due();

}