"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
exports.initLogger = initLogger;
exports.getLogger = getLogger;
// Logging utility for the MCP server
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
class Logger {
    logLevel;
    logFile;
    constructor(level = 'info', file) {
        this.logLevel = level;
        this.logFile = file;
        if (this.logFile) {
            // Ensure log directory exists
            const logDir = path_1.default.dirname(this.logFile);
            fs_extra_1.default.ensureDirSync(logDir);
        }
    }
    getLevelPriority(level) {
        const priorities = { debug: 0, info: 1, warn: 2, error: 3 };
        return priorities[level];
    }
    shouldLog(level) {
        return this.getLevelPriority(level) >= this.getLevelPriority(this.logLevel);
    }
    formatMessage(entry) {
        const servicePrefix = entry.service ? `[${entry.service}] ` : '';
        const dataString = entry.data ? ` | ${JSON.stringify(entry.data)}` : '';
        return `${entry.timestamp} [${entry.level.toUpperCase()}] ${servicePrefix}${entry.message}${dataString}`;
    }
    createLogEntry(level, message, data, service) {
        return {
            timestamp: new Date().toISOString(),
            level,
            message,
            data,
            service,
        };
    }
    writeLog(entry) {
        const formattedMessage = this.formatMessage(entry);
        // For MCP servers, NEVER output to console (stdout or stderr)
        // Only write to file to avoid breaking JSON-RPC protocol
        // File output only - no console output for MCP compatibility
        if (this.logFile) {
            fs_extra_1.default.appendFileSync(this.logFile, formattedMessage + '\n');
        }
        // If no log file configured, silently drop logs to maintain MCP protocol
    }
    debug(message, data, service) {
        if (this.shouldLog('debug')) {
            this.writeLog(this.createLogEntry('debug', message, data, service));
        }
    }
    info(message, data, service) {
        if (this.shouldLog('info')) {
            this.writeLog(this.createLogEntry('info', message, data, service));
        }
    }
    warn(message, data, service) {
        if (this.shouldLog('warn')) {
            this.writeLog(this.createLogEntry('warn', message, data, service));
        }
    }
    error(message, data, service) {
        if (this.shouldLog('error')) {
            this.writeLog(this.createLogEntry('error', message, data, service));
        }
    }
    // Service-specific logging methods
    service(serviceName) {
        const serviceLogger = {
            debug: (message, data) => this.debug(message, data, serviceName),
            info: (message, data) => this.info(message, data, serviceName),
            warn: (message, data) => this.warn(message, data, serviceName),
            error: (message, data) => this.error(message, data, serviceName),
            child: () => serviceLogger // Add child method for compatibility
        };
        return serviceLogger;
    }
    // Performance timing utility
    time(label) {
        // MCP compatibility: console.time disabled
        // console.time(label);
    }
    timeEnd(label) {
        // MCP compatibility: console.timeEnd disabled
        // console.timeEnd(label);
    }
    // Error with stack trace
    errorWithStack(error, message, service) {
        const errorMessage = message || error.message;
        const errorData = {
            stack: error.stack,
            name: error.name,
        };
        this.error(errorMessage, errorData, service);
    }
}
exports.Logger = Logger;
// Global logger instance
let globalLogger;
function initLogger(level = 'info', file) {
    globalLogger = new Logger(level, file);
    return globalLogger;
}
function getLogger() {
    if (!globalLogger) {
        globalLogger = new Logger();
    }
    return globalLogger;
}
//# sourceMappingURL=logger.js.map