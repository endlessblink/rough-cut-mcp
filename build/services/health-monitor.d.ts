/**
 * Health Monitoring Service for Rough Cut MCP
 * Monitors system health, external services, and provides diagnostics
 */
import { MCPConfig } from '../types/index.js';
export interface HealthStatus {
    status: 'healthy' | 'degraded' | 'unhealthy';
    score: number;
    lastChecked: Date;
    issues: HealthIssue[];
    services: ServiceHealth[];
}
export interface HealthIssue {
    severity: 'info' | 'warning' | 'error' | 'critical';
    component: string;
    message: string;
    suggestion?: string;
    timestamp: Date;
}
export interface ServiceHealth {
    name: string;
    status: 'up' | 'down' | 'degraded' | 'unknown';
    responseTime?: number;
    lastChecked: Date;
    error?: string;
}
export declare class HealthMonitor {
    private config;
    private logger;
    private healthHistory;
    private maxHistorySize;
    constructor(config: MCPConfig);
    /**
     * Perform comprehensive health check
     */
    performHealthCheck(): Promise<HealthStatus>;
    /**
     * Check filesystem health
     */
    private checkFilesystem;
    /**
     * Check system resources
     */
    private checkSystemResources;
    /**
     * Check Node.js dependencies
     */
    private checkDependencies;
    /**
     * Check external services
     */
    private checkExternalServices;
    /**
     * Check a single external service
     */
    private checkService;
    /**
     * Check Remotion health
     */
    private checkRemotionHealth;
    /**
     * Calculate overall health score (0-100)
     */
    private calculateHealthScore;
    /**
     * Determine overall status from score and issues
     */
    private determineOverallStatus;
    /**
     * Add health status to history
     */
    private addToHistory;
    /**
     * Get health history
     */
    getHealthHistory(limit?: number): HealthStatus[];
    /**
     * Get latest health status
     */
    getLatestHealth(): HealthStatus | null;
    /**
     * Get health trends
     */
    getHealthTrends(): {
        averageScore: number;
        trend: 'improving' | 'stable' | 'declining';
        commonIssues: {
            component: string;
            count: number;
        }[];
    };
}
//# sourceMappingURL=health-monitor.d.ts.map