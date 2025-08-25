export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
declare class Logger {
    private logLevel;
    private logFile?;
    constructor(level?: LogLevel, file?: string);
    private getLevelPriority;
    private shouldLog;
    private formatMessage;
    private createLogEntry;
    private writeLog;
    debug(message: string, data?: any, service?: string): void;
    info(message: string, data?: any, service?: string): void;
    warn(message: string, data?: any, service?: string): void;
    error(message: string, data?: any, service?: string): void;
    service(serviceName: string): {
        debug: (message: string, data?: any) => void;
        info: (message: string, data?: any) => void;
        warn: (message: string, data?: any) => void;
        error: (message: string, data?: any) => void;
    };
    time(label: string): void;
    timeEnd(label: string): void;
    errorWithStack(error: Error, message?: string, service?: string): void;
}
export declare function initLogger(level?: LogLevel, file?: string): Logger;
export declare function getLogger(): Logger;
export { Logger };
//# sourceMappingURL=logger.d.ts.map