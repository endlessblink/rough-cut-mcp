/**
 * Force Delete System - Safely removes animation projects even when locked by processes
 * Handles Remotion Studio instances, file locks, and cleanup without corruption
 */
export interface ForceDeleteOptions {
    projectPath: string;
    projectName: string;
    killProcesses?: boolean;
    removeNodeModules?: boolean;
    timeout?: number;
}
export interface ForceDeleteResult {
    success: boolean;
    processesKilled: string[];
    filesRemoved: string[];
    errors: string[];
    warnings: string[];
}
/**
 * Force delete an animation project, handling all locks and processes
 */
export declare function forceDeleteProject(options: ForceDeleteOptions): Promise<ForceDeleteResult>;
/**
 * Check if a project directory is locked by any processes
 */
export declare function isProjectLocked(projectPath: string): Promise<{
    locked: boolean;
    lockingProcesses: string[];
}>;
/**
 * Safe project deletion that handles all edge cases
 */
export declare function safeDeleteProject(projectPath: string, projectName: string): Promise<ForceDeleteResult>;
//# sourceMappingURL=force-delete.d.ts.map