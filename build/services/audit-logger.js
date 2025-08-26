/**
 * Enhanced Audit Logger for Tool/Layer Activation History
 *
 * Provides comprehensive logging and analysis of tool and layer
 * activation patterns for debugging and optimization.
 */
import { getLogger } from '../utils/logger.js';
import * as fs from 'fs-extra';
import * as path from 'path';
import { EventEmitter } from 'events';
/**
 * Audit event types
 */
export var AuditEventType;
(function (AuditEventType) {
    AuditEventType["TOOL_ACTIVATED"] = "tool_activated";
    AuditEventType["TOOL_DEACTIVATED"] = "tool_deactivated";
    AuditEventType["TOOL_CALLED"] = "tool_called";
    AuditEventType["TOOL_FAILED"] = "tool_failed";
    AuditEventType["LAYER_ACTIVATED"] = "layer_activated";
    AuditEventType["LAYER_DEACTIVATED"] = "layer_deactivated";
    AuditEventType["CONTEXT_OPTIMIZED"] = "context_optimized";
    AuditEventType["DEPENDENCY_RESOLVED"] = "dependency_resolved";
    AuditEventType["CONFIGURATION_CHANGED"] = "configuration_changed";
    AuditEventType["SESSION_STARTED"] = "session_started";
    AuditEventType["SESSION_ENDED"] = "session_ended";
})(AuditEventType || (AuditEventType = {}));
/**
 * Audit event severity levels
 */
export var AuditSeverity;
(function (AuditSeverity) {
    AuditSeverity["DEBUG"] = "debug";
    AuditSeverity["INFO"] = "info";
    AuditSeverity["WARNING"] = "warning";
    AuditSeverity["ERROR"] = "error";
    AuditSeverity["CRITICAL"] = "critical";
})(AuditSeverity || (AuditSeverity = {}));
/**
 * Enhanced Audit Logger
 */
