/**
 * Studio Port Manager Service
 * Manages Remotion Studio instances and ensures port consistency
 */

import { spawn, ChildProcess } from 'child_process';
import * as net from 'net';
import * as fs from 'fs-extra';
import * as path from 'path';
import { getLogger } from '../utils/logger.js';

const logger = getLogger().service('StudioPortManager');

export interface StudioInstance {
  projectName: string;
  port: number;
  pid: number;
  process?: ChildProcess;
  startTime: Date;
  projectPath: string;
}

export interface PortAllocation {
  projectName: string;
  preferredPort: number;
  lastUsedPort?: number;
}

export class StudioPortManager {
  private activeInstances: Map<string, StudioInstance> = new Map();
  private portAllocations: Map<string, PortAllocation> = new Map();
  private portConfigPath: string;
  private basePort: number = 3000;
  private maxPort: number = 3100;
  
  constructor(configPath?: string) {
    this.portConfigPath = configPath || path.join(process.cwd(), '.studio-ports.json');
    this.loadPortAllocations();
  }

  /**
   * Load saved port allocations from disk
   */
  private async loadPortAllocations(): Promise<void> {
    try {
      if (await fs.pathExists(this.portConfigPath)) {
        const data = await fs.readJson(this.portConfigPath);
        for (const [project, allocation] of Object.entries(data)) {
          this.portAllocations.set(project, allocation as PortAllocation);
        }
        logger.info('Loaded port allocations', { count: this.portAllocations.size });
      }
    } catch (error) {
      logger.error('Failed to load port allocations', { error });
    }
  }

  /**
   * Save port allocations to disk
   */
  private async savePortAllocations(): Promise<void> {
    try {
      const data = Object.fromEntries(this.portAllocations);
      await fs.writeJson(this.portConfigPath, data, { spaces: 2 });
      logger.debug('Saved port allocations');
    } catch (error) {
      logger.error('Failed to save port allocations', { error });
    }
  }

