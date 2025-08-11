import { WingDb } from './wingdb';
import { JsonTable } from './providers/json-table';
import { FileTable } from './providers/file-table';
import * as fs from 'fs/promises';
import * as path from 'path';

// Mock marketing-db classes to test compatibility
interface Campaign {
  id: string;
  name: string;
  theme: string;
  start: string;
  end: string;
  channels: string[];
  lead: number;
  color: string;
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval?: number;
    byDay?: string[];
    count?: number;
    until?: string;
  }
}

class CampaignTable extends JsonTable<Campaign> {
  constructor(public db: WingDb, fileName: string) {
    super(db, fileName);
  }

  public instantiate(raw: any): Campaign {
    const instance = Object.assign({}, raw) as Campaign;
    return instance;
  }

  record(row: Campaign): Record<string, any> {
    return {
      id: row.id,
      name: row.name,
      theme: row.theme,
      start: row.start,
      end: row.end,
      channels: row.channels,
      lead: row.lead,
      color: row.color,
      recurrence: row.recurrence,
    };
  }
}

class PromptsTable extends FileTable {
  constructor(public db: WingDb, folder: string, extension: string) {
    super(db, folder, extension);
  }
}

// Mock MarketingDb class
class TestMarketingDb extends WingDb {
  campaigns: CampaignTable;
  prompts: PromptsTable;

  constructor(dbPath: string = './test-marketing-db') {
    super(dbPath);
  }

  public get tables() {
    return {
      'campaigns': { ctor: CampaignTable, file: 'campaigns.json' },
      'prompts': { ctor: PromptsTable, file: 'prompts', extension: '.txt' }
    };
  }

  public async load(): Promise<void> {
    await super.load();

    // Assign table instances (mimicking marketing-db pattern)
    this.campaigns = this['getTable']('campaigns') as CampaignTable;
    this.prompts = this['getTable']('prompts') as PromptsTable;
  }
}

