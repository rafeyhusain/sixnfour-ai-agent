export function marketingAgent(): string {
  return 'marketing-agent';
}

import { JobManager } from './job-manager';
import { Campaign, DB_PATH, MarketingDb, ScheduleResult } from '@awing/marketing-db';
import { JobStatus } from '@awing/scheduler-plugin';
import { ContentScheduler } from './content-scheduler';
import { ContentGenerator } from './content-generator';
import { ContentPublisher } from './content-publisher';
import { WingResponse } from '@awing/wingerror';

export class MarketingAgent {
  private static instance: MarketingAgent;
  jobManager: JobManager;
  contentGenerator: ContentGenerator;
  contentPublisher: ContentPublisher;
  contentScheduler: ContentScheduler;
  db: MarketingDb;

  constructor(dbPath: string = DB_PATH, public sample: boolean = false) 
  {
    this.db = new MarketingDb(dbPath)

    this.jobManager = new JobManager(this.db);
    this.contentGenerator = new ContentGenerator(this.db, this.sample);
    this.contentPublisher = new ContentPublisher(this.db, this.sample);
    this.contentScheduler = new ContentScheduler(this.db, this.sample);
  }

  async start() {
    await this.db.load();
    await this.contentGenerator.load();
    await this.contentPublisher.load();
    await this.contentScheduler.load();
    await this.jobManager.start();
  }

  async restart() {
    await this.jobManager.restart();
  }

  async stop() {
    await this.jobManager.stop();
  }
  
  async create(campaign: Campaign): Promise<WingResponse> {
    return await this.contentScheduler.create(campaign);
  }
  
  async update(campaign: Campaign): Promise<WingResponse> {
    return await this.contentScheduler.update(campaign);
  }
  
  async delete(campaignId: string): Promise<WingResponse> {
    return await this.contentScheduler.delete(campaignId);
  }

  async scheduleAll(): Promise<WingResponse[]> {
    const id = this.contentScheduler.id;
        
    if (this.jobManager.canRun(id)) {
      this.jobManager.setStatus(id, JobStatus.Running);
      const result = await this.contentScheduler.scheduleAll();
      this.jobManager.setStatus(id, JobStatus.Idle);
      return result;
    }

    return [];
  }

  async generateAll(): Promise<WingResponse[]> {
    const id = this.contentGenerator.id;
    
    if (this.jobManager.canRun(id)) {
      this.jobManager.setStatus(id, JobStatus.Running);
      const result = await this.contentGenerator.generateAll();
      this.jobManager.setStatus(id, JobStatus.Idle);
      return result;
    }

    return [];
  }

  async publishAll(): Promise<WingResponse[]> {
    const id = this.contentPublisher.id;
        
    if (this.jobManager.canRun(id)) {
      this.jobManager.setStatus(id, JobStatus.Running);
      const result = await this.contentPublisher.publishAll();
      this.jobManager.setStatus(id, JobStatus.Idle);
      return result;
    }

    return [];
  }

  static getInstance(dbPath: string = DB_PATH, sample: boolean = false)  {
    if (!MarketingAgent.instance) {
      MarketingAgent.instance = new MarketingAgent(dbPath, sample);
    }
    return MarketingAgent.instance;
  }
}
