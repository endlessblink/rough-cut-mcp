/**
 * Real-time Update Service
 * Handles live updates to Remotion projects with immediate feedback
 */
import { EventEmitter } from 'events';
import { FileIntegrityManager, EditOperation } from '../utils/file-integrity.js';
import { StudioPortManager } from './studio-port-manager.js';
export interface UpdateRequest {
    projectName: string;
    projectPath: string;
    filePath: string;
    operations: EditOperation[];
    validateSyntax?: boolean;
}
export interface UpdateResult {
    success: boolean;
    buildTime?: number;
    errors: string[];
    warnings: string[];
    port?: number;
    requiresRestart: boolean;
    hotReloaded: boolean;
}
export interface BuildStatus {
    building: boolean;
    success: boolean;
    errors: string[];
    warnings: string[];
    startTime?: Date;
    endTime?: Date;
    duration?: number;
}
export declare class RealtimeUpdateService extends EventEmitter {
    private fileIntegrity;
    private portManager;
    private buildStatuses;
    private updateQueue;
    constructor(fileIntegrity: FileIntegrityManager, portManager: StudioPortManager);
    /**
     * Monitor build output for a project
     */
    private monitorBuildOutput;
    /**
     * Wait for Remotion to rebuild after file changes
     */
    private waitForRebuild;
    /**
     * Validate component after update
     */
    private validateComponent;
    /**
     * Apply updates to a video component
     */
    updateVideoComponent(request: UpdateRequest): Promise<UpdateResult>;
    /**
     * Batch update multiple files
     */
    batchUpdate(requests: UpdateRequest[]): Promise<Map<string, UpdateResult>>;
    /**
     * Start watching a project for changes
     * Note: File watching functionality requires optional chokidar dependency
     */
    startWatching(projectName: string, projectPath: string): void;
    /**
     * Stop watching a project
     */
    stopWatching(projectName: string): void;
    /**
     * Stop all watchers
     */
    stopAllWatchers(): void;
    /**
     * Get build status for a project
     */
    getBuildStatus(projectName: string): BuildStatus | undefined;
    /**
     * Queue an update for later processing
     */
    queueUpdate(request: UpdateRequest): void;
    /**
     * Process queued updates for a project
     */
    processQueue(projectName: string): Promise<UpdateResult[]>;
}
export declare function createRealtimeUpdater(fileIntegrity: FileIntegrityManager, portManager: StudioPortManager): RealtimeUpdateService;
//# sourceMappingURL=realtime-updater.d.ts.map