describe('Marketing-DB Compatibility Tests', () => {
  let marketingDb: TestMarketingDb;
  let testDataDir: string;

  beforeEach(async () => {
    testDataDir = path.join(__dirname, '../../../test-marketing-db');
    await fs.mkdir(testDataDir, { recursive: true });
    marketingDb = new TestMarketingDb(testDataDir);
  });

  afterEach(async () => {
    // Clean up test data
    try {
      await fs.rm(testDataDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Backward Compatibility', () => {
    it('should maintain existing marketing-db API patterns', async () => {
      // Test that marketing-db can still extend WingDb
      expect(marketingDb).toBeInstanceOf(WingDb);
      expect(marketingDb).toBeInstanceOf(TestMarketingDb);

      // Test that tables are properly configured
      const tables = marketingDb.tables;
      expect(tables['campaigns']).toBeDefined();
      expect(tables['prompts']).toBeDefined();
    });

    it('should support existing JsonTable extension pattern', async () => {
      // Test that CampaignTable extends JsonTable correctly
      const campaignTable = new CampaignTable(marketingDb, 'campaigns.json');
      expect(campaignTable).toBeInstanceOf(JsonTable);
      expect(campaignTable).toBeInstanceOf(CampaignTable);

      // Load the table first (required for backward compatibility)
      await campaignTable.load();

      // Test basic operations
      const campaign: Campaign = {
        id: 'test-campaign-1',
        name: 'Test Campaign',
        theme: 'marketing',
        start: '2023-01-01',
        end: '2023-12-31',
        channels: ['social', 'email'],
        lead: 30,
        color: '#ff0000'
      };

      // Test set operation
      const result = campaignTable.set(campaign);
      expect(result).toBe(true);

      // Test get operation
      const retrieved = campaignTable.get('test-campaign-1');
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('Test Campaign');
      expect(retrieved?.theme).toBe('marketing');
    });

    it('should support existing FileTable extension pattern', async () => {
      // Test that PromptsTable extends FileTable correctly
      const promptsTable = new PromptsTable(marketingDb, 'prompts', '.txt');
      expect(promptsTable).toBeInstanceOf(FileTable);
      expect(promptsTable).toBeInstanceOf(PromptsTable);

      // Load the table first (required for backward compatibility)
      await promptsTable.load();

      // Test basic operations
      promptsTable.set('prompt1', 'This is a test prompt');
      promptsTable.set('prompt2', 'This is another test prompt');

      // Test get operation
      const retrieved = promptsTable.get('prompt1');
      expect(retrieved).toBe('This is a test prompt');
    });

    it('should support existing filter functionality', async () => {
      const campaignTable = new CampaignTable(marketingDb, 'campaigns.json');

      // Load the table first (required for backward compatibility)
      await campaignTable.load();

      // Add test campaigns
      const campaigns: Campaign[] = [
        {
          id: 'campaign-1',
          name: 'Summer Campaign',
          theme: 'summer',
          start: '2023-06-01',
          end: '2023-08-31',
          channels: ['social'],
          lead: 30,
          color: '#ff0000'
        },
        {
          id: 'campaign-2',
          name: 'Winter Campaign',
          theme: 'winter',
          start: '2023-12-01',
          end: '2024-02-28',
          channels: ['email'],
          lead: 45,
          color: '#0000ff'
        },
        {
          id: 'campaign-3',
          name: 'Spring Campaign',
          theme: 'spring',
          start: '2023-03-01',
          end: '2023-05-31',
          channels: ['social', 'email'],
          lead: 30,
          color: '#00ff00'
        }
      ];

      for (const campaign of campaigns) {
        campaignTable.set(campaign);
      }

      // Test existing filter method
      const socialCampaigns = campaignTable.filter({ channels: ['social'] });
      expect(socialCampaigns.length).toBeGreaterThan(0);

      // Test new findAll method (should work the same)
      const summerCampaigns = campaignTable.findAll({ theme: 'summer' });
      expect(summerCampaigns).toHaveLength(1);
      expect(summerCampaigns[0].name).toBe('Summer Campaign');
    });

    it('should support existing instantiate method pattern', async () => {
      const campaignTable = new CampaignTable(marketingDb, 'campaigns.json');

      // Load the table first (required for backward compatibility)
      await campaignTable.load();

      // Test that instantiate method works correctly
      const rawData = {
        id: 'test-instantiate',
        name: 'Test Instantiate',
        theme: 'test',
        start: '2023-01-01',
        end: '2023-12-31',
        channels: ['test'],
        lead: 30,
        color: '#ffffff'
      };

      const instantiated = campaignTable.instantiate(rawData);
      expect(instantiated).toBeDefined();
      expect(instantiated.id).toBe('test-instantiate');
      expect(instantiated.name).toBe('Test Instantiate');
    });

    it('should support existing record method pattern', async () => {
      const campaignTable = new CampaignTable(marketingDb, 'campaigns.json');

      // Load the table first (required for backward compatibility)
      await campaignTable.load();

      const campaign: Campaign = {
        id: 'test-record',
        name: 'Test Record',
        theme: 'test',
        start: '2023-01-01',
        end: '2023-12-31',
        channels: ['test'],
        lead: 30,
        color: '#ffffff'
      };

      const record = campaignTable.record(campaign);
      expect(record).toBeDefined();
      expect(record.id).toBe('test-record');
      expect(record.name).toBe('Test Record');
      expect(record.theme).toBe('test');
    });
  });

  describe('Performance Optimizations Compatibility', () => {
    it('should support new performance features while maintaining compatibility', async () => {
      const campaignTable = new CampaignTable(marketingDb, 'campaigns.json');

      // Load the table first (required for backward compatibility)
      await campaignTable.load();

      // Add test data
      const campaigns: Campaign[] = [];
      for (let i = 0; i < 100; i++) {
        campaigns.push({
          id: `campaign-${i}`,
          name: `Campaign ${i}`,
          theme: i % 2 === 0 ? 'summer' : 'winter',
          start: '2023-01-01',
          end: '2023-12-31',
          channels: i % 3 === 0 ? ['social'] : ['email'],
          lead: 30,
          color: '#ff0000'
        });
      }

      // Test batch operations (new feature)
      const insertedCount = campaignTable.batchSet(campaigns);
      expect(insertedCount).toBe(100);

      // Test indexing (new feature)
      campaignTable.createIndexes(['theme', 'channels']);

      // Test fast filtering with indexes
      const summerCampaigns = campaignTable.findAll({ theme: 'summer' });
      expect(summerCampaigns).toHaveLength(50);

      // Test pagination (new feature)
      const page1 = campaignTable.getPaginated(1, 20);
      expect(page1.data).toHaveLength(20);
      expect(page1.total).toBe(100);
      expect(page1.totalPages).toBe(5);

      // Test that existing methods still work
      const allCampaigns = campaignTable.filter({});
      expect(allCampaigns).toHaveLength(100);
    });

    it('should support caching without breaking existing functionality', async () => {
      const campaignTable = new CampaignTable(marketingDb, 'campaigns.json');

      // Load the table first (required for backward compatibility)
      await campaignTable.load();

      const campaign: Campaign = {
        id: 'cached-campaign',
        name: 'Cached Campaign',
        theme: 'test',
        start: '2023-01-01',
        end: '2023-12-31',
        channels: ['test'],
        lead: 30,
        color: '#ffffff'
      };

      campaignTable.set(campaign);

      // First access (should cache)
      const firstAccess = campaignTable.get('cached-campaign');
      expect(firstAccess).toBeDefined();

      // Second access (should use cache)
      const secondAccess = campaignTable.get('cached-campaign');
      expect(secondAccess).toBeDefined();
      expect(firstAccess).toBe(secondAccess);

      // Test memory stats (new feature)
      const stats = campaignTable.getMemoryStats();
      expect(stats.cacheSize).toBeGreaterThan(0);
      expect(stats.totalEntries).toBe(1);
    });

    it('should support debounced saves without breaking existing API', async () => {
      const campaignTable = new CampaignTable(marketingDb, 'campaigns.json');

      // Load the table first (required for backward compatibility)
      await campaignTable.load();

      const campaign: Campaign = {
        id: 'debounced-campaign',
        name: 'Debounced Campaign',
        theme: 'test',
        start: '2023-01-01',
        end: '2023-12-31',
        channels: ['test'],
        lead: 30,
        color: '#ffffff'
      };

      // Test that setRow still works (should trigger debounced save)
      const result = await campaignTable.saveRow('debounced-campaign', campaign);
      expect(result).toBe(true);

      // Verify the record was saved
      const retrieved = campaignTable.get('debounced-campaign');
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('Debounced Campaign');
    });
  });

  describe('Database Loading and Initialization', () => {
    it('should support existing load pattern', async () => {
      // Test that the marketing-db load pattern still works
      await marketingDb.load();

      // Verify that table instances are assigned
      expect(marketingDb.campaigns).toBeDefined();
      expect(marketingDb.prompts).toBeDefined();
      expect(marketingDb.campaigns).toBeInstanceOf(CampaignTable);
      expect(marketingDb.prompts).toBeInstanceOf(PromptsTable);
    });

    it('should support existing table access patterns', async () => {
      await marketingDb.load();

      // Test that we can access tables through the database instance
      const campaigns = marketingDb.campaigns;
      const prompts = marketingDb.prompts;

      expect(campaigns).toBeDefined();
      expect(prompts).toBeDefined();

      // Test that we can still use the getTable method
      const campaignsViaGetTable = marketingDb['getTable']('campaigns');
      expect(campaignsViaGetTable).toBe(campaigns);
    });
  });

  describe('Error Handling Compatibility', () => {
    it('should handle errors gracefully without breaking existing patterns', async () => {
      const campaignTable = new CampaignTable(marketingDb, 'campaigns.json');

      // Load the table first (required for backward compatibility)
      await campaignTable.load();

      // Test with invalid data
      const invalidCampaign = {
        id: 'invalid-campaign',
        // Missing required fields
      } as any;

      // Should handle gracefully
      expect(() => {
        campaignTable.set(invalidCampaign);
      }).not.toThrow();

      // Test batch operations with mixed valid/invalid data
      const mixedData = [
        {
          id: 'valid-1',
          name: 'Valid Campaign 1',
          theme: 'test',
          start: '2023-01-01',
          end: '2023-12-31',
          channels: ['test'],
          lead: 30,
          color: '#ffffff'
        },
        invalidCampaign,
        {
          id: 'valid-2',
          name: 'Valid Campaign 2',
          theme: 'test',
          start: '2023-01-01',
          end: '2023-12-31',
          channels: ['test'],
          lead: 30,
          color: '#ffffff'
        }
      ];

      const insertedCount = campaignTable.batchSet(mixedData);
      expect(insertedCount).toBeGreaterThan(0);
    });
  });

  describe('Memory Management Compatibility', () => {
    it('should support memory management without breaking existing functionality', async () => {
      const campaignTable = new CampaignTable(marketingDb, 'campaigns.json');

      // Load the table first (required for backward compatibility)
      await campaignTable.load();

      // Add some data
      const campaign: Campaign = {
        id: 'memory-test',
        name: 'Memory Test Campaign',
        theme: 'test',
        start: '2023-01-01',
        end: '2023-12-31',
        channels: ['test'],
        lead: 30,
        color: '#ffffff'
      };

      campaignTable.set(campaign);
      campaignTable.get('memory-test'); // Populate cache

      // Test cache clearing (new feature)
      const statsBefore = campaignTable.getMemoryStats();
      expect(statsBefore.cacheSize).toBeGreaterThan(0);

      campaignTable.clearCache();

      const statsAfter = campaignTable.getMemoryStats();
      expect(statsAfter.cacheSize).toBe(0);

      // Verify data is still accessible after cache clear
      const retrieved = campaignTable.get('memory-test');
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('Memory Test Campaign');
    });
  });
}); 