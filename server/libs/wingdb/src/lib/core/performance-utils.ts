/**
 * Performance utilities for optimizing database operations
 */
export class PerformanceUtils {
  /**
   * Batch process items with configurable batch size and concurrency
   */
  static async batchProcess<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    batchSize: number = 100,
    concurrency: number = 5
  ): Promise<R[]> {
    const results: R[] = [];
    
    for (let i = 0; i < items.length; i += batchSize * concurrency) {
      const batch = items.slice(i, i + batchSize * concurrency);
      const batchPromises = batch.map(processor);
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }
    
    return results;
  }

  /**
   * Create a debounced function that delays execution
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }

  /**
   * Create a throttled function that limits execution frequency
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Measure execution time of a function
   */
  static async measureTime<T>(
    fn: () => Promise<T>,
    label: string = 'Operation'
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const end = performance.now();
      console.log(`${label} took ${(end - start).toFixed(2)}ms`);
      return result;
    } catch (error) {
      const end = performance.now();
      console.error(`${label} failed after ${(end - start).toFixed(2)}ms:`, error);
      throw error;
    }
  }

  /**
   * Create a simple LRU cache
   */
  static createLRUCache<K, V>(maxSize: number = 1000): Map<K, V> {
    const cache = new Map<K, V>();
    
    return new Proxy(cache, {
      get(target, prop) {
        if (prop === 'set') {
          return (key: K, value: V) => {
            if (target.size >= maxSize) {
              const firstKey = target.keys().next().value;
              target.delete(firstKey);
            }
            return target.set(key, value);
          };
        }
        return target[prop as keyof Map<K, V>];
      }
    });
  }

  /**
   * Chunk array into smaller arrays
   */
  static chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Create a simple index for fast lookups
   */
  static createIndex<T>(
    items: T[],
    keyExtractor: (item: T) => string
  ): Map<string, T[]> {
    const index = new Map<string, T[]>();
    
    for (const item of items) {
      const key = keyExtractor(item);
      if (!index.has(key)) {
        index.set(key, []);
      }
      index.get(key)!.push(item);
    }
    
    return index;
  }

  /**
   * Merge multiple indexes efficiently
   */
  static mergeIndexes<T>(
    indexes: Map<string, T[]>[]
  ): Map<string, T[]> {
    const merged = new Map<string, T[]>();
    
    for (const index of indexes) {
      for (const [key, values] of index.entries()) {
        if (!merged.has(key)) {
          merged.set(key, []);
        }
        merged.get(key)!.push(...values);
      }
    }
    
    return merged;
  }

  /**
   * Efficiently filter items using multiple criteria
   */
  static multiFilter<T>(
    items: T[],
    filters: Array<(item: T) => boolean>
  ): T[] {
    return items.filter(item => 
      filters.every(filter => filter(item))
    );
  }

  /**
   * Sort items with multiple criteria
   */
  static multiSort<T>(
    items: T[],
    comparators: Array<(a: T, b: T) => number>
  ): T[] {
    return [...items].sort((a, b) => {
      for (const comparator of comparators) {
        const result = comparator(a, b);
        if (result !== 0) return result;
      }
      return 0;
    });
  }

  /**
   * Create a memory-efficient iterator for large datasets
   */
  static *createIterator<T>(
    items: T[],
    batchSize: number = 1000
  ): Generator<T[], void, unknown> {
    for (let i = 0; i < items.length; i += batchSize) {
      yield items.slice(i, i + batchSize);
    }
  }

  /**
   * Process items in memory-efficient batches
   */
  static async processInBatches<T, R>(
    items: T[],
    processor: (batch: T[]) => Promise<R[]>,
    batchSize: number = 1000
  ): Promise<R[]> {
    const results: R[] = [];
    
    for (const batch of this.createIterator(items, batchSize)) {
      const batchResults = await processor(batch);
      results.push(...batchResults);
    }
    
    return results;
  }

  /**
   * Get memory usage information
   */
  static getMemoryUsage(): { used: number; total: number; percentage: number } {
    const used = process.memoryUsage();
    const total = used.heapTotal;
    const percentage = (used.heapUsed / total) * 100;
    
    return {
      used: Math.round(used.heapUsed / 1024 / 1024), // MB
      total: Math.round(total / 1024 / 1024), // MB
      percentage: Math.round(percentage)
    };
  }

  /**
   * Force garbage collection if available
   */
  static forceGC(): void {
    if (global.gc) {
      global.gc();
    }
  }

  /**
   * Create a performance monitor
   */
  static createPerformanceMonitor() {
    const metrics: Record<string, { count: number; totalTime: number; avgTime: number }> = {};
    
    return {
      start(label: string) {
        return performance.now();
      },
      
      end(label: string, startTime: number) {
        const duration = performance.now() - startTime;
        
        if (!metrics[label]) {
          metrics[label] = { count: 0, totalTime: 0, avgTime: 0 };
        }
        
        metrics[label].count++;
        metrics[label].totalTime += duration;
        metrics[label].avgTime = metrics[label].totalTime / metrics[label].count;
      },
      
      getMetrics() {
        return { ...metrics };
      },
      
      reset() {
        Object.keys(metrics).forEach(key => delete metrics[key]);
      }
    };
  }
} 