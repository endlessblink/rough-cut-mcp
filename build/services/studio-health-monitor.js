"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudioHealthMonitor = void 0;
const events_1 = require("events");
const logger_js_1 = require("../utils/logger.js");
const logger = (0, logger_js_1.getLogger)().service('StudioHealthMonitor');
const process_discovery_js_1 = require("./process-discovery.js");
const studio_lifecycle_js_1 = require("./studio-lifecycle.js");
class StudioHealthMonitor extends events_1.EventEmitter {
    config;
    isRunning = false;
    healthCheckInterval;
    studioHealth = new Map();
    recoveryQueue = new Map();
    constructor(config) {
        super();
        this.config = {
            checkInterval: 30000, // 30 seconds
            httpTimeout: 5000, // 5 seconds
            failureThreshold: 3, // 3 consecutive failures
            autoRecover: true,
            maxRecoveryAttempts: 3,
            recoveryDelay: 60000, // 1 minute between recovery attempts
            ...config
        };
        logger.info('StudioHealthMonitor initialized', { config: this.config });
    }
    /**
     * Start continuous health monitoring
     */
    start() {
        if (this.isRunning) {
            logger.warn('Health monitor is already running');
            return;
        }
        this.isRunning = true;
        // Perform initial health check
        this.performHealthCheck().catch(error => {
            logger.error('Initial health check failed:', error);
        });
        // Schedule regular health checks
        this.healthCheckInterval = setInterval(() => {
            this.performHealthCheck().catch(error => {
                logger.error('Scheduled health check failed:', error);
            });
        }, this.config.checkInterval);
        logger.info('Studio health monitoring started', {
            interval: this.config.checkInterval,
            autoRecover: this.config.autoRecover
        });
        this.emit('started');
    }
    /**
     * Stop health monitoring
     */
    stop() {
        if (!this.isRunning) {
            return;
        }
        this.isRunning = false;
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = undefined;
        }
        // Clear any pending recoveries
        this.recoveryQueue.clear();
        logger.info('Studio health monitoring stopped');
        this.emit('stopped');
    }
    /**
     * Perform a complete health check of all studios
     */
    async performHealthCheck() {
        if (!this.isRunning) {
            return;
        }
        try {
            logger.debug('Starting health check cycle');
            // Discover all active studios
            const activeStudios = await process_discovery_js_1.ProcessDiscovery.getActiveStudios();
            // Remove health records for studios that no longer exist
            const activePortsSet = new Set(activeStudios.map(s => s.port));
            for (const [port] of this.studioHealth) {
                if (!activePortsSet.has(port)) {
                    this.studioHealth.delete(port);
                    this.recoveryQueue.delete(port);
                    logger.debug(`Removed health record for non-existent studio on port ${port}`);
                }
            }
            // Check health of each active studio
            const healthChecks = activeStudios.map(studio => this.checkStudioHealth(studio));
            await Promise.allSettled(healthChecks);
            // Process recovery queue
            await this.processRecoveryQueue();
            // Emit health report
            const report = this.generateHealthReport();
            this.emit('healthCheck', report);
            logger.debug('Health check cycle completed', {
                totalStudios: report.totalStudios,
                healthy: report.healthyStudios,
                unhealthy: report.unhealthyStudios,
                averageResponseTime: report.averageResponseTime
            });
        }
        catch (error) {
            logger.error('Health check cycle failed:', error);
            this.emit('error', error);
        }
    }
    /**
     * Check the health of a specific studio
     */
    async checkStudioHealth(studio) {
        const port = studio.port;
        const existingHealth = this.studioHealth.get(port);
        try {
            // Test HTTP endpoint responsiveness
            const startTime = Date.now();
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), this.config.httpTimeout);
            const response = await fetch(`http://localhost:${port}`, {
                method: 'HEAD',
                signal: controller.signal,
                headers: {
                    'User-Agent': 'RoughCut-HealthMonitor'
                }
            });
            clearTimeout(timeout);
            const responseTime = Date.now() - startTime;
            const isHealthy = response.ok || (response.status >= 200 && response.status < 500);
            // Update health status
            const healthStatus = {
                port,
                pid: studio.pid,
                projectName: studio.projectName,
                projectPath: studio.projectPath,
                isHealthy,
                lastCheck: new Date(),
                consecutiveFailures: isHealthy ? 0 : (existingHealth?.consecutiveFailures || 0) + 1,
                responseTime: isHealthy ? responseTime : undefined,
                recoveryAttempts: existingHealth?.recoveryAttempts || 0,
                lastRecoveryAttempt: existingHealth?.lastRecoveryAttempt
            };
            this.studioHealth.set(port, healthStatus);
            // Check if studio became unhealthy
            if (!isHealthy && healthStatus.consecutiveFailures >= this.config.failureThreshold) {
                if (!existingHealth || existingHealth.isHealthy) {
                    // Studio just became unhealthy
                    logger.warn(`Studio on port ${port} became unhealthy`, {
                        consecutiveFailures: healthStatus.consecutiveFailures,
                        responseStatus: response.status
                    });
                    this.emit('studioUnhealthy', healthStatus);
                    // Queue for recovery if auto-recovery is enabled
                    if (this.config.autoRecover) {
                        this.queueForRecovery(port);
                    }
                }
            }
            else if (isHealthy && existingHealth && !existingHealth.isHealthy) {
                // Studio recovered
                logger.info(`Studio on port ${port} recovered`, {
                    responseTime,
                    previousFailures: existingHealth.consecutiveFailures
                });
                // Remove from recovery queue
                this.recoveryQueue.delete(port);
                this.emit('studioRecovered', healthStatus);
            }
        }
        catch (error) {
            // Health check failed
            const healthStatus = {
                port,
                pid: studio.pid,
                projectName: studio.projectName,
                projectPath: studio.projectPath,
                isHealthy: false,
                lastCheck: new Date(),
                consecutiveFailures: (existingHealth?.consecutiveFailures || 0) + 1,
                error: error instanceof Error ? error.message : String(error),
                recoveryAttempts: existingHealth?.recoveryAttempts || 0,
                lastRecoveryAttempt: existingHealth?.lastRecoveryAttempt
            };
            this.studioHealth.set(port, healthStatus);
            // Check if we've reached the failure threshold
            if (healthStatus.consecutiveFailures >= this.config.failureThreshold) {
                if (!existingHealth || existingHealth.isHealthy) {
                    // Studio just became unhealthy
                    logger.warn(`Studio on port ${port} became unhealthy due to error`, {
                        error: healthStatus.error,
                        consecutiveFailures: healthStatus.consecutiveFailures
                    });
                    this.emit('studioUnhealthy', healthStatus);
                    // Queue for recovery if auto-recovery is enabled
                    if (this.config.autoRecover) {
                        this.queueForRecovery(port);
                    }
                }
            }
        }
    }
    /**
     * Queue a studio for recovery
     */
    queueForRecovery(port) {
        const existingHealth = this.studioHealth.get(port);
        if (!existingHealth || existingHealth.recoveryAttempts >= this.config.maxRecoveryAttempts) {
            if (existingHealth) {
                logger.warn(`Studio on port ${port} has exceeded maximum recovery attempts`, {
                    attempts: existingHealth.recoveryAttempts,
                    maxAttempts: this.config.maxRecoveryAttempts
                });
            }
            return;
        }
        const nextAttemptTime = new Date(Date.now() + this.config.recoveryDelay);
        this.recoveryQueue.set(port, {
            attempts: existingHealth.recoveryAttempts,
            nextAttempt: nextAttemptTime
        });
        logger.info(`Studio on port ${port} queued for recovery`, {
            attempt: existingHealth.recoveryAttempts + 1,
            nextAttempt: nextAttemptTime.toISOString()
        });
    }
    /**
     * Process the recovery queue
     */
    async processRecoveryQueue() {
        const now = new Date();
        const recoveriesToProcess = Array.from(this.recoveryQueue.entries())
            .filter(([_, recovery]) => recovery.nextAttempt <= now);
        for (const [port, recovery] of recoveriesToProcess) {
            try {
                await this.attemptStudioRecovery(port);
                // Remove from queue regardless of success - health check will re-queue if still unhealthy
                this.recoveryQueue.delete(port);
            }
            catch (error) {
                logger.error(`Recovery attempt failed for studio on port ${port}:`, error);
                // Keep in queue for next cycle
            }
        }
    }
    /**
     * Attempt to recover a specific studio
     */
    async attemptStudioRecovery(port) {
        const healthStatus = this.studioHealth.get(port);
        if (!healthStatus) {
            return;
        }
        logger.info(`Attempting recovery for studio on port ${port}`, {
            attempt: healthStatus.recoveryAttempts + 1,
            pid: healthStatus.pid
        });
        try {
            // Update recovery attempt count
            healthStatus.recoveryAttempts++;
            healthStatus.lastRecoveryAttempt = new Date();
            this.studioHealth.set(port, healthStatus);
            // Try to gracefully restart the studio
            const shutdownResult = await studio_lifecycle_js_1.StudioLifecycle.shutdownStudios({
                port,
                force: false
            });
            if (!shutdownResult.success) {
                // If graceful shutdown failed, try force shutdown
                logger.warn(`Graceful shutdown failed for port ${port}, attempting force shutdown`);
                await studio_lifecycle_js_1.StudioLifecycle.shutdownStudios({
                    port,
                    force: true
                });
            }
            // Wait a moment for the port to be released
            await new Promise(resolve => setTimeout(resolve, 2000));
            // Launch a new studio instance if we have project information
            if (healthStatus.projectPath) {
                const launchResult = await studio_lifecycle_js_1.StudioLifecycle.launchStudio({
                    projectPath: healthStatus.projectPath,
                    preferredPort: port,
                    timeout: 30000,
                    validate: true
                });
                if (launchResult.success) {
                    logger.info(`Successfully recovered studio on port ${port}`, {
                        newPid: launchResult.pid,
                        previousPid: healthStatus.pid
                    });
                    // Update health status with new PID
                    healthStatus.pid = launchResult.pid;
                    healthStatus.consecutiveFailures = 0;
                    healthStatus.isHealthy = true;
                    healthStatus.error = undefined;
                    this.studioHealth.set(port, healthStatus);
                    this.emit('studioRecovered', healthStatus);
                }
                else {
                    throw new Error(launchResult.error || 'Recovery launch failed');
                }
            }
            else {
                logger.warn(`Cannot recover studio on port ${port} - no project path available`);
            }
        }
        catch (error) {
            logger.error(`Recovery attempt ${healthStatus.recoveryAttempts} failed for port ${port}:`, error);
            healthStatus.error = `Recovery failed: ${error instanceof Error ? error.message : String(error)}`;
            this.studioHealth.set(port, healthStatus);
            this.emit('recoveryFailed', { port, attempt: healthStatus.recoveryAttempts, error });
        }
    }
    /**
     * Generate a comprehensive health report
     */
    generateHealthReport() {
        const studios = Array.from(this.studioHealth.values());
        const healthyStudios = studios.filter(s => s.isHealthy);
        const unhealthyStudios = studios.filter(s => !s.isHealthy);
        const responseTimes = healthyStudios
            .map(s => s.responseTime)
            .filter((rt) => rt !== undefined);
        const averageResponseTime = responseTimes.length > 0
            ? responseTimes.reduce((sum, rt) => sum + rt, 0) / responseTimes.length
            : 0;
        return {
            totalStudios: studios.length,
            healthyStudios: healthyStudios.length,
            unhealthyStudios: unhealthyStudios.length,
            averageResponseTime: Math.round(averageResponseTime),
            studios: studios.sort((a, b) => a.port - b.port),
            lastFullScan: new Date(),
            activeRecoveries: this.recoveryQueue.size
        };
    }
    /**
     * Get current health status for all studios
     */
    getHealthStatus() {
        return new Map(this.studioHealth);
    }
    /**
     * Get health status for a specific studio
     */
    getStudioHealth(port) {
        return this.studioHealth.get(port);
    }
    /**
     * Manually trigger recovery for a specific studio
     */
    async triggerRecovery(port) {
        const healthStatus = this.studioHealth.get(port);
        if (!healthStatus) {
            throw new Error(`No health record found for studio on port ${port}`);
        }
        if (healthStatus.recoveryAttempts >= this.config.maxRecoveryAttempts) {
            throw new Error(`Studio on port ${port} has exceeded maximum recovery attempts`);
        }
        await this.attemptStudioRecovery(port);
    }
    /**
     * Reset recovery attempts for a studio
     */
    resetRecoveryAttempts(port) {
        const healthStatus = this.studioHealth.get(port);
        if (healthStatus) {
            healthStatus.recoveryAttempts = 0;
            healthStatus.lastRecoveryAttempt = undefined;
            this.studioHealth.set(port, healthStatus);
            // Remove from recovery queue
            this.recoveryQueue.delete(port);
            logger.info(`Reset recovery attempts for studio on port ${port}`);
        }
    }
    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        // Restart monitoring with new configuration if running
        if (this.isRunning) {
            this.stop();
            this.start();
        }
        logger.info('Health monitor configuration updated', { config: this.config });
    }
    /**
     * Get comprehensive status including configuration
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            config: { ...this.config },
            healthReport: this.generateHealthReport(),
            recoveryQueue: Array.from(this.recoveryQueue.entries()).map(([port, recovery]) => ({
                port,
                attempts: recovery.attempts,
                nextAttempt: recovery.nextAttempt
            }))
        };
    }
}
exports.StudioHealthMonitor = StudioHealthMonitor;
//# sourceMappingURL=studio-health-monitor.js.map