/**
 * Studio Discovery Service
 * Discovers existing Remotion Studio instances across the system
 * Solves the core problem: MCP reusing healthy studios instead of spawning new ones
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { getLogger } from '../utils/logger.js';
import { 
  DiscoveredStudio, 
  ProcessInfo, 
  HealthCheckResult, 
  StudioDiscoveryOptions 
} from '../types/studio-discovery.js';

const execAsync = promisify(exec);

export class StudioDiscoveryService {
  private logger = getLogger().service('StudioDiscovery');
  private defaultOptions: StudioDiscoveryOptions = {
    portRange: { min: 3000, max: 3010 }, // Discovery scans all ports, but registry excludes 3001
    healthTimeout: 3000,
    includeUnhealthy: false,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  };

  /**
   * Main discovery method - finds all running Remotion studios
   */
  async discoverRunningStudios(options?: StudioDiscoveryOptions): Promise<DiscoveredStudio[]> {
    const opts = { ...this.defaultOptions, ...options };
    this.logger.info('Starting studio discovery', { options: opts });

    try {
      // Step 1: Get all listening ports in range
      const listeningPorts = await this.getListeningPorts(opts.portRange!);
      this.logger.debug('Found listening ports', { ports: listeningPorts });

      // Step 2: Check each port to see if it's a Remotion studio
      const studios: DiscoveredStudio[] = [];
      for (const port of listeningPorts) {
        try {
          const studio = await this.identifyStudio(port, opts);
          if (studio && (opts.includeUnhealthy || studio.isHealthy)) {
            studios.push(studio);
          }
        } catch (error) {
          this.logger.debug('Failed to identify studio on port', { port, error });
        }
      }

      this.logger.info('Discovery completed', { 
        totalPorts: listeningPorts.length,
        studiosFound: studios.length,
        healthyStudios: studios.filter(s => s.isHealthy).length
      });

      return studios;
    } catch (error) {
      this.logger.error('Studio discovery failed', { error });
      return [];
    }
  }

  /**
   * Check if a specific port is running a Remotion studio
   */
  async identifyStudio(port: number, options?: StudioDiscoveryOptions): Promise<DiscoveredStudio | null> {
    const opts = { ...this.defaultOptions, ...options };

    try {
      // Step 1: Get process info for this port
      const processInfo = await this.getProcessInfoFromPort(port);
      if (!processInfo) {
        return null;
      }

      // Step 2: Health check the endpoint
      const startTime = Date.now();
      const healthCheck = await this.performHealthCheck(port, opts.healthTimeout!);
      const responseTime = Date.now() - startTime;

      if (!healthCheck.isHealthy) {
        return null;
      }

      // Step 3: Determine uptime
      const uptime = await this.getProcessUptime(processInfo.pid);

      // Step 4: Build discovered studio object
      const studio: DiscoveredStudio = {
        pid: processInfo.pid,
        port,
        project: healthCheck.projectInfo?.name,
        projectPath: healthCheck.projectInfo?.path,
        isHealthy: healthCheck.isHealthy,
        url: `http://localhost:${port}`,
        uptime,
        lastSeen: new Date(),
        responseTime,
        version: healthCheck.remotionVersion,
        commandLine: processInfo.commandLine
      };

      this.logger.debug('Studio identified', { port, pid: studio.pid, healthy: studio.isHealthy });
      return studio;

    } catch (error) {
      this.logger.debug('Failed to identify studio', { port, error });
      return null;
    }
  }

  /**
   * Find the best studio to reuse based on criteria
   */
  async findBestStudio(preferredProject?: string): Promise<DiscoveredStudio | null> {
    const studios = await this.discoverRunningStudios();
    
    if (studios.length === 0) {
      this.logger.debug('No studios found for reuse');
      return null;
    }

    this.logger.info('Looking for best studio to reuse', { 
      totalStudios: studios.length,
      preferredProject,
      healthyStudios: studios.filter(s => s.isHealthy).length
    });

    // Priority 1: Healthy studio with matching project
    if (preferredProject) {
      const matching = studios.find(s => 
        s.isHealthy && 
        (s.project === preferredProject || s.projectPath?.includes(preferredProject))
      );
      if (matching) {
        this.logger.info('Found matching project studio', { 
          port: matching.port, 
          project: matching.project 
        });
        return matching;
      }
    }

    // Priority 2: Any healthy studio (best uptime)
    const healthyStudios = studios.filter(s => s.isHealthy);
    if (healthyStudios.length > 0) {
      // Sort by uptime (prefer more stable/longer running instances)
      const bestStudio = healthyStudios.sort((a, b) => b.uptime - a.uptime)[0];
      this.logger.info('Found healthy studio for reuse', { 
        port: bestStudio.port,
        uptime: Math.round(bestStudio.uptime / 1000) + 's'
      });
      return bestStudio;
    }

    this.logger.warn('No healthy studios available for reuse');
    return null;
  }

  /**
   * Get all listening ports in specified range
   */
  private async getListeningPorts(portRange: { min: number; max: number }): Promise<number[]> {
    const platform = process.platform;
    const ports: number[] = [];

    try {
      if (platform === 'win32') {
        // Windows: Use netstat to find listening ports
        const { stdout } = await execAsync('netstat -an | findstr LISTENING');
        const lines = stdout.split('\n');

        for (const line of lines) {
          const match = line.match(/:(\d{4,5})\s/);
          if (match) {
            const port = parseInt(match[1]);
            if (port >= portRange.min && port <= portRange.max) {
              ports.push(port);
            }
          }
        }
      } else {
        // Unix/Linux/Mac: Use lsof or ss
        try {
          const { stdout } = await execAsync(`lsof -i :${portRange.min}-${portRange.max} | grep LISTEN`);
          const lines = stdout.split('\n');

          for (const line of lines) {
            const match = line.match(/:(\d{4,5})/);
            if (match) {
              const port = parseInt(match[1]);
              ports.push(port);
            }
          }
        } catch {
          // Fallback to ss command
          const { stdout } = await execAsync(`ss -tlpn | grep -E ":(${portRange.min}|${portRange.min + 1}|${portRange.min + 2}|${portRange.min + 3}|${portRange.min + 4}|${portRange.min + 5}|${portRange.min + 6}|${portRange.min + 7}|${portRange.min + 8}|${portRange.min + 9}|${portRange.max})"`);
          const lines = stdout.split('\n');

          for (const line of lines) {
            const match = line.match(/:(\d{4,5})/);
            if (match) {
              const port = parseInt(match[1]);
              ports.push(port);
            }
          }
        }
      }

      return [...new Set(ports)].sort();
    } catch (error) {
      this.logger.error('Failed to get listening ports', { error, platform });
      return [];
    }
  }

  /**
   * Get process information from port
   */
  private async getProcessInfoFromPort(port: number): Promise<ProcessInfo | null> {
    const platform = process.platform;

    try {
      if (platform === 'win32') {
        // Windows: Use netstat to get PID, then tasklist for command line
        const { stdout: netstatOutput } = await execAsync(`netstat -ano | findstr :${port} | findstr LISTENING`);
        const lines = netstatOutput.trim().split('\n');
        
        for (const line of lines) {
          const match = line.match(/\s+(\d+)$/);
          if (match) {
            const pid = parseInt(match[1]);
            
            // Get command line from tasklist
            try {
              const { stdout: tasklistOutput } = await execAsync(`tasklist /FI "PID eq ${pid}" /FO CSV /V`);
              const csvLines = tasklistOutput.split('\n');
              if (csvLines.length > 1) {
                const commandLine = csvLines[1] || '';
                
                return {
                  pid,
                  port,
                  commandLine,
                  processName: 'node.exe',
                  startTime: new Date() // Would need WMI for accurate start time
                };
              }
            } catch (tasklistError) {
              this.logger.debug('Failed to get command line', { pid, error: tasklistError });
            }

            return {
              pid,
              port,
              commandLine: 'Unknown',
              processName: 'Unknown'
            };
          }
        }
      } else {
        // Unix: Use lsof to get PID and command
        const { stdout } = await execAsync(`lsof -i :${port} | grep LISTEN`);
        const match = stdout.match(/(\w+)\s+(\d+)/);
        
        if (match) {
          const processName = match[1];
          const pid = parseInt(match[2]);
          
          // Get command line from ps
          try {
            const { stdout: psOutput } = await execAsync(`ps -p ${pid} -o cmd=`);
            const commandLine = psOutput.trim();
            
            return {
              pid,
              port,
              commandLine,
              processName
            };
          } catch {
            return {
              pid,
              port,
              commandLine: 'Unknown',
              processName
            };
          }
        }
      }

      return null;
    } catch (error) {
      this.logger.debug('Failed to get process info', { port, error });
      return null;
    }
  }

  /**
   * Perform health check on a potential studio
   */
  private async performHealthCheck(port: number, timeout: number = 3000): Promise<HealthCheckResult> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const startTime = Date.now();
      const response = await fetch(`http://localhost:${port}`, {
        signal: controller.signal,
        method: 'GET',
        headers: {
          'Accept': 'text/html,application/xhtml+xml'
        }
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        return {
          isHealthy: false,
          error: `HTTP ${response.status}`,
          responseTime
        };
      }

      // Check response content for Remotion signatures
      const html = await response.text();
      const isRemotionStudio = this.detectRemotionStudio(html);

      if (!isRemotionStudio) {
        return {
          isHealthy: false,
          error: 'Not a Remotion Studio',
          responseTime
        };
      }

      // Extract project information from HTML
      const projectInfo = this.extractProjectInfo(html);
      const remotionVersion = this.extractRemotionVersion(html);

      return {
        isHealthy: true,
        responseTime,
        remotionVersion,
        projectInfo
      };

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          isHealthy: false,
          error: 'Timeout'
        };
      }
      return {
        isHealthy: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Detect if HTML response is from Remotion Studio
   */
  private detectRemotionStudio(html: string): boolean {
    const signatures = [
      'Remotion Studio',
      'remotion-studio',
      '__REMOTION__',
      'remotion.config',
      '"remotion"',
      'webpack.config.remotion'
    ];

    return signatures.some(sig => html.includes(sig));
  }

  /**
   * Extract project information from studio HTML
   */
  private extractProjectInfo(html: string): any {
    try {
      // Look for project metadata in script tags or data attributes
      const titleMatch = html.match(/<title[^>]*>([^<]*)</i);
      const title = titleMatch ? titleMatch[1] : null;

      // Look for webpack configs or project info
      const projectMatch = html.match(/"name":\s*"([^"]+)"/);
      const projectName = projectMatch ? projectMatch[1] : null;

      return {
        name: projectName || title,
        path: null // Would need API endpoint to get this
      };
    } catch (error) {
      this.logger.debug('Failed to extract project info', { error });
      return {};
    }
  }

  /**
   * Extract Remotion version from HTML
   */
  private extractRemotionVersion(html: string): string | undefined {
    try {
      const versionMatch = html.match(/"version":\s*"([^"]+)"|remotion@([^"\\s]+)/);
      return versionMatch ? (versionMatch[1] || versionMatch[2]) : undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Get process uptime in milliseconds
   */
  private async getProcessUptime(pid: number): Promise<number> {
    try {
      if (process.platform === 'win32') {
        // Windows: Get process start time using tasklist
        const { stdout } = await execAsync(`wmic process where "processid=${pid}" get CreationDate /value`);
        const creationMatch = stdout.match(/CreationDate=(\d{14})/);
        
        if (creationMatch) {
          const creationDate = creationMatch[1];
          // Parse WMI date format: 20250129123045.123456+000
          const year = parseInt(creationDate.substring(0, 4));
          const month = parseInt(creationDate.substring(4, 6)) - 1;
          const day = parseInt(creationDate.substring(6, 8));
          const hour = parseInt(creationDate.substring(8, 10));
          const minute = parseInt(creationDate.substring(10, 12));
          const second = parseInt(creationDate.substring(12, 14));
          
          const startTime = new Date(year, month, day, hour, minute, second);
          return Date.now() - startTime.getTime();
        }
      } else {
        // Unix: Use ps to get start time
        const { stdout } = await execAsync(`ps -o lstart= -p ${pid}`);
        const startTime = new Date(stdout.trim());
        return Date.now() - startTime.getTime();
      }

      // Fallback: return 0 if we can't determine uptime
      return 0;
    } catch (error) {
      this.logger.debug('Failed to get process uptime', { pid, error });
      return 0;
    }
  }

  /**
   * Quick ping to check if studio is responsive
   */
  async pingStudio(port: number, timeout: number = 2000): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(`http://localhost:${port}`, {
        signal: controller.signal,
        method: 'HEAD' // Lightweight check
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Check if a studio is running a specific project
   */
  async isStudioRunningProject(port: number, projectName: string): Promise<boolean> {
    try {
      const healthCheck = await this.performHealthCheck(port);
      return healthCheck.isHealthy && 
             (healthCheck.projectInfo?.name === projectName ||
              healthCheck.projectInfo?.path?.includes(projectName) ||
              false);
    } catch {
      return false;
    }
  }

  /**
   * Get detailed information about all discovered studios
   */
  async getStudioReport(): Promise<{
    totalStudios: number;
    healthyStudios: number;
    unhealthyStudios: number;
    studios: DiscoveredStudio[];
    portUsage: number[];
    recommendations: string[];
  }> {
    const allStudios = await this.discoverRunningStudios({ includeUnhealthy: true });
    const healthyStudios = allStudios.filter(s => s.isHealthy);
    const unhealthyStudios = allStudios.filter(s => !s.isHealthy);
    
    const recommendations: string[] = [];
    
    if (allStudios.length === 0) {
      recommendations.push('No studios detected - ready to start new instance');
    } else if (healthyStudios.length === 0) {
      recommendations.push('All detected studios are unhealthy - recommend cleanup and restart');
    } else if (healthyStudios.length === 1) {
      recommendations.push('One healthy studio available - ideal for reuse');
    } else {
      recommendations.push(`${healthyStudios.length} healthy studios running - consider consolidating`);
    }

    if (unhealthyStudios.length > 0) {
      recommendations.push(`${unhealthyStudios.length} unhealthy studios should be cleaned up`);
    }

    return {
      totalStudios: allStudios.length,
      healthyStudios: healthyStudios.length,
      unhealthyStudios: unhealthyStudios.length,
      studios: allStudios,
      portUsage: allStudios.map(s => s.port).sort(),
      recommendations
    };
  }
}