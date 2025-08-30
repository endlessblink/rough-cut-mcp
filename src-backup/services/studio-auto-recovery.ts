/**
 * Studio Auto-Recovery System
 * Handles automatic recovery of crashed studio processes
 */

import { getLogger } from '../utils/logger.js';
import { StudioRegistry } from './studio-registry.js';
import { StudioDiscoveryService } from './studio-discovery.js';

export interface RecoveryAttempt {
  port: number;
  pid: number;
  projectPath: string;
  projectName: string;
  attempts: number;
  lastAttempt: Date;
  success: boolean;
}

export class StudioAutoRecovery {
  private logger = getLogger().service('StudioAutoRecovery');
  private recoveryAttempts: Map<number, RecoveryAttempt> = new Map();
  private maxRetries = 3;
  private retryDelay = 5000; // 5 seconds
  private registry: StudioRegistry;
  private discoveryService: StudioDiscoveryService;
  private monitorInterval?: NodeJS.Timeout;

  constructor(registry: StudioRegistry) {
    this.registry = registry;
    this.discoveryService = new StudioDiscoveryService();
  }

  /**
   * Start monitoring for crashed processes
   */
  startMonitoring(intervalMs: number = 30000): void {
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
  stopMonitoring(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = undefined;
      this.logger.info('Auto-recovery monitoring stopped');
    }
  }

  /**
   * Check for crashed studios and attempt recovery
   */
  private async checkAndRecoverCrashedStudios(): Promise<void> {
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
    } catch (error) {
      this.logger.error('Error during crash monitoring', { error });
    }
  }

  /**
   * Handle a crashed process
   */
  async handleProcessCrash(instance: any): Promise<boolean> {
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
      const newInstance = await this.registry.launchStudioLegacy(
        attempt.projectPath,
        attempt.projectName,
        attempt.port
      );

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

    } catch (error) {
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
  private async permanentCleanup(instance: any): Promise<void> {
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
    } catch (error) {
      this.logger.error('Permanent cleanup failed', { 
        port: instance.port, 
        error 
      });
    }
  }

  /**
   * Check if a process is alive
   */
  private isProcessAlive(pid: number): boolean {
    try {
      process.kill(pid, 0);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get recovery statistics
   */
  getRecoveryStats(): {
    activeRecoveries: number;
    totalAttempts: number;
    successfulRecoveries: number;
    failedRecoveries: number;
    attempts: RecoveryAttempt[];
  } {
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
  async forceRecovery(port: number): Promise<boolean> {
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
  clearRecoveryHistory(): void {
    const cleared = this.recoveryAttempts.size;
    this.recoveryAttempts.clear();
    this.logger.info('Recovery history cleared', { cleared });
  }
}