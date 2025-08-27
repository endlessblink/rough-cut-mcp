/**
 * Studio Registry Service
 * Manages persistent tracking of Remotion Studio instances
 */
import fs from 'fs-extra';
import path from 'path';
import { spawn } from 'child_process';
import { getLogger } from '../utils/logger.js';
export class StudioRegistry {
    instances;
    registryFile;
    logger = getLogger().service('StudioRegistry');
    config;
    portRange = { min: 3000, max: 3100 };
    constructor(config) {
        this.config = config;
        this.instances = new Map();
        this.registryFile = path.join(config.assetsDir, '.studio-registry.json');
        // Load existing registry
        this.loadRegistry();
        // Clean up dead instances
        this.cleanupDeadInstances();
    }
    /**
     * Load registry from persistent storage
     */
    async loadRegistry() {
        try {
            if (await fs.pathExists(this.registryFile)) {
                const data = await fs.readJson(this.registryFile);
                for (const instance of data.instances || []) {
                    // Check if process is still alive
                    if (this.isProcessAlive(instance.pid)) {
                        this.instances.set(instance.port, instance);
                    }
                }
                this.logger.info(`Loaded ${this.instances.size} studio instances from registry`);
            }
        }
        catch (error) {
            this.logger.warn('Failed to load studio registry', { error });
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
            await fs.writeJson(this.registryFile, data, { spaces: 2 });
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
     * Clean up instances that are no longer running
     */
    async cleanupDeadInstances() {
        const deadPorts = [];
        for (const [port, instance] of this.instances) {
            if (!this.isProcessAlive(instance.pid)) {
                deadPorts.push(port);
                this.logger.info(`Removing dead studio instance on port ${port}`);
            }
        }
        for (const port of deadPorts) {
            this.instances.delete(port);
        }
        if (deadPorts.length > 0) {
            await this.saveRegistry();
        }
    }
    /**
     * Find an available port
     */
    async findAvailablePort() {
        const net = await import('net');
        for (let port = this.portRange.min; port <= this.portRange.max; port++) {
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
     * Launch a new Remotion Studio instance
     */
    async launchStudio(projectPath, projectName, requestedPort) {
        try {
            // Ensure project path exists
            if (!await fs.pathExists(projectPath)) {
                throw new Error(`Project path does not exist: ${projectPath}`);
            }
            // Check if package.json exists
            const packageJsonPath = path.join(projectPath, 'package.json');
            if (!await fs.pathExists(packageJsonPath)) {
                throw new Error(`No package.json found in project: ${projectPath}`);
            }
            // Find available port
            const port = requestedPort && !this.instances.has(requestedPort)
                ? requestedPort
                : await this.findAvailablePort();
            // Launch Remotion Studio
            const studioProcess = spawn('npx', ['remotion', 'studio', '--port', String(port)], {
                cwd: projectPath,
                shell: true,
                detached: process.platform !== 'win32',
                stdio: 'ignore'
            });
            // Create instance record
            const instance = {
                pid: studioProcess.pid || 0,
                port,
                projectPath,
                projectName: projectName || path.basename(projectPath),
                startTime: Date.now(),
                status: 'starting',
                url: `http://localhost:${port}`,
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
                project: projectName || path.basename(projectPath)
            });
            return instance;
        }
        catch (error) {
            this.logger.error('Failed to launch studio', { error });
            throw error;
        }
    }
    /**
     * Stop a studio instance
     */
    async stopStudio(port) {
        const instance = this.instances.get(port);
        if (!instance) {
            this.logger.warn(`No studio instance found on port ${port}`);
            return false;
        }
        try {
            // Try to kill the process
            if (instance.process) {
                instance.process.kill();
            }
            else if (instance.pid) {
                process.kill(instance.pid);
            }
            // Remove from registry
            this.instances.delete(port);
            await this.saveRegistry();
            this.logger.info(`Stopped studio on port ${port}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to stop studio on port ${port}`, { error });
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
            .map(inst => ({
            ...inst,
            process: undefined // Don't expose the process object
        }));
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
        return instance ? { ...instance, process: undefined } : undefined;
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
        return this.launchStudio(projectPath, projectName, port);
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
}
//# sourceMappingURL=studio-registry.js.map