import { Logger } from "@awing/pino-plugin";
import { FileTable } from "./providers/file-table";
import { JsonTable } from "./providers/json-table";
import { PerformanceUtils } from "./core/performance-utils";

export function wingdb(): string {
  return 'wingdb';
}

export abstract class WingDb {
  protected logger: ReturnType<typeof Logger>;
  protected performanceMonitor: ReturnType<typeof PerformanceUtils.createPerformanceMonitor>;

  constructor(public dbPath: string) {
    this.logger = Logger(this.constructor.name);
    this.performanceMonitor = PerformanceUtils.createPerformanceMonitor();
  }

  public abstract get tables(): Record<string, { ctor: any; file: string }>;

  protected getTable(tableName: string): any {
    if (!(tableName in this.tables)) {
      throw new Error(`Unknown collection: ${tableName}`);
    }
    if (!this[tableName]) {
      const { ctor, file } = this.tables[tableName];

      this[tableName] = new ctor(this, file);
    }
    return this[tableName];
  }

  protected getJsonTable<T extends { id: string }>(tableName: string): JsonTable<T> {
    return this.getTable(tableName) as JsonTable<T>;
  }

  protected getFileTable(tableName: string): FileTable {
    return this.getTable(tableName) as FileTable;
  }

  public async reload(): Promise<void> {
    this.resetAll();
    await this.load();
  }

  public async load(): Promise<void> {
    const startTime = this.performanceMonitor.start('load-all-tables');
    try {
      const tableNames = Object.keys(this.tables);
      this.logger.info(`Loading ${tableNames.length} tables...`);
      
      const loadPromises = tableNames.map(async (tableName) => {
        const tableStartTime = this.performanceMonitor.start(`load-table-${tableName}`);
        try {
          await this.loadTable(tableName);
          this.performanceMonitor.end(`load-table-${tableName}`, tableStartTime);
        } catch (error) {
          this.logger.error(`Failed to load table ${tableName}:`, error);
          throw error;
        }
      });

      await Promise.all(loadPromises);
      
      this.performanceMonitor.end('load-all-tables', startTime);
      this.logger.info(`Loaded database successfully from [${this.dbPath}]`);
    } catch (error) {
      this.logger.error('Failed to load tables:', error);
      throw error;
    }
  }

  public async loadTable(tableName: string): Promise<any> {
    try {
      const table = this.getTable(tableName);
      await table.load();
      this.logger.debug(`Loaded table [${tableName}] [${table.count}] rows successfully`);
      return table;
    } catch (error) {
      this.logger.error(`Failed to load table [${tableName}]:`, error);
      throw error;
    }
  }

  public async get(tableName: string): Promise<any> {
    const startTime = this.performanceMonitor.start(`get-${tableName}`);
    try {
      const table = await this.loadTable(tableName);
      const result = table.records();
      this.performanceMonitor.end(`get-${tableName}`, startTime);
      return result;
    } catch (error) {
      this.logger.error(`Failed to get data for ${tableName}:`, error);
      throw error;
    }
  }

  public async set(tableName: string, json: string): Promise<void> {
    const startTime = this.performanceMonitor.start(`set-${tableName}`);
    try {
      const table = this.getTable(tableName);
      await table.saveJson(json);
      this.performanceMonitor.end(`set-${tableName}`, startTime);
      this.logger.info(`Saved data for [${tableName}] successfully.`);
    } catch (error) {
      this.logger.error(`Failed to set data for [${tableName}]:`, error);
      throw error;
    }
  }

  public async setItem(tableName: string, id: string, json: string): Promise<void> {
    const startTime = this.performanceMonitor.start(`set-item-${tableName}-${id}`);
    try {
      const table = this.getJsonTable(tableName);
      await table.load();
      await table.saveJsonRow(id, json);
      this.performanceMonitor.end(`set-item-${tableName}-${id}`, startTime);
      this.logger.info(`Saved data for [${tableName}:${id}] successfully.`);
    } catch (error) {
      this.logger.error(`setItem: Failed to set data for [${tableName}]:[${id}]`, error);
      throw error;
    }
  }

  public async getPaginated(tableName: string, page: number = 1, pageSize: number = 100, filter: Record<string, any> = {}): Promise<any> {
    const startTime = this.performanceMonitor.start(`get-paginated-${tableName}`);
    try {
      const table = this.getTable(tableName);
      if (table.getPaginated) {
        const result = table.getPaginated(page, pageSize, filter);
        this.performanceMonitor.end(`get-paginated-${tableName}`, startTime);
        return result;
      } else {
        throw new Error(`Table ${tableName} does not support pagination`);
      }
    } catch (error) {
      this.logger.error(`Failed to get paginated data for ${tableName}:`, error);
      throw error;
    }
  }

