/**
 * Enhanced Audit Logger for Tool/Layer Activation History
 *
 * Provides comprehensive logging and analysis of tool and layer
 * activation patterns for debugging and optimization.
 */
import { EventEmitter } from 'events';
/**
 * Audit event types
 */
export declare enum AuditEventType {
    TOOL_ACTIVATED = "tool_activated",
    TOOL_DEACTIVATED = "tool_deactivated",
    TOOL_CALLED = "tool_called",
    TOOL_FAILED = "tool_failed",
    LAYER_ACTIVATED = "layer_activated",
    LAYER_DEACTIVATED = "layer_deactivated",
    CONTEXT_OPTIMIZED = "context_optimized",
    DEPENDENCY_RESOLVED = "dependency_resolved",
    CONFIGURATION_CHANGED = "configuration_changed",
    SESSION_STARTED = "session_started",
    SESSION_ENDED = "session_ended"
}
/**
 * Audit event severity levels
 */
export declare enum AuditSeverity {
    DEBUG = "debug",
    INFO = "info",
    WARNING = "warning",
    ERROR = "error",
    CRITICAL = "critical"
}
/**
 * Audit event entry
 */
export interface AuditEntry {
    /** Unique event ID */
    id: string;
    /** Event timestamp */
    timestamp: Date;
    /** Event type */
    type: AuditEventType;
    /** Event severity */
    severity: AuditSeverity;
    /** Entity involved (tool/layer ID) */
    entity: string;
    /** Action performed */
    action: string;
    /** Who triggered the event */
    triggeredBy: string;
    /** Session ID */
    sessionId: string;
    /** Additional context data */
    context: Record<string, any>;
    /** Error details if applicable */
    error?: string;
    /** Performance metrics */
    metrics?: {
        duration?: number;
        contextWeight?: number;
        memoryUsage?: number;
    };
    /** Related events */
    relatedEvents?: string[];
}
/**
 * Audit query options
 */
export interface AuditQueryOptions {
    /** Filter by event types */
    types?: AuditEventType[];
    /** Filter by severity levels */
    severities?: AuditSeverity[];
    /** Filter by entity */
    entity?: string;
    /** Filter by session */
    sessionId?: string;
    /** Start time */
    startTime?: Date;
    /** End time */
    endTime?: Date;
    /** Maximum results */
    limit?: number;
    /** Sort order */
    sortOrder?: 'asc' | 'desc';
}
/**
 * Audit statistics
 */
export interface AuditStatistics {
    /** Total events */
    totalEvents: number;
    /** Events by type */
    eventsByType: Map<AuditEventType, number>;
    /** Events by severity */
    eventsBySeverity: Map<AuditSeverity, number>;
    /** Most active entities */
    topEntities: Array<{
        entity: string;
        count: number;
    }>;
    /** Error rate */
    errorRate: number;
    /** Average event duration */
    averageDuration: number;
    /** Peak activity periods */
    peakPeriods: Array<{
        hour: number;
        count: number;
    }>;
}
/**
 * Audit pattern detection result
 */
export interface AuditPattern {
    /** Pattern type */
    type: string;
    /** Pattern description */
    description: string;
    /** Confidence score (0-1) */
    confidence: number;
    /** Events involved in pattern */
    events: string[];
    /** Recommendations */
    recommendations: string[];
}
/**
 * Enhanced Audit Logger
 */
export declare class AuditLogger extends EventEmitter {
    private entries;
    private sessionId;
    private logger;
    private auditFile;
    private maxEntries;
    private persistInterval;
    private entryIndex;
    constructor(auditDir: string, maxEntries?: number, persistIntervalMs?: number);
    /**
     * Log an audit event
     */
    logEvent(event: Omit<AuditEntry, 'id' | 'timestamp' | 'sessionId'>): string;
    /**
     * Log tool activation
     */
    logToolActivation(toolId: string, triggeredBy: string, context?: Record<string, any>): string;
    /**
     * Log tool deactivation
     */
    logToolDeactivation(toolId: string, triggeredBy: string, reason: string): string;
    /**
     * Log tool call
     */
    logToolCall(toolId: string, triggeredBy: string, args: any, duration: number, success: boolean, error?: string): string;
    /**
     * Log layer activation
     */
    logLayerActivation(layerId: string, triggeredBy: string, tools: string[], contextWeight: number): string;
    /**
     * Query audit entries
     */
    query(options?: AuditQueryOptions): AuditEntry[];
    /**
     * Get statistics
     */
    getStatistics(): AuditStatistics;
    /**
     * Detect patterns in audit logs
     */
    detectPatterns(): AuditPattern[];
    /**
     * Detect activation/deactivation cycles
     */
    private detectActivationCycles;
    /**
     * Detect error clusters
     */
    private detectErrorClusters;
    /**
     * Detect performance degradation
     */
    private detectPerformanceDegradation;
    /**
     * Detect context thrashing
     */
    private detectContextThrashing;
    /**
     * Persist audit logs to file
     */
    persist(): Promise<void>;
    /**
     * Load audit logs from file
     */
    load(file: string): Promise<void>;
    /**
     * End session and persist
     */
    endSession(): Promise<void>;
    /**
     * Generate session ID
     */
    private generateSessionId;
    /**
     * Generate event ID
     */
    private generateEventId;
}
//# sourceMappingURL=audit-logger.d.ts.map