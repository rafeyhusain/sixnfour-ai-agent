import axios from 'axios';
import cron, { ScheduledTask } from 'node-cron';
import { Logger } from '@awing/pino-plugin';

export enum JobStatus {
    Running = "running",
    Paused = "paused",
    Idle = "idle"
}

export interface ISchedule {
    id: string;
    description: string;
    cron: string;
    url: string;
    status: JobStatus;
}

export class Job {
    id: string;
    description: string;
    cron: string;
    url: string;
    status: JobStatus;
    task: ScheduledTask;

    private logger: ReturnType<typeof Logger>;
    constructor() {
        this.logger = Logger(this.constructor.name);
    }

    static get default(): Job {
        const schedule: Job =
            Job.instance({
                id: 'ping',
                description: 'ping',
                url: 'http://localhost:5002/ping',
                cron: '*/3 * * * * *',
                status: JobStatus.Idle
            })

        return schedule;
    }

    static instance({
        id,
        description,
        cron,
        url,
        status
    }: ISchedule): Job {
        const s = new Job();
        s.id = id;
        s.description = description;
        s.cron = cron;
        s.url = url;
        s.status = status;
        return s;
    }

    get canRun(): boolean {
        return [
            JobStatus.Idle,
        ].includes(this.status);
    }

    start(): void {
        if (this.task) {
            this.task.start();
            this.idle();
        }
    }

    stop(): void {
        if (this.task) {
            this.task.stop();
            this.paused();
        }
    }

    setStatus(status: JobStatus): void {
        this.status = status;
    }

    running(): void {
        this.status = JobStatus.Running;
    }

    paused(): void {
        this.status = JobStatus.Paused;
    }

    idle(): void {
        this.status = JobStatus.Idle;
    }

    restart(): void {
        this.stop();
        this.start();
    }

    get valid(): boolean {
        return cron.validate(this.cron);
    }

    create(): boolean {
        this.task = cron.schedule(this.cron, async () => {
            try {
                await axios.get(this.url);
                this.logger.info(`Triggered cron job ${this.id}: ${this.url}`);
            } catch (err) {
                this.logger.error(`Failed to trigger cron job ${this.id}`, err);
            }
        });

        return true;
    }

    toString(): string {
        return `Schedule { id: ${this.id}, description: ${this.description}, cron: ${this.cron}, url: ${this.url}, status: ${this.status} }`;
    }

    cronTime(schedule: Job, leadDays: number): string {
        const [min, hour, dayStr, monthStr] = schedule.cron.split(' ');
        const eventDate = new Date(2024, parseInt(monthStr) - 1, parseInt(dayStr));

        eventDate.setDate(eventDate.getDate() - leadDays);

        const preDay = eventDate.getDate();
        const preMonth = eventDate.getMonth() + 1;

        return `${min} ${hour} ${preDay} ${preMonth} *`;
    }
} 