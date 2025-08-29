/**
 * Studio Auto-Recovery System
 * Handles automatic recovery of crashed studio processes
 */
import { StudioRegistry } from './studio-registry.js';
export interface RecoveryAttempt {
    port: number;
    pid: number;
    projectPath: string;
    projectName: string;
    attempts: number;
    lastAttempt: Date;
    success: boolean;
}
export declare class StudioAutoRecovery {
    private logger;
    private recoveryAttempts;
    private maxRetries;
    private retryDelay;
    private registry;
    private discoveryService;
    private monitorInterval?;
    constructor(registry: StudioRegistry);
    /**
     * Start monitoring for crashed processes
     */
    startMonitoring(intervalMs?: number): void;
    /**
     * Stop monitoring
     */
    stopMonitoring(): void;
    /**
     * Check for crashed studios and attempt recovery
     */
    private checkAndRecoverCrashedStudios;
    /**
     * Handle a crashed process
     */
    handleProcessCrash(instance: any): Promise<boolean>;
    /**
     * Permanent cleanup for failed recovery
     */
    private permanentCleanup;
    /**
     * Check if a process is alive
     */
    private isProcessAlive;
    /**
     * Get recovery statistics
     */
    getRecoveryStats(): {
        activeRecoveries: number;
        totalAttempts: number;
        successfulRecoveries: number;
        failedRecoveries: number;
        attempts: RecoveryAttempt[];
    };
    /**
     * Force recovery attempt for a specific port
     */
    forceRecovery(port: number): Promise<boolean>;
    /**
     * Clear recovery history
     */
    clearRecoveryHistory(): void;
}
//# sourceMappingURL=studio-auto-recovery.d.ts.map