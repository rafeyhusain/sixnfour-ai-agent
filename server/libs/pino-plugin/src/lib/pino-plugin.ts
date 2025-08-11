export function pinoPlugin(): string {
  return 'pino-plugin';
}

import pino from 'pino';
import * as path from 'path';
import * as fs from 'fs';

// Global logger cache to prevent memory leaks
const loggerCache = new Map<string, PinoPlugin>();

// Shared pino instance to prevent multiple exit listeners
let sharedPinoInstance: pino.Logger | null = null;

// Track the number of exit listeners to prevent memory leaks
let exitListenerCount = 0;
const MAX_EXIT_LISTENERS = 20;

export enum LogType {
  FAILED = 'FAILED',
  WARN = 'WARN',
  DEBUG = 'DEBUG',
  SUCCESS = 'SUCCESS',
  STARTED = 'STARTED',
  FINISHED = 'FINISHED',
  INFO = 'INFO',
}

export class PinoPlugin {
  private name: string;
  private logger: pino.Logger;

  static getLogger(name: string): PinoPlugin {
    if (!loggerCache.has(name)) {
      // Check if we're approaching the exit listener limit
      const currentExitListeners = process.listenerCount('exit');
      if (currentExitListeners >= MAX_EXIT_LISTENERS) {
        console.warn(`Warning: High number of exit listeners (${currentExitListeners}). Consider using shared logger instances.`);
      }
      
      loggerCache.set(name, new PinoPlugin(name));
    }
    return loggerCache.get(name)!;
  }

  static clearCache(): void {
    loggerCache.clear();
  }

  static getCacheSize(): number {
    return loggerCache.size;
  }

  static getExitListenerCount(): number {
    return process.listenerCount('exit');
  }

  constructor(name: string) {
    this.name = name;
    
    // Use shared pino instance to prevent multiple exit listeners
    if (!sharedPinoInstance) {
      // Ensure logs directory exists
      const logsDir = path.join(process.cwd(), 'logs');
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }

      const createConsoleTransport = () => {
        try {
          return pino.transport({
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'SYS:standard',
              ignore: 'pid,hostname',
              messageFormat: '{msg}',
            },
          });
        } catch (error) {
          return pino.destination(1); // stdout
        }
      };

      sharedPinoInstance = pino({
        level: 'debug',
        timestamp: () => `,"time":"${new Date().toISOString()}"`,
      }, pino.multistream([
        {
          level: 'debug',
          stream: createConsoleTransport(),
        },
        {
          level: 'debug',
          stream: pino.destination({
            dest: path.join(logsDir, 'shared.log'),
            sync: false,
            mkdir: true,
          }),
        },
      ]));

      // Prevent EventEmitter memory leaks by setting max listeners
      // This is needed because pino uses on-exit-leak-free which adds exit listeners
      if (process.listenerCount('exit') > 10) {
        process.setMaxListeners(Math.max(process.listenerCount('exit') + 5, 20));
      }
    }

    this.logger = sharedPinoInstance;
  }

  private formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    let secs = Math.round(seconds % 60);
    if (secs === 60) {
      secs = 0;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  private log(message: string, type: LogType | '', icon: string, startTime?: number): number {
    let timeSpent = 0;
    let duration = '';

    if (startTime) {
      timeSpent = (Date.now() - startTime) / 1000;
      duration = `Duration:[${this.formatDuration(timeSpent)}]:`;
    }

    let logMessage = `[${this.name}]:${duration}${message}`;

    switch (type) {
      case LogType.FAILED:
        this.logger.error(logMessage);
        break;
      case LogType.WARN:
        this.logger.warn(logMessage);
        break;
      case LogType.DEBUG:
        this.logger.debug(logMessage);
        break;
      case LogType.SUCCESS:
      case LogType.STARTED:
      case LogType.FINISHED:
      case LogType.INFO:
      default:
        this.logger.info(logMessage);
        break;
    }

    return Number(timeSpent.toFixed(2));
  }

  started(message: string, startTime?: number): number {
    return this.log(message, LogType.STARTED, '>', startTime);
  }

  finished(message: string, startTime?: number): number {
    return this.log(message, LogType.FINISHED, '✓', startTime);
  }

  success(message: string, startTime?: number): number {
    return this.log(message, LogType.SUCCESS, '+', startTime);
  }

  failed(message: string, startTime?: number): number {
    return this.log(message, LogType.FAILED, 'x', startTime);
  }

  info(message: string, startTime?: number): number {
    return this.log(message, LogType.INFO, 'i', startTime);
  }
  
  warn(message: string, startTime?: number): number {
    return this.log(message, LogType.WARN, '', startTime);
  }
    
  debug(message: string, startTime?: number): number {
    return this.log(message, LogType.DEBUG, '', startTime);
  }

  error(message: string, err: unknown): void {
    let error = err instanceof Error ? err : new Error(String(err))
    let msg = `${message}: ${error.message}`;
    let rec = {"error": error};

    this.log2(msg, LogType.FAILED, rec);
  }

  log2(message: string, type: LogType, rec: Record<string, any>): void {
    this.log(`${message} ${JSON.stringify(rec)}`, type, '', 0); 
  }

  info2(message: string, rec: Record<string, any>): void {
    this.log2(message, LogType.INFO, rec);
  }

  debug2(message: string, rec: Record<string, any>): void {
    this.log2(message, LogType.DEBUG, rec);
  }

  failed2(message: string, rec: Record<string, any>): void {
    this.log2(message, LogType.FAILED, rec);
  }
}

// Export a factory function that uses the cached logger
export const Logger = (name: string) => PinoPlugin.getLogger(name); 