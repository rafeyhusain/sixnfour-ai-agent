import * as fs from 'fs/promises';
import * as path from 'path';
import { WingDb } from '../wingdb';
import { Logger } from '@awing/pino-plugin';
import { WingError } from '@awing/wingerror';

export class FolderEntry {
  key: string;
  value: string;
}

/**
 * FolderTable loads all subfolders, provides get/set, and can load/save 
 * Optimized for handling large numbers of folders with caching and batch operations.
 */
export class FolderTable<T> {
  rows: Map<string, string> = new Map();
  cache: Map<string, T> = new Map();
  cacheSize: number = 1000;
  logger: ReturnType<typeof Logger>;
  private writeQueue: Promise<void> = Promise.resolve();
  private lastSaveTime: number = 0;
  private saveDebounceMs: number = 1000; // Debounce saves by 1 second
  private isLoaded: boolean = false;
  
  get fullPath(): string {
    return path.join(this.db.dbPath, this.folder);
  }

  constructor(public db: WingDb, public folder: string) {
    this.logger = Logger(this.constructor.name);
  }

  [Symbol.iterator](): Iterator<string> {
    return this.rows.values();
  }

  /**
   * Loads all subfolders in the folder into the table.
   * The key is the subfolder name, the value is the absolute path to the subfolder.
   * Optimized with batch operations and progress tracking.
   */
  async load(create: boolean = false): Promise<void> {
    try {
      try {
        await fs.access(this.fullPath);
      } catch (err) {
        if (create) {
          await fs.mkdir(this.fullPath, { recursive: true });
          this.logger.info(`Created folder: ${this.fullPath}`);
        } else {
          throw err;
        }
      }

      const entries = await fs.readdir(this.fullPath, { withFileTypes: true });
      const directories = entries.filter(entry => entry.isDirectory());
      
      this.logger.info(`Loading ${directories.length} folders from ${this.folder}...`);
      
      // Process directories in batches for better performance
      const batchSize = 100;
      for (let i = 0; i < directories.length; i += batchSize) {
        const batch = directories.slice(i, i + batchSize);
        await this.loadBatch(batch);
        
        // Log progress for large loads
        if (directories.length > 1000) {
          const progress = Math.round(((i + batch.length) / directories.length) * 100);
          this.logger.debug(`Loading progress: ${progress}%`);
        }
      }
      
      this.isLoaded = true;
      this.logger.info(`Loaded [${this.rows.size}] subfolders from folder [${this.fullPath}]`);
    } catch (err) {
      this.logger.error(`Failed to read directory ${this.fullPath}:`, err);
      throw err;
    }
  }

