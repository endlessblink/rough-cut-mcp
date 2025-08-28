/**
 * Studio Registry Service
 * Manages persistent tracking of Remotion Studio instances
 */
import { ChildProcess } from 'child_process';
import { MCPConfig } from '../types/index.js';
import { NetworkUrls } from '../utils/network-utils.js';
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
    constructor(config: MCPConfig);
    /**
     * Load registry from persistent storage
     */
    private loadRegistry;
    /**
     * Save registry to persistent storage
     */
    private saveRegistry;
    /**
     * Check if a process is still alive
     */
    private isProcessAlive;
    /**
     * Clean up instances that are no longer running
     */
    private cleanupDeadInstances;
    /**
     * Find an available port
     */
    private findAvailablePort;
    /**
     * Launch a new Remotion Studio instance
     */
    launchStudio(projectPath: string, projectName?: string, requestedPort?: number): Promise<StudioInstance>;
    /**
     * Stop a studio instance
     */
    stopStudio(port: number): Promise<boolean>;
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
}
//# sourceMappingURL=studio-registry.d.ts.map