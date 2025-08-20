// Enterprise-grade logging system
import { ENV_CONFIG } from '@/config/environment';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: unknown;
  stack?: string;
}

class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = ENV_CONFIG.isDevelopment ? LogLevel.DEBUG : LogLevel.WARN;
  private logs: LogEntry[] = [];
  private maxLogs = 100;

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private createLogEntry(level: LogLevel, message: string, context?: string, data?: unknown): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      data,
      stack: level === LogLevel.ERROR ? new Error().stack : undefined
    };
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.logLevel;
  }

  private storeLog(entry: LogEntry): void {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  private formatMessage(entry: LogEntry): string {
    const prefix = entry.context ? `[${entry.context}]` : '';
    return `${entry.timestamp} ${prefix} ${entry.message}`;
  }

  error(message: string, context?: string, data?: unknown): void {
    const entry = this.createLogEntry(LogLevel.ERROR, message, context, data);
    this.storeLog(entry);
    
    if (this.shouldLog(LogLevel.ERROR)) {
      if (ENV_CONFIG.isDevelopment) {
        console.error(this.formatMessage(entry), data || '');
        if (entry.stack) console.error(entry.stack);
      }
    }
  }

  warn(message: string, context?: string, data?: unknown): void {
    const entry = this.createLogEntry(LogLevel.WARN, message, context, data);
    this.storeLog(entry);
    
    if (this.shouldLog(LogLevel.WARN) && ENV_CONFIG.isDevelopment) {
      console.warn(this.formatMessage(entry), data || '');
    }
  }

  info(message: string, context?: string, data?: unknown): void {
    const entry = this.createLogEntry(LogLevel.INFO, message, context, data);
    this.storeLog(entry);
    
    if (this.shouldLog(LogLevel.INFO) && ENV_CONFIG.isDevelopment) {
      console.info(this.formatMessage(entry), data || '');
    }
  }

  debug(message: string, context?: string, data?: unknown): void {
    const entry = this.createLogEntry(LogLevel.DEBUG, message, context, data);
    this.storeLog(entry);
    
    if (this.shouldLog(LogLevel.DEBUG) && ENV_CONFIG.isDevelopment) {
      console.debug(this.formatMessage(entry), data || '');
    }
  }

  getLogs(): readonly LogEntry[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Convenience exports
export const log = {
  error: (message: string, context?: string, data?: unknown) => logger.error(message, context, data),
  warn: (message: string, context?: string, data?: unknown) => logger.warn(message, context, data),
  info: (message: string, context?: string, data?: unknown) => logger.info(message, context, data),
  debug: (message: string, context?: string, data?: unknown) => logger.debug(message, context, data),
};