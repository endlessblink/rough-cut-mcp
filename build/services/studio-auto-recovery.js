"use strict";
/**
 * Studio Auto-Recovery System
 * Handles automatic recovery of crashed studio processes
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudioAutoRecovery = void 0;
const logger_js_1 = require("../utils/logger.js");
const studio_discovery_js_1 = require("./studio-discovery.js");
class StudioAutoRecovery {
    logger = (0, logger_js_1.getLogger)().service('StudioAutoRecovery');
    recoveryAttempts = new Map();
    maxRetries = 3;
    retryDelay = 5000; // 5 seconds
    registry;
    discoveryService;
    monitorInterval;
    constructor(registry) {
        this.registry = registry;
        this.discoveryService = new studio_discovery_js_1.StudioDiscoveryService();
    }
    /**
     * Start monitoring for crashed processes
     */
    startMonitoring(intervalMs = 30000) {
        if (this.monitorInterval) {
            this.stopMonitoring();
        }
        this.logger.info('Starting auto-recovery monitoring', { intervalMs });
        this.monitorInterval = setInterval(() => {
            this.checkAndRecoverCrashedStudios();
        }, intervalMs);
    }
    /**
     * Stop monitoring
     */
    stopMonitoring() {
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            this.monitorInterval = undefined;
            this.logger.info('Auto-recovery monitoring stopped');
        }
    }
    /**
     * Check for crashed studios and attempt recovery
     */
    async checkAndRecoverCrashedStudios() {
        try {
            const instances = this.registry.getInstances();
            for (const instance of instances) {
                // Check if process is still alive
                const isAlive = this.isProcessAlive(instance.pid);
                if (!isAlive && instance.status === 'running') {
                    this.logger.warn('Detected crashed studio', {
                        port: instance.port,
                        pid: instance.pid,
                        project: instance.projectName
                    });
                    // Attempt recovery
                    await this.handleProcessCrash(instance);
                }
            }
        }
        catch (error) {
            this.logger.error('Error during crash monitoring', { error });
        }
    }
    /**
     * Handle a crashed process
     */
    async handleProcessCrash(instance) {
        const recoveryKey = instance.port;
        let attempt = this.recoveryAttempts.get(recoveryKey);
        if (!attempt) {
            attempt = {
                port: instance.port,
                pid: instance.pid,
                projectPath: instance.projectPath,
                projectName: instance.projectName,
                attempts: 0,
                lastAttempt: new Date(),
                success: false
            };
            this.recoveryAttempts.set(recoveryKey, attempt);
        }
        // Check if we've exceeded max retries
        if (attempt.attempts >= this.maxRetries) {
            this.logger.error('Max recovery attempts exceeded', {
                port: instance.port,
                attempts: attempt.attempts
            });
            // Mark as permanently failed
            await this.permanentCleanup(instance);
            return false;
        }
        // Increment attempt counter
        attempt.attempts++;
        attempt.lastAttempt = new Date();
        this.logger.info('Attempting studio recovery', {
            port: instance.port,
            attempt: attempt.attempts,
            maxRetries: this.maxRetries
        });
        try {
            // Wait a moment before attempting restart
            await new Promise(resolve => setTimeout(resolve, this.retryDelay));
            // First check if another process has taken the port
            const discovered = await this.discoveryService.identifyStudio(instance.port);
            if (discovered && discovered.isHealthy) {
                this.logger.info('Another healthy studio detected on port - adopting', {
                    port: instance.port,
                    newPid: discovered.pid
                });
                // Adopt the new process
                await this.registry.adoptExistingStudio(discovered);
                attempt.success = true;
                return true;
            }
            // Attempt to restart the studio
            const newInstance = await this.registry.launchStudioLegacy(attempt.projectPath, attempt.projectName, attempt.port);
            this.logger.info('Studio recovery successful', {
                port: newInstance.port,
                newPid: newInstance.pid,
                attempts: attempt.attempts
            });
            attempt.success = true;
            // Clean up successful recovery attempt after a delay
            setTimeout(() => {
                this.recoveryAttempts.delete(recoveryKey);
            }, 60000); // Clean up after 1 minute
            return true;
        }
        catch (error) {
            this.logger.error('Studio recovery failed', {
                port: instance.port,
                attempt: attempt.attempts,
                error: error instanceof Error ? error.message : String(error)
            });
            return false;
        }
    }
    /**
     * Permanent cleanup for failed recovery
     */
    async permanentCleanup(instance) {
        this.logger.info('Performing permanent cleanup', {
            port: instance.port,
            pid: instance.pid
        });
        try {
            // Remove from registry
            await this.registry.stopStudio(instance.port);
            // Clean up recovery attempt record
            this.recoveryAttempts.delete(instance.port);
            this.logger.info('Permanent cleanup completed', { port: instance.port });
        }
        catch (error) {
            this.logger.error('Permanent cleanup failed', {
                port: instance.port,
                error
            });
        }
    }
    /**
     * Check if a process is alive
     */
    isProcessAlive(pid) {
        try {
            process.kill(pid, 0);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Get recovery statistics
     */
    getRecoveryStats() {
        const attempts = Array.from(this.recoveryAttempts.values());
        return {
            activeRecoveries: attempts.filter(a => !a.success && a.attempts < this.maxRetries).length,
            totalAttempts: attempts.reduce((sum, a) => sum + a.attempts, 0),
            successfulRecoveries: attempts.filter(a => a.success).length,
            failedRecoveries: attempts.filter(a => !a.success && a.attempts >= this.maxRetries).length,
            attempts
        };
    }
    /**
     * Force recovery attempt for a specific port
     */
    async forceRecovery(port) {
        const instance = this.registry.getInstance(port);
        if (!instance) {
            this.logger.warn('No instance found for forced recovery', { port });
            return false;
        }
        // Reset retry count for this instance
        this.recoveryAttempts.delete(port);
        return await this.handleProcessCrash(instance);
    }
    /**
     * Clear recovery history
     */
    clearRecoveryHistory() {
        const cleared = this.recoveryAttempts.size;
        this.recoveryAttempts.clear();
        this.logger.info('Recovery history cleared', { cleared });
    }
}
exports.StudioAutoRecovery = StudioAutoRecovery;
//# sourceMappingURL=studio-auto-recovery.js.map