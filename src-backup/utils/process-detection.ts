// Process detection utilities for Windows
import { exec } from 'child_process';
import { promisify } from 'util';
import { getLogger } from './logger.js';

const execAsync = promisify(exec);
const logger = getLogger().service('ProcessDetection');

export interface ProcessInfo {
  pid: string;
  name: string;
  commandLine: string;
  port?: number;
  workingDir?: string;
}

export interface PortInfo {
  port: number;
  pid: string;
  protocol: 'TCP' | 'UDP';
  state: 'LISTENING' | 'ESTABLISHED' | 'CLOSE_WAIT' | string;
  localAddress: string;
  remoteAddress?: string;
}

/**
 * Get all running processes matching a pattern
 */
export async function findProcessesByName(processName: string): Promise<ProcessInfo[]> {
  try {
    const cmd = `wmic process where "name like '${processName}%'" get processid,name,commandline /format:csv`;
    const { stdout } = await execAsync(cmd);
    
    const processes: ProcessInfo[] = [];
    const lines = stdout.trim().split('\n').slice(1); // Skip header
    
    for (const line of lines) {
      if (!line.trim()) continue;
      
      const parts = line.split(',');
      if (parts.length >= 3) {
        const commandLine = parts[1] || '';
        const name = parts[2] || '';
        const pid = parts[3] || '';
        
        if (pid && pid !== '0') {
          processes.push({
            pid: pid.trim(),
            name: name.trim(),
            commandLine: commandLine.trim(),
          });
        }
      }
    }
    
    return processes;
    
  } catch (error: any) {
    logger.warn(`Failed to find processes by name "${processName}":`, error.message);
    return [];
  }
}

/**
 * Get all processes using specific ports
 */
export async function getPortUsage(portRange?: { start: number; end: number }): Promise<PortInfo[]> {
  try {
    const cmd = 'netstat -ano';
    const { stdout } = await execAsync(cmd);
    
    const ports: PortInfo[] = [];
    const lines = stdout.trim().split('\n');
    
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 5 && (parts[0] === 'TCP' || parts[0] === 'UDP')) {
        const protocol = parts[0] as 'TCP' | 'UDP';
        const localAddress = parts[1];
        const remoteAddress = parts[2];
        const state = parts[3];
        const pid = parts[4] || parts[parts.length - 1];
        
        // Extract port from local address (format: IP:PORT)
        const portMatch = localAddress.match(/:(\d+)$/);
        if (portMatch) {
          const port = parseInt(portMatch[1]);
          
          // Filter by port range if provided
          if (!portRange || (port >= portRange.start && port <= portRange.end)) {
            ports.push({
              port,
              pid: pid.trim(),
              protocol,
              state,
              localAddress,
              remoteAddress: remoteAddress !== '*:*' ? remoteAddress : undefined,
            });
          }
        }
      }
    }
    
    return ports;
    
  } catch (error: any) {
    logger.warn('Failed to get port usage:', error.message);
    return [];
  }
}

/**
 * Find Remotion Studio processes specifically
 */
export async function findRemotionStudioProcesses(): Promise<(ProcessInfo & { port?: number; projectPath?: string })[]> {
  try {
    // Find all node.exe processes
    const nodeProcesses = await findProcessesByName('node.exe');
    
    const studioProcesses = nodeProcesses
      .filter(proc => proc.commandLine.includes('remotion') && 
                     (proc.commandLine.includes('studio') || proc.commandLine.includes('preview')))
      .map(proc => {
        // Extract port from command line
        const portMatch = proc.commandLine.match(/--port[\s=](\d+)/);
        const port = portMatch ? parseInt(portMatch[1]) : undefined;
        
        // Extract project path
        const rootMatch = proc.commandLine.match(/--root[\s=]"?([^"\s]+)"?/);
        const cwdMatch = proc.commandLine.match(/--cwd[\s=]"?([^"\s]+)"?/);
        const projectPath = rootMatch?.[1] || cwdMatch?.[1];
        
        return {
          ...proc,
          port,
          projectPath,
        };
      });
    
    return studioProcesses;
    
  } catch (error: any) {
    logger.warn('Failed to find Remotion Studio processes:', error.message);
    return [];
  }
}

