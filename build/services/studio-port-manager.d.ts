/**
 * Studio Port Manager Service
 * Manages Remotion Studio instances and ensures port consistency
 */
import { ChildProcess } from 'child_process';
export interface StudioInstance {
    projectName: string;
    port: number;
    pid: number;
    process?: ChildProcess;
    startTime: Date;
    projectPath: string;
}
export interface PortAllocation {
    projectName: string;
    preferredPort: number;
    lastUsedPort?: number;
}
export declare class StudioPortManager {
    private activeInstances;
    private portAllocations;
    private portConfigPath;
    private basePort;
    private maxPort;
    constructor(configPath?: string);
    /**
     * Load saved port allocations from disk
     */
    private loadPortAllocations;
    /**
     * Save port allocations to disk
     */
    private savePortAllocations;
    /**
     * Check if a port is available
     */
    private isPortAvailable;
    /**
     * Find an available port starting from a preferred port
     */
    private findAvailablePort;
    /**
     * Get or allocate a port for a project
     */
    getProjectPort(projectName: string): Promise<number>;
    /**
     * Kill a process by PID
     */
    private killProcess;
    /**
     * Start Remotion Studio for a project
     */
    startStudio(projectName: string, projectPath: string, port?: number): Promise<StudioInstance>;
    /**
     * Restart studio for a project (preserving port)
     */
    restartStudio(projectName: string, projectPath: string): Promise<StudioInstance>;
    /**
     * Stop studio for a project
     */
    stopStudio(projectName: string): Promise<boolean>;
    /**
     * Stop all active studios
     */
    stopAllStudios(): Promise<void>;
    /**
     * Get information about an active studio
     */
    getStudioInfo(projectName: string): StudioInstance | undefined;
    /**
     * Get all active studios
     */
    getAllActiveStudios(): StudioInstance[];
    /**
     * Check if a studio is running for a project
     */
    isStudioRunning(projectName: string): boolean;
    /**
     * Update project without restarting studio (if possible)
     */
    updateProjectSafely(projectName: string, projectPath: string, updateFn: () => Promise<void>): Promise<boolean>;
    /**
     * Clean up orphaned processes
     */
    cleanupOrphanedProcesses(): Promise<number>;
}
export declare const studioPortManager: StudioPortManager;
//# sourceMappingURL=studio-port-manager.d.ts.map