import { WingDb } from "@awing/wingdb";
import { Campaign, CampaignTask, CampaignType, Prompts, Schedule, Settings, ExampleTable, Content, Medias } from ".";
import { Contents } from "./model/contents";

export const DB_PATH = '../data/db';
export const LIBS_DB_PATH = '../../../data/db';

export enum Table {
  Schedules = 'schedules',
  CampaignTypes = 'campaign-types',
  Campaigns = 'campaigns',
  CampaignTasks = 'campaign-tasks',
  Prompts = 'prompts',
  Settings = 'settings',
  Contents = 'contents',
  ExampleTable = 'example-table',
  Media = 'medias'
}

export class MarketingDb extends WingDb {
  schedules: Schedule;
  campaignTypes: CampaignType;
  campaigns: Campaign;
  campaignTasks: CampaignTask;
  prompts: Prompts;
  settings: Settings;
  exampleTable: ExampleTable;
  contents: Contents;
  medias: Medias;
  static instance: MarketingDb;

  constructor(dbPath: string = DB_PATH) {
    super(dbPath);
  }

  public get tables() {
    return {
      // JsonTable
      [Table.Schedules]: { ctor: Schedule, file: `${Table.Schedules}.json` },
      [Table.CampaignTypes]: { ctor: CampaignType, file: `${Table.CampaignTypes}.json` },
      [Table.Campaigns]: { ctor: Campaign, file: `${Table.Campaigns}.json` },
      [Table.CampaignTasks]: { ctor: CampaignTask, file: `${Table.CampaignTasks}.json` },
      [Table.Settings]: { ctor: Settings, file: `${Table.Settings}.json` },
      [Table.ExampleTable]: { ctor: ExampleTable, file: `${Table.ExampleTable}.json` },
      [Table.Contents]: { ctor: Contents, file: `${Table.Contents}` },
      [Table.Media]: { ctor: Medias, file: `${Table.Media}.json` },
      
      // FileTable
      [Table.Prompts]: { ctor: Prompts, file: `${Table.Prompts}` }
    };
  }

  public async tableNames(): Promise<string[]> {
    return Object.keys(this.tables);
  }

  public async load(): Promise<void> {
    await Content.ensureFolder(this);
    await Medias.ensureFolder(this);

    await super.load();

    // JsonTable
    this.schedules = this[Table.Schedules];
    this.campaignTypes = this[Table.CampaignTypes];
    this.campaigns = this[Table.Campaigns];
    this.campaignTasks = this[Table.CampaignTasks];
    this.settings = this[Table.Settings];
    this.exampleTable = this[Table.ExampleTable];
    this.contents = this[Table.Contents];
    this.medias = this[Table.Media];

    // FileTable
    this.prompts = this[Table.Prompts];
  }

  static getInstance(dbPath: string = DB_PATH) : MarketingDb {
    if (!MarketingDb.instance) {
      MarketingDb.instance = new MarketingDb(dbPath);
    }
    return MarketingDb.instance;
  }
} 
