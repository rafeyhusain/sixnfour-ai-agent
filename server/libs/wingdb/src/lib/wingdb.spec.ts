import { wingdb, WingDb } from './wingdb';
import { FileTable } from './providers/file-table';
import { JsonTable } from './providers/json-table';
import { FolderTable } from './providers/folder-table';
import { DelimitedTable } from './providers/delimited-table';
import { BaseTable } from './core/base-table';
import { PerformanceUtils } from './core/performance-utils';
import { Logger, PinoPlugin } from '@awing/pino-plugin';
import * as fs from 'fs/promises';
import * as path from 'path';

// Mock class to test WingDb
// Wrapper class for DelimitedTable to match the expected constructor pattern
class TestDelimitedTable<T extends { id?: string }> extends DelimitedTable<T> {
  constructor(db: WingDb, fileName: string) {
    const filePath = path.join(db.dbPath, fileName);
    super(filePath);
  }
}

class TestWingDb extends WingDb {
  get tables() {
    return {
      'test-file': { ctor: FileTable, file: 'test-folder' },
      'test-json': { ctor: JsonTable, file: 'test.json' },
      'test-folder': { ctor: FolderTable, file: 'test-folders' },
      'test-csv': { ctor: TestDelimitedTable, file: 'test.csv' }
    };
  }
}

// Test data interface
interface TestRecord {
  id: string;
  name: string;
  status: string;
  category: string;
  createdAt: string;
  value: number;
}

// Test JsonTable class for backward compatibility
class TestJsonTable extends JsonTable<TestRecord> {
  constructor(db: WingDb, fileName: string) {
    super(db, fileName);
  }

  protected instantiate(raw: any): TestRecord {
    return raw as TestRecord;
  }

  record(row: TestRecord): Record<string, any> {
    return {
      id: row.id,
      name: row.name,
      status: row.status,
      category: row.category,
      createdAt: row.createdAt,
      value: row.value
    };
  }
}

