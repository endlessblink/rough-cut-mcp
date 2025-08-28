// Logging utility for the MCP server
import fs from 'fs-extra';
import path from 'path';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  service?: string;
}

class Logger {
  private logLevel: LogLevel;
  private logFile?: string;

  constructor(level: LogLevel = 'info', file?: string) {
    this.logLevel = level;
    this.logFile = file;
    
    if (this.logFile) {
      // Ensure log directory exists
      const logDir = path.dirname(this.logFile);
      fs.ensureDirSync(logDir);
    }
  }

  private getLevelPriority(level: LogLevel): number {
    const priorities = { debug: 0, info: 1, warn: 2, error: 3 };
    return priorities[level];
  }

  private shouldLog(level: LogLevel): boolean {
    return this.getLevelPriority(level) >= this.getLevelPriority(this.logLevel);
  }

  private formatMessage(entry: LogEntry): string {
    const servicePrefix = entry.service ? `[${entry.service}] ` : '';
    const dataString = entry.data ? ` | ${JSON.stringify(entry.data)}` : '';
    return `${entry.timestamp} [${entry.level.toUpperCase()}] ${servicePrefix}${entry.message}${dataString}`;
  }

  private createLogEntry(level: LogLevel, message: string, data?: any, service?: string): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      service,
    };
  }

  private writeLog(entry: LogEntry): void {
    const formattedMessage = this.formatMessage(entry);
    
    // For MCP servers, NEVER output to console (stdout or stderr)
    // Only write to file to avoid breaking JSON-RPC protocol
    
    // File output only - no console output for MCP compatibility
    if (this.logFile) {
      fs.appendFileSync(this.logFile, formattedMessage + '\n');
    }
    // If no log file configured, silently drop logs to maintain MCP protocol
  }

  debug(message: string, data?: any, service?: string): void {
    if (this.shouldLog('debug')) {
      this.writeLog(this.createLogEntry('debug', message, data, service));
    }
  }

  info(message: string, data?: any, service?: string): void {
    if (this.shouldLog('info')) {
      this.writeLog(this.createLogEntry('info', message, data, service));
    }
  }

  warn(message: string, data?: any, service?: string): void {
    if (this.shouldLog('warn')) {
      this.writeLog(this.createLogEntry('warn', message, data, service));
    }
  }

  error(message: string, data?: any, service?: string): void {
    if (this.shouldLog('error')) {
      this.writeLog(this.createLogEntry('error', message, data, service));
    }
  }

  // Service-specific logging methods
  service(serviceName: string) {
    const serviceLogger = {
      debug: (message: string, data?: any) => this.debug(message, data, serviceName),
      info: (message: string, data?: any) => this.info(message, data, serviceName),
      warn: (message: string, data?: any) => this.warn(message, data, serviceName),
      error: (message: string, data?: any) => this.error(message, data, serviceName),
      child: () => serviceLogger  // Add child method for compatibility
    };
    return serviceLogger;
  }

  // Performance timing utility
  time(label: string): void {
    // MCP compatibility: console.time disabled
    // console.time(label);
  }

  timeEnd(label: string): void {
    // MCP compatibility: console.timeEnd disabled
    // console.timeEnd(label);
  }

  // Error with stack trace
  errorWithStack(error: Error, message?: string, service?: string): void {
    const errorMessage = message || error.message;
    const errorData = {
      stack: error.stack,
      name: error.name,
    };
    this.error(errorMessage, errorData, service);
  }
}

// Global logger instance
let globalLogger: Logger;

export function initLogger(level: LogLevel = 'info', file?: string): Logger {
  globalLogger = new Logger(level, file);
  return globalLogger;
}

export function getLogger(): Logger {
  if (!globalLogger) {
    globalLogger = new Logger();
  }
  return globalLogger;
}

// Export logger instance for direct use
export { Logger };