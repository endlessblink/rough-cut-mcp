/**
 * Studio Registry Service
 * Manages persistent tracking of Remotion Studio instances
 */
import { ChildProcess } from 'child_process';
import { MCPConfig } from '../types/index.js';
import { NetworkUrls } from '../utils/network-utils.js';
import { DiscoveredStudio, AdoptStudioResult } from '../types/studio-discovery.js';
export interface StudioInstance {
    pid: number;
    port: number;
    projectPath: string;
    projectName?: string;
    startTime: number;
    status: 'starting' | 'running' | 'stopped' | 'error';
    url: string;
    urls?: NetworkUrls;
    process?: ChildProcess;
}
export declare class StudioRegistry {
    private instances;
    private registryFile;
    private logger;
    private config;
    private portRange;
    private discoveryService;
    private portValidator;
    private lastDiscoveryTime;
    private discoveryCache;
    constructor(config: MCPConfig);
    /**
     * Initialize registry with enhanced process discovery
     */
    private initializeRegistry;
    /**
     * Load registry from persistent storage
     */
    private loadRegistry;
    /**
     * Enhanced discovery using ProcessDiscovery service
     */
    private discoverAndAdoptStudiosEnhanced;
    /**
     * Legacy discovery method as fallback
     */
    private discoverAndAdoptStudiosLegacy;
    /**
     * Save registry to persistent storage
     */
    private saveRegistry;
    /**
     * Check if a process is still alive
     */
    private isProcessAlive;
    /**
     * Enhanced cleanup using process discovery
     */
    private cleanupDeadInstances;
    /**
     * Find an available port using enhanced PortManager
     */
    private findAvailablePort;
    /**
     * Legacy port finding method as fallback
     */
    private findAvailablePortLegacy;
    /**
     * Find existing studio serving a specific project
     */
    private findStudioByProject;
    /**
     * Create flexible project name patterns for matching
     */
    private createProjectPatterns;
    /**
     * Test if a studio on a specific port serves a given project (cross-platform)
     */
    private testStudioForProject;
    /**
     * Convert StudioProcess to StudioInstance format
     */
    private convertStudioProcessToInstance;
    /**
     * Enhanced smart studio launch with robust lifecycle management
     * This is the main method that solves the MCP reuse problem
     */
    smartLaunchStudio(projectPath: string, projectName?: string, requestedPort?: number, forceNewPort?: boolean): Promise<StudioInstance & {
        wasReused: boolean;
    }>;
    /**
     * Adopt an existing discovered studio into the registry
     */
    adoptExistingStudio(discovered: DiscoveredStudio): Promise<AdoptStudioResult>;
    /**
     * Launch studio using enhanced lifecycle management
     */
    launchStudioWithLifecycle(projectPath: string, projectName?: string, requestedPort?: number): Promise<StudioInstance>;
    /**
     * Legacy studio launch method as fallback
     */
    launchStudioLegacy(projectPath: string, projectName?: string, requestedPort?: number): Promise<StudioInstance>;
    /**
     * Stop studio instance using enhanced lifecycle management
     */
    stopStudio(port: number): Promise<boolean>;
    /**
     * Legacy studio shutdown method
     */
    private stopStudioLegacy;
    /**
     * Get all running instances
     */
    getInstances(): StudioInstance[];
    /**
     * Get a specific instance by port
     */
    getInstance(port: number): StudioInstance | undefined;
    /**
     * Restart a studio instance
     */
    restartStudio(port: number): Promise<StudioInstance>;
    /**
     * Get status summary
     */
    getStatus(): {
        totalInstances: number;
        runningInstances: number;
        instances: StudioInstance[];
    };
    /**
     * Get comprehensive studio report including discovered instances
     */
    getComprehensiveReport(): Promise<{
        tracked: StudioInstance[];
        discovered: DiscoveredStudio[];
        recommendations: string[];
        portUsage: number[];
        systemHealth: 'excellent' | 'good' | 'fair' | 'poor';
    }>;
    /**
     * Refresh discovery and update registry
     */
    refreshDiscovery(): Promise<{
        newlyAdopted: number;
        cleaned: number;
        errors: string[];
    }>;
    /**
     * Kill all orphaned processes (not tracked by registry)
     */
    killOrphanedProcesses(): Promise<{
        killed: number;
        errors: string[];
    }>;
    /**
     * Health check all tracked instances
     */
    performHealthCheck(): Promise<{
        healthy: number;
        unhealthy: number;
        recovered: number;
        instances: Array<{
            port: number;
            pid: number;
            isHealthy: boolean;
            responseTime?: number;
            error?: string;
        }>;
    }>;
}
//# sourceMappingURL=studio-registry.d.ts.map