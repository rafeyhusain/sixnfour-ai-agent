import * as fs from 'fs/promises';
import * as path from 'path';
import { WingDb } from '../wingdb';
import { Logger } from '@awing/pino-plugin';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

/**
 * FileTable loads all .txt, .json etc. files in a folder into a Map, provides get/set, and can save back to files.
 * Optimized for handling large numbers of files with caching and batch operations.
 */
export class FileTable {
  rows: Map<string, string> = new Map();
  cache: Map<string, string> = new Map();
  cacheSize: number = 1000;
  logger: ReturnType<typeof Logger>;
  private writeQueue: Promise<void> = Promise.resolve();
  private lastSaveTime: number = 0;
  private saveDebounceMs: number = 1000; // Debounce saves by 1 second
  private isLoaded: boolean = false;

  constructor(public db: WingDb, public folder: string, public extension: string) {
    this.logger = Logger(this.constructor.name);
  }

  [Symbol.iterator](): Iterator<string> {
    return this.rows.values();
  }

  get fullPath(): string {
    return path.join(this.db.dbPath, this.folder);
  }

  /**
   * Loads all .txt, .json etc. files in the folder into the table.
   * Optimized with batch operations and progress tracking.
   */
  async load(): Promise<void> {
    try {
      // Create directory if it doesn't exist
      await fs.mkdir(this.fullPath, { recursive: true });
      
      const files = await fs.readdir(this.fullPath);
      const matchingFiles = files.filter(file => file.endsWith(this.extension));
      
      this.logger.info(`Loading ${matchingFiles.length} files from ${this.folder}...`);
      
      // Process files in batches for better performance
      const batchSize = 100;
      for (let i = 0; i < matchingFiles.length; i += batchSize) {
        const batch = matchingFiles.slice(i, i + batchSize);
        await this.loadBatch(batch);
        
        // Log progress for large loads
        if (matchingFiles.length > 1000) {
          const progress = Math.round(((i + batch.length) / matchingFiles.length) * 100);
          this.logger.debug(`Loading progress: ${progress}%`);
        }
      }
      
      this.isLoaded = true;
      this.logger.info(`Loaded [${this.rows.size}] [${this.extension}] files from folder [${this.folder}]`);
    } catch (err) {
      this.logger.error(`Failed to read directory ${this.folder}:`, err);
      throw err;
    }
  }

  /**
   * Load a batch of files for better performance
   */
  private async loadBatch(files: string[]): Promise<void> {
    const promises = files.map(async (file) => {
      const key = path.basename(file, this.extension);
      const filePath = path.join(this.fullPath, file);
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        this.rows.set(key, content);
        this.addToCache(key, content);
      } catch (err) {
        this.logger.error(`Failed to read ${file}:`, err);
      }
    });

    await Promise.all(promises);
  }

  /**
   * Gets the content for a given key (filename without extension) with caching.
   */
  get(key: string): string | undefined {
    // Check cache first
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    const value = this.rows.get(key);
    if (value) {
      this.addToCache(key, value);
      return value;
    }
    return undefined;
  }

  /**
   * Sets the content for a given key (filename without extension).
   */
  set(key: string, value: string): void {
    this.rows.set(key, value);
    this.addToCache(key, value);
  }

  /**
   * Batch set multiple files for better performance
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
   * Saves the current table back to .txt, .json etc. files in the folder.
   * Optimized with batch operations and debounced saves.
   */
  async save(): Promise<void> {
    try {
      const entries = Array.from(this.rows.entries());
      
      // Process files in batches
      const batchSize = 50;
      for (let i = 0; i < entries.length; i += batchSize) {
        const batch = entries.slice(i, i + batchSize);
        await this.saveBatch(batch);
        
        // Log progress for large saves
        if (entries.length > 1000) {
          const progress = Math.round(((i + batch.length) / entries.length) * 100);
          this.logger.debug(`Saving progress: ${progress}%`);
        }
      }
      
      this.lastSaveTime = Date.now();
      this.logger.info(`Saved ${this.rows.size} ${this.extension} files to ${this.folder}`);
    } catch (err) {
      this.logger.error(`Failed to save files to ${this.folder}:`, err);
      throw err;
    }
  }

  /**
   * Save a batch of files for better performance
   */
  private async saveBatch(entries: Array<[string, string]>): Promise<void> {
    const promises = entries.map(async ([key, value]) => {
      const filePath = path.join(this.folder, `${key}${this.extension}`);
      try {
        await fs.writeFile(filePath, value, 'utf-8');
        this.logger.debug(`Saved: ${key}${this.extension}`);
      } catch (err) {
        this.logger.error(`Failed to write ${key}${this.extension}:`, err);
      }
    });

    await Promise.all(promises);
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
  private addToCache(key: string, value: string): void {
    if (this.cache.size >= this.cacheSize) {
      // Remove oldest entry (first key)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  /**
   * Batch delete multiple files
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
   * Get files with pagination for large datasets
   */
  getPaginated(page: number = 1, pageSize: number = 100): { data: Array<{ key: string; value: string }>, total: number, page: number, pageSize: number, totalPages: number } {
    const entries = Array.from(this.rows.entries()).map(([key, value]) => ({ key, value }));
    const total = entries.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const data = entries.slice(startIndex, endIndex);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages
    };
  }

  /**
   * Search files by content (case-insensitive)
   */
  searchContent(searchTerm: string): Array<{ key: string; value: string }> {
    const results: Array<{ key: string; value: string }> = [];
    const term = searchTerm.toLowerCase();

    for (const [key, value] of this.rows.entries()) {
      if (value.toLowerCase().includes(term)) {
        results.push({ key, value });
      }
    }

    return results;
  }

  /**
   * Get files by pattern matching
   */
  getByPattern(pattern: RegExp): Array<{ key: string; value: string }> {
    const results: Array<{ key: string; value: string }> = [];

    for (const [key, value] of this.rows.entries()) {
      if (pattern.test(key) || pattern.test(value)) {
        results.push({ key, value });
      }
    }

    return results;
  }

  /**
   * Get all records as an array of objects with id and value properties
   */
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

  async toJson(): Promise<string> {
    if (!this.isLoaded) {
      throw new Error('No items loaded. Call load() first.');
    }

    const list = [];
    for (const [key, value] of this.rows.entries()) {
      list.push({ id: key, value: value })
    }
    return JSON.stringify(list, null, 2);
  }

  async saveJson(jsonStr: string): Promise<void> {
    try {
      const format = 'Input JSON must be an array of objects e.g. [{id:"text", value:"sample value"}].';

      const list = JSON.parse(jsonStr);
      if (!Array.isArray(list)) {
        throw new Error(`Invalid json: ${jsonStr}. ${format}`);
      }

      this.rows.clear();
      this.cache.clear();

      const entries = list.map(item => ({ key: item.id, value: item.value }));
      this.batchSet(entries);
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