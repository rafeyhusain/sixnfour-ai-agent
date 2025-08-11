import { BaseTable } from '../core/base-table';
import * as fs from 'fs/promises';
import * as path from 'path';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { Transform } from 'stream';
import { Logger } from '@awing/pino-plugin';

export class DelimitedTable<T extends { id?: string }> extends BaseTable<T> {
  filePath: string;
  delimiter: string;
  headers: string[];
  private writeQueue: Promise<void> = Promise.resolve();
  private lastSaveTime: number = 0;
  private saveDebounceMs: number = 1000; // Debounce saves by 1 second
  protected logger: ReturnType<typeof Logger>;

  constructor(filePath: string, delimiter: string = ',', headers?: string[]) {
    super();
    this.filePath = filePath;
    this.delimiter = delimiter;
    this.headers = headers || [];
    this.logger = Logger(this.constructor.name);
  }

  async load(create: boolean = false): Promise<T[]> {
    const absPath = path.resolve(this.filePath);
    try {
      await fs.access(absPath);
    } catch (err) {
      if (create) {
        await fs.writeFile(absPath, '', 'utf-8');
      } else {
        throw err;
      }
    }

    // Check file size for streaming vs sync loading
    const stats = await fs.stat(absPath);
    if (stats.size > 10 * 1024 * 1024) { // 10MB threshold
      return await this.loadStreaming(absPath);
    } else {
      return await this.loadSync(absPath);
    }
  }

  private async loadSync(absPath: string): Promise<T[]> {
    const data = await fs.readFile(absPath, 'utf-8');
    const lines = data.split(/\r?\n/).filter(Boolean);
    if (lines.length === 0) return [];

    let headers = this.headers;
    let startIdx = 0;
    if (!headers.length) {
      headers = lines[0].split(this.delimiter).map(h => h.trim());
      startIdx = 1;
      this.headers = headers;
    }

    // Batch process rows for better performance
    const rows: T[] = [];
    let idCounter = 1;
    
    for (let i = startIdx; i < lines.length; i++) {
      const values = lines[i].split(this.delimiter);
      const row: any = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx];
      });
      if (!row.id) {
        row.id = String(idCounter++);
      }
      rows.push(row as T);
    }

    // Batch set all rows
    this.batchSet(rows, false);
    this.autoId = idCounter;
    this.isLoaded = true;
    return Array.from(this.rows.values());
  }

  private async loadStreaming(absPath: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const rows: T[] = [];
      let headers = this.headers;
      let isFirstLine = true;
      let idCounter = 1;
      let buffer = '';

      const readStream = createReadStream(absPath, { encoding: 'utf-8', highWaterMark: 64 * 1024 });
      
      const processLine = (line: string) => {
        if (isFirstLine && !headers.length) {
          headers = line.split(this.delimiter).map(h => h.trim());
          this.headers = headers;
          isFirstLine = false;
          return;
        }

        if (isFirstLine) {
          isFirstLine = false;
          return;
        }

        const values = line.split(this.delimiter);
        const row: any = {};
        headers.forEach((h, idx) => {
          row[h] = values[idx];
        });
        if (!row.id) {
          row.id = String(idCounter++);
        }
        rows.push(row as T);
      };

      readStream.on('data', (chunk) => {
        buffer += chunk;
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() || ''; // Keep incomplete line in buffer
        
        for (const line of lines) {
          if (line.trim()) {
            processLine(line);
          }
        }
      });
      
      readStream.on('end', () => {
        // Process any remaining data in buffer
        if (buffer.trim()) {
          processLine(buffer);
        }
        
        // Batch set all loaded rows
        this.batchSet(rows, false);
        this.autoId = idCounter;
        this.isLoaded = true;
        resolve(Array.from(this.rows.values()));
      });
      
      readStream.on('error', reject);
    });
  }

  async save(): Promise<void> {
    try {
      const rowsArr = Array.from(this.rows.values());
      if (!this.headers.length && rowsArr.length > 0) {
        this.headers = Object.keys(rowsArr[0]);
      }

      const content = this.generateCsvContent(rowsArr);
      
      // Use streaming for large files
      if (content.length > 10 * 1024 * 1024) { // 10MB threshold
        await this.saveStreaming(content);
      } else {
        const absPath = path.resolve(this.filePath);
        await fs.writeFile(absPath, content, 'utf-8');
      }
      
      this.lastSaveTime = Date.now();
    } catch (error) {
      throw error;
    }
  }

  private generateCsvContent(rowsArr: T[]): string {
    const lines = [this.headers.join(this.delimiter)];
    for (const row of rowsArr) {
      const vals = this.headers.map(h => (row as any)[h] ?? '');
      lines.push(vals.join(this.delimiter));
    }
    return lines.join('\n');
  }

  private async saveStreaming(content: string): Promise<void> {
    const absPath = path.resolve(this.filePath);
    const writeStream = createWriteStream(absPath, { encoding: 'utf-8' });
    const readStream = require('stream').Readable.from([content]);
    
    await pipeline(readStream, writeStream);
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
   * Batch operations for better performance
   */
  async batchSetRows(rows: T[], unique: boolean = true): Promise<number> {
    const result = this.batchSet(rows, unique);
    await this.debouncedSave();
    return result;
  }

  /**
   * Get paginated results with optimized performance
   */
  getPaginated(page: number = 1, pageSize: number = 100, filter: Record<string, any> = {}): { data: T[], total: number, page: number, pageSize: number, totalPages: number } {
    return this.findWithPagination(filter, page, pageSize);
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
   * Export to different formats
   */
  async exportToJson(): Promise<string> {
    const records = Array.from(this.rows.values());
    return JSON.stringify(records, null, 2);
  }

  async exportToJsonFile(outputPath: string): Promise<void> {
    const json = await this.exportToJson();
    await fs.writeFile(outputPath, json, 'utf-8');
  }

  /**
   * Import from JSON
   */
  async importFromJson(jsonContent: string): Promise<number> {
    try {
      const data = JSON.parse(jsonContent);
      if (!Array.isArray(data)) {
        throw new Error('JSON content must be an array');
      }
      
      this.clear();
      const rows = data.map(row => row as T);
      const result = this.batchSet(rows, false);
      await this.save();
      return result;
    } catch (error) {
      throw new Error(`Failed to import JSON: ${error.message}`);
    }
  }

  /**
   * Get statistics about the data
   */
  getStats(): { totalRows: number; columns: string[]; sampleData: Record<string, any> } {
    const totalRows = this.rows.size;
    const columns = this.headers;
    const sampleData = totalRows > 0 ? Array.from(this.rows.values())[0] as Record<string, any> : {};

    return {
      totalRows,
      columns,
      sampleData
    };
  }

  get count(): number {
    return this.rows.size;
  }

  /**
   * Get all records as an array of objects
   */
  records(): Record<string, any>[] {
    if (!this.isLoaded) {
      this.logger.failed('No items loaded. Call load() first.');
      return [];
    }

    return Array.from(this.rows.values()).map(row => {
      const record: Record<string, any> = {};
      for (const [key, value] of Object.entries(row)) {
        record[key] = value;
      }
      return record;
    });
  }

  /**
   * Check if table is loaded
   */
  get loaded(): boolean {
    return this.isLoaded;
  }
} 