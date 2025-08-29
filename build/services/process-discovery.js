"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessDiscovery = void 0;
const axios_1 = __importDefault(require("axios"));
const logger_js_1 = require("../utils/logger.js");
const port_manager_js_1 = require("./port-manager.js");
const logger = (0, logger_js_1.getLogger)().service('ProcessDiscovery');
class ProcessDiscovery {
    static HTTP_TIMEOUT = 2000; // 2 seconds
    static PORT_RANGE = { start: 3000, end: 3020 };
    static AVOID_PORTS = [3002]; // Known Windows service conflicts
    /**
     * Simple, reliable studio discovery using HTTP scanning only
     */
    static async discoverStudioProcesses() {
        logger.debug('Starting simple HTTP-based studio discovery...');
        try {
            // Use simple HTTP scanning - works everywhere, no dependencies
            const httpStudios = await ProcessDiscovery.scanPortsForStudios();
            // Separate Remotion studios from other servers
            const remotionStudios = [];
            const otherProcesses = [];
            for (const studio of httpStudios) {
                const isRemotionStudio = await ProcessDiscovery.isRemotionStudio(studio);
                if (isRemotionStudio) {
                    // Try to detect project information
                    const projectInfo = await ProcessDiscovery.detectProjectFromStudio(studio.port);
                    remotionStudios.push({
                        ...studio,
                        ...projectInfo
                    });
                }
                else {
                    otherProcesses.push(studio);
                }
            }
            // Get port conflicts if PortManager is available
            let conflicts = [];
            try {
                conflicts = await port_manager_js_1.PortManager.getPortsInUse();
            }
            catch (error) {
                logger.debug('Could not get port conflicts:', error);
            }
            logger.info(`Simple discovery complete: ${remotionStudios.length} Remotion studios found`);
            return {
                totalNodeProcesses: httpStudios.length,
                remotionStudios,
                otherNodeProcesses: otherProcesses,
                conflicts
            };
        }
        catch (error) {
            logger.error('Error during HTTP-based studio discovery:', error);
            throw error;
        }
    }
    /**
     * Scan ports for HTTP servers (simple and reliable)
     */
    static async scanPortsForStudios() {
        const studios = [];
        logger.debug(`Scanning ports ${ProcessDiscovery.PORT_RANGE.start}-${ProcessDiscovery.PORT_RANGE.end}`);
        for (let port = ProcessDiscovery.PORT_RANGE.start; port <= ProcessDiscovery.PORT_RANGE.end; port++) {
            if (ProcessDiscovery.AVOID_PORTS.includes(port)) {
                logger.debug(`Skipping port ${port} (known conflict)`);
                continue;
            }
            try {
                const httpTest = await ProcessDiscovery.testHttpEndpoint(port);
                if (httpTest.success) {
                    studios.push({
                        pid: 0, // HTTP-only discovery doesn't provide PID
                        port: port,
                        processName: 'http-server',
                        isResponding: true,
                        responseTime: httpTest.responseTime,
                        discoveryMethod: 'http-scan'
                    });
                    logger.debug(`Found HTTP server on port ${port} (${httpTest.responseTime}ms)`);
                }
            }
            catch (error) {
                // Port not responding - this is normal, continue
            }
        }
        logger.debug(`HTTP scan found ${studios.length} responsive servers`);
        return studios;
    }
    /**
     * Test HTTP endpoint with proper error handling
     */
    static async testHttpEndpoint(port) {
        const startTime = Date.now();
        try {
            const response = await axios_1.default.get(`http://localhost:${port}`, {
                timeout: ProcessDiscovery.HTTP_TIMEOUT,
                validateStatus: (status) => status < 500, // Accept 4xx but not 5xx
                headers: {
                    'User-Agent': 'RoughCut-MCP-Discovery'
                }
            });
            return {
                success: response.status < 400,
                responseTime: Date.now() - startTime
            };
        }
        catch (error) {
            if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
                return { success: false };
            }
            return { success: false };
        }
    }
    /**
     * Test if a server is likely a Remotion Studio
     */
    static async isRemotionStudio(studio) {
        if (!studio.isResponding)
            return false;
        try {
            const response = await axios_1.default.get(`http://localhost:${studio.port}`, {
                timeout: ProcessDiscovery.HTTP_TIMEOUT,
                validateStatus: () => true // Accept any status for content analysis
            });
            const content = String(response.data).toLowerCase();
            // Look for Remotion indicators
            const remotionIndicators = [
                'remotion',
                'webpack',
                '__webpack',
                'react',
                'composition'
            ];
            const isRemotionStudio = remotionIndicators.some(indicator => content.includes(indicator));
            if (isRemotionStudio) {
                logger.debug(`Port ${studio.port} identified as Remotion Studio`);
            }
            return isRemotionStudio;
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Detect project information from a running studio
     */
    static async detectProjectFromStudio(port) {
        try {
            const response = await axios_1.default.get(`http://localhost:${port}`, {
                timeout: ProcessDiscovery.HTTP_TIMEOUT,
                validateStatus: () => true
            });
            const content = String(response.data);
            // Extract project name from title
            const titleMatch = content.match(/<title[^>]*>([^<]*)</i);
            if (titleMatch && titleMatch[1]) {
                const title = titleMatch[1];
                if (title.includes(' - ')) {
                    const parts = title.split(' - ');
                    if (parts.length > 1) {
                        const projectName = parts[1].trim();
                        logger.debug(`Detected project name from title: ${projectName}`);
                        return { projectName };
                    }
                }
            }
            // Look for composition names in the content
            const compositionMatch = content.match(/composition[^"']*["']([^"']+)["']/i);
            if (compositionMatch && compositionMatch[1]) {
                const projectName = compositionMatch[1];
                logger.debug(`Detected project name from composition: ${projectName}`);
                return { projectName };
            }
            return {};
        }
        catch (error) {
            logger.debug(`Error detecting project for port ${port}:`, error);
            return {};
        }
    }
    /**
     * Get all active Remotion Studio processes (main interface)
     */
    static async getActiveStudios() {
        logger.debug('getActiveStudios called - starting discovery');
        const discovery = await ProcessDiscovery.discoverStudioProcesses();
        logger.debug(`getActiveStudios returning ${discovery.remotionStudios.length} studios`);
        return discovery.remotionStudios;
    }
    /**
     * Get a specific studio process by port
     */
    static async getStudioByPort(port) {
        const discovery = await ProcessDiscovery.discoverStudioProcesses();
        return discovery.remotionStudios.find(studio => studio.port === port) || null;
    }
    /**
     * Check if a specific PID is still running (simplified)
     */
    static async isProcessRunning(pid) {
        if (pid === 0)
            return false; // HTTP-only discovery doesn't have real PID
        try {
            // Simple process.kill test
            process.kill(pid, 0);
            return true;
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Get comprehensive discovery report
     */
    static async getDiscoveryReport() {
        const discovery = await ProcessDiscovery.discoverStudioProcesses();
        let report = `\n=== SIMPLE HTTP STUDIO DISCOVERY REPORT ===\n`;
        report += `Total HTTP servers: ${discovery.totalNodeProcesses}\n`;
        report += `Remotion Studios: ${discovery.remotionStudios.length}\n`;
        report += `Other HTTP servers: ${discovery.otherNodeProcesses.length}\n\n`;
        if (discovery.remotionStudios.length > 0) {
            report += `=== REMOTION STUDIOS ===\n`;
            for (const studio of discovery.remotionStudios) {
                report += `Port ${studio.port}: ${studio.projectName || 'Unknown Project'}`;
                if (studio.responseTime) {
                    report += ` (${studio.responseTime}ms)`;
                }
                report += `\n`;
            }
            report += `\n`;
        }
        report += `=========================================\n`;
        return report;
    }
}
exports.ProcessDiscovery = ProcessDiscovery;
//# sourceMappingURL=process-discovery.js.map