  /**
   * Check if a port is available
   */
  private async isPortAvailable(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const server = net.createServer();
      
      server.once('error', () => {
        resolve(false);
      });
      
      server.once('listening', () => {
        server.close();
        resolve(true);
      });
      
      server.listen(port);
    });
  }

  /**
   * Find an available port starting from a preferred port
   */
  private async findAvailablePort(preferredPort?: number): Promise<number> {
    let port = preferredPort || this.basePort;
    
    while (port <= this.maxPort) {
      if (await this.isPortAvailable(port)) {
        return port;
      }
      port++;
    }
    
    throw new Error(`No available ports between ${this.basePort} and ${this.maxPort}`);
  }

  /**
   * Get or allocate a port for a project
   */
  async getProjectPort(projectName: string): Promise<number> {
    // Check if project already has an active instance
    const activeInstance = this.activeInstances.get(projectName);
    if (activeInstance) {
      logger.debug('Project has active instance', { projectName, port: activeInstance.port });
      return activeInstance.port;
    }
    
    // Check if project has a saved allocation
    const allocation = this.portAllocations.get(projectName);
    if (allocation) {
      // Try to use the last used port
      if (allocation.lastUsedPort && await this.isPortAvailable(allocation.lastUsedPort)) {
        logger.debug('Using last used port', { projectName, port: allocation.lastUsedPort });
        return allocation.lastUsedPort;
      }
      
      // Try preferred port
      if (await this.isPortAvailable(allocation.preferredPort)) {
        logger.debug('Using preferred port', { projectName, port: allocation.preferredPort });
        return allocation.preferredPort;
      }
    }
    
    // Find a new available port
    const port = await this.findAvailablePort(allocation?.preferredPort);
    
    // Save allocation
    this.portAllocations.set(projectName, {
      projectName,
      preferredPort: allocation?.preferredPort || port,
      lastUsedPort: port
    });
    
    await this.savePortAllocations();
    
    logger.info('Allocated port for project', { projectName, port });
    return port;
  }

  /**
   * Kill a process by PID
   */
  private async killProcess(pid: number): Promise<boolean> {
    try {
      process.kill(pid, 'SIGTERM');
      
      // Wait for process to terminate
      let attempts = 0;
      while (attempts < 10) {
        try {
          process.kill(pid, 0); // Check if process exists
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        } catch {
          // Process no longer exists
          return true;
        }
      }
      
      // Force kill if still running
      process.kill(pid, 'SIGKILL');
      return true;
      
    } catch (error) {
      logger.error('Failed to kill process', { pid, error });
      return false;
    }
  }

  /**
   * Start Remotion Studio for a project
   */
  async startStudio(
    projectName: string,
    projectPath: string,
    port?: number
  ): Promise<StudioInstance> {
    
    logger.info('Starting studio', { projectName, projectPath, port });
    
    // Kill any existing instance
    const existingInstance = this.activeInstances.get(projectName);
    if (existingInstance) {
      logger.info('Killing existing instance', { projectName, pid: existingInstance.pid });
      await this.killProcess(existingInstance.pid);
      this.activeInstances.delete(projectName);
    }
    
    // Get port for project
    const assignedPort = port || await this.getProjectPort(projectName);
    
    // Start studio process
    const studioProcess = spawn('npx', [
      'remotion',
      'studio',
      `--port=${assignedPort}`,
      '--no-open' // Don't auto-open browser
    ], {
      cwd: projectPath,
      shell: true,
      stdio: 'pipe',
      detached: false
    });
    
    const instance: StudioInstance = {
      projectName,
      port: assignedPort,
      pid: studioProcess.pid!,
      process: studioProcess,
      startTime: new Date(),
      projectPath
    };
    
    // Monitor studio output
    studioProcess.stdout?.on('data', (data) => {
      const output = data.toString();
      logger.debug('Studio output', { projectName, output: output.slice(0, 100) });
      
      // Check for successful start
      if (output.includes('Server ready') || output.includes('Compiled successfully')) {
        logger.info('Studio started successfully', { projectName, port: assignedPort });
      }
    });
    
    studioProcess.stderr?.on('data', (data) => {
      logger.error('Studio error', { projectName, error: data.toString() });
    });
    
    studioProcess.on('exit', (code) => {
      logger.info('Studio process exited', { projectName, code });
      this.activeInstances.delete(projectName);
    });
    
    // Store instance
    this.activeInstances.set(projectName, instance);
    
    // Update allocation
    const allocation = this.portAllocations.get(projectName) || {
      projectName,
      preferredPort: assignedPort
    };
    allocation.lastUsedPort = assignedPort;
    this.portAllocations.set(projectName, allocation);
    await this.savePortAllocations();
    
    return instance;
  }

  /**
   * Restart studio for a project (preserving port)
   */
  async restartStudio(
    projectName: string,
    projectPath: string
  ): Promise<StudioInstance> {
    
    logger.info('Restarting studio', { projectName });
    
    // Get the current or allocated port
    const port = await this.getProjectPort(projectName);
    
    // Start studio with same port
    return this.startStudio(projectName, projectPath, port);
  }

  /**
   * Stop studio for a project
   */
  async stopStudio(projectName: string): Promise<boolean> {
    const instance = this.activeInstances.get(projectName);
    
    if (!instance) {
      logger.warn('No active instance found', { projectName });
      return false;
    }
    
    const success = await this.killProcess(instance.pid);
    
    if (success) {
      this.activeInstances.delete(projectName);
      logger.info('Studio stopped', { projectName });
    }
    
    return success;
  }

  /**
   * Stop all active studios
   */
  async stopAllStudios(): Promise<void> {
    logger.info('Stopping all studios', { count: this.activeInstances.size });
    
    const promises = Array.from(this.activeInstances.keys()).map(projectName =>
      this.stopStudio(projectName)
    );
    
    await Promise.all(promises);
  }

  /**
   * Get information about an active studio
   */
  getStudioInfo(projectName: string): StudioInstance | undefined {
    return this.activeInstances.get(projectName);
  }

  /**
   * Get all active studios
   */
  getAllActiveStudios(): StudioInstance[] {
    return Array.from(this.activeInstances.values());
  }

  /**
   * Check if a studio is running for a project
   */
  isStudioRunning(projectName: string): boolean {
    const instance = this.activeInstances.get(projectName);
    
    if (!instance) {
      return false;
    }
    
    // Check if process is still running
    try {
      process.kill(instance.pid, 0);
      return true;
    } catch {
      // Process no longer exists
      this.activeInstances.delete(projectName);
      return false;
    }
  }

  /**
   * Update project without restarting studio (if possible)
   */
  async updateProjectSafely(
    projectName: string,
    projectPath: string,
    updateFn: () => Promise<void>
  ): Promise<boolean> {
    
    logger.info('Safely updating project', { projectName });
    
    try {
      // Apply updates
      await updateFn();
      
      // Check if studio is running
      if (!this.isStudioRunning(projectName)) {
        // No studio running, start it
        await this.startStudio(projectName, projectPath);
        return true;
      }
      
      // Studio is running and will hot-reload
      logger.info('Project updated, studio will hot-reload', { projectName });
      return true;
      
    } catch (error) {
      logger.error('Failed to update project', { projectName, error });
      
      // Try to restart studio on error
      try {
        await this.restartStudio(projectName, projectPath);
        return true;
      } catch {
        return false;
      }
    }
  }

  /**
   * Clean up orphaned processes
   */
  async cleanupOrphanedProcesses(): Promise<number> {
    let cleanedCount = 0;
    
    for (const [projectName, instance] of this.activeInstances.entries()) {
      try {
        process.kill(instance.pid, 0);
      } catch {
        // Process no longer exists
        this.activeInstances.delete(projectName);
        cleanedCount++;
        logger.info('Cleaned orphaned instance', { projectName, pid: instance.pid });
      }
    }
    
    return cleanedCount;
  }
}

// Export singleton instance
export const studioPortManager = new StudioPortManager();