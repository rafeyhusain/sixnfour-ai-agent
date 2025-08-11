import * as fs from 'fs/promises';
import * as path from 'path';
import { WingDb } from '../wingdb';
import { Logger } from '@awing/pino-plugin';
import { WingError } from '@awing/wingerror';
import { BaseTable } from '../core/base-table';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

export class JsonTable<T extends { id: string }> extends BaseTable<T> {
  filePath: string;
  fileName: string;
  tableName: string;
  absPath: string;

  protected logger: ReturnType<typeof Logger>;
  private writeQueue: Promise<void> = Promise.resolve();
  private lastSaveTime: number = 0;
  private saveDebounceMs: number = 1000; // Debounce saves by 1 second
  
  constructor(public db: WingDb, fileName: string) {
    super();
    this.fileName = fileName;
    this.filePath = path.join(db.dbPath, fileName);
    this.absPath = path.resolve(this.filePath);
    this.tableName = path.parse(this.fileName).name;
    this.logger = Logger(this.constructor.name);
  }

  [Symbol.iterator](): Iterator<T> {
    return Array.from(this.rows.values()).map(row => this.instantiate(row))[Symbol.iterator]();
  }

  async exists(absPath: string): Promise<boolean> {
    try {
      await fs.access(absPath);
      return true;
    } catch {
      return false;
    }
  }

  async load(create: boolean = true): Promise<T[]> {
    const exists = await this.exists(this.absPath);
    
    if (!exists) {
      if (create) {
        await fs.writeFile(this.absPath, '[]', 'utf-8');
      } else {
        throw Error(`File does not exist ${this.absPath}`);
      }
    }

    try {
      // Use streaming for large files
      const stats = await fs.stat(this.absPath);
      if (stats.size > 10 * 1024 * 1024) { // 10MB threshold
        return await this.loadStreaming();
      } else {
        return await this.loadSync();
      }
    } catch (error) {
      this.logger.error('Error loading table:', error);
      throw error;
    }
  }

  private async loadSync(): Promise<T[]> {
    const data = await fs.readFile(this.absPath, 'utf-8');
    const json = JSON.parse(data || '[]');

    // Set isLoaded to true before batch operations to prevent "not loaded" errors
    this.isLoaded = true;

    if (Array.isArray(json)) {
      // Batch set for better performance
      const rows = json.map(row => this.instantiate(row));
      this.batchSet(rows, false);
    } else {
      this.setRow(json.id, this.instantiate(json));
    }

    return Array.from(this.rows.values());
  }

  private async loadStreaming(): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const rows: T[] = [];
      let buffer = '';
      let isArray = false;
      let bracketCount = 0;
      let inString = false;
      let escapeNext = false;

      const readStream = createReadStream(this.absPath, { encoding: 'utf-8', highWaterMark: 64 * 1024 });
      
      readStream.on('data', (chunk) => {
        buffer += chunk;
        
        // Process complete JSON objects
        for (let i = 0; i < buffer.length; i++) {
          const char = buffer[i];
          
          if (escapeNext) {
            escapeNext = false;
            continue;
          }
          
          if (char === '\\') {
            escapeNext = true;
            continue;
          }
          
          if (char === '"' && !escapeNext) {
            inString = !inString;
            continue;
          }
          
          if (!inString) {
            if (char === '[' && bracketCount === 0) {
              isArray = true;
            } else if (char === '{' && bracketCount === 0 && !isArray) {
              isArray = false;
            }
            
            if (char === '{' || char === '[') {
              bracketCount++;
            } else if (char === '}' || char === ']') {
              bracketCount--;
              
              if (bracketCount === 0) {
                try {
                  const jsonStr = buffer.substring(0, i + 1);
                  const json = JSON.parse(jsonStr);
                  
                  if (isArray && Array.isArray(json)) {
                    rows.push(...json.map(row => this.instantiate(row)));
                  } else if (!isArray) {
                    rows.push(this.instantiate(json));
                  }
                  
                  buffer = buffer.substring(i + 1);
                  i = -1; // Reset index
                } catch (e) {
                  // Incomplete JSON, continue reading
                }
              }
            }
          }
        }
      });
      
      readStream.on('end', () => {
        // Set isLoaded to true before batch operations to prevent "not loaded" errors
        this.isLoaded = true;
        // Batch set all loaded rows
        this.batchSet(rows, false);
        resolve(Array.from(this.rows.values()));
      });
      
