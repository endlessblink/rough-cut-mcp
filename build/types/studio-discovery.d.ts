/**
 * Studio Discovery Types
 * Types for discovering and managing existing Remotion Studio instances
 */
export interface DiscoveredStudio {
    pid: number;
    port: number;
    project?: string;
    projectPath?: string;
    isHealthy: boolean;
    url: string;
    uptime: number;
    lastSeen: Date;
    responseTime?: number;
    version?: string;
    commandLine?: string;
}
export interface ProcessInfo {
    pid: number;
    port: number;
    commandLine: string;
    processName: string;
    startTime?: Date;
    cpuUsage?: number;
    memoryUsage?: number;
}
export interface HealthCheckResult {
    isHealthy: boolean;
    responseTime?: number;
    error?: string;
    remotionVersion?: string;
    projectInfo?: {
        name?: string;
        path?: string;
        compositions?: string[];
    };
}
export interface StudioDiscoveryOptions {
    /** Port range to scan */
    portRange?: {
        min: number;
        max: number;
    };
    /** Timeout for health checks */
    healthTimeout?: number;
    /** Whether to include unhealthy studios */
    includeUnhealthy?: boolean;
    /** Maximum age of processes to consider */
    maxAge?: number;
}
export interface AdoptStudioResult {
    success: boolean;
    adoptedStudio?: DiscoveredStudio;
    error?: string;
    conflicts?: string[];
}
export interface CleanupResult {
    processesKilled: number;
    portsFreed: number[];
    errors: string[];
    timeWaitConnectionsCleared: number;
}
export interface ValidationReport {
    totalProcesses: number;
    healthyProcesses: number;
    unhealthyProcesses: number;
    orphanedProcesses: number;
    portConflicts: number[];
    recommendations: string[];
}
//# sourceMappingURL=studio-discovery.d.ts.map