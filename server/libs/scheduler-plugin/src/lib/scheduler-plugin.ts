export function schedulerPlugin(): string {
  return 'scheduler-plugin';
}

import * as fs from 'fs/promises';
import * as path from 'path';
import { existsSync } from 'fs';
import { Job, JobStatus } from './job';
import {Logger } from '@awing/pino-plugin'
import { DB_PATH } from '@awing/marketing-db';

export const SCHEDULER_FILE_PATH = `${DB_PATH}/schedules.json`;

export class SchedulerPlugin {
  private readonly filePath: string;
  private jobs: Map<string, Job> = new Map();
  private logger: ReturnType<typeof Logger>;

  constructor(filePath = SCHEDULER_FILE_PATH) {
    this.logger = Logger(this.constructor.name);
    this.filePath = path.resolve(filePath);
  }

  async start(): Promise<void> {
    this.load();
    this.logger.info('All scheduled jobs have been loaded.');
  }

  async restart(): Promise<void> {
    this.stop();
    this.start();
  }

  async stop(): Promise<void> {
    for (const [id, schedule] of this.jobs.entries()) {
      schedule.stop();
    }
    this.logger.info('All scheduled jobs have been stopped.');
  }

  async load(): Promise<void> {
    try {

      let jobs: Job[] = [Job.default];

      if (existsSync(this.filePath)) {
        this.logger.info('Schedule file found.');
        const data = await fs.readFile(this.filePath, 'utf-8');
        jobs = JSON.parse(data);
      } else {
        this.logger.info('No schedule file found, using default schedule.');
      }

      for (const job of jobs) {
        this.add(job, false); // don't persist while restoring
      }

      this.logger.info(`Loaded ${jobs.length} scheduled job(s).`);
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        // File doesn't exist yet — safe to ignore
        this.logger.info('No schedule file found. Starting fresh.');
        return;
      }
      this.logger.error('Error loading schedules:', err);
    }
  }

  // Save all current entries to file
  private async save(): Promise<void> {
    const data = Array.from(this.jobs.values());
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  addJob(
    id: string,
    description: string,
    cron: string,
    url: string,
    status: JobStatus): boolean {
    return this.add(Job.instance({ id, description, cron, url, status }));
  }

  // Add a new scheduled job
  add(job: Job, persist = true): boolean {
    if (this.jobs.has(job.id)) {
      this.logger.warn(`Job with id "${job.id}" already exists.`);
      return false;
    }

    if (!job.valid) {
      throw new Error(`Invalid cron time: ${job.cron}`);
    }

    if (!job.create()) {
      throw new Error(`Unable to schedule cron job: ${job}`);
    }

    this.jobs.set(job.id, Job.instance(
      {
        id: job.id,
        description: job.description,
        cron: job.cron,
        url: job.url,
        status: job.status
      })
    );

    if (persist) {
      this.save();
    }

    this.logger.info(`Added scheduled job [${job.id}]`);

    return true;
  }

  remove(id: string): boolean {
    const job = this.jobs.get(id);
    if (!job) return false;

    job.stop();
    this.jobs.delete(id);
    this.save();

    this.logger.info(`Removed scheduled job ${id}`);
    return true;
  }

  list(): Job[] {
    return Array.from(this.jobs.values());
  }

  get(id: string): Job | undefined {
    return this.jobs.get(id);
  }

  canRun(id: string): boolean {
    const job = this.jobs.get(id);
    if (!job) return false;

    return job.canRun;
  }
  
  setStatus(id: string, status: JobStatus): boolean {
    const job = this.jobs.get(id);
    if (!job) return false;

    job.setStatus(status);

    return true;
  }
}
