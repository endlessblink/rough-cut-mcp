/**
 * Cross-Platform Port Validator
 * Provides robust port checking and process management across Windows, Mac, Linux
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as net from 'net';
import { getLogger } from '../utils/logger.js';
import { ProcessInfo } from '../types/studio-discovery.js';

const execAsync = promisify(exec);

export interface PortValidationResult {
  port: number;
  isAvailable: boolean;
  processInfo?: ProcessInfo;
  error?: string;
}

export interface PortRange {
  min: number;
  max: number;
}

export class PortValidator {
  private logger = getLogger().service('PortValidator');
  private platform = process.platform;

  /**
   * Check if a specific port is available
   */
  async isPortAvailable(port: number): Promise<boolean> {
    try {
      // Method 1: Try to bind to the port
      const isBindable = await this.tryBindPort(port);
      if (!isBindable) {
        return false;
      }

      // Method 2: Cross-check with system commands
      const systemCheck = await this.systemPortCheck(port);
      return !systemCheck.inUse;

    } catch (error) {
      this.logger.debug('Port availability check failed', { port, error });
      return false;
    }
  }

  /**
   * Find the next available port starting from a given port
   */
  async findAvailablePort(startPort: number = 3002, maxPort: number = 3100): Promise<number> { // Exclude 3001
    this.logger.debug('Finding available port', { startPort, maxPort });

    for (let port = startPort; port <= maxPort; port++) {
      if (await this.isPortAvailable(port)) {
        this.logger.info('Found available port', { port });
        return port;
      }
    }

    throw new Error(`No available ports in range ${startPort}-${maxPort}`);
  }

  /**
   * Get detailed information about what's using a port
   */
  async getPortProcessInfo(port: number): Promise<ProcessInfo | null> {
    try {
      if (this.platform === 'win32') {
        return await this.getWindowsPortProcess(port);
      } else {
        return await this.getUnixPortProcess(port);
      }
    } catch (error) {
      this.logger.debug('Failed to get port process info', { port, error });
      return null;
    }
  }

  /**
   * Kill process using a specific port
   */
  async killProcessOnPort(port: number, force: boolean = false): Promise<boolean> {
    const processInfo = await this.getPortProcessInfo(port);
    
    if (!processInfo) {
      this.logger.debug('No process found on port', { port });
      return true; // Port is already free
    }

    try {
      if (this.platform === 'win32') {
        const cmd = force ? `taskkill /PID ${processInfo.pid} /F` : `taskkill /PID ${processInfo.pid}`;
        await execAsync(cmd);
      } else {
        const signal = force ? 'SIGKILL' : 'SIGTERM';
        process.kill(processInfo.pid, signal);
      }

      // Wait a moment for the process to terminate
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verify the port is now free
      const isNowFree = await this.isPortAvailable(port);
      this.logger.info('Process kill result', { 
        port, 
        pid: processInfo.pid, 
        success: isNowFree 
      });

      return isNowFree;
    } catch (error) {
      this.logger.error('Failed to kill process on port', { port, pid: processInfo.pid, error });
      return false;
    }
  }

  /**
   * Get all ports in use within a range
   */
  async getPortsInUse(range: PortRange): Promise<number[]> {
    const portsInUse: number[] = [];

    try {
      if (this.platform === 'win32') {
        const { stdout } = await execAsync('netstat -an | findstr LISTENING');
        const lines = stdout.split('\n');

        for (const line of lines) {
          const match = line.match(/:(\d{4,5})\s/);
          if (match) {
            const port = parseInt(match[1]);
            if (port >= range.min && port <= range.max) {
              portsInUse.push(port);
            }
          }
        }
      } else {
        const { stdout } = await execAsync(`ss -tlpn | grep -E ":(${range.min}|${range.min + 1}|${range.min + 2}|${range.max})"`);
        const lines = stdout.split('\n');

        for (const line of lines) {
          const match = line.match(/:(\d{4,5})/);
          if (match) {
            const port = parseInt(match[1]);
            if (port >= range.min && port <= range.max) {
              portsInUse.push(port);
            }
          }
        }
      }

      return [...new Set(portsInUse)].sort();
    } catch (error) {
      this.logger.error('Failed to get ports in use', { range, error });
      return [];
    }
  }

  /**
   * Validate multiple ports at once
   */
  async validatePortRange(range: PortRange): Promise<PortValidationResult[]> {
    const results: PortValidationResult[] = [];

    for (let port = range.min; port <= range.max; port++) {
      try {
        const isAvailable = await this.isPortAvailable(port);
        const processInfo = isAvailable ? undefined : (await this.getPortProcessInfo(port)) || undefined;

        results.push({
          port,
          isAvailable,
          processInfo
        });
      } catch (error) {
        results.push({
          port,
          isAvailable: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  }

  /**
   * Private: Try to bind to a port to test availability
   */
  private async tryBindPort(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const server = net.createServer();
      
      server.once('error', () => {
        resolve(false);
      });
      
      server.once('listening', () => {
        server.close(() => {
          resolve(true);
        });
      });
      
      server.listen(port, '127.0.0.1');
    });
  }

  /**
   * Private: System-level port check
   */
  private async systemPortCheck(port: number): Promise<{ inUse: boolean; pid?: number }> {
    try {
      if (this.platform === 'win32') {
        const { stdout } = await execAsync(`netstat -ano | findstr :${port} | findstr LISTENING`);
        if (stdout.trim()) {
          const match = stdout.match(/\s+(\d+)$/);
          const pid = match ? parseInt(match[1]) : undefined;
          return { inUse: true, pid };
        }
        return { inUse: false };
      } else {
        const { stdout } = await execAsync(`lsof -i :${port}`);
        if (stdout.trim()) {
          const match = stdout.match(/(\d+)/);
          const pid = match ? parseInt(match[1]) : undefined;
          return { inUse: true, pid };
        }
        return { inUse: false };
      }
    } catch (error) {
      // Command failed - likely means port is not in use
      return { inUse: false };
    }
  }

  /**
   * Private: Get process info on Windows
   */
  private async getWindowsPortProcess(port: number): Promise<ProcessInfo | null> {
    try {
      // Get PID from netstat
      const { stdout: netstatOutput } = await execAsync(`netstat -ano | findstr :${port} | findstr LISTENING`);
      const netstatMatch = netstatOutput.match(/\s+(\d+)$/);
      
      if (!netstatMatch) {
        return null;
      }

      const pid = parseInt(netstatMatch[1]);

      // Get process details from tasklist
      const { stdout: tasklistOutput } = await execAsync(`tasklist /FI "PID eq ${pid}" /FO CSV`);
      const lines = tasklistOutput.split('\n');
      
      if (lines.length > 1) {
        const fields = lines[1].split(',');
        const processName = fields[0]?.replace(/"/g, '') || 'Unknown';

        // Try to get command line from wmic
        let commandLine = 'Unknown';
        try {
          const { stdout: wmicOutput } = await execAsync(`wmic process where "processid=${pid}" get commandline /value`);
          const commandMatch = wmicOutput.match(/CommandLine=(.*)/);
          if (commandMatch) {
            commandLine = commandMatch[1].trim();
          }
        } catch {
          // wmic failed, use process name as fallback
          commandLine = processName;
        }

        return {
          pid,
          port,
          processName,
          commandLine
        };
      }

      return null;
    } catch (error) {
      this.logger.debug('Windows port process lookup failed', { port, error });
      return null;
    }
  }

  /**
   * Private: Get process info on Unix systems
   */
  private async getUnixPortProcess(port: number): Promise<ProcessInfo | null> {
    try {
      const { stdout } = await execAsync(`lsof -i :${port}`);
      const lines = stdout.split('\n');
      
      for (const line of lines) {
        if (line.includes('LISTEN')) {
          const parts = line.split(/\s+/);
          const processName = parts[0];
          const pid = parseInt(parts[1]);
          
          if (!isNaN(pid)) {
            // Get command line from ps
            let commandLine = 'Unknown';
            try {
              const { stdout: psOutput } = await execAsync(`ps -p ${pid} -o cmd=`);
              commandLine = psOutput.trim();
            } catch {
              commandLine = processName;
            }

            return {
              pid,
              port,
              processName,
              commandLine
            };
          }
        }
      }

      return null;
    } catch (error) {
      this.logger.debug('Unix port process lookup failed', { port, error });
      return null;
    }
  }

  /**
   * Clean up TIME_WAIT connections (platform-specific)
   */
  async cleanupTimeWaitConnections(port?: number): Promise<number> {
    try {
      let cleanedConnections = 0;

      if (this.platform === 'win32') {
        // Windows: Reset TCP connections
        if (port) {
          // Kill specific port connections
          try {
            await execAsync(`netsh interface ip delete destinationcache`);
            cleanedConnections++;
          } catch (error) {
            this.logger.debug('Failed to cleanup Windows connections', { port, error });
          }
        }
      } else {
        // Unix: Adjust TCP settings to reduce TIME_WAIT
        try {
          await execAsync('sysctl -w net.ipv4.tcp_tw_reuse=1');
          cleanedConnections++;
        } catch (error) {
          this.logger.debug('Failed to cleanup Unix connections', { error });
        }
      }

      this.logger.info('TIME_WAIT cleanup completed', { 
        port, 
        cleanedConnections, 
        platform: this.platform 
      });
      
      return cleanedConnections;
    } catch (error) {
      this.logger.error('TIME_WAIT cleanup failed', { port, error });
      return 0;
    }
  }
}