      readStream.on('error', reject);
    });
  }

  /**
   * Optimized filtering with index support
   */
  filter(filters: Record<string, any>): T[] {
    if (!this.isLoaded) {
      this.logger.failed('items not loaded, call load() first.');
      return [];
    }
    
    if (!filters || Object.keys(filters).length === 0) {
      return Array.from(this.rows.values()).map(row => this.instantiate(row));
    }
    
    // Use optimized findAll from BaseTable
    return this.findAll(filters).map(row => this.instantiate(row));
  }

  protected instantiate(raw: any): T {
    return raw as T;
  }

  get(id: string): T | undefined {
    try {
      if (!this.isLoaded) {
        this.logger.failed('json table is not loaded, call load() first.');
        return undefined;
      }

      // Check cache first for instantiated objects
      if (this.cache.has(id)) {
        return this.cache.get(id);
      }

      const row = this.rows.get(id);
      if (!row) {
        return undefined;
      }

      // Instantiate and cache the object
      const instantiated = this.instantiate(row);
      this.addToCache(id, instantiated);
      return instantiated;
    } catch (error) {
      this.logger.error('Error in get:', error);
      return undefined;
    }
  }

  async saveRow(id: string, row: T, unique: boolean = true): Promise<boolean> {
    const result = this.setRow(id, row, unique);
    await this.debouncedSave();
    return result;
  }

  async saveJsonRow(id: string, json: string, unique: boolean = true): Promise<boolean> {
    let row = JSON.parse(json);
    return this.saveRow(id, row, unique);
  }

  setJson(id: string, json: string, unique: boolean = true): boolean {
    let row = JSON.parse(json);
    return this.setRow(id, row, unique);
  }

  // Overloads for update
  update(id: string, row: T): string[];
  update(filter: Record<string, any>, row: T): string[];
  update(filter: string | Record<string, any>, row: T): string[] {
    const updatedIds: string[] = [];
    if (typeof filter !== 'string') {
      const records = this.filter(filter as Record<string, any>);
      if (!records || records.length === 0) {
        WingError.throwNotFound(`${this.tableName} records matching filter do not exist`);
      }
      for (const rec of records) {
        if (rec && rec.id) {
          this.setRow(rec.id, row, false);
          updatedIds.push(rec.id);
        }
      }
    } else {
      const id = filter as string;

      if (!this.get(id)) {
        WingError.throwNotFound(`${this.tableName} [${id}] does not exist`);
      }
      
      this.setRow(id, row, false);
      updatedIds.push(id);
    }
    
    // Debounced save for better performance
    this.debouncedSave();
    return updatedIds;
  }

  delete(id: string): string[];
  delete(filter: Record<string, any>): string[];
  delete(filter: string | Record<string, any>): string[] {
    const deletedIds: string[] = [];
    if (typeof filter !== 'string') {
      const records = this.filter(filter as Record<string, any>);
      if (!records || records.length === 0) {
        WingError.throwNotFound(`${this.tableName} records matching filter do not exist`);
      }
      for (const rec of records) {
        if (rec && rec.id) {
          this.rows.delete(rec.id);
          this.cache.delete(rec.id);
          deletedIds.push(rec.id);
        }
      }
    } else {
      const id = filter as string;

      if (!this.get(id)) {
        WingError.throwNotFound(`${this.tableName} [${id}] does not exist`);
      }
      this.rows.delete(id);
      this.cache.delete(id);
      deletedIds.push(id);
    }
    
    // Debounced save for better performance
    this.debouncedSave();
    return deletedIds;
  }

  setRow(id: string, row: T, unique: boolean = true): boolean {
    if (!this.isLoaded) {
      this.logger.failed(`table ${this.tableName} is not loaded, call load() first.`);
      return false;
    }

    if (unique && this.rows.has(id)) {
      WingError.throwConflict(id);
    }

    super.set(row, unique);
    return true;
  }

  // Override the base set method to maintain compatibility
  set(row: T, unique: boolean = true): boolean {
    if (!this.isLoaded) {
      this.logger.failed(`table ${this.tableName} is not loaded, call load() first.`);
      return false;
    }

    if (unique && this.rows.has(row.id)) {
      WingError.throwConflict(row.id);
    }

    super.set(row, unique);
    return true;
  }

  async clear(): Promise<void> {
    super.clear();
  }

  async addRows(content: string): Promise<void> {
    try {
      const arr = JSON.parse(content);
      if (!Array.isArray(arr)) {
        throw new Error('Content is not a JSON array');
      }
      const rows = arr.map(row => this.instantiate(row));
      this.batchSet(rows, false);
      await this.debouncedSave();
    } catch (error) {
      this.logger.error('Failed to parse content as JSON:', error);
      throw error;
    }
  }

  async add(content: string): Promise<void> {
    try {
      let cleanContent = this.clean(content);
      const arr = JSON.parse(cleanContent);
      if (!Array.isArray(arr)) {
        throw new Error('Content is not a JSON array');
      }
      const rows = arr.map(row => this.instantiate(row));
      this.batchSet(rows, false);
      await this.debouncedSave();
    } catch (error) {
      this.logger.error('Failed to parse content as JSON array:', error);
      throw error;
    }
  }

  private clean(content: string) {
    let cleanContent = content.trim();
    if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.slice(3);
    }
    if (cleanContent.endsWith('```')) {
      cleanContent = cleanContent.slice(0, -3);
    }
    cleanContent = cleanContent.trim();
    return cleanContent;
  }

  async truncate(): Promise<void> {
    await this.clear();
    await this.save();
  }

  async backup(absPath: string): Promise<void> {
    if (await this.exists(absPath)) {
      const { dir, name, ext } = path.parse(absPath);
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const datetime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
      const backupName = `${name}-${datetime}${ext}`;
      const backupPath = path.join(dir, 'backup', backupName);

      // Ensure the backup directory exists
      await fs.mkdir(path.join(dir, 'backup'), { recursive: true });

      // Move the file from absPath to backupPath
      await fs.rename(absPath, backupPath);
    }
  }

  async save(backup: boolean = true): Promise<void> {
    try {
      if (!this.isLoaded) {
        throw new Error('No items to save. Call load() first.');
      }

      if (backup) {
        await this.backup(this.absPath);
      }

      await this.saveRecordsJson(this.absPath);
      this.lastSaveTime = Date.now();

    } catch (error) {
      this.logger.error('Error saving items to file:', error);
      throw error;
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
        await this.save(false);
      });
    } else {
      // Save immediately
      this.writeQueue = this.save(false);
    }
  }

  async saveRecordsJson(absPath: string): Promise<void> {
    const content = this.toJson();
    
    // Use streaming for large files
    if (content.length > 10 * 1024 * 1024) { // 10MB threshold
      await this.saveStreaming(absPath, content);
    } else {
      await fs.writeFile(absPath, content, 'utf-8');
    }
  }

  private async saveStreaming(absPath: string, content: string): Promise<void> {
    const writeStream = createWriteStream(absPath, { encoding: 'utf-8' });
    const readStream = require('stream').Readable.from([content]);
    
    await pipeline(readStream, writeStream);
  }

  toJson(): string {
    const records = this.records();
    const content = JSON.stringify(records, null, 2);
    return content;
  }

  records(): Record<string, any>[] {
    const records = [];
    for (const row of this.rows.values()) {
      const record = this.record(row);
      if (record) {
        records.push(record);
      }
    }
    return records;
  }

  recordById(id: string): Record<string, any> {
    const row = this.get(id);
    if (row) {
      return this.record(row);
    }

    WingError.throwNotFound(`[${id}] does not exist in [${this.tableName}]`);
  }

  record(row: T): Record<string, any> {
    return null;
  }

  async saveJson(json: string): Promise<void> {
    try {
      const arr = JSON.parse(json);
      if (!Array.isArray(arr)) {
        throw new Error('Provided JSON is not an array');
      }
      this.clear();
      const rows = arr.map(row => this.instantiate(row));
      this.batchSet(rows, false);
      await this.save();
    } catch (error) {
      this.logger.error('Failed to save JSON array:', error);
      throw error;
    }
  }

  get count(): number {
    return this.rows.size;
  }

  /**
   * Create indexes on commonly queried fields for better performance
   */
  createIndexes(fields: string[]): void {
    for (const field of fields) {
      this.createIndex(field);
    }
  }

  /**
   * Get paginated results with optimized performance
   */
  getPaginated(page: number = 1, pageSize: number = 100, filter: Record<string, any> = {}): { data: T[], total: number, page: number, pageSize: number, totalPages: number } {
    return this.findWithPagination(filter, page, pageSize);
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
      cacheHitRatio: this.rows.size > 0 ? this.cache.size / this.rows.size : 0
    };
  }
}