import { spawn, ChildProcess } from 'child_process';
import { join, resolve } from 'path';
import { promises as fs } from 'fs';
import { getLogger } from '../utils/logger.js';
import { PortManager, PortAllocationResult } from './port-manager.js';
import { ProcessDiscovery, StudioProcess } from './process-discovery.js';
import { loadConfig } from '../utils/config.js';
import { paths } from '../config/paths.js';

const logger = getLogger().service('StudioLifecycle');

export interface StudioLaunchOptions {
  projectPath: string;
  preferredPort?: number;
  forceNewInstance?: boolean;
  timeout?: number;
  validate?: boolean;
}

export interface StudioLaunchResult {
  success: boolean;
  port?: number;
  pid?: number;
  projectPath?: string;
  reusedExisting?: boolean;
  error?: string;
  warnings?: string[];
}

export interface StudioShutdownResult {
  success: boolean;
  killedProcesses: number[];
  errors?: string[];
}

export class StudioLifecycle {
  private static readonly DEFAULT_TIMEOUT = 60000; // 60 seconds
  private static readonly HEALTH_CHECK_INTERVAL = 5000; // 5 seconds
  private static readonly MAX_STARTUP_ATTEMPTS = 3;
  
  private static activeProcesses = new Map<number, ChildProcess>();
  private static processMetadata = new Map<number, { projectPath: string; startTime: Date; port: number }>();