export class AuditLogger extends EventEmitter {
    entries;
    sessionId;
    logger;
    auditFile;
    maxEntries;
    persistInterval;
    entryIndex; // Index by entity
    constructor(auditDir, maxEntries = 10000, persistIntervalMs = 60000) {
        super();
        this.entries = new Map();
        this.entryIndex = new Map();
        this.sessionId = this.generateSessionId();
        this.logger = getLogger().service('AuditLogger');
        this.maxEntries = maxEntries;
        this.auditFile = path.join(auditDir, `audit-${this.sessionId}.json`);
        this.persistInterval = null;
        // Ensure audit directory exists
        fs.ensureDirSync(auditDir);
        // Start periodic persistence
        if (persistIntervalMs > 0) {
            this.persistInterval = setInterval(() => {
                this.persist();
            }, persistIntervalMs);
        }
        // Log session start
        this.logEvent({
            type: AuditEventType.SESSION_STARTED,
            severity: AuditSeverity.INFO,
            entity: 'system',
            action: 'Session started',
            triggeredBy: 'system',
            context: {
                sessionId: this.sessionId,
                timestamp: new Date(),
            },
        });
        this.logger.info('Audit Logger initialized', {
            sessionId: this.sessionId,
            auditFile: this.auditFile,
        });
    }
    /**
     * Log an audit event
     */
    logEvent(event) {
        const id = this.generateEventId();
        const entry = {
            id,
            timestamp: new Date(),
            sessionId: this.sessionId,
            ...event,
        };
        // Store entry
        this.entries.set(id, entry);
        // Update index
        if (!this.entryIndex.has(entry.entity)) {
            this.entryIndex.set(entry.entity, new Set());
        }
        this.entryIndex.get(entry.entity).add(id);
        // Enforce max entries limit
        if (this.entries.size > this.maxEntries) {
            const toRemove = Array.from(this.entries.keys()).slice(0, this.entries.size - this.maxEntries);
            for (const removeId of toRemove) {
                const removeEntry = this.entries.get(removeId);
                if (removeEntry) {
                    // Remove from index
                    const entityIndex = this.entryIndex.get(removeEntry.entity);
                    if (entityIndex) {
                        entityIndex.delete(removeId);
                    }
                }
                this.entries.delete(removeId);
            }
        }
        // Log to file logger
        this.logger.debug('Audit event', entry);
        // Emit event
        this.emit('auditEvent', entry);
        return id;
    }
    /**
     * Log tool activation
     */
    logToolActivation(toolId, triggeredBy, context = {}) {
        return this.logEvent({
            type: AuditEventType.TOOL_ACTIVATED,
            severity: AuditSeverity.INFO,
            entity: toolId,
            action: `Tool '${toolId}' activated`,
            triggeredBy,
            context,
        });
    }
    /**
     * Log tool deactivation
     */
    logToolDeactivation(toolId, triggeredBy, reason) {
        return this.logEvent({
            type: AuditEventType.TOOL_DEACTIVATED,
            severity: AuditSeverity.INFO,
            entity: toolId,
            action: `Tool '${toolId}' deactivated`,
            triggeredBy,
            context: { reason },
        });
    }
    /**
     * Log tool call
     */
    logToolCall(toolId, triggeredBy, args, duration, success, error) {
        return this.logEvent({
            type: success ? AuditEventType.TOOL_CALLED : AuditEventType.TOOL_FAILED,
            severity: success ? AuditSeverity.DEBUG : AuditSeverity.ERROR,
            entity: toolId,
            action: `Tool '${toolId}' ${success ? 'called' : 'failed'}`,
            triggeredBy,
            context: { args, success },
            error,
            metrics: { duration },
        });
    }
    /**
     * Log layer activation
     */
    logLayerActivation(layerId, triggeredBy, tools, contextWeight) {
        return this.logEvent({
            type: AuditEventType.LAYER_ACTIVATED,
            severity: AuditSeverity.INFO,
            entity: layerId,
            action: `Layer '${layerId}' activated`,
            triggeredBy,
            context: { tools, toolCount: tools.length },
            metrics: { contextWeight },
        });
    }
    /**
     * Query audit entries
     */
    query(options = {}) {
        let entries = Array.from(this.entries.values());
        // Apply filters
        if (options.types && options.types.length > 0) {
            entries = entries.filter(e => options.types.includes(e.type));
        }
        if (options.severities && options.severities.length > 0) {
            entries = entries.filter(e => options.severities.includes(e.severity));
        }
        if (options.entity) {
            entries = entries.filter(e => e.entity === options.entity);
        }
        if (options.sessionId) {
            entries = entries.filter(e => e.sessionId === options.sessionId);
        }
        if (options.startTime) {
            entries = entries.filter(e => e.timestamp >= options.startTime);
        }
        if (options.endTime) {
            entries = entries.filter(e => e.timestamp <= options.endTime);
        }
        // Sort
        entries.sort((a, b) => {
            const diff = a.timestamp.getTime() - b.timestamp.getTime();
            return options.sortOrder === 'desc' ? -diff : diff;
        });
        // Apply limit
        if (options.limit && options.limit > 0) {
            entries = entries.slice(0, options.limit);
        }
        return entries;
    }
    /**
     * Get statistics
     */
    getStatistics() {
        const entries = Array.from(this.entries.values());
        const eventsByType = new Map();
        const eventsBySeverity = new Map();
        const entityCounts = new Map();
        const hourCounts = new Map();
        let totalDuration = 0;
        let durationCount = 0;
        let errorCount = 0;
        for (const entry of entries) {
            // Count by type
            eventsByType.set(entry.type, (eventsByType.get(entry.type) || 0) + 1);
            // Count by severity
            eventsBySeverity.set(entry.severity, (eventsBySeverity.get(entry.severity) || 0) + 1);
            // Count by entity
            entityCounts.set(entry.entity, (entityCounts.get(entry.entity) || 0) + 1);
            // Count by hour
            const hour = entry.timestamp.getHours();
            hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
            // Track durations
            if (entry.metrics?.duration) {
                totalDuration += entry.metrics.duration;
                durationCount++;
            }
            // Count errors
            if (entry.severity === AuditSeverity.ERROR || entry.severity === AuditSeverity.CRITICAL) {
                errorCount++;
            }
        }
        // Get top entities
        const topEntities = Array.from(entityCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([entity, count]) => ({ entity, count }));
        // Get peak periods
        const peakPeriods = Array.from(hourCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([hour, count]) => ({ hour, count }));
        return {
            totalEvents: entries.length,
            eventsByType,
            eventsBySeverity,
            topEntities,
            errorRate: entries.length > 0 ? errorCount / entries.length : 0,
            averageDuration: durationCount > 0 ? totalDuration / durationCount : 0,
            peakPeriods,
        };
    }
    /**
     * Detect patterns in audit logs
     */
    detectPatterns() {
        const patterns = [];
        const entries = Array.from(this.entries.values());
        // Pattern 1: Frequent activation/deactivation cycles
        const activationCycles = this.detectActivationCycles(entries);
        if (activationCycles)
            patterns.push(activationCycles);
        // Pattern 2: Error clusters
        const errorClusters = this.detectErrorClusters(entries);
        if (errorClusters)
            patterns.push(errorClusters);
        // Pattern 3: Performance degradation
        const performanceDegradation = this.detectPerformanceDegradation(entries);
        if (performanceDegradation)
            patterns.push(performanceDegradation);
        // Pattern 4: Context thrashing
        const contextThrashing = this.detectContextThrashing(entries);
        if (contextThrashing)
            patterns.push(contextThrashing);
        return patterns;
    }
    /**
     * Detect activation/deactivation cycles
     */
    detectActivationCycles(entries) {
        const entityCycles = new Map();
        for (let i = 0; i < entries.length - 1; i++) {
            const current = entries[i];
            const next = entries[i + 1];
            if (current.entity === next.entity &&
                ((current.type === AuditEventType.TOOL_ACTIVATED &&
                    next.type === AuditEventType.TOOL_DEACTIVATED) ||
                    (current.type === AuditEventType.LAYER_ACTIVATED &&
                        next.type === AuditEventType.LAYER_DEACTIVATED))) {
                entityCycles.set(current.entity, (entityCycles.get(current.entity) || 0) + 1);
            }
        }
        const frequentCycles = Array.from(entityCycles.entries())
            .filter(([_, count]) => count > 3);
        if (frequentCycles.length > 0) {
            return {
                type: 'activation_cycles',
                description: 'Frequent activation/deactivation cycles detected',
                confidence: Math.min(1, frequentCycles.length / 5),
                events: frequentCycles.map(([entity]) => entity),
                recommendations: [
                    'Consider keeping frequently used tools/layers active',
                    'Review activation triggers to reduce churn',
                    'Increase context weight limits if needed',
                ],
            };
        }
        return null;
    }
    /**
     * Detect error clusters
     */
    detectErrorClusters(entries) {
        const errorGroups = [];
        let currentGroup = [];
        for (const entry of entries) {
            if (entry.severity === AuditSeverity.ERROR ||
                entry.severity === AuditSeverity.CRITICAL) {
                currentGroup.push(entry);
            }
            else if (currentGroup.length > 0) {
                if (currentGroup.length >= 3) {
                    errorGroups.push(currentGroup);
                }
                currentGroup = [];
            }
        }
        if (errorGroups.length > 0) {
            const affectedEntities = new Set();
            errorGroups.forEach(group => {
                group.forEach(entry => affectedEntities.add(entry.entity));
            });
            return {
                type: 'error_clusters',
                description: `${errorGroups.length} error clusters detected`,
                confidence: Math.min(1, errorGroups.length / 3),
                events: Array.from(affectedEntities),
                recommendations: [
                    'Investigate common error causes',
                    'Add better error handling',
                    'Review API key configuration for affected tools',
                ],
            };
        }
        return null;
    }
    /**
     * Detect performance degradation
     */
    detectPerformanceDegradation(entries) {
        const toolDurations = new Map();
        for (const entry of entries) {
            if (entry.type === AuditEventType.TOOL_CALLED && entry.metrics?.duration) {
                if (!toolDurations.has(entry.entity)) {
                    toolDurations.set(entry.entity, []);
                }
                toolDurations.get(entry.entity).push(entry.metrics.duration);
            }
        }
        const degradedTools = [];
        for (const [tool, durations] of toolDurations) {
            if (durations.length >= 5) {
                const firstHalf = durations.slice(0, Math.floor(durations.length / 2));
                const secondHalf = durations.slice(Math.floor(durations.length / 2));
                const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
                const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
                if (avgSecond > avgFirst * 1.5) {
                    degradedTools.push(tool);
                }
            }
        }
        if (degradedTools.length > 0) {
            return {
                type: 'performance_degradation',
                description: 'Performance degradation detected in some tools',
                confidence: Math.min(1, degradedTools.length / 3),
                events: degradedTools,
                recommendations: [
                    'Check system resources',
                    'Review context weight usage',
                    'Consider restarting affected services',
                ],
            };
        }
        return null;
    }
    /**
     * Detect context thrashing
     */
    detectContextThrashing(entries) {
        const optimizations = entries.filter(e => e.type === AuditEventType.CONTEXT_OPTIMIZED);
        if (optimizations.length > 5) {
            const timeDiffs = [];
            for (let i = 1; i < optimizations.length; i++) {
                const diff = optimizations[i].timestamp.getTime() -
                    optimizations[i - 1].timestamp.getTime();
                timeDiffs.push(diff);
            }
            const avgTimeBetween = timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length;
            if (avgTimeBetween < 60000) { // Less than 1 minute between optimizations
                return {
                    type: 'context_thrashing',
                    description: 'Frequent context optimizations indicate thrashing',
                    confidence: Math.min(1, 10 / (avgTimeBetween / 1000)),
                    events: optimizations.map(e => e.id),
                    recommendations: [
                        'Increase maximum context weight limit',
                        'Review tool/layer activation patterns',
                        'Consider using more selective tool loading',
                    ],
                };
            }
        }
        return null;
    }
    /**
     * Persist audit logs to file
     */
    async persist() {
        try {
            const entries = Array.from(this.entries.values());
            await fs.writeJson(this.auditFile, {
                sessionId: this.sessionId,
                entries,
                statistics: this.getStatistics(),
                patterns: this.detectPatterns(),
            }, { spaces: 2 });
            this.logger.debug('Audit logs persisted', {
                file: this.auditFile,
                entries: entries.length,
            });
        }
        catch (error) {
            this.logger.error('Failed to persist audit logs', { error });
        }
    }
    /**
     * Load audit logs from file
     */
    async load(file) {
        try {
            if (await fs.pathExists(file)) {
                const data = await fs.readJson(file);
                this.entries.clear();
                this.entryIndex.clear();
                for (const entry of data.entries) {
                    entry.timestamp = new Date(entry.timestamp);
                    this.entries.set(entry.id, entry);
                    if (!this.entryIndex.has(entry.entity)) {
                        this.entryIndex.set(entry.entity, new Set());
                    }
                    this.entryIndex.get(entry.entity).add(entry.id);
                }
                this.logger.info('Audit logs loaded', {
                    file,
                    entries: this.entries.size,
                });
            }
        }
        catch (error) {
            this.logger.error('Failed to load audit logs', { error });
        }
    }
    /**
     * End session and persist
     */
    async endSession() {
        this.logEvent({
            type: AuditEventType.SESSION_ENDED,
            severity: AuditSeverity.INFO,
            entity: 'system',
            action: 'Session ended',
            triggeredBy: 'system',
            context: {
                sessionId: this.sessionId,
                totalEvents: this.entries.size,
            },
        });
        await this.persist();
        if (this.persistInterval) {
            clearInterval(this.persistInterval);
            this.persistInterval = null;
        }
        this.logger.info('Audit session ended', { sessionId: this.sessionId });
    }
    /**
     * Generate session ID
     */
    generateSessionId() {
        return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Generate event ID
     */
    generateEventId() {
        return `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}
//# sourceMappingURL=audit-logger.js.map