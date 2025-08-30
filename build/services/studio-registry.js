"use strict";
/**
 * Studio Registry Service
 * Manages persistent tracking of Remotion Studio instances
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudioRegistry = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const logger_js_1 = require("../utils/logger.js");
const network_utils_js_1 = require("../utils/network-utils.js");
const studio_discovery_js_1 = require("./studio-discovery.js");
const port_validator_js_1 = require("./port-validator.js");
const port_manager_js_1 = require("./port-manager.js");
const process_discovery_js_1 = require("./process-discovery.js");
const studio_lifecycle_js_1 = require("./studio-lifecycle.js");
const axios_1 = __importDefault(require("axios"));
/**
 * Get real Remotion Studio child process PID
 * Fixes the "PID: 0" issue by finding actual child process
 */
async function getRealStudioPID(parentPid) {
    try {
        const { exec } = require('child_process');
        return new Promise((resolve) => {
            // Use modern tasklist instead of deprecated WMIC  
            exec('tasklist /fo csv | findstr /i "remotion"', (error, stdout) => {
                if (error) {
                    resolve(parentPid); // Fallback to parent PID
                    return;
                }
                // Parse CSV to find Remotion process PID
                const lines = stdout.split('\n').filter((line) => line.includes('node.exe') && line.includes('remotion'));
                if (lines.length > 0) {
                    // Extract PID: "node.exe","1234","Console"...
                    const match = lines[0].match(/"[^"]*","(\d+)"/);
                    if (match) {
                        const realPid = parseInt(match[1], 10);
                        resolve(realPid);
                        return;
                    }
                }
                resolve(parentPid); // Fallback
            });
        });
    }
    catch (error) {
        return parentPid;
    }
}
class StudioRegistry {
    instances;
    registryFile;
    logger = (0, logger_js_1.getLogger)().service('StudioRegistry');
    config;
    portRange = { min: 3002, max: 3100 }; // Exclude 3001
    discoveryService;
    portValidator;
    lastDiscoveryTime = new Date(0);
    discoveryCache = new Map();
    constructor(config) {
        this.config = config;
        this.instances = new Map();
        this.registryFile = path_1.default.join(config.assetsDir, '.studio-registry.json');
        this.discoveryService = new studio_discovery_js_1.StudioDiscoveryService();
        this.portValidator = new port_validator_js_1.PortValidator();
        // Initialize registry with discovery
        this.initializeRegistry();
    }
    /**
     * Initialize registry with enhanced process discovery
     */
    async initializeRegistry() {
        try {
            // Step 1: Load saved registry
            await this.loadRegistry();
            // Step 2: Use enhanced process discovery to find actual studios
            await this.discoverAndAdoptStudiosEnhanced();
            // Step 3: Clean up dead instances
            await this.cleanupDeadInstances();
            this.logger.info('Registry initialized with enhanced discovery', {
                trackedInstances: this.instances.size,
                registryFile: this.registryFile
            });
        }
        catch (error) {
            this.logger.error('Failed to initialize registry', { error });
        }
    }
    /**
     * Load registry from persistent storage
     */
    async loadRegistry() {
        try {
            if (await fs_extra_1.default.pathExists(this.registryFile)) {
                const data = await fs_extra_1.default.readJson(this.registryFile);
                for (const instance of data.instances || []) {
                    // Check if process is still alive
                    if (this.isProcessAlive(instance.pid)) {
                        this.instances.set(instance.port, instance);
                    }
                }
                this.logger.debug(`Loaded ${this.instances.size} studio instances from registry`);
            }
        }
        catch (error) {
            this.logger.warn('Failed to load studio registry', { error });
        }
    }
    /**
     * Enhanced discovery using ProcessDiscovery service
     */
    async discoverAndAdoptStudiosEnhanced() {
        try {
            // Use the new ProcessDiscovery service for accurate studio detection
            const processDiscovery = await process_discovery_js_1.ProcessDiscovery.discoverStudioProcesses();
            let adopted = 0;
            for (const studio of processDiscovery.remotionStudios) {
                // Only adopt responding studios not already tracked
                if (studio.isResponding && !this.instances.has(studio.port)) {
                    // Convert to DiscoveredStudio format for compatibility
                    const discoveredStudio = {
                        port: studio.port,
                        pid: studio.pid,
                        project: studio.projectName || 'unknown',
                        projectPath: studio.projectPath,
                        isHealthy: studio.isResponding,
                        url: `http://localhost:${studio.port}`,
                        uptime: Date.now() - (studio.startupTime?.getTime() || Date.now()),
                        lastSeen: new Date(),
                        responseTime: studio.responseTime || 0,
                        version: 'unknown'
                    };
                    await this.adoptExistingStudio(discoveredStudio);
                    adopted++;
                }
            }
            this.logger.info('Enhanced discovery and adoption completed', {
                totalNodeProcesses: processDiscovery.totalNodeProcesses,
                remotionStudios: processDiscovery.remotionStudios.length,
                responding: processDiscovery.remotionStudios.filter(s => s.isResponding).length,
                adopted,
                conflicts: processDiscovery.conflicts.length
            });
            // Log any port conflicts found
            if (processDiscovery.conflicts.length > 0) {
                this.logger.warn('Port conflicts detected', {
                    conflicts: processDiscovery.conflicts.map(c => ({
                        port: c.port,
                        process: c.processName,
                        isSystemService: c.isSystemService
                    }))
                });
            }
        }
        catch (error) {
            this.logger.warn('Failed to discover and adopt studios with enhanced discovery', { error });
            // Fallback to original discovery method
            await this.discoverAndAdoptStudiosLegacy();
        }
    }
    /**
     * Legacy discovery method as fallback
     */
    async discoverAndAdoptStudiosLegacy() {
        try {
            const discoveredStudios = await this.discoveryService.discoverRunningStudios();
            for (const discovered of discoveredStudios) {
                // Only adopt healthy studios not already tracked
                if (discovered.isHealthy && !this.instances.has(discovered.port)) {
                    await this.adoptExistingStudio(discovered);
                }
            }
            this.logger.info('Legacy discovery and adoption completed', {
                discovered: discoveredStudios.length,
                healthy: discoveredStudios.filter(s => s.isHealthy).length,
                adopted: discoveredStudios.filter(s => s.isHealthy && !this.instances.has(s.port)).length
            });
        }
        catch (error) {
            this.logger.warn('Failed to discover and adopt studios', { error });
        }
    }
    /**
     * Save registry to persistent storage
     */
    async saveRegistry() {
        try {
            const data = {
                lastUpdated: new Date().toISOString(),
                instances: Array.from(this.instances.values()).map(inst => ({
                    pid: inst.pid,
                    port: inst.port,
                    projectPath: inst.projectPath,
                    projectName: inst.projectName,
                    startTime: inst.startTime,
                    status: inst.status,
                    url: inst.url
                }))
            };
            await fs_extra_1.default.writeJson(this.registryFile, data, { spaces: 2 });
            this.logger.debug('Studio registry saved');
        }
        catch (error) {
            this.logger.error('Failed to save studio registry', { error });
        }
    }
    /**
     * Check if a process is still alive
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
     * Enhanced cleanup using process discovery
     */
    async cleanupDeadInstances() {
        const deadPorts = [];
        for (const [port, instance] of this.instances) {
            // Use ProcessDiscovery for more accurate process validation
            const isAlive = await process_discovery_js_1.ProcessDiscovery.isProcessRunning(instance.pid);
            if (!isAlive) {
                deadPorts.push(port);
                this.logger.info(`Removing dead studio instance on port ${port} (PID: ${instance.pid})`);
            }
        }
        for (const port of deadPorts) {
            this.instances.delete(port);
        }
        if (deadPorts.length > 0) {
            await this.saveRegistry();
            this.logger.info(`Cleaned up ${deadPorts.length} dead instances`);
        }
    }
    /**
     * Find an available port using enhanced PortManager
     */
    async findAvailablePort() {
        try {
            // Use the new PortManager for intelligent port allocation
            const portResult = await port_manager_js_1.PortManager.findAvailablePort();
            if (portResult.available) {
                return portResult.port;
            }
            else if (portResult.conflictDetails) {
                // Log the conflict and try to find another port
                this.logger.warn('Port conflict detected', {
                    port: portResult.port,
                    conflictProcess: portResult.conflictDetails.processName,
                    isSystemService: portResult.conflictDetails.isSystemService
                });
                // Find any available port in safe range
                const fallbackResult = await port_manager_js_1.PortManager.findAvailablePort();
                if (fallbackResult.available) {
                    return fallbackResult.port;
                }
            }
            throw new Error('No available ports found in safe range');
        }
        catch (error) {
            this.logger.error('Enhanced port finding failed, using fallback', { error });
            // Fallback to original method
            return this.findAvailablePortLegacy();
        }
    }
    /**
     * Legacy port finding method as fallback
     */
    async findAvailablePortLegacy() {
        const net = await import('net');
        for (let port = this.portRange.min; port <= this.portRange.max; port++) {
            // Skip port 3001 (reserved/excluded)
            if (port === 3001)
                continue;
            // Check if port is already in use by our instances
            if (this.instances.has(port))
                continue;
            // Check if port is available on the system
            const isAvailable = await new Promise((resolve) => {
                const server = net.createServer();
                server.once('error', () => resolve(false));
                server.once('listening', () => {
                    server.close();
                    resolve(true);
                });
                server.listen(port);
            });
            if (isAvailable) {
                return port;
            }
        }
        throw new Error(`No available ports in range ${this.portRange.min}-${this.portRange.max}`);
    }
    /**
     * Find existing studio serving a specific project
     */
    async findStudioByProject(projectName) {
        if (!projectName)
            return null;
        try {
            // Use ProcessDiscovery to scan all active studios
            const activeStudios = await process_discovery_js_1.ProcessDiscovery.getActiveStudios();
            for (const studio of activeStudios) {
                if (studio.isResponding) {
                    // Test if this studio serves the specific project
                    const isMatchingProject = await this.testStudioForProject(studio.port, projectName);
                    if (isMatchingProject) {
                        this.logger.info('Found existing studio for project', {
                            project: projectName,
                            port: studio.port,
                            pid: studio.pid
                        });
                        // Convert to StudioInstance format
                        return this.convertStudioProcessToInstance(studio, projectName);
                    }
                }
            }
            this.logger.debug('No existing studio found for project', { project: projectName });
            return null;
        }
        catch (error) {
            this.logger.error('Error finding studio by project', { project: projectName, error });
            return null;
        }
    }
    /**
     * Create flexible project name patterns for matching
     */
    createProjectPatterns(projectName) {
        const lower = projectName.toLowerCase();
        const patterns = [
            lower, // exact match
            lower.replace(/[-_\s]/g, ''), // remove all separators
            lower.replace(/[-_]/g, ' '), // spaces instead of separators
            `"${lower}"`, // quoted versions
            `'${lower}'`,
            ...lower.split(/[-_\s]+/), // individual words
            // Reverse word order (e.g., "matrix-endlessblink" vs "endlessblink-matrix")
            lower.split(/[-_\s]+/).reverse().join(''),
            lower.split(/[-_\s]+/).reverse().join(' ')
        ].filter(Boolean);
        // Remove duplicates
        return [...new Set(patterns)];
    }
    /**
     * Test if a studio on a specific port serves a given project (cross-platform)
     */
    async testStudioForProject(port, projectName) {
        try {
            const patterns = this.createProjectPatterns(projectName);
            // Test multiple endpoints that Remotion Studio serves
            const endpoints = [
                `http://localhost:${port}`,
                `http://localhost:${port}/api/compositions`,
                `http://localhost:${port}/${projectName}`
            ];
            for (const endpoint of endpoints) {
                try {
                    const response = await axios_1.default.get(endpoint, {
                        timeout: 3000,
                        validateStatus: () => true, // Accept any status for content analysis
                        headers: {
                            'User-Agent': 'RoughCut-MCP-Discovery'
                        }
                    });
                    if (response.status < 500) {
                        const content = String(response.data).toLowerCase();
                        // Check if any pattern matches the response content
                        for (const pattern of patterns) {
                            if (content.includes(pattern)) {
                                this.logger.debug('Project match found in response', {
                                    port,
                                    projectName,
                                    endpoint,
                                    matchedPattern: pattern
                                });
                                return true;
                            }
                        }
                    }
                }
                catch (endpointError) {
                    // Continue to next endpoint
                    continue;
                }
            }
            return false;
        }
        catch (error) {
            this.logger.debug('Error testing studio for project', { port, projectName, error });
            return false;
        }
    }
    /**
     * Convert StudioProcess to StudioInstance format
     */
    convertStudioProcessToInstance(studio, projectName) {
        const networkUrls = (0, network_utils_js_1.buildNetworkUrls)(studio.port);
        return {
            pid: studio.pid,
            port: studio.port,
            projectPath: studio.projectPath || path_1.default.join(this.config.assetsDir, 'projects', projectName),
            projectName: projectName,
            startTime: studio.startupTime?.getTime() || Date.now(),
            status: 'running',
            url: networkUrls.primary,
            urls: networkUrls
        };
    }
    /**
     * Enhanced smart studio launch with robust lifecycle management
     * This is the main method that solves the MCP reuse problem
     */
    async smartLaunchStudio(projectPath, projectName, requestedPort, forceNewPort) {
        this.logger.info('Enhanced smart studio launch requested', {
            projectPath,
            projectName,
            requestedPort,
            forceNewPort
        });
        try {
            // CRITICAL: If user requests specific port, HONOR IT - don't reuse existing
            if (forceNewPort || requestedPort) {
                this.logger.info('User requested specific port or forced new instance - skipping reuse', {
                    requestedPort,
                    forceNewPort
                });
                // CRITICAL FIX: Stop existing studio on requested port first
                if (requestedPort && this.instances.has(requestedPort)) {
                    this.logger.info('Stopping existing studio on requested port', { port: requestedPort });
                    await this.stopStudio(requestedPort);
                }
                // Launch new instance on requested port
                const newInstance = await this.launchStudioWithLifecycle(projectPath, projectName, requestedPort);
                return { ...newInstance, wasReused: false };
            }
            // Step 1: FIRST - Try to find existing studio for this specific project (only if not forced)
            if (projectName) {
                const existingStudio = await this.findStudioByProject(projectName);
                if (existingStudio) {
                    this.logger.info('Found and reusing existing studio for project', {
                        project: projectName,
                        port: existingStudio.port,
                        pid: existingStudio.pid
                    });
                    // Adopt into registry if not already tracked
                    if (!this.instances.has(existingStudio.port)) {
                        this.instances.set(existingStudio.port, existingStudio);
                        await this.saveRegistry();
                    }
                    return { ...existingStudio, wasReused: true };
                }
            }
            // Step 2: Look for any healthy studio that could be reused (fallback)
            const activeStudios = await process_discovery_js_1.ProcessDiscovery.getActiveStudios();
            const healthyStudio = activeStudios.find(studio => studio.isResponding);
            if (healthyStudio && !projectName) {
                this.logger.info('Found existing healthy studio for general reuse', {
                    port: healthyStudio.port,
                    pid: healthyStudio.pid
                });
                // Convert and adopt if not tracked
                const instance = this.convertStudioProcessToInstance(healthyStudio, 'reused-studio');
                if (!this.instances.has(healthyStudio.port)) {
                    this.instances.set(healthyStudio.port, instance);
                    await this.saveRegistry();
                }
                return { ...instance, wasReused: true };
            }
            // Step 3: No existing studio found, launch new one using robust lifecycle
            this.logger.info('No suitable existing studio found - launching new studio with enhanced lifecycle');
            const newInstance = await this.launchStudioWithLifecycle(projectPath, projectName, requestedPort);
            return { ...newInstance, wasReused: false };
        }
        catch (error) {
            this.logger.error('Enhanced smart studio launch failed', { error });
            throw error;
        }
    }
    /**
     * Adopt an existing discovered studio into the registry
     */
    async adoptExistingStudio(discovered) {
        try {
            this.logger.info('Adopting existing studio', {
                port: discovered.port,
                pid: discovered.pid,
                project: discovered.project
            });
            // Check for conflicts
            const conflicts = [];
            if (this.instances.has(discovered.port)) {
                conflicts.push(`Port ${discovered.port} already tracked in registry`);
            }
            if (conflicts.length > 0) {
                this.logger.warn('Cannot adopt studio due to conflicts', { conflicts });
                return {
                    success: false,
                    conflicts,
                    error: 'Registry conflicts prevent adoption'
                };
            }
            // Build network URLs
            const networkUrls = (0, network_utils_js_1.buildNetworkUrls)(discovered.port);
            // Create studio instance from discovered info
            const instance = {
                pid: discovered.pid,
                port: discovered.port,
                projectPath: discovered.projectPath || this.config.assetsDir,
                projectName: discovered.project || 'adopted-studio',
                startTime: Date.now() - discovered.uptime,
                status: 'running',
                url: networkUrls.primary,
                urls: networkUrls,
                // Note: No process object since we didn't spawn it
                process: undefined
            };
            // Add to registry
            this.instances.set(discovered.port, instance);
            await this.saveRegistry();
            this.logger.info('Studio adopted successfully', {
                port: discovered.port,
                project: instance.projectName,
                uptime: Math.round(discovered.uptime / 1000) + 's'
            });
            return {
                success: true,
                adoptedStudio: discovered
            };
        }
        catch (error) {
            this.logger.error('Failed to adopt studio', {
                port: discovered.port,
                error
            });
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown adoption error'
            };
        }
    }
    /**
     * Launch studio using enhanced lifecycle management
     */
    async launchStudioWithLifecycle(projectPath, projectName, requestedPort) {
        try {
            // Use the new StudioLifecycle service for robust startup
            // CRITICAL: Force new instance when user specifies port
            const launchResult = await studio_lifecycle_js_1.StudioLifecycle.launchStudio({
                projectPath,
                preferredPort: requestedPort,
                forceNewInstance: !!requestedPort, // Force new when port requested
                timeout: 60000,
                validate: true
            });
            if (!launchResult.success) {
                throw new Error(launchResult.error || 'Studio launch failed');
            }
            // Convert lifecycle result to StudioInstance
            const networkUrls = (0, network_utils_js_1.buildNetworkUrls)(launchResult.port);
            const instance = {
                pid: launchResult.pid,
                port: launchResult.port,
                projectPath: launchResult.projectPath || projectPath,
                projectName: projectName || path_1.default.basename(projectPath),
                startTime: Date.now(),
                status: 'running',
                url: networkUrls.primary,
                urls: networkUrls
            };
            // Store in registry
            this.instances.set(launchResult.port, instance);
            await this.saveRegistry();
            this.logger.info('Studio launched successfully with enhanced lifecycle', {
                port: launchResult.port,
                pid: launchResult.pid,
                project: projectName || path_1.default.basename(projectPath),
                reusedExisting: launchResult.reusedExisting,
                warnings: launchResult.warnings
            });
            return instance;
        }
        catch (error) {
            this.logger.error('Enhanced studio launch failed', { error });
            // Fallback to legacy launch method
            return this.launchStudioLegacy(projectPath, projectName, requestedPort);
        }
    }
    /**
     * Legacy studio launch method as fallback
     */
    async launchStudioLegacy(projectPath, projectName, requestedPort) {
        try {
            // Ensure project path exists
            if (!await fs_extra_1.default.pathExists(projectPath)) {
                throw new Error(`Project path does not exist: ${projectPath}`);
            }
            // Check if package.json exists
            const packageJsonPath = path_1.default.join(projectPath, 'package.json');
            if (!await fs_extra_1.default.pathExists(packageJsonPath)) {
                throw new Error(`No package.json found in project: ${projectPath}`);
            }
            // CRITICAL FIX: Always honor user-requested port, don't check instances
            const port = requestedPort || await this.findAvailablePort();
            // Launch Remotion Studio with Windows-compatible command (research-backed fix)
            const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
            const studioProcess = (0, child_process_1.spawn)(command, ['remotion', 'studio', '--port', String(port)], {
                cwd: projectPath,
                shell: true,
                detached: process.platform !== 'win32',
                stdio: 'ignore',
                env: {
                    ...process.env,
                    PATH: process.env.PATH + ';C:\\Program Files\\nodejs' // Ensure Node.js in PATH
                }
            });
            // Build network URLs for remote access
            const networkUrls = (0, network_utils_js_1.buildNetworkUrls)(port);
            // Get real child process PID (fixes PID: 0 issue)
            const realPid = await getRealStudioPID(studioProcess.pid || 0);
            // Create instance record
            const instance = {
                pid: realPid,
                port,
                projectPath,
                projectName: projectName || path_1.default.basename(projectPath),
                startTime: Date.now(),
                status: 'starting',
                url: networkUrls.primary,
                urls: networkUrls,
                process: studioProcess
            };
            // Store instance
            this.instances.set(port, instance);
            // Update status after a delay
            setTimeout(() => {
                if (this.isProcessAlive(instance.pid)) {
                    instance.status = 'running';
                    this.saveRegistry();
                }
                else {
                    instance.status = 'error';
                    this.instances.delete(port);
                    this.saveRegistry();
                }
            }, 3000);
            // Save registry immediately
            await this.saveRegistry();
            this.logger.info('Studio launched', {
                port,
                pid: instance.pid,
                project: projectName || path_1.default.basename(projectPath),
                urls: {
                    local: networkUrls.local,
                    network: networkUrls.network,
                    primary: networkUrls.primary
                }
            });
            return instance;
        }
        catch (error) {
            this.logger.error('Failed to launch studio', { error });
            throw error;
        }
    }
    /**
     * Stop studio instance using enhanced lifecycle management
     */
    async stopStudio(port) {
        const instance = this.instances.get(port);
        if (!instance) {
            this.logger.warn(`No studio instance found on port ${port}`);
            return false;
        }
        try {
            // Use enhanced lifecycle management for shutdown
            const shutdownResult = await studio_lifecycle_js_1.StudioLifecycle.shutdownStudios({
                port,
                force: false
            });
            if (shutdownResult.success && shutdownResult.killedProcesses.length > 0) {
                // Remove from registry
                this.instances.delete(port);
                await this.saveRegistry();
                this.logger.info(`Enhanced shutdown completed for studio on port ${port}`, {
                    killedProcesses: shutdownResult.killedProcesses
                });
                return true;
            }
            else {
                // If enhanced shutdown failed, try legacy method
                return this.stopStudioLegacy(port, instance);
            }
        }
        catch (error) {
            this.logger.error(`Enhanced studio shutdown failed for port ${port}`, { error });
            // Fallback to legacy shutdown
            return this.stopStudioLegacy(port, instance);
        }
    }
    /**
     * Legacy studio shutdown method
     */
    async stopStudioLegacy(port, instance) {
        try {
            // Try to kill the process using PortManager
            const killSuccess = await port_manager_js_1.PortManager.killProcess(instance.pid, false);
            // Remove from registry regardless of kill success
            this.instances.delete(port);
            await this.saveRegistry();
            if (killSuccess) {
                this.logger.info(`Legacy shutdown successful for studio on port ${port}`);
                return true;
            }
            else {
                this.logger.warn(`Process kill failed but removed from registry: port ${port}`);
                return false;
            }
        }
        catch (error) {
            this.logger.error(`Legacy studio shutdown failed for port ${port}`, { error });
            // Force remove from registry even if kill failed
            this.instances.delete(port);
            await this.saveRegistry();
            return false;
        }
    }
    /**
     * Get all running instances
     */
    getInstances() {
        // Update status and clean up dead instances first
        this.cleanupDeadInstances();
        return Array.from(this.instances.values())
            .filter(inst => this.isProcessAlive(inst.pid))
            .map(inst => {
            // Rebuild network URLs for current network state
            const urls = (0, network_utils_js_1.buildNetworkUrls)(inst.port);
            return {
                ...inst,
                url: urls.primary,
                urls,
                process: undefined // Don't expose the process object
            };
        });
    }
    /**
     * Get a specific instance by port
     */
    getInstance(port) {
        const instance = this.instances.get(port);
        if (instance && !this.isProcessAlive(instance.pid)) {
            this.instances.delete(port);
            this.saveRegistry();
            return undefined;
        }
        if (instance) {
            // Rebuild network URLs for current network state
            const urls = (0, network_utils_js_1.buildNetworkUrls)(instance.port);
            return {
                ...instance,
                url: urls.primary,
                urls,
                process: undefined
            };
        }
        return undefined;
    }
    /**
     * Restart a studio instance
     */
    async restartStudio(port) {
        const instance = this.instances.get(port);
        if (!instance) {
            throw new Error(`No studio instance found on port ${port}`);
        }
        const { projectPath, projectName } = instance;
        // Stop the existing instance
        await this.stopStudio(port);
        // Wait a moment for port to be released
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Launch new instance
        return this.launchStudioLegacy(projectPath, projectName, port);
    }
    /**
     * Get status summary
     */
    getStatus() {
        const instances = this.getInstances();
        return {
            totalInstances: instances.length,
            runningInstances: instances.filter(i => i.status === 'running').length,
            instances
        };
    }
    /**
     * Get comprehensive studio report including discovered instances
     */
    async getComprehensiveReport() {
        const trackedInstances = this.getInstances();
        const discoveryReport = await this.discoveryService.getStudioReport();
        // Determine system health
        let systemHealth = 'excellent';
        if (discoveryReport.unhealthyStudios > 0) {
            systemHealth = discoveryReport.unhealthyStudios > 2 ? 'poor' : 'fair';
        }
        else if (discoveryReport.totalStudios > 3) {
            systemHealth = 'good'; // Too many instances
        }
        const recommendations = [
            ...discoveryReport.recommendations,
            `Registry tracking ${trackedInstances.length} instance(s)`,
        ];
        if (trackedInstances.length !== discoveryReport.healthyStudios) {
            recommendations.push('Some healthy studios are not tracked - consider adoption');
        }
        return {
            tracked: trackedInstances,
            discovered: discoveryReport.studios,
            recommendations,
            portUsage: discoveryReport.portUsage,
            systemHealth
        };
    }
    /**
     * Refresh discovery and update registry
     */
    async refreshDiscovery() {
        const errors = [];
        let newlyAdopted = 0;
        let cleaned = 0;
        try {
            // Clean up dead instances first
            const deadPorts = [];
            for (const [port, instance] of this.instances) {
                if (!this.isProcessAlive(instance.pid)) {
                    deadPorts.push(port);
                }
            }
            for (const port of deadPorts) {
                this.instances.delete(port);
                cleaned++;
            }
            // Discover new studios
            const discovered = await this.discoveryService.discoverRunningStudios();
            for (const studio of discovered) {
                if (studio.isHealthy && !this.instances.has(studio.port)) {
                    const result = await this.adoptExistingStudio(studio);
                    if (result.success) {
                        newlyAdopted++;
                    }
                    else if (result.error) {
                        errors.push(`Failed to adopt ${studio.port}: ${result.error}`);
                    }
                }
            }
            await this.saveRegistry();
            this.logger.info('Discovery refresh completed', {
                newlyAdopted,
                cleaned,
                errors: errors.length
            });
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            errors.push(`Discovery refresh failed: ${errorMsg}`);
            this.logger.error('Discovery refresh failed', { error });
        }
        return {
            newlyAdopted,
            cleaned,
            errors
        };
    }
    /**
     * Kill all orphaned processes (not tracked by registry)
     */
    async killOrphanedProcesses() {
        const errors = [];
        let killed = 0;
        try {
            const discovered = await this.discoveryService.discoverRunningStudios({ includeUnhealthy: true });
            for (const studio of discovered) {
                // If studio is not tracked by registry, consider it orphaned
                if (!this.instances.has(studio.port)) {
                    try {
                        const success = await this.portValidator.killProcessOnPort(studio.port, true);
                        if (success) {
                            killed++;
                            this.logger.info('Killed orphaned studio process', {
                                port: studio.port,
                                pid: studio.pid
                            });
                        }
                        else {
                            errors.push(`Failed to kill process on port ${studio.port}`);
                        }
                    }
                    catch (error) {
                        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
                        errors.push(`Error killing process ${studio.pid}: ${errorMsg}`);
                    }
                }
            }
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            errors.push(`Orphaned process cleanup failed: ${errorMsg}`);
        }
        return {
            killed,
            errors
        };
    }
    /**
     * Health check all tracked instances
     */
    async performHealthCheck() {
        const results = {
            healthy: 0,
            unhealthy: 0,
            recovered: 0,
            instances: []
        };
        for (const [port, instance] of this.instances) {
            try {
                const startTime = Date.now();
                const isHealthy = await this.discoveryService.pingStudio(port);
                const responseTime = Date.now() - startTime;
                const instanceResult = {
                    port,
                    pid: instance.pid,
                    isHealthy,
                    responseTime: isHealthy ? responseTime : undefined
                };
                if (isHealthy) {
                    results.healthy++;
                    if (instance.status !== 'running') {
                        // Studio recovered
                        instance.status = 'running';
                        results.recovered++;
                    }
                }
                else {
                    results.unhealthy++;
                    instance.status = 'error';
                    instanceResult.error = 'Studio not responding';
                }
                results.instances.push(instanceResult);
            }
            catch (error) {
                results.unhealthy++;
                results.instances.push({
                    port,
                    pid: instance.pid,
                    isHealthy: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
        // Save updated statuses
        await this.saveRegistry();
        return results;
    }
}
exports.StudioRegistry = StudioRegistry;
//# sourceMappingURL=studio-registry.js.map