import { Logger } from "@awing/pino-plugin";

export type PrimitiveLike = string | number | boolean | bigint | symbol | null | undefined | Date;

export abstract class BaseTable<T extends { id?: string }> {
  protected rows: Map<string, T> = new Map();
  protected indexes: Map<string, Map<any, Set<string>>> = new Map();
  protected autoId: number = 1;
  protected cache: Map<string, T> = new Map();
  protected cacheSize: number = 1000;
  protected isLoaded: boolean = false;
  protected logger: ReturnType<typeof Logger>;

  abstract load(...args: any[]): Promise<T[]>;
  abstract save(...args: any[]): Promise<void>;

  set(row: T, unique: boolean = true): boolean {
    if (!row.id) {
      row.id = String(this.autoId++);
    } else if (this.rows.has(row.id)) {
      if (unique) throw Error(`id:[${row.id}] already exists`);
      // Remove old indexes for this record
      this.removeFromIndexes(row.id);
    }

    this.rows.set(row.id, row);
    this.addToIndexes(row.id, row);
    this.addToCache(row.id, row);
    return true;
  }

  /**
   * Clear all data and indexes
   */
  clear(): void {
    this.rows.clear();
    this.indexes.clear();
    this.cache.clear();
    this.autoId = 1;
  }

  /**
   * Find records using optimized filtering with indexes
   */
  findAll(filter: Record<string, any> = {}): T[] {
    if (!filter || Object.keys(filter).length === 0) {
      return Array.from(this.rows.values());
    }

    // Use indexes for faster filtering if available
    const candidateIds = this.getCandidateIds(filter);

    if (candidateIds.size === 0) {
      // No indexes available or no matches, fall back to linear search
      const result: T[] = [];
      for (const row of this.rows.values()) {
        if (this.matchesFilter(row, filter)) {
          result.push(row);
        }
      }
      return result;
    }

    // Filter candidates that match all conditions
    const result: T[] = [];
    for (const id of candidateIds) {
      const row = this.rows.get(id);
      if (row && this.matchesFilter(row, filter)) {
        result.push(row);
      }
    }

    return result;
  }

