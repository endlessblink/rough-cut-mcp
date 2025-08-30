import { StudioProcess } from './process-discovery.js';
export interface StudioLaunchOptions {
    projectPath: string;
    preferredPort?: number;
    forceNewInstance?: boolean;
    timeout?: number;
    validate?: boolean;
}
export interface StudioLaunchResult {
    success: boolean;
    port?: number;
    pid?: number;
    projectPath?: string;
    reusedExisting?: boolean;
    error?: string;
    warnings?: string[];
}
export interface StudioShutdownResult {
    success: boolean;
    killedProcesses: number[];
    errors?: string[];
}
export declare class StudioLifecycle {
    private static readonly DEFAULT_TIMEOUT;
    private static readonly HEALTH_CHECK_INTERVAL;
    private static readonly MAX_STARTUP_ATTEMPTS;
    private static activeProcesses;
    private static processMetadata;
    /**
     * Launches a Remotion Studio with robust validation and error handling
     */
    static launchStudio(options: StudioLaunchOptions): Promise<StudioLaunchResult>;
    /**
     * Starts the actual Remotion Studio process
     */
    private static startStudioProcess;
    /**
     * Validates that the studio is fully functional and compositions are loaded
     */
    private static validateStudioFunctionality;
    /**
     * Finds existing studio for a project
     */
    private static findExistingStudioForProject;
    /**
     * Shuts down studio instances
     */
    static shutdownStudios(options: {
        port?: number;
        pid?: number;
        all?: boolean;
        force?: boolean;
    }): Promise<StudioShutdownResult>;
    /**
     * Kills a process by PID
     */
    private static killProcess;
    /**
     * Validates project path exists and has required files for Remotion Studio
     */
    private static validateProjectPath;
    /**
     * Gets status of all managed studio processes
     */
    static getLifecycleStatus(): Promise<{
        managedProcesses: number;
        activeStudios: StudioProcess[];
        orphanedProcesses: number[];
    }>;
    /**
     * Cleanup orphaned processes and tracking
     */
    static cleanup(): Promise<void>;
    /**
     * Gets comprehensive lifecycle report
     */
    static getLifecycleReport(): Promise<string>;
}
//# sourceMappingURL=studio-lifecycle.d.ts.map