  /**
   * Launches a Remotion Studio with robust validation and error handling
   */
  static async launchStudio(options: StudioLaunchOptions): Promise<StudioLaunchResult> {
    const {
      projectPath,
      preferredPort,
      forceNewInstance = false,
      timeout = StudioLifecycle.DEFAULT_TIMEOUT,
      validate = true
    } = options;

    const warnings: string[] = [];
    
    logger.info(`Launching Remotion Studio for project: ${projectPath}`);

    try {
      // 1. Validate project path
      const projectValidation = await StudioLifecycle.validateProjectPath(projectPath);
      if (!projectValidation.valid) {
        return {
          success: false,
          error: `Invalid project path: ${projectValidation.error}`
        };
      }

      // 2. Check if studio already running for this project (unless force new)
      if (!forceNewInstance) {
        const existingStudio = await StudioLifecycle.findExistingStudioForProject(projectPath);
        if (existingStudio && existingStudio.isResponding) {
          logger.info(`Found existing studio for project on port ${existingStudio.port}`);
          return {
            success: true,
            port: existingStudio.port,
            pid: existingStudio.pid,
            projectPath,
            reusedExisting: true
          };
        } else if (existingStudio && !existingStudio.isResponding) {
          warnings.push(`Found unresponsive studio on port ${existingStudio.port}, will start new instance`);
          // Attempt to clean up the dead process
          await StudioLifecycle.killProcess(existingStudio.pid, true);
        }
      }

      // 3. Find available port
      const portResult = await PortManager.findAvailablePort(preferredPort);
      if (!portResult.available) {
        if (portResult.conflictDetails?.isSystemService) {
          return {
            success: false,
            error: `Port ${portResult.port} is occupied by Windows system service: ${portResult.conflictDetails.processName}`
          };
        } else {
          warnings.push(`Preferred port ${preferredPort} unavailable, using port ${portResult.port}`);
        }
      }

      const targetPort = portResult.port;

      // 4. Validate port safety
      const portSafety = await PortManager.validatePortSafety(targetPort);
      if (!portSafety.safe) {
        return {
          success: false,
          error: `Port ${targetPort} is not safe to use: ${portSafety.reason}`
        };
      }

      // 5. Attempt to start the studio
      let lastError: string | undefined;
      for (let attempt = 1; attempt <= StudioLifecycle.MAX_STARTUP_ATTEMPTS; attempt++) {
        logger.debug(`Studio startup attempt ${attempt}/${StudioLifecycle.MAX_STARTUP_ATTEMPTS}`);
        
        const startupResult = await StudioLifecycle.startStudioProcess(projectPath, targetPort, timeout);
        
        if (startupResult.success && startupResult.process && startupResult.pid) {
          // Store process information
          StudioLifecycle.activeProcesses.set(startupResult.pid, startupResult.process);
          StudioLifecycle.processMetadata.set(startupResult.pid, {
            projectPath,
            startTime: new Date(),
            port: targetPort
          });

          // 6. Validate functionality if requested
          if (validate) {
            const validationResult = await StudioLifecycle.validateStudioFunctionality(targetPort, projectPath, timeout);
            if (!validationResult.success) {
              // Cleanup failed instance
              await StudioLifecycle.killProcess(startupResult.pid, true);
              lastError = validationResult.error;
              continue; // Try again
            }
          }

          logger.info(`Successfully launched Remotion Studio on port ${targetPort} (PID: ${startupResult.pid})`);
          return {
            success: true,
            port: targetPort,
            pid: startupResult.pid,
            projectPath,
            warnings: warnings.length > 0 ? warnings : undefined
          };
        } else {
          lastError = startupResult.error || 'Unknown startup error';
          logger.warn(`Startup attempt ${attempt} failed: ${lastError}`);
        }
      }

      return {
        success: false,
        error: `Failed to start studio after ${StudioLifecycle.MAX_STARTUP_ATTEMPTS} attempts. Last error: ${lastError}`
      };

    } catch (error) {
      logger.error('Error launching studio:', error);
      return {
        success: false,
        error: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Starts the actual Remotion Studio process
   */
  private static async startStudioProcess(
    projectPath: string, 
    port: number, 
    timeout: number
  ): Promise<{ success: boolean; process?: ChildProcess; pid?: number; error?: string }> {
    
    return new Promise((resolve) => {
      try {
        const config = loadConfig();
        
        // Ensure we're using Windows paths for the spawn
        const windowsProjectPath = paths.getWindowsPath(projectPath);
        
        logger.debug(`Starting Remotion Studio process for ${windowsProjectPath} on port ${port}`);
        
        // Spawn the remotion studio process
        const process = spawn('npx', ['remotion', 'studio', '--port', port.toString()], {
          cwd: windowsProjectPath,
          stdio: ['ignore', 'pipe', 'pipe'],
          shell: true,
          windowsHide: true
        });

        let resolved = false;
        let stdoutData = '';
        let stderrData = '';

        // Set up timeout
        const timeoutHandle = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            logger.error(`Studio startup timeout after ${timeout}ms`);
            process.kill('SIGKILL');
            resolve({
              success: false,
              error: `Startup timeout after ${timeout}ms`
            });
          }
        }, timeout);

        // Handle process startup
        process.on('spawn', () => {
          logger.debug(`Studio process spawned with PID: ${process.pid}`);
        });

        // Collect stdout for debugging
        process.stdout?.on('data', (data: Buffer) => {
          stdoutData += data.toString();
          const output = data.toString().toLowerCase();
          
          // Look for success indicators
          if (output.includes('ready') || output.includes('server running') || output.includes(`localhost:${port}`)) {
            if (!resolved) {
              resolved = true;
              clearTimeout(timeoutHandle);
              logger.debug('Studio process appears ready based on stdout');
              resolve({
                success: true,
                process,
                pid: process.pid!
              });
            }
          }
        });

        // Collect stderr for debugging
        process.stderr?.on('data', (data: Buffer) => {
          stderrData += data.toString();
          const output = data.toString().toLowerCase();
          
          // Look for fatal errors
          if (output.includes('error') && (output.includes('fatal') || output.includes('cannot') || output.includes('failed'))) {
            if (!resolved) {
              resolved = true;
              clearTimeout(timeoutHandle);
              logger.error('Studio process failed based on stderr:', output);
              resolve({
                success: false,
                error: `Process error: ${data.toString().trim()}`
              });
            }
          }
        });

        // Handle process exit
        process.on('exit', (code, signal) => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeoutHandle);
            logger.error(`Studio process exited with code ${code}, signal ${signal}`);
            resolve({
              success: false,
              error: `Process exited with code ${code}${signal ? `, signal ${signal}` : ''}`
            });
          }
        });

        // Handle process errors
        process.on('error', (error) => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeoutHandle);
            logger.error('Studio process error:', error);
            resolve({
              success: false,
              error: `Process spawn error: ${error.message}`
            });
          }
        });

        // If we don't get explicit success/failure indicators from output,
        // fall back to checking if process is still alive after a delay
        setTimeout(() => {
          if (!resolved && process.pid) {
            // Process is still running, assume success
            resolved = true;
            clearTimeout(timeoutHandle);
            logger.debug('Studio process still running, assuming success');
            resolve({
              success: true,
              process,
              pid: process.pid
            });
          }
        }, Math.min(timeout * 0.5, 10000)); // Wait up to 10 seconds or half timeout

      } catch (error) {
        logger.error('Error spawning studio process:', error);
        resolve({
          success: false,
          error: `Spawn error: ${error instanceof Error ? error.message : String(error)}`
        });
      }
    });
  }

  /**
   * Validates that the studio is fully functional
   */
  private static async validateStudioFunctionality(
    port: number, 
    projectPath: string, 
    timeout: number
  ): Promise<{ success: boolean; error?: string }> {
    
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        // Test HTTP endpoint
        const controller = new AbortController();
        const requestTimeout = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(`http://localhost:${port}`, {
          method: 'HEAD',
          signal: controller.signal,
          headers: {
            'User-Agent': 'RoughCut-MCP-Validation'
          }
        });
        
        clearTimeout(requestTimeout);
        
        if (response.ok || (response.status >= 200 && response.status < 500)) {
          // Additional validation: check if it's actually Remotion
          const discovery = await ProcessDiscovery.getStudioByPort(port);
          if (discovery && discovery.isResponding) {
            logger.debug(`Studio on port ${port} validated successfully`);
            return { success: true };
          }
        }
        
      } catch (error) {
        // Continue waiting
      }
      
      // Wait before next check
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    return {
      success: false,
      error: `Studio failed validation after ${timeout}ms - not responding to HTTP requests`
    };
  }

  /**
   * Finds existing studio for a project
   */
  private static async findExistingStudioForProject(projectPath: string): Promise<StudioProcess | null> {
    try {
      const discovery = await ProcessDiscovery.discoverStudioProcesses();
      
      // Try to match by project path
      for (const studio of discovery.remotionStudios) {
        if (studio.projectPath) {
          const normalizedStudioPath = resolve(studio.projectPath);
          const normalizedTargetPath = resolve(projectPath);
          
          if (normalizedStudioPath === normalizedTargetPath) {
            return studio;
          }
        }
      }
      
      // If no exact match, return any studio (assuming single project workflow)
      return discovery.remotionStudios.length > 0 ? discovery.remotionStudios[0] : null;
      
    } catch (error) {
      logger.error('Error finding existing studio:', error);
      return null;
    }
  }

  /**
   * Shuts down studio instances
   */
  static async shutdownStudios(options: { port?: number; pid?: number; all?: boolean; force?: boolean }): Promise<StudioShutdownResult> {
    const { port, pid, all = false, force = false } = options;
    const killedProcesses: number[] = [];
    const errors: string[] = [];

    try {
      let targetProcesses: StudioProcess[] = [];

      if (all) {
        // Get all running studios
        const discovery = await ProcessDiscovery.discoverStudioProcesses();
        targetProcesses = discovery.remotionStudios;
      } else if (port) {
        // Find studio by port
        const studio = await ProcessDiscovery.getStudioByPort(port);
        if (studio) {
          targetProcesses = [studio];
        }
      } else if (pid) {
        // Find studio by PID
        const discovery = await ProcessDiscovery.discoverStudioProcesses();
        const studio = discovery.remotionStudios.find(s => s.pid === pid);
        if (studio) {
          targetProcesses = [studio];
        }
      }

      if (targetProcesses.length === 0) {
        return {
          success: true,
          killedProcesses: [],
          errors: ['No matching studio processes found']
        };
      }

      // Kill each process
      for (const studio of targetProcesses) {
        try {
          const success = await StudioLifecycle.killProcess(studio.pid, force);
          if (success) {
            killedProcesses.push(studio.pid);
            logger.info(`Successfully killed studio process ${studio.pid} on port ${studio.port}`);
          } else {
            errors.push(`Failed to kill process ${studio.pid}`);
          }
        } catch (error) {
          const errorMsg = `Error killing process ${studio.pid}: ${error instanceof Error ? error.message : String(error)}`;
          errors.push(errorMsg);
          logger.error(errorMsg);
        }
      }

      return {
        success: errors.length === 0,
        killedProcesses,
        errors: errors.length > 0 ? errors : undefined
      };

    } catch (error) {
      logger.error('Error during studio shutdown:', error);
      return {
        success: false,
        killedProcesses,
        errors: [`Shutdown error: ${error instanceof Error ? error.message : String(error)}`]
      };
    }
  }

  /**
   * Kills a process by PID
   */
  private static async killProcess(pid: number, force: boolean = false): Promise<boolean> {
    try {
      // Remove from our tracking
      StudioLifecycle.activeProcesses.delete(pid);
      StudioLifecycle.processMetadata.delete(pid);

      // Use PortManager to kill the process
      return await PortManager.killProcess(pid, force);
      
    } catch (error) {
      logger.error(`Error killing process ${pid}:`, error);
      return false;
    }
  }

  /**
   * Validates project path exists and has required files
   */
  private static async validateProjectPath(projectPath: string): Promise<{ valid: boolean; error?: string }> {
    try {
      const config = loadConfig();
      const windowsPath = paths.getWindowsPath(projectPath);
      
      // Check if directory exists
      const stats = await fs.stat(windowsPath);
      if (!stats.isDirectory()) {
        return { valid: false, error: 'Path is not a directory' };
      }

      // Check for package.json
      const packageJsonPath = join(windowsPath, 'package.json');
      try {
        await fs.access(packageJsonPath);
      } catch {
        return { valid: false, error: 'No package.json found in project directory' };
      }

      return { valid: true };

    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Unknown validation error' 
      };
    }
  }

  /**
   * Gets status of all managed studio processes
   */
  static async getLifecycleStatus(): Promise<{
    managedProcesses: number;
    activeStudios: StudioProcess[];
    orphanedProcesses: number[];
  }> {
    try {
      // Get current discovery state
      const discovery = await ProcessDiscovery.discoverStudioProcesses();
      
      // Check which of our managed processes are still alive
      const orphanedProcesses: number[] = [];
      for (const [pid] of StudioLifecycle.activeProcesses) {
        const isAlive = await ProcessDiscovery.isProcessRunning(pid);
        if (!isAlive) {
          orphanedProcesses.push(pid);
          StudioLifecycle.activeProcesses.delete(pid);
          StudioLifecycle.processMetadata.delete(pid);
        }
      }

      return {
        managedProcesses: StudioLifecycle.activeProcesses.size,
        activeStudios: discovery.remotionStudios,
        orphanedProcesses
      };

    } catch (error) {
      logger.error('Error getting lifecycle status:', error);
      return {
        managedProcesses: StudioLifecycle.activeProcesses.size,
        activeStudios: [],
        orphanedProcesses: []
      };
    }
  }

  /**
   * Cleanup orphaned processes and tracking
   */
  static async cleanup(): Promise<void> {
    try {
      const status = await StudioLifecycle.getLifecycleStatus();
      
      // Clean up orphaned tracking
      for (const pid of status.orphanedProcesses) {
        StudioLifecycle.activeProcesses.delete(pid);
        StudioLifecycle.processMetadata.delete(pid);
        logger.info(`Cleaned up orphaned process tracking for PID ${pid}`);
      }

    } catch (error) {
      logger.error('Error during cleanup:', error);
    }
  }

  /**
   * Gets comprehensive lifecycle report
   */
  static async getLifecycleReport(): Promise<string> {
    const status = await StudioLifecycle.getLifecycleStatus();
    
    let report = `\n=== STUDIO LIFECYCLE REPORT ===\n`;
    report += `Managed processes: ${status.managedProcesses}\n`;
    report += `Active studios: ${status.activeStudios.length}\n`;
    report += `Orphaned processes: ${status.orphanedProcesses.length}\n\n`;
    
    if (status.activeStudios.length > 0) {
      report += `=== ACTIVE STUDIOS ===\n`;
      for (const studio of status.activeStudios) {
        const metadata = StudioLifecycle.processMetadata.get(studio.pid);
        report += `Port ${studio.port}: PID ${studio.pid}`;
        if (metadata) {
          const uptime = Date.now() - metadata.startTime.getTime();
          report += ` (up ${Math.round(uptime / 1000)}s)`;
        }
        report += `\n`;
        if (studio.projectPath) {
          report += `  Project: ${studio.projectPath}\n`;
        }
        if (!studio.isResponding) {
          report += `  [WARNING: NOT RESPONDING]\n`;
        }
      }
      report += `\n`;
    }
    
    if (status.orphanedProcesses.length > 0) {
      report += `=== ORPHANED PROCESSES ===\n`;
      for (const pid of status.orphanedProcesses) {
        report += `PID ${pid} - Process terminated but was being tracked\n`;
      }
      report += `\n`;
    }
    
    report += `===============================\n`;
    return report;
  }
}