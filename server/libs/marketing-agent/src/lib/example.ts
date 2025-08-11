import { ContentGenerator } from './content-generator';
import { ContentPublisher } from './content-publisher';
import { MarketingAgent } from './marketing-agent';
import { JobManager } from './job-manager';
import { Campaign, LIBS_DB_PATH, MarketingDb } from '@awing/marketing-db';
import path = require('path');

const sample = false;

async function createCampaign() {
  try {
    const campaign = {
      "id": "dummy_campaign",
      "name": "Dummy Campaign",
      "theme": "Dummy Campaign Theme",
      "start": "2025-01-01T10:00:00",
      "end": "2025-01-01T23:59:00",
      "channels": [
        "instagram",
        "facebook",
        "tiktok"
      ],
      "lead": 7,
      "color": "red",
      "recurrence": {
        "frequency": "yearly"
      }
    };

    const agent = MarketingAgent.getInstance(LIBS_DB_PATH, sample);
    await agent.db.load();
    const response = await agent.contentScheduler.create(campaign as Campaign);
    console.log('Campaign created:', response);
  } catch (err) {
    console.error('Error scheduling content:', err);
  }
}

async function deleteCampaign() {
  try {
    const agent = MarketingAgent.getInstance(LIBS_DB_PATH, sample);
    await agent.db.load();
    const response = await agent.contentScheduler.delete('dummy_campaign');
    console.log('campaign deleted:', response);
  } catch (err) {
    console.error('Error deleting campaign:', err);
  }
}

async function scheduleAll() {
  try {
    const agent = MarketingAgent.getInstance(LIBS_DB_PATH, sample);
    await agent.db.load();
    const response = await agent.contentScheduler.scheduleAll();
    console.log('Schedule response:', JSON.stringify(response, null, 2));
  } catch (err) {
    console.error('Error scheduling content:', err);
  }
}

async function generateAll() {
  try {
    const db = new MarketingDb(LIBS_DB_PATH);
    await db.load();
    const service = new ContentGenerator(db, sample);
    await service.load();
    const response = await service.generateAll();
    console.log('generateAll Response:', JSON.stringify(response, null, 2));
  } catch (err) {
    console.error('Error generating content:', err);
  }
}



async function publishAll() {
  try {
    const db = new MarketingDb(LIBS_DB_PATH);
    await db.load();
  
    const service = new ContentPublisher(db, sample);
    await service.load();

    const response = await service.publishAll();
    console.log('publishAll Response:', JSON.stringify(response, null, 2));
  } catch (err) {
    console.error('Error publishing content:', err);
  }
}

async function schedule() {
  const agent = MarketingAgent.getInstance(LIBS_DB_PATH, sample);
  await agent.db.load();
  const scheduleManager = new JobManager(agent.db);
  await scheduleManager.start();
}

async function generateById() {
  try {
    const db = new MarketingDb(LIBS_DB_PATH);
    await db.load();

    const service = new ContentGenerator(db, sample);
    await service.load();

    const response = await service.generateById(`new_year_day:d-7`);
    console.log('generateById Response:', JSON.stringify(response, null, 2));
  } catch (err) {
    console.error('Error generating with agent:', err);
  }
}

async function publishById() {
  try {
    const db = new MarketingDb(LIBS_DB_PATH);
    await db.load();
  
    const service = new ContentPublisher(db, sample);
    await service.load();

    const response = await service.publishById('new_year_day:d-7');
    console.log('publishById Response:', JSON.stringify(response, null, 2));
  } catch (err) {
    console.error('Error publishing content:', err);
  }
}

export async function runExamples() {
  // await scheduleAll();
  // await generateAll();
  // await publishAll();

  // await schedule();
  // await generateById();
  await publishById();

  // await createCampaign();
  // await deleteCampaign();
}
