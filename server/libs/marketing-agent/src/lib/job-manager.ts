import { SchedulerPlugin, JobStatus } from '@awing/scheduler-plugin';
import { MarketingDb, Schedule } from '@awing/marketing-db';
import { Logger } from '@awing/pino-plugin';

export class JobManager {
    public scheduler: SchedulerPlugin;
    private logger: ReturnType<typeof Logger>;

    constructor(private db: MarketingDb) {
        this.logger = Logger(this.constructor.name);
    }

    async start() {
        try {
            this.logger.started('Scheduling all events');
            this.scheduler = new SchedulerPlugin(this.db.schedules.absPath);
            await this.addJobs();
            this.logger.success('All jobs are started');
        } catch (error) {
            this.logger.error('Error start scheduler:', error);
        }
    }

    async restart() {
        this.logger.started('Restarting scheduler');
        try {
            await this.scheduler.restart();
            this.logger.success('Scheduler restarted');
        } catch (error) {
            this.logger.error('Error restarting scheduler:', error);
        }
    }

    async stop() {
        this.logger.started('Stopping scheduler');
        try {
            await this.scheduler.stop();
            this.logger.success('Scheduler stopped');
        } catch (error) {
            this.logger.error('Error stopping scheduler:', error);
        }
    }

    canRun(id: string): boolean {
        return this.scheduler.canRun(id);
    }

    async setStatus(id: string, status: JobStatus) {
        this.scheduler.setStatus(id, status);
    }

    private async addJobs(): Promise<void> {
        try {
            for (const schedule of this.db.schedules) {
                this.addJob(schedule);
            }
        } catch (error) {
            this.logger.error('Error scheduling all events:', error);
        }
    }

    private addJob(schedule: Schedule) {
        try {
            this.scheduler.addJob(
                schedule.id,
                schedule.description,
                schedule.cron,
                schedule.url,
                (schedule.status as unknown) as JobStatus
            );
        } catch (err) {
            this.logger.error(`Failed to schedule job for schedule ${schedule.id}:`, err);
        }
    }
} 