/**
 * Get process working directory
 */
export async function getProcessWorkingDirectory(pid: string): Promise<string | null> {
  try {
    const cmd = `wmic process where "processid=${pid}" get commandline /format:csv`;
    const { stdout } = await execAsync(cmd);
    
    const lines = stdout.trim().split('\n');
    if (lines.length >= 2) {
      const commandLine = lines[1].split(',')[1] || '';
      
      // Try to extract working directory from command line
      const cwdMatch = commandLine.match(/--cwd[\s=]"?([^"\s]+)"?/);
      if (cwdMatch) {
        return cwdMatch[1];
      }
      
      // Fallback: try to get actual working directory
      const pwdCmd = `powershell "Get-WmiObject Win32_Process -Filter \\"ProcessId=${pid}\\" | Select-Object CommandLine"`;
      const { stdout: pwdOutput } = await execAsync(pwdCmd);
      
      const pathMatch = pwdOutput.match(/([C-Z]:\\[^"]*)/);
      return pathMatch ? pathMatch[1] : null;
    }
    
    return null;
    
  } catch (error: any) {
    logger.warn(`Failed to get working directory for PID ${pid}:`, error.message);
    return null;
  }
}

/**
 * Kill process by PID
 */
export async function killProcess(pid: string, force = false): Promise<{ success: boolean; error?: string }> {
  try {
    const cmd = force ? `taskkill /PID ${pid} /F` : `taskkill /PID ${pid}`;
    await execAsync(cmd);
    
    logger.info(`Successfully killed process ${pid}`);
    return { success: true };
    
  } catch (error: any) {
    logger.warn(`Failed to kill process ${pid}:`, error.message);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

/**
 * Check if a process is still running
 */
export async function isProcessRunning(pid: string): Promise<boolean> {
  try {
    const cmd = `tasklist /FI "PID eq ${pid}"`;
    const { stdout } = await execAsync(cmd);
    
    return stdout.includes(pid);
    
  } catch (error: any) {
    logger.warn(`Failed to check if process ${pid} is running:`, error.message);
    return false;
  }
}

/**
 * Wait for a process to start listening on a specific port
 */
export async function waitForPortListening(
  port: number, 
  timeoutMs = 10000, 
  intervalMs = 500
): Promise<{ success: boolean; error?: string; pid?: string }> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeoutMs) {
    try {
      const portInfo = await getPortUsage({ start: port, end: port });
      const listeningPorts = portInfo.filter(p => p.port === port && p.state === 'LISTENING');
      
      if (listeningPorts.length > 0) {
        return {
          success: true,
          pid: listeningPorts[0].pid,
        };
      }
      
      // Wait before next check
      await new Promise(resolve => setTimeout(resolve, intervalMs));
      
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
  
  return {
    success: false,
    error: `Timeout waiting for port ${port} to start listening (${timeoutMs}ms)`,
  };
}

/**
 * Find available port in range
 */
export async function findAvailablePort(startPort = 7400, endPort = 7600): Promise<number | null> {
  try {
    const usedPorts = await getPortUsage({ start: startPort, end: endPort });
    const usedPortNumbers = new Set(usedPorts.map(p => p.port));
    
    for (let port = startPort; port <= endPort; port++) {
      if (!usedPortNumbers.has(port)) {
        // Double-check by trying to bind
        try {
          const net = await import('net');
          const server = net.createServer();
          
          await new Promise<void>((resolve, reject) => {
            server.listen(port, '127.0.0.1', () => {
              server.close(() => resolve());
            });
            server.on('error', reject);
          });
          
          return port;
          
        } catch {
          // Port is actually in use, continue searching
          continue;
        }
      }
    }
    
    return null; // No available port found
    
  } catch (error: any) {
    logger.warn('Failed to find available port:', error.message);
    return null;
  }
}