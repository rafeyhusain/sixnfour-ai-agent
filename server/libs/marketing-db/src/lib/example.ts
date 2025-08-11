import { DB_PATH, MarketingDb, TaskStatus } from '@awing/marketing-db';
import { CampaignTask } from './model/campaign-task';

async function save() {
  try {
    const db = new MarketingDb(DB_PATH);
    await db.load();
    const task = new CampaignTask(db, 'campaign-tasks');
    task.id = new Date().toISOString();
    task.campaign = '1';
    task.status = TaskStatus.Pending;
    task.lead = 1;
    task.folder = '1';
    task.error = {"error": "test error"};
    task.scheduled = new Date().toISOString();
    task.generated = new Date().toISOString();
    task.published = new Date().toISOString();
    
    db.campaignTasks.set(task);
    await db.campaignTasks.save();

    console.log('Save campaignTasks response:', db.campaignTasks.count);
  } catch (err) {
    console.error('Error saving content:', err);
  }
}

export async function runExamples() {
  await save();
}
