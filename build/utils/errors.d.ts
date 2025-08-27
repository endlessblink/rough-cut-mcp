/**
 * Comprehensive Error Context System for Rough Cut MCP
 * Provides detailed, actionable error messages with troubleshooting guidance
 */
/**
 * Error severity levels
 */
export declare enum ErrorSeverity {
    INFO = "info",
    WARNING = "warning",
    ERROR = "error",
    CRITICAL = "critical"
}
/**
 * Error categories for better organization
 */
export declare enum ErrorCategory {
    CONFIGURATION = "configuration",
    FILESYSTEM = "filesystem",
    NETWORK = "network",
    TOOL_ACTIVATION = "tool_activation",
    STUDIO = "studio",
    DEPENDENCY = "dependency",
    API = "api",
    VALIDATION = "validation",
    RENDER = "render",
    UNKNOWN = "unknown"
}
/**
 * Troubleshooting suggestion
 */
export interface TroubleshootingSuggestion {
    action: string;
    command?: string;
    documentation?: string;
    priority: number;
}
/**
 * Error context information
 */
export interface ErrorContext {
    category: ErrorCategory;
    severity: ErrorSeverity;
    code?: string;
    component: string;
    operation: string;
    details?: Record<string, any>;
    timestamp: Date;
    stack?: string;
}
/**
 * Enhanced MCP Error with context and suggestions
 */
export declare class MCPError extends Error {
    readonly context: ErrorContext;
    readonly suggestions: TroubleshootingSuggestion[];
    readonly userMessage: string;
    constructor(message: string, context: Partial<ErrorContext>, suggestions?: TroubleshootingSuggestion[]);
    /**
     * Generate user-friendly error message
     */
    private generateUserMessage;
    /**
     * Log the error with appropriate level
     */
    private logError;
    /**
     * Convert to JSON for serialization
     */
    toJSON(): Record<string, any>;
}
/**
 * Error factory for common error scenarios
 */
export declare class ErrorFactory {
    /**
     * Create a filesystem error
     */
    static filesystem(operation: string, path: string, error: Error): MCPError;
    /**
     * Create a studio launch error
     */
    static studioLaunch(projectPath: string, error: Error): MCPError;
    /**
     * Create a tool activation error
     */
    static toolActivation(toolName: string, reason: string): MCPError;
    /**
     * Create an API key missing error
     */
    static missingApiKey(service: string, envVar: string): MCPError;
    /**
     * Create a dependency error
     */
    static dependency(packageName: string, projectPath: string): MCPError;
    /**
     * Create a validation error
     */
    static validation(field: string, value: any, requirement: string): MCPError;
}
/**
 * Wrap async functions with error context
 */
export declare function withErrorContext<T extends (...args: any[]) => Promise<any>>(fn: T, component: string, operation: string): T;
//# sourceMappingURL=errors.d.ts.map