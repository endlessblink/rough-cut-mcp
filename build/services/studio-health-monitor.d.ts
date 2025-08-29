import { EventEmitter } from 'events';
export interface HealthMonitorConfig {
    /** Interval between health checks in milliseconds */
    checkInterval: number;
    /** Timeout for HTTP health checks in milliseconds */
    httpTimeout: number;
    /** Number of failed checks before considering a studio unhealthy */
    failureThreshold: number;
    /** Whether to automatically recover failed studios */
    autoRecover: boolean;
    /** Maximum number of recovery attempts */
    maxRecoveryAttempts: number;
    /** Delay between recovery attempts in milliseconds */
    recoveryDelay: number;
}
export interface StudioHealthStatus {
    port: number;
    pid: number;
    projectName?: string;
    projectPath?: string;
    isHealthy: boolean;
    lastCheck: Date;
    consecutiveFailures: number;
    responseTime?: number;
    error?: string;
    recoveryAttempts: number;
    lastRecoveryAttempt?: Date;
}
export interface HealthMonitorReport {
    totalStudios: number;
    healthyStudios: number;
    unhealthyStudios: number;
    averageResponseTime: number;
    studios: StudioHealthStatus[];
    lastFullScan: Date;
    activeRecoveries: number;
}
export declare class StudioHealthMonitor extends EventEmitter {
    private config;
    private isRunning;
    private healthCheckInterval?;
    private studioHealth;
    private recoveryQueue;
    constructor(config?: Partial<HealthMonitorConfig>);
    /**
     * Start continuous health monitoring
     */
    start(): void;
    /**
     * Stop health monitoring
     */
    stop(): void;
    /**
     * Perform a complete health check of all studios
     */
    performHealthCheck(): Promise<void>;
    /**
     * Check the health of a specific studio
     */
    private checkStudioHealth;
    /**
     * Queue a studio for recovery
     */
    private queueForRecovery;
    /**
     * Process the recovery queue
     */
    private processRecoveryQueue;
    /**
     * Attempt to recover a specific studio
     */
    private attemptStudioRecovery;
    /**
     * Generate a comprehensive health report
     */
    generateHealthReport(): HealthMonitorReport;
    /**
     * Get current health status for all studios
     */
    getHealthStatus(): Map<number, StudioHealthStatus>;
    /**
     * Get health status for a specific studio
     */
    getStudioHealth(port: number): StudioHealthStatus | undefined;
    /**
     * Manually trigger recovery for a specific studio
     */
    triggerRecovery(port: number): Promise<void>;
    /**
     * Reset recovery attempts for a studio
     */
    resetRecoveryAttempts(port: number): void;
    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<HealthMonitorConfig>): void;
    /**
     * Get comprehensive status including configuration
     */
    getStatus(): {
        isRunning: boolean;
        config: HealthMonitorConfig;
        healthReport: HealthMonitorReport;
        recoveryQueue: Array<{
            port: number;
            attempts: number;
            nextAttempt: Date;
        }>;
    };
}
//# sourceMappingURL=studio-health-monitor.d.ts.map