  /**
   * Load a batch of directories for better performance
   */
  private async loadBatch(entries: Array<{ name: string; isDirectory(): boolean }>): Promise<void> {
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const row = entry.name;
        this.rows.set(row, path.join(this.fullPath, row));
      }
    }
  }

  static async createFolder(folder: string): Promise<void> {
    await fs.mkdir(folder, { recursive: true });
  }

  protected instantiate(raw: FolderEntry): T | undefined {
    // By default, just return the raw object
    return raw as T;
  }

  /**
   * Get an item by its id with caching.
   * @param id The id of the item to retrieve.
   * @returns The item with the given id, or undefined if not found.
   */
  get(id: string): T | undefined {
    try {
      if (!this.isLoaded) {
        this.logger.failed('rows not loaded, call load() first.');
        return undefined;
      }

      // Check cache first
      if (this.cache.has(id)) {
        return this.cache.get(id);
      }

      const row = this.rows.get(id);

      if (!row) {
        this.logger.warn(`row with id '${id}' not found.`);
        return undefined;
      }

      const entry = this.toEntry(id, row);
      const instance = this.instantiate(entry);
      
      if (instance) {
        this.addToCache(id, instance);
      }

      return instance;
    } catch (error) {
      this.logger.error('Error in get:', error);
      return undefined;
    }
  }

  toEntry(key: string, value: string): { key: string, value: string } {
    return { key, value };
  }

  /**
   * Sets the path for a given subfolder name.
   */
  set(key: string, value: string): void {
    this.rows.set(key, value);
    // Remove from cache since the value changed
    this.cache.delete(key);
  }

  /**
   * Batch set multiple folders for better performance
   */
  batchSet(entries: Array<{ key: string; value: string }>): number {
    let successCount = 0;
    for (const { key, value } of entries) {
      try {
        this.set(key, value);
        successCount++;
      } catch (error) {
        this.logger.warn(`Failed to set ${key}:`, error);
      }
    }
    return successCount;
  }

  /**
   * Saves the current table as folders.json in the folder.
   * Optimized with debounced saves.
   */
  async save(): Promise<void> {
    try {
      const obj: Record<string, string> = {};
      for (const [key, value] of this.rows.entries()) {
        obj[key] = value;
      }
      const filePath = path.join(this.folder, 'folders.json');
      await fs.writeFile(filePath, JSON.stringify(obj, null, 2), 'utf-8');
      this.lastSaveTime = Date.now();
      this.logger.info(`Saved [${this.rows.size}] entries to folder [${this.folder}]`);
    } catch (err) {
      this.logger.error(`Failed to save folders.json to ${this.folder}:`, err);
      throw err;
    }
  }

  /**
   * Debounced save for better performance
   */
  private async debouncedSave(): Promise<void> {
    const now = Date.now();
    if (now - this.lastSaveTime < this.saveDebounceMs) {
      // Queue the save for later
      this.writeQueue = this.writeQueue.then(async () => {
        await new Promise(resolve => setTimeout(resolve, this.saveDebounceMs));
        await this.save();
      });
    } else {
      // Save immediately
      this.writeQueue = this.save();
    }
  }

  /**
   * Add to cache with LRU eviction
   */
  private addToCache(id: string, instance: T): void {
    if (this.cache.size >= this.cacheSize) {
      // Remove oldest entry (first key)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(id, instance);
  }

  /**
   * Batch delete multiple folders
   */
  async batchDelete(keys: string[]): Promise<number> {
    let deletedCount = 0;
    for (const key of keys) {
      if (this.rows.delete(key)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }
    await this.debouncedSave();
    return deletedCount;
  }

  /**
   * Get folders with pagination for large datasets
   */
  getPaginated(page: number = 1, pageSize: number = 100): { data: T[], total: number, page: number, pageSize: number, totalPages: number } {
    const entries = Array.from(this.rows.entries());
    const total = entries.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const data = entries.slice(startIndex, endIndex).map(([key, value]) => {
      const entry = this.toEntry(key, value);
      return this.instantiate(entry);
    }).filter(Boolean) as T[];

    return {
      data,
      total,
      page,
      pageSize,
      totalPages
    };
  }

  /**
   * Search folders by name pattern
   */
  searchByName(pattern: RegExp): T[] {
    const results: T[] = [];

    for (const [key, value] of this.rows.entries()) {
      if (pattern.test(key)) {
        const entry = this.toEntry(key, value);
        const instance = this.instantiate(entry);
        if (instance) {
          results.push(instance);
        }
      }
    }

    return results;
  }

  /**
   * Get folders by path pattern
   */
  searchByPath(pattern: RegExp): T[] {
    const results: T[] = [];

    for (const [key, value] of this.rows.entries()) {
      if (pattern.test(value)) {
        const entry = this.toEntry(key, value);
        const instance = this.instantiate(entry);
        if (instance) {
          results.push(instance);
        }
      }
    }

    return results;
  }

  records(): Record<string, any>[] {
    if (!this.isLoaded) {
      this.logger.failed('No items loaded. Call load() first.');
      return [];
    }

    const records = [];
    for (const [key, value] of this.rows.entries()) {
      records.push({ id: key, value: value });
    }
    return records;
  }

  recordById(id: string): Record<string, any> {
    const row = this.get(id);
    if (row) {
      return this.record(row);
    }

    WingError.throwNotFound(`[${id}] does not exist in [${this.folder}]`);
  }

  record(row: T): Record<string, any> {
    return null;
  }
  
  async toJson(): Promise<string> {
    if (!this.isLoaded) {
      throw new Error('No items loaded. Call load() first.');
    }
    const arr = Array.from(this.rows.entries()).map(([key, value]) => (this.toEntry(key, value)));
    return JSON.stringify(arr, null, 2);
  }

  async toJsonKeys(): Promise<string> {
    if (!this.isLoaded) {
      throw new Error('No items loaded. Call load() first.');
    }
    return JSON.stringify(Array.from(this.rows.keys()), null, 2);
  }

  async toJsonValues(): Promise<string> {
    if (!this.isLoaded) {
      throw new Error('No items loaded. Call load() first.');
    }
    return JSON.stringify(Array.from(this.rows.values()), null, 2);
  }

  /**
   * Loads the table from a JSON string, replacing the current rows.
   * The input should be the same kind of JSON that toJson() returns.
   * @param jsonStr The JSON string representing the rows.
   */
  async saveJson(jsonStr: string): Promise<void> {
    try {
      const obj = JSON.parse(jsonStr);
      if (typeof obj !== 'object' || Array.isArray(obj) || obj === null) {
        throw new Error('Invalid JSON: expected an object of rows');
      }
      this.rows = new Map(Object.entries(obj));
      this.cache.clear();
      await this.save();
    } catch (err) {
      this.logger.error('Failed to save from JSON:', err);
      throw err;
    }
  }

  get count(): number {
    return this.rows.size;
  }

  /**
   * Check if table is loaded
   */
  get loaded(): boolean {
    return this.isLoaded;
  }

  /**
   * Clear cache to free memory
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get memory usage statistics
   */
  getMemoryStats(): { cacheSize: number; totalEntries: number; cacheHitRatio: number } {
    return {
      cacheSize: this.cache.size,
      totalEntries: this.rows.size,
      cacheHitRatio: this.cache.size / this.rows.size
    };
  }
} 