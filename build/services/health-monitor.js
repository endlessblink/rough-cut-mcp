"use strict";
/**
 * Health Monitoring Service for Rough Cut MCP
 * Monitors system health, external services, and provides diagnostics
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthMonitor = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const logger_js_1 = require("../utils/logger.js");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class HealthMonitor {
    config;
    logger = (0, logger_js_1.getLogger)().service('HealthMonitor');
    healthHistory = [];
    maxHistorySize = 100;
    constructor(config) {
        this.config = config;
    }
    /**
     * Perform comprehensive health check
     */
    async performHealthCheck() {
        const startTime = Date.now();
        const issues = [];
        const services = [];
        try {
            this.logger.info('Starting health check');
            // Check filesystem health
            await this.checkFilesystem(issues);
            // Check system resources
            await this.checkSystemResources(issues);
            // Check Node.js and dependencies
            await this.checkDependencies(issues);
            // Check external services
            await this.checkExternalServices(services);
            // Check Remotion availability
            await this.checkRemotionHealth(issues);
            // Calculate overall health score
            const score = this.calculateHealthScore(issues, services);
            const status = this.determineOverallStatus(score, issues);
            const healthStatus = {
                status,
                score,
                lastChecked: new Date(),
                issues,
                services
            };
            // Store in history
            this.addToHistory(healthStatus);
            this.logger.info(`Health check completed in ${Date.now() - startTime}ms`, {
                status,
                score,
                issuesCount: issues.length,
                servicesCount: services.length
            });
            return healthStatus;
        }
        catch (error) {
            this.logger.error('Health check failed', { error });
            const criticalIssue = {
                severity: 'critical',
                component: 'health-monitor',
                message: `Health check system failure: ${error instanceof Error ? error.message : String(error)}`,
                timestamp: new Date()
            };
            return {
                status: 'unhealthy',
                score: 0,
                lastChecked: new Date(),
                issues: [criticalIssue],
                services: []
            };
        }
    }
    /**
     * Check filesystem health
     */
    async checkFilesystem(issues) {
        try {
            // Check if main directories exist and are writable
            const directories = [
                this.config.assetsDir,
                path.join(this.config.assetsDir, 'projects'),
                path.join(this.config.assetsDir, 'videos'),
                path.join(this.config.assetsDir, 'temp')
            ];
            for (const dir of directories) {
                try {
                    await fs_extra_1.default.ensureDir(dir);
                    // Test write access
                    const testFile = path.join(dir, '.health-check-test');
                    await fs_extra_1.default.writeFile(testFile, 'test');
                    await fs_extra_1.default.remove(testFile);
                }
                catch (error) {
                    issues.push({
                        severity: 'error',
                        component: 'filesystem',
                        message: `Cannot access directory: ${dir}`,
                        suggestion: `Check permissions and disk space for ${dir}`,
                        timestamp: new Date()
                    });
                }
            }
            // Check disk space
            try {
                const stats = await fs_extra_1.default.stat(this.config.assetsDir);
                // This is a simplified check - in production you'd want more detailed disk space checking
                this.logger.debug('Filesystem check completed');
            }
            catch (error) {
                issues.push({
                    severity: 'warning',
                    component: 'filesystem',
                    message: 'Could not check disk space',
                    suggestion: 'Manually verify sufficient disk space is available',
                    timestamp: new Date()
                });
            }
        }
        catch (error) {
            issues.push({
                severity: 'error',
                component: 'filesystem',
                message: 'Filesystem health check failed',
                suggestion: 'Check file system permissions and disk space',
                timestamp: new Date()
            });
        }
    }
    /**
     * Check system resources
     */
    async checkSystemResources(issues) {
        try {
            // Check memory usage
            const memUsage = process.memoryUsage();
            const memUsedMB = memUsage.heapUsed / 1024 / 1024;
            if (memUsedMB > 500) { // More than 500MB
                issues.push({
                    severity: 'warning',
                    component: 'memory',
                    message: `High memory usage: ${Math.round(memUsedMB)}MB`,
                    suggestion: 'Consider restarting the MCP server if memory usage continues to grow',
                    timestamp: new Date()
                });
            }
            // Check Node.js version
            const nodeVersion = process.version;
            const majorVersion = parseInt(nodeVersion.substring(1).split('.')[0]);
            if (majorVersion < 18) {
                issues.push({
                    severity: 'error',
                    component: 'nodejs',
                    message: `Node.js version ${nodeVersion} is too old (minimum: v18)`,
                    suggestion: 'Update Node.js to version 18 or higher',
                    timestamp: new Date()
                });
            }
        }
        catch (error) {
            issues.push({
                severity: 'warning',
                component: 'system',
                message: 'Could not check system resources',
                timestamp: new Date()
            });
        }
    }
    /**
     * Check Node.js dependencies
     */
    async checkDependencies(issues) {
        try {
            // Check critical dependencies
            const criticalDeps = [
                '@modelcontextprotocol/sdk',
                '@remotion/cli',
                'fs-extra'
            ];
            for (const dep of criticalDeps) {
                try {
                    require.resolve(dep);
                }
                catch (error) {
                    issues.push({
                        severity: 'critical',
                        component: 'dependencies',
                        message: `Critical dependency missing: ${dep}`,
                        suggestion: `Run: npm install ${dep}`,
                        timestamp: new Date()
                    });
                }
            }
        }
        catch (error) {
            issues.push({
                severity: 'error',
                component: 'dependencies',
                message: 'Dependency check failed',
                suggestion: 'Run: npm install',
                timestamp: new Date()
            });
        }
    }
    /**
     * Check external services
     */
    async checkExternalServices(services) {
        // ElevenLabs API
        if (this.config.apiKeys.elevenlabs) {
            const elevenLabsHealth = await this.checkService('ElevenLabs', 'https://api.elevenlabs.io/v1/voices', { 'xi-api-key': this.config.apiKeys.elevenlabs });
            services.push(elevenLabsHealth);
        }
        // Freesound API  
        if (this.config.apiKeys.freesound) {
            const freesoundHealth = await this.checkService('Freesound', 'https://freesound.org/apiv2/search/text/?query=test&token=' + this.config.apiKeys.freesound);
            services.push(freesoundHealth);
        }
        // Flux AI API
        if (this.config.apiKeys.flux) {
            const fluxHealth = await this.checkService('Flux AI', 'https://api.flux.ai/v1/models', // This might not be the real endpoint
            { 'Authorization': `Bearer ${this.config.apiKeys.flux}` });
            services.push(fluxHealth);
        }
    }
    /**
     * Check a single external service
     */
    async checkService(name, url, headers) {
        const startTime = Date.now();
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: headers || {},
                signal: AbortSignal.timeout(5000) // 5 second timeout
            });
            const responseTime = Date.now() - startTime;
            return {
                name,
                status: response.ok ? 'up' : 'degraded',
                responseTime,
                lastChecked: new Date(),
                error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`
            };
        }
        catch (error) {
            return {
                name,
                status: 'down',
                responseTime: Date.now() - startTime,
                lastChecked: new Date(),
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }
    /**
     * Check Remotion health
     */
    async checkRemotionHealth(issues) {
        try {
            // Check if Remotion CLI is available
            const { stdout } = await execAsync('npx remotion --version', {
                timeout: 10000,
                cwd: this.config.assetsDir
            });
            if (!stdout.includes('remotion')) {
                issues.push({
                    severity: 'error',
                    component: 'remotion',
                    message: 'Remotion CLI not available',
                    suggestion: 'Run: npm install @remotion/cli',
                    timestamp: new Date()
                });
            }
        }
        catch (error) {
            issues.push({
                severity: 'warning',
                component: 'remotion',
                message: 'Could not verify Remotion installation',
                suggestion: 'Ensure @remotion/cli is installed: npm install @remotion/cli',
                timestamp: new Date()
            });
        }
    }
    /**
     * Calculate overall health score (0-100)
     */
    calculateHealthScore(issues, services) {
        let score = 100;
        // Deduct points for issues
        for (const issue of issues) {
            switch (issue.severity) {
                case 'critical':
                    score -= 25;
                    break;
                case 'error':
                    score -= 15;
                    break;
                case 'warning':
                    score -= 5;
                    break;
                case 'info':
                    score -= 1;
                    break;
            }
        }
        // Deduct points for service issues
        for (const service of services) {
            switch (service.status) {
                case 'down':
                    score -= 10;
                    break;
                case 'degraded':
                    score -= 5;
                    break;
                case 'unknown':
                    score -= 2;
                    break;
            }
        }
        return Math.max(0, Math.min(100, score));
    }
    /**
     * Determine overall status from score and issues
     */
    determineOverallStatus(score, issues) {
        // Check for critical issues first
        const hasCritical = issues.some(issue => issue.severity === 'critical');
        if (hasCritical) {
            return 'unhealthy';
        }
        // Use score thresholds
        if (score >= 80) {
            return 'healthy';
        }
        else if (score >= 50) {
            return 'degraded';
        }
        else {
            return 'unhealthy';
        }
    }
    /**
     * Add health status to history
     */
    addToHistory(status) {
        this.healthHistory.unshift(status);
        // Trim history to max size
        if (this.healthHistory.length > this.maxHistorySize) {
            this.healthHistory = this.healthHistory.slice(0, this.maxHistorySize);
        }
    }
    /**
     * Get health history
     */
    getHealthHistory(limit) {
        return limit
            ? this.healthHistory.slice(0, limit)
            : [...this.healthHistory];
    }
    /**
     * Get latest health status
     */
    getLatestHealth() {
        return this.healthHistory[0] || null;
    }
    /**
     * Get health trends
     */
    getHealthTrends() {
        if (this.healthHistory.length < 2) {
            return {
                averageScore: this.healthHistory[0]?.score || 0,
                trend: 'stable',
                commonIssues: []
            };
        }
        // Calculate average score
        const averageScore = this.healthHistory.reduce((sum, status) => sum + status.score, 0) / this.healthHistory.length;
        // Determine trend (compare recent vs older scores)
        const recent = this.healthHistory.slice(0, Math.min(5, Math.floor(this.healthHistory.length / 2)));
        const older = this.healthHistory.slice(-Math.min(5, Math.floor(this.healthHistory.length / 2)));
        const recentAvg = recent.reduce((sum, status) => sum + status.score, 0) / recent.length;
        const olderAvg = older.reduce((sum, status) => sum + status.score, 0) / older.length;
        let trend;
        const diff = recentAvg - olderAvg;
        if (diff > 5) {
            trend = 'improving';
        }
        else if (diff < -5) {
            trend = 'declining';
        }
        else {
            trend = 'stable';
        }
        // Find common issues
        const issueMap = new Map();
        for (const status of this.healthHistory) {
            for (const issue of status.issues) {
                const key = `${issue.component}:${issue.severity}`;
                issueMap.set(key, (issueMap.get(key) || 0) + 1);
            }
        }
        const commonIssues = Array.from(issueMap.entries())
            .map(([key, count]) => ({ component: key, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        return {
            averageScore: Math.round(averageScore),
            trend,
            commonIssues
        };
    }
}
exports.HealthMonitor = HealthMonitor;
//# sourceMappingURL=health-monitor.js.map