  public async batchSet(tableName: string, items: any[]): Promise<number> {
    const startTime = this.performanceMonitor.start(`batch-set-${tableName}`);
    try {
      const table = this.getTable(tableName);
      if (table.batchSet) {
        const result = table.batchSet(items);
        this.performanceMonitor.end(`batch-set-${tableName}`, startTime);
        this.logger.info(`Batch set ${result} items in [${tableName}] successfully.`);
        return result;
      } else {
        throw new Error(`Table ${tableName} does not support batch operations`);
      }
    } catch (error) {
      this.logger.error(`Failed to batch set data for ${tableName}:`, error);
      throw error;
    }
  }

  public async createIndexes(tableName: string, fields: string[]): Promise<void> {
    const startTime = this.performanceMonitor.start(`create-indexes-${tableName}`);
    try {
      const table = this.getTable(tableName);
      if (table.createIndexes) {
        table.createIndexes(fields);
        this.performanceMonitor.end(`create-indexes-${tableName}`, startTime);
        this.logger.info(`Created indexes on fields [${fields.join(', ')}] for [${tableName}].`);
      } else {
        throw new Error(`Table ${tableName} does not support indexing`);
      }
    } catch (error) {
      this.logger.error(`Failed to create indexes for ${tableName}:`, error);
      throw error;
    }
  }

  public getMemoryStats(): Record<string, any> {
    const stats: Record<string, any> = {};
    const tableNames = Object.keys(this.tables);
    
    for (const tableName of tableNames) {
      try {
        const table = this.getTable(tableName);
        if (table.getMemoryStats) {
          stats[tableName] = table.getMemoryStats();
        }
      } catch (error) {
        this.logger.warn(`Could not get memory stats for ${tableName}:`, error);
      }
    }
    
    stats.overall = PerformanceUtils.getMemoryUsage();
    
    return stats;
  }

  public clearAllCaches(): void {
    const tableNames = Object.keys(this.tables);
    
    for (const tableName of tableNames) {
      try {
        const table = this.getTable(tableName);
        if (table.clearCache) {
          table.clearCache();
          this.logger.debug(`Cleared cache for [${tableName}].`);
        }
      } catch (error) {
        this.logger.warn(`Could not clear cache for ${tableName}:`, error);
      }
    }
    
    this.logger.info('Cleared all table caches.');
  }

  public resetAll(): void {
    const tableNames = Object.keys(this.tables);
    
    for (const tableName of tableNames) {
      this[tableName] = undefined;
      this.logger.debug(`Reset table [${tableName}] instance.`);
    }
    
    this.logger.info(`Reset all ${tableNames.length} table instances.`);
  }

  public resetTable(tableName: string): void {
    if (!(tableName in this.tables)) {
      throw new Error(`Unknown collection: ${tableName}`);
    }
    
    this[tableName] = undefined;
    this.logger.debug(`Reset table [${tableName}] instance.`);
  }

  public getPerformanceMetrics(): Record<string, any> {
    return this.performanceMonitor.getMetrics();
  }

  public resetPerformanceMetrics(): void {
    this.performanceMonitor.reset();
    this.logger.info('Reset performance metrics.');
  }

  private logPerformanceMetrics(): void {
    const metrics = this.getPerformanceMetrics();
    const memory = PerformanceUtils.getMemoryUsage();
    
    this.logger.info(`Performance Metrics - Operations: ${Object.keys(metrics).length}, Memory: ${memory.used}MB/${memory.total}MB (${memory.percentage}%)`);
    this.logger.debug(`Detailed metrics: ${JSON.stringify(metrics, null, 2)}`);
  }

  public async optimize(): Promise<void> {
    const startTime = this.performanceMonitor.start('optimize-database');
    try {
      this.logger.info('Starting database optimization...');
      
      this.clearAllCaches();
      
      PerformanceUtils.forceGC();
      
      await this.load();
      
      this.performanceMonitor.end('optimize-database', startTime);
      this.logger.info('Database optimization completed successfully.');
    } catch (error) {
      this.logger.error('Failed to optimize database:', error);
      throw error;
    }
  }
}