describe('wingdb', () => {
  let testDb: TestWingDb;
  let testDataDir: string;

  beforeEach(async () => {
    testDataDir = path.join(__dirname, '../../../test-data');
    await fs.mkdir(testDataDir, { recursive: true });
    testDb = new TestWingDb(testDataDir);
  });

  afterEach(async () => {
    // Clean up test data
    try {
      await fs.rm(testDataDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Basic Functionality', () => {
    it('should work', () => {
      expect(wingdb()).toEqual('wingdb');
    });

    it('should create database instance', () => {
      expect(testDb).toBeDefined();
      expect(testDb.dbPath).toBe(testDataDir);
    });

    it('should have tables configuration', () => {
      const tables = testDb.tables;
      expect(tables).toBeDefined();
      expect(tables['test-json']).toBeDefined();
      expect(tables['test-file']).toBeDefined();
    });
  });

  describe('Backward Compatibility Tests', () => {
    it('should maintain existing API compatibility', async () => {
      // Test that existing methods still work
      const table = testDb['getTable']('test-json') as JsonTable<TestRecord>;
      expect(table).toBeInstanceOf(JsonTable);
      
      // Load the table first (required for backward compatibility)
      await table.load();
      
      // Test that we can still access the table multiple times (caching)
      const table2 = testDb['getTable']('test-json');
      expect(table).toBe(table2);
    });

    it('should support existing JsonTable extension pattern', async () => {
      const testTable = new TestJsonTable(testDb, 'test-compatibility.json');
      
      // Load the table first (required for backward compatibility)
      await testTable.load();
      
      // Test basic operations
      const testRecord: TestRecord = {
        id: '1',
        name: 'Test Record',
        status: 'active',
        category: 'test',
        createdAt: new Date().toISOString(),
        value: 100
      };

      // Test set operation
      const result = testTable.set(testRecord);
      expect(result).toBe(true);

      // Test get operation
      const retrieved = testTable.get('1');
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('Test Record');
    });

    it('should maintain existing filter functionality', async () => {
      const table = testDb['getTable']('test-json') as JsonTable<TestRecord>;
      
      // Load the table first (required for backward compatibility)
      await table.load();
      
      // Add test data
      const records: TestRecord[] = [
        { id: '1', name: 'Test 1', status: 'active', category: 'A', createdAt: '2023-01-01', value: 100 },
        { id: '2', name: 'Test 2', status: 'inactive', category: 'B', createdAt: '2023-01-02', value: 200 },
        { id: '3', name: 'Test 3', status: 'active', category: 'A', createdAt: '2023-01-03', value: 300 }
      ];

      for (const record of records) {
        const result = table.set(record);
        expect(result).toBe(true);
      }

      // Debug: Check if data was set
      expect(table.count).toBe(3);
      
      // Test existing filter method
      const activeRecords = table.filter({ status: 'active' });
      expect(activeRecords).toHaveLength(2);

      // Test new findAll method (should work the same)
      const activeRecords2 = table.findAll({ status: 'active' });
      expect(activeRecords2).toHaveLength(2);
    });
  });

  describe('Performance Optimizations Tests', () => {
    it('should support indexing for faster queries', async () => {
      const table = testDb['getTable']('test-json') as JsonTable<TestRecord>;
      
      // Load the table first (required for backward compatibility)
      await table.load();
      
      // Add test data
      const records: TestRecord[] = [];
      for (let i = 0; i < 1000; i++) {
        records.push({
          id: `id-${i}`,
          name: `Record ${i}`,
          status: i % 2 === 0 ? 'active' : 'inactive',
          category: `category-${i % 10}`,
          createdAt: new Date().toISOString(),
          value: i
        });
      }

      // Batch set records
      const insertedCount = table.batchSet(records);
      expect(insertedCount).toBe(1000);

      // Create indexes
      table.createIndexes(['status', 'category']);

      // Test indexed queries
      const startTime = performance.now();
      const activeRecords = table.findAll({ status: 'active' });
      const endTime = performance.now();
      
      expect(activeRecords).toHaveLength(500);
      expect(endTime - startTime).toBeLessThan(100); // Should be very fast with indexes
    });

    it('should support pagination for large datasets', async () => {
      const table = testDb['getTable']('test-json') as JsonTable<TestRecord>;
      
      // Load the table first (required for backward compatibility)
      await table.load();
      
      // Add test data
      const records: TestRecord[] = [];
      for (let i = 0; i < 1000; i++) {
        records.push({
          id: `id-${i}`,
          name: `Record ${i}`,
          status: 'active',
          category: 'test',
          createdAt: new Date().toISOString(),
          value: i
        });
      }

      table.batchSet(records);

      // Test pagination
      const page1 = table.getPaginated(1, 100);
      expect(page1.data).toHaveLength(100);
      expect(page1.total).toBe(1000);
      expect(page1.totalPages).toBe(10);
      expect(page1.page).toBe(1);

      const page2 = table.getPaginated(2, 100);
      expect(page2.data).toHaveLength(100);
      expect(page2.page).toBe(2);
    });

    it('should support caching for repeated access', async () => {
      const table = testDb['getTable']('test-json') as JsonTable<TestRecord>;
      
      // Load the table first (required for backward compatibility)
      await table.load();
      
      const testRecord: TestRecord = {
        id: 'cached-record',
        name: 'Cached Record',
        status: 'active',
        category: 'test',
        createdAt: new Date().toISOString(),
        value: 100
      };

      table.set(testRecord);

      // First access (should cache)
      const firstAccess = table.get('cached-record');
      expect(firstAccess).toBeDefined();

      // Second access (should use cache)
      const secondAccess = table.get('cached-record');
      expect(secondAccess).toBeDefined();
      expect(firstAccess).toBe(secondAccess);

      // Check memory stats
      const stats = table.getMemoryStats();
      expect(stats.cacheSize).toBeGreaterThan(0);
    });

    it('should support batch operations', async () => {
      const table = testDb['getTable']('test-json') as JsonTable<TestRecord>;
      
      // Load the table first (required for backward compatibility)
      await table.load();
      
      // Test batch set
      const records: TestRecord[] = [];
      for (let i = 0; i < 100; i++) {
        records.push({
          id: `batch-${i}`,
          name: `Batch Record ${i}`,
          status: 'active',
          category: 'batch',
          createdAt: new Date().toISOString(),
          value: i
        });
      }

      const insertedCount = table.batchSet(records);
      expect(insertedCount).toBe(100);

      // Test batch delete
      const idsToDelete = records.slice(0, 50).map(r => r.id);
      const deletedCount = table.batchDelete(idsToDelete);
      expect(deletedCount).toBe(50);

      // Verify remaining records
      expect(table.count).toBe(50);
    });
  });

  describe('FileTable Tests', () => {
    it('should support file operations with performance optimizations', async () => {
      const fileTable = testDb['getTable']('test-file') as FileTable;
      
      // Load the table first (required for backward compatibility)
      await fileTable.load();
      
      // Test batch operations
      const files = [
        { key: 'file1', value: 'content1' },
        { key: 'file2', value: 'content2' },
        { key: 'file3', value: 'content3' }
      ];

      const insertedCount = fileTable.batchSet(files);
      expect(insertedCount).toBe(3);

      // Test search functionality
      const searchResults = fileTable.searchContent('content');
      expect(searchResults).toHaveLength(3);

      // Test pagination
      const paginated = fileTable.getPaginated(1, 2);
      expect(paginated.data).toHaveLength(2);
      expect(paginated.total).toBe(3);
    });
  });

  describe('FolderTable Tests', () => {
    it('should support folder operations with performance optimizations', async () => {
      const folderTable = testDb['getTable']('test-folder') as FolderTable<string>;
      
      // Create test folders
      const testFolders = ['folder1', 'folder2', 'folder3'];
      for (const folder of testFolders) {
        const folderPath = path.join(testDataDir, 'test-folders', folder);
        await fs.mkdir(folderPath, { recursive: true });
      }

      // Test loading
      await folderTable.load();
      expect(folderTable.count).toBe(3);

      // Test search functionality
      const searchResults = folderTable.searchByName(/folder/);
      expect(searchResults).toHaveLength(3);

      // Test pagination
      const paginated = folderTable.getPaginated(1, 2);
      expect(paginated.data).toHaveLength(2);
      expect(paginated.total).toBe(3);
    });
  });

  describe('DelimitedTable Tests', () => {
    it('should support CSV operations with performance optimizations', async () => {
      const csvTable = testDb['getTable']('test-csv') as DelimitedTable<TestRecord>;
      
      // Create test CSV data
      const csvData = [
        'id,name,status,category,createdAt,value',
        '1,Test 1,active,A,2023-01-01,100',
        '2,Test 2,inactive,B,2023-01-02,200',
        '3,Test 3,active,A,2023-01-03,300'
      ].join('\n');

      const csvPath = path.join(testDataDir, 'test.csv');
      await fs.writeFile(csvPath, csvData);

      // Test loading
      await csvTable.load();
      expect(csvTable.count).toBe(3);

      // Test indexing
      csvTable.createIndexes(['status', 'category']);

      // Test filtering
      const activeRecords = csvTable.findAll({ status: 'active' });
      expect(activeRecords).toHaveLength(2);

      // Test pagination
      const paginated = csvTable.getPaginated(1, 2);
      expect(paginated.data).toHaveLength(2);
      expect(paginated.total).toBe(3);
    });
  });

  describe('PerformanceUtils Tests', () => {
    it('should provide batch processing utilities', async () => {
      const items = Array.from({ length: 100 }, (_, i) => i);
      
      const results = await PerformanceUtils.batchProcess(
        items,
        async (item) => item * 2,
        10, // batch size
        2   // concurrency
      );

      expect(results).toHaveLength(100);
      expect(results[0]).toBe(0);
      expect(results[50]).toBe(100);
    });

    it('should provide memory monitoring', () => {
      const memory = PerformanceUtils.getMemoryUsage();
      expect(memory.used).toBeGreaterThan(0);
      expect(memory.total).toBeGreaterThan(0);
      expect(memory.percentage).toBeGreaterThan(0);
      expect(memory.percentage).toBeLessThanOrEqual(100);
    });

    it('should provide performance monitoring', () => {
      const monitor = PerformanceUtils.createPerformanceMonitor();
      
      const startTime = monitor.start('test-operation');
      // Simulate some work
      const endTime = performance.now();
      monitor.end('test-operation', startTime);

      const metrics = monitor.getMetrics();
      expect(metrics['test-operation']).toBeDefined();
      expect(metrics['test-operation'].count).toBe(1);
      expect(metrics['test-operation'].totalTime).toBeGreaterThan(0);
    });

    it('should provide chunking utilities', () => {
      const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const chunks = PerformanceUtils.chunk(array, 3);
      
      expect(chunks).toHaveLength(4);
      expect(chunks[0]).toEqual([1, 2, 3]);
      expect(chunks[3]).toEqual([10]);
    });
  });

  describe('Memory Management Tests', () => {
    it('should support cache clearing', async () => {
      const table = testDb['getTable']('test-json') as JsonTable<TestRecord>;
      
      // Load the table first (required for backward compatibility)
      await table.load();
      
      // Add some data
      const testRecord: TestRecord = {
        id: 'test-cache',
        name: 'Cache Test',
        status: 'active',
        category: 'test',
        createdAt: new Date().toISOString(),
        value: 100
      };

      table.set(testRecord);
      
      // Access to populate cache
      table.get('test-cache');
      
      // Check cache size
      const statsBefore = table.getMemoryStats();
      expect(statsBefore.cacheSize).toBeGreaterThan(0);

      // Clear cache
      table.clearCache();
      
      // Check cache is cleared
      const statsAfter = table.getMemoryStats();
      expect(statsAfter.cacheSize).toBe(0);
    });

    it('should support database-wide cache clearing', async () => {
      // Add data to multiple tables
      const jsonTable = testDb['getTable']('test-json') as JsonTable<TestRecord>;
      const fileTable = testDb['getTable']('test-file') as FileTable;

      // Load tables first (required for backward compatibility)
      await jsonTable.load();
      await fileTable.load();

      jsonTable.set({
        id: 'test1',
        name: 'Test 1',
        status: 'active',
        category: 'test',
        createdAt: new Date().toISOString(),
        value: 100
      });

      fileTable.set('test-file', 'test content');

      // Access to populate caches
      jsonTable.get('test1');
      fileTable.get('test-file');

      // Clear all caches
      testDb.clearAllCaches();

      // Verify caches are cleared
      const jsonStats = jsonTable.getMemoryStats();
      const fileStats = fileTable.getMemoryStats();
      
      expect(jsonStats.cacheSize).toBe(0);
      expect(fileStats.cacheSize).toBe(0);
    });
  });

  describe('Performance Monitoring Tests', () => {
    it('should track performance metrics', async () => {
      // Test that performance monitoring works
      const metrics = testDb.getPerformanceMetrics();
      expect(metrics).toBeDefined();
      expect(typeof metrics).toBe('object');
    });

    it('should reset performance metrics', () => {
      // Get initial metrics
      const initialMetrics = testDb.getPerformanceMetrics();
      
      // Reset metrics
      testDb.resetPerformanceMetrics();
      
      // Get metrics after reset
      const resetMetrics = testDb.getPerformanceMetrics();
      
      // Should be empty after reset
      expect(Object.keys(resetMetrics)).toHaveLength(0);
    });

    it('should provide memory statistics', () => {
      const stats = testDb.getMemoryStats();
      expect(stats).toBeDefined();
      expect(stats.overall).toBeDefined();
      expect(stats.overall.used).toBeGreaterThan(0);
    });
  });

  describe('Error Handling Tests', () => {
    it('should handle invalid table names gracefully', () => {
      expect(() => {
        testDb['getTable']('non-existent-table');
      }).toThrow('Unknown collection: non-existent-table');
    });

    it('should handle batch operations with errors gracefully', async () => {
      const table = testDb['getTable']('test-json') as JsonTable<TestRecord>;
      
      // Load the table first (required for backward compatibility)
      await table.load();
      
      // Test with invalid data (missing required fields)
      const invalidRecords = [
        { id: 'valid-1', name: 'Valid Record', status: 'active', category: 'test', createdAt: '2023-01-01', value: 100 },
        { id: 'invalid-1' } as any, // Missing required fields
        { id: 'valid-2', name: 'Valid Record 2', status: 'active', category: 'test', createdAt: '2023-01-01', value: 200 }
      ];

      // Should handle errors gracefully and continue with valid records
      const insertedCount = table.batchSet(invalidRecords);
      expect(insertedCount).toBeGreaterThan(0);
    });
  });

  describe('Logger Memory Leak Prevention', () => {
    it('should use cached logger instances to prevent memory leaks', () => {
      // Create multiple instances to test logger caching
      const db1 = new TestWingDb('./test-db-1');
      const db2 = new TestWingDb('./test-db-2');
      
      // Get tables multiple times to trigger the caching mechanism
      const table1 = db1['getTable']('test-file');
      const table2 = db1['getTable']('test-file'); // Should return cached instance
      const table3 = db1['getTable']('test-json');
      const table4 = db2['getTable']('test-file');
      
      // Verify that we get the same table instance when calling getTable multiple times
      expect(table1).toBe(table2);
      
      // Verify that different databases get different table instances
      expect(table1).not.toBe(table4);
      
      // Check that the logger instances are properly cached by testing table access
      expect(table1.logger).toBeDefined();
      expect(table3.logger).toBeDefined();
    });

    it('should prevent EventEmitter memory leaks by reusing logger instances', () => {
      // Simulate the scenario that was causing the memory leak
      const initialExitListeners = process.listenerCount('exit');
      
      // Create multiple database instances and get tables multiple times
      const databases = [];
      for (let i = 0; i < 5; i++) {
        const db = new TestWingDb(`./test-db-${i}`);
        databases.push(db);
        
        // Get tables multiple times to simulate the original issue
        for (let j = 0; j < 3; j++) {
          db['getTable']('test-file');
          db['getTable']('test-json');
        }
      }
      
      // Check that we haven't added excessive exit listeners
      const finalExitListeners = process.listenerCount('exit');
      const addedListeners = finalExitListeners - initialExitListeners;
      
      // We should have added very few listeners (ideally 0, but some is acceptable)
      // The original issue was adding 11+ listeners, so we should be well under that
      expect(addedListeners).toBeLessThan(5);
    });

    it('should use the same logger instance for the same class name', () => {
      // Test that the Logger factory returns the same instance for the same name
      const logger1 = Logger('TestClass');
      const logger2 = Logger('TestClass');
      const logger3 = Logger('DifferentClass');
      
      expect(logger1).toBe(logger2);
      expect(logger1).not.toBe(logger3);
    });

    it('should monitor exit listener count and prevent excessive listeners', () => {
      const initialExitListeners = process.listenerCount('exit');
      const initialCacheSize = PinoPlugin.getCacheSize();
      
      // Create multiple loggers to test the caching mechanism
      const loggers = [];
      for (let i = 0; i < 10; i++) {
        loggers.push(Logger(`TestLogger${i}`));
      }
      
      // Create duplicate loggers to test caching
      for (let i = 0; i < 5; i++) {
        loggers.push(Logger(`TestLogger${i}`)); // These should reuse existing instances
      }
      
      const finalExitListeners = process.listenerCount('exit');
      const finalCacheSize = PinoPlugin.getCacheSize();
      
      // We should have added very few new exit listeners (ideally 0, but some is acceptable)
      const addedListeners = finalExitListeners - initialExitListeners;
      expect(addedListeners).toBeLessThan(5);
      
      // Cache size should be initial + 10 (one for each unique logger name)
      expect(finalCacheSize).toBe(initialCacheSize + 10);
      
      // Verify that we're reusing logger instances
      expect(loggers[0]).toBe(loggers[10]); // Same logger instance
      expect(loggers[1]).toBe(loggers[11]); // Same logger instance
    });
  });
});
