"use strict";
/**
 * Real-time Update Service
 * Handles live updates to Remotion projects with immediate feedback
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeUpdateService = void 0;
exports.createRealtimeUpdater = createRealtimeUpdater;
const events_1 = require("events");
const fs = __importStar(require("fs-extra"));
const logger_js_1 = require("../utils/logger.js");
const logger = (0, logger_js_1.getLogger)().service('RealtimeUpdater');
class RealtimeUpdateService extends events_1.EventEmitter {
    fileIntegrity;
    portManager;
    buildStatuses = new Map();
    updateQueue = new Map();
    constructor(fileIntegrity, portManager) {
        super();
        this.fileIntegrity = fileIntegrity;
        this.portManager = portManager;
    }
    /**
     * Monitor build output for a project
     */
    monitorBuildOutput(projectName, process) {
        return new Promise((resolve) => {
            const status = {
                building: true,
                success: false,
                errors: [],
                warnings: [],
                startTime: new Date()
            };
            let buildComplete = false;
            const timeout = setTimeout(() => {
                if (!buildComplete) {
                    status.building = false;
                    status.errors.push('Build timeout after 30 seconds');
                    resolve(status);
                }
            }, 30000);
            process.stdout?.on('data', (data) => {
                const output = data.toString();
                // Check for successful build
                if (output.includes('Compiled successfully') ||
                    output.includes('Built in') ||
                    output.includes('Server ready')) {
                    buildComplete = true;
                    status.success = true;
                    status.building = false;
                }
                // Check for errors
                if (output.includes('ERROR') || output.includes('Error:')) {
                    status.errors.push(output);
                }
                // Check for warnings
                if (output.includes('WARNING') || output.includes('Warning:')) {
                    status.warnings.push(output);
                }
                // Emit progress event
                this.emit('buildProgress', {
                    projectName,
                    output: output.slice(0, 200)
                });
            });
            process.stderr?.on('data', (data) => {
                const error = data.toString();
                status.errors.push(error);
                this.emit('buildError', {
                    projectName,
                    error
                });
            });
            process.on('exit', (code) => {
                clearTimeout(timeout);
                buildComplete = true;
                status.building = false;
                status.endTime = new Date();
                status.duration = status.endTime.getTime() - status.startTime.getTime();
                if (code !== 0 && !status.success) {
                    status.errors.push(`Build process exited with code ${code}`);
                }
                resolve(status);
            });
        });
    }
    /**
     * Wait for Remotion to rebuild after file changes
     */
    async waitForRebuild(projectName, timeoutMs = 10000) {
        return new Promise((resolve) => {
            const startTime = Date.now();
            let resolved = false;
            // Set timeout
            const timeout = setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    resolve({
                        building: false,
                        success: false,
                        errors: ['Rebuild timeout'],
                        warnings: [],
                        duration: Date.now() - startTime
                    });
                }
            }, timeoutMs);
            // Watch for build completion
            const checkInterval = setInterval(() => {
                const status = this.buildStatuses.get(projectName);
                if (status && !status.building) {
                    clearTimeout(timeout);
                    clearInterval(checkInterval);
                    resolved = true;
                    resolve(status);
                }
            }, 100);
        });
    }
    /**
     * Validate component after update
     */
    async validateComponent(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            // Check for basic React component structure
            if (!content.includes('export') && !content.includes('module.exports')) {
                logger.warn('Component missing exports', { filePath });
                return false;
            }
            // Check for common Remotion imports
            if (filePath.includes('Composition') || filePath.includes('Video')) {
                if (!content.includes('remotion')) {
                    logger.warn('Remotion component missing imports', { filePath });
                    return false;
                }
            }
            // Use file integrity validation
            const validation = this.fileIntegrity.validateFileSyntax(content);
            if (!validation.valid) {
                logger.error('Component validation failed', {
                    filePath,
                    errors: validation.errors
                });
                return false;
            }
            return true;
        }
        catch (error) {
            logger.error('Failed to validate component', { filePath, error });
            return false;
        }
    }
    /**
     * Apply updates to a video component
     */
    async updateVideoComponent(request) {
        const startTime = Date.now();
        logger.info('Updating video component', {
            projectName: request.projectName,
            filePath: request.filePath,
            operationCount: request.operations.length
        });
        const result = {
            success: false,
            errors: [],
            warnings: [],
            requiresRestart: false,
            hotReloaded: false
        };
        try {
            // 1. Apply file updates atomically
            const updateResult = await this.fileIntegrity.atomicFileUpdate(request.filePath, request.operations);
            if (!updateResult.success) {
                result.errors.push(updateResult.error || 'File update failed');
                return result;
            }
            // 2. Validate component if requested
            if (request.validateSyntax !== false) {
                const valid = await this.validateComponent(request.filePath);
                if (!valid) {
                    result.warnings.push('Component validation warnings detected');
                }
            }
            // 3. Check if studio is running
            const studioRunning = this.portManager.isStudioRunning(request.projectName);
            if (studioRunning) {
                // 4. Wait for hot reload
                logger.info('Waiting for hot reload', { projectName: request.projectName });
                // Mark build as starting
                this.buildStatuses.set(request.projectName, {
                    building: true,
                    success: false,
                    errors: [],
                    warnings: [],
                    startTime: new Date()
                });
                // Trigger file change notification
                this.emit('fileChanged', {
                    projectName: request.projectName,
                    filePath: request.filePath
                });
                // Wait for rebuild
                const buildStatus = await this.waitForRebuild(request.projectName, 10000);
                if (buildStatus.success) {
                    result.hotReloaded = true;
                    result.success = true;
                    result.buildTime = Date.now() - startTime;
                    logger.info('Hot reload successful', {
                        projectName: request.projectName,
                        buildTime: result.buildTime
                    });
                }
                else {
                    result.errors.push(...buildStatus.errors);
                    result.warnings.push(...buildStatus.warnings);
                    result.requiresRestart = true;
                }
                // Get port
                const studioInfo = this.portManager.getStudioInfo(request.projectName);
                result.port = studioInfo?.port;
            }
            else {
                // 5. Start studio if not running
                logger.info('Starting studio for project', { projectName: request.projectName });
                const instance = await this.portManager.startStudio(request.projectName, request.projectPath);
                result.port = instance.port;
                result.success = true;
                result.buildTime = Date.now() - startTime;
                result.requiresRestart = false;
                result.hotReloaded = false;
            }
        }
        catch (error) {
            logger.error('Failed to update component', { error });
            result.errors.push(error instanceof Error ? error.message : String(error));
            result.requiresRestart = true;
        }
        // Emit completion event
        this.emit('updateComplete', {
            projectName: request.projectName,
            result
        });
        return result;
    }
    /**
     * Batch update multiple files
     */
    async batchUpdate(requests) {
        const results = new Map();
        // Group by project
        const byProject = new Map();
        for (const request of requests) {
            const projectRequests = byProject.get(request.projectName) || [];
            projectRequests.push(request);
            byProject.set(request.projectName, projectRequests);
        }
        // Process each project
        for (const [projectName, projectRequests] of byProject) {
            logger.info('Batch updating project', {
                projectName,
                fileCount: projectRequests.length
            });
            // Apply all updates
            for (const request of projectRequests) {
                const result = await this.updateVideoComponent(request);
                results.set(request.filePath, result);
                // Stop on critical error
                if (!result.success && result.requiresRestart) {
                    logger.error('Batch update stopped due to critical error', {
                        projectName,
                        filePath: request.filePath
                    });
                    break;
                }
            }
        }
        return results;
    }
    /**
     * Start watching a project for changes
     * Note: File watching functionality requires optional chokidar dependency
     */
    startWatching(projectName, projectPath) {
        logger.info('File watching not implemented', { projectName, projectPath });
        // File watching functionality can be added with chokidar package
    }
    /**
     * Stop watching a project
     */
    stopWatching(projectName) {
        logger.info('File watching not implemented', { projectName });
    }
    /**
     * Stop all watchers
     */
    stopAllWatchers() {
        logger.info('File watching not implemented');
    }
    /**
     * Get build status for a project
     */
    getBuildStatus(projectName) {
        return this.buildStatuses.get(projectName);
    }
    /**
     * Queue an update for later processing
     */
    queueUpdate(request) {
        const queue = this.updateQueue.get(request.projectName) || [];
        queue.push(request);
        this.updateQueue.set(request.projectName, queue);
        logger.debug('Update queued', {
            projectName: request.projectName,
            queueSize: queue.length
        });
    }
    /**
     * Process queued updates for a project
     */
    async processQueue(projectName) {
        const queue = this.updateQueue.get(projectName) || [];
        if (queue.length === 0) {
            return [];
        }
        logger.info('Processing update queue', {
            projectName,
            queueSize: queue.length
        });
        const results = [];
        for (const request of queue) {
            const result = await this.updateVideoComponent(request);
            results.push(result);
            if (!result.success && result.requiresRestart) {
                break;
            }
        }
        // Clear queue
        this.updateQueue.delete(projectName);
        return results;
    }
}
exports.RealtimeUpdateService = RealtimeUpdateService;
// Export factory function
function createRealtimeUpdater(fileIntegrity, portManager) {
    return new RealtimeUpdateService(fileIntegrity, portManager);
}
//# sourceMappingURL=realtime-updater.js.map