  /**
   * Find records with pagination for large datasets
   */
  findWithPagination(filter: Record<string, any> = {}, page: number = 1, pageSize: number = 100): { data: T[], total: number, page: number, pageSize: number, totalPages: number } {
    const allMatching = this.findAll(filter);
    const total = allMatching.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const data = allMatching.slice(startIndex, endIndex);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages
    };
  }

  /**
   * Create an index on a specific field for faster lookups
   */
  createIndex(fieldName: string): void {
    if (!this.indexes.has(fieldName)) {
      this.indexes.set(fieldName, new Map());
    }

    const index = this.indexes.get(fieldName)!;
    index.clear();

    for (const [id, row] of this.rows.entries()) {
      const value = (row as any)[fieldName];
      if (value !== undefined) {
        if (Array.isArray(value)) {
          // For array fields, index each individual value
          for (const arrayValue of value) {
            if (!index.has(arrayValue)) {
              index.set(arrayValue, new Set());
            }
            index.get(arrayValue)!.add(id);
          }
        } else {
          // For non-array fields, index the single value
          if (!index.has(value)) {
            index.set(value, new Set());
          }
          index.get(value)!.add(id);
        }
      }
    }
  }

  /**
   * Get candidate IDs using indexes for faster filtering
   */
  private getCandidateIds(filter: Record<string, any>): Set<string> {
    const candidateIds = new Set<string>();
    let firstIndex = true;

    for (const [field, value] of Object.entries(filter)) {
      if (this.indexes.has(field)) {
        const index = this.indexes.get(field)!;
        const matchingIds = index.get(value);

        if (matchingIds) {
          if (firstIndex) {
            // First index - initialize candidates
            matchingIds.forEach(id => candidateIds.add(id));
            firstIndex = false;
          } else {
            // Intersect with existing candidates
            const currentIds = new Set(candidateIds);
            candidateIds.clear();
            for (const id of currentIds) {
              if (matchingIds.has(id)) {
                candidateIds.add(id);
              }
            }
          }
        } else {
          // No matches for this field
          return new Set();
        }
      }
    }

    return candidateIds;
  }

  /**
   * Check if a row matches all filter conditions
   */
  private matchesFilter(row: T, filter: Record<string, any>): boolean {
    return Object.entries(filter).every(([key, value]) => {
      const rowValue = (row as any)[key];

      // Handle array filtering
      if (Array.isArray(rowValue) && Array.isArray(value)) {
        // If both are arrays, check if any value in the filter array exists in the row array
        return value.some((filterVal: any) => rowValue.includes(filterVal));
      } else if (Array.isArray(rowValue) && !Array.isArray(value)) {
        // If row value is array but filter value is not, check if filter value exists in row array
        return rowValue.includes(value);
      } else if (!Array.isArray(rowValue) && Array.isArray(value)) {
        // If row value is not array but filter value is, check if row value exists in filter array
        return value.includes(rowValue);
      } else {
        // Both are non-arrays, do exact comparison
        return rowValue === value;
      }
    });
  }

  /**
   * Add record to indexes
   */
  private addToIndexes(id: string, row: T): void {
    for (const [fieldName, index] of this.indexes.entries()) {
      const value = (row as any)[fieldName];
      if (value !== undefined) {
        if (Array.isArray(value)) {
          // For array fields, index each individual value
          for (const arrayValue of value) {
            if (!index.has(arrayValue)) {
              index.set(arrayValue, new Set());
            }
            index.get(arrayValue)!.add(id);
          }
        } else {
          // For non-array fields, index the single value
          if (!index.has(value)) {
            index.set(value, new Set());
          }
          index.get(value)!.add(id);
        }
      }
    }
  }

  /**
   * Remove record from indexes
   */
  private removeFromIndexes(id: string): void {
    const oldRow = this.rows.get(id);
    if (oldRow) {
      for (const [fieldName, index] of this.indexes.entries()) {
        const value = (oldRow as any)[fieldName];
        if (value !== undefined) {
          if (Array.isArray(value)) {
            // For array fields, remove from each individual value index
            for (const arrayValue of value) {
              const idSet = index.get(arrayValue);
              if (idSet) {
                idSet.delete(id);
                if (idSet.size === 0) {
                  index.delete(arrayValue);
                }
              }
            }
          } else {
            // For non-array fields, remove from single value index
            const idSet = index.get(value);
            if (idSet) {
              idSet.delete(id);
              if (idSet.size === 0) {
                index.delete(value);
              }
            }
          }
        }
      }
    }
  }

  /**
   * Add to cache with LRU eviction
   */
  protected addToCache(id: string, row: T): void {
    if (this.cache.size >= this.cacheSize) {
      // Remove oldest entry (first key)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(id, row);
  }

  /**
   * Get count of records
   */
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
   * Iterator for all records
   */
  [Symbol.iterator](): Iterator<T> {
    return this.rows.values();
  }

  /**
   * Batch operations for better performance
   */
  batchSet(rows: T[], unique: boolean = true): number {
    let successCount = 0;
    for (const row of rows) {
      try {
        if (this.set(row, unique)) {
          successCount++;
        }
      } catch (error) {
        // Continue with other rows even if one fails
        console.warn(`Failed to set row ${row.id}:`, error);
      }
    }
    return successCount;
  }

  /**
   * Batch delete by IDs
   */
  batchDelete(ids: string[]): number {
    let deletedCount = 0;
    for (const id of ids) {
      if (this.rows.delete(id)) {
        this.removeFromIndexes(id);
        this.cache.delete(id);
        deletedCount++;
      }
    }
    return deletedCount;
  }
  
  protected instantiate(raw: any): T {
    return raw as T;
  }

  // Overload signatures
  get(id: string): T | undefined;
  get<K extends PrimitiveLike>(
    id: string,
    defaultValue: K
  ): K;

  // Implementation
  get<K extends PrimitiveLike>(
    id: string,
    defaultValue?: K
  ): T | K | undefined {
    try {
      if (!this.isLoaded) {
        this.logger.failed('json table is not loaded, call load() first.');
        return defaultValue ?? undefined;
      }

      if (this.cache.has(id)) {
        const val = this.cache.get(id);
        return this.coerceType(val, defaultValue);
      }

      const row = this.rows.get(id);
      if (!row) {
        return defaultValue ?? undefined;
      }

      const instantiated = this.instantiate(row);
      this.addToCache(id, instantiated);
      return this.coerceType(instantiated, defaultValue);
    } catch (error) {
      this.logger.error('Error in get:', error);
      return defaultValue ?? undefined;
    }
  }

  // Type coercion router
  coerceType<K extends PrimitiveLike>(
    val: unknown,
    defaultValue?: K
  ): K | T | undefined {
    if (defaultValue === undefined) return val as T;

    if (typeof defaultValue === 'string') return this.toString(val, defaultValue) as K;
    if (typeof defaultValue === 'number') return this.toNumber(val, defaultValue) as K;
    if (typeof defaultValue === 'boolean') return this.toBoolean(val, defaultValue) as K;
    if (typeof defaultValue === 'bigint') return this.toBigInt(val, defaultValue) as K;
    if (typeof defaultValue === 'symbol') return this.toSymbol(val, defaultValue) as K;
    if (defaultValue === null) return this.toNull(val, defaultValue as null) as K;
    if (defaultValue === undefined) return this.toUndefined(val, defaultValue as undefined) as K;
    if (defaultValue instanceof Date) return this.toDate(val, defaultValue) as K;
    
    return defaultValue;
  }

  // Individual primitive handlers
  toString(val: unknown, def: string): string {
    return String(val ?? def);
  }

  toNumber(val: unknown, def: number): number {
    const num = Number(val);
    return isNaN(num) ? def : num;
  }

  toBoolean(val: unknown, def: boolean): boolean {
    if (typeof val === 'boolean') return val;
    if (typeof val === 'string') return val.toLowerCase() === 'true';
    return Boolean(val ?? def);
  }

  toBigInt(val: unknown, def: bigint): bigint {
    try {
      return BigInt(val as any);
    } catch {
      return def;
    }
  }

  toSymbol(val: unknown, def: symbol): symbol {
    if (typeof val === 'symbol') return val;
    if (typeof val === 'string') return Symbol.for(val);
    return def;
  }

  toNull(val: unknown, def: null): null {
    return val === null ? null : def;
  }

  toUndefined(val: unknown, def: undefined): undefined {
    return val === undefined ? undefined : def;
  }

  toDate(val: unknown, def: Date): Date {
    if (val instanceof Date) return val;
    const parsed = new Date(val as string);
    return isNaN(parsed.getTime()) ? def : parsed;
  }
} 