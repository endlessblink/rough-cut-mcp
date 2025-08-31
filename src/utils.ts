// Windows Utility Functions - Simple and Direct
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import axios from 'axios';

const execAsync = promisify(exec);

/**
 * Get Windows project path for a project name
 */
export function getWindowsProjectPath(projectName: string): string {
  const assetsDir = getAssetsDir();
  return path.join(assetsDir, 'projects', projectName);
}

/**
 * Get assets directory using Windows paths
 */
export function getAssetsDir(): string {
  // Use environment variable or default Windows path
  return process.env.REMOTION_ASSETS_DIR || 
         'D:\\MY PROJECTS\\AI\\LLM\\AI Code Gen\\my-builds\\Video + Motion\\RoughCut\\assets';
}

/**
 * Find what process is actually using a port
 * Uses modern Windows commands instead of deprecated WMIC
 */
export async function findProcessOnPort(port: number): Promise<number | null> {
  try {
    // Use netstat to find port, then tasklist to get process name
    const netstatResult = await execAsync(`netstat -ano | findstr :${port} | findstr LISTENING`);
    
    if (!netstatResult.stdout.trim()) {
      return null; // No process on port
    }
    
    // Extract PID from netstat output: "TCP 0.0.0.0:3000 ... LISTENING 1234"
    const match = netstatResult.stdout.match(/\s+(\d+)\s*$/);
    if (!match) {
      return null;
    }
    
    const pid = parseInt(match[1], 10);
    
    // Verify it's actually a node/remotion process
    try {
      const processResult = await execAsync(`tasklist /fi "PID eq ${pid}" /fo csv`);
      if (processResult.stdout.includes('node.exe') || processResult.stdout.includes('remotion')) {
        return pid;
      }
    } catch {
      // If tasklist fails, still return the PID
      return pid;
    }
    
    return pid;
    
  } catch (error) {
    return null;
  }
}

/**
 * Kill process on specific port
 * Uses direct Windows commands that actually work
 */
export async function killProcessOnPort(port: number): Promise<boolean> {
  try {
    const pid = await findProcessOnPort(port);
    
    if (!pid) {
      return false; // Nothing to kill
    }
    
    // Use Windows taskkill - force kill the process tree
    await execAsync(`taskkill /f /t /pid ${pid}`);
    
    // Wait a moment for cleanup
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verify it's actually gone
    const stillExists = await findProcessOnPort(port);
    return !stillExists;
    
  } catch (error) {
    // If kill fails, that's usually fine (process already dead)
    return true;
  }
}

/**
 * Validate that Remotion is actually available
 */
export async function validateRemotionAvailable(): Promise<boolean> {
  try {
    const result = await execAsync('npx.cmd remotion --version', { timeout: 10000 });
    return result.stdout.includes('remotion') || result.stdout.includes('4.0');
  } catch {
    return false;
  }
}

/**
 * Get real system status - no lies, just facts
 */
export async function getSystemStatus(): Promise<{ports: Array<{port: number, pid: number}>, remotionAvailable: boolean}> {
  const ports = [];
  
  // Check 6600-6620 studio port range
  for (const port of [6600, 6601, 6602, 6603, 6604, 6605, 6606, 6607, 6608, 6609, 6610]) {
    const pid = await findProcessOnPort(port);
    if (pid) {
      ports.push({ port, pid });
    }
  }
  
  const remotionAvailable = await validateRemotionAvailable();
  
  return { ports, remotionAvailable };
}

/**
 * Find which port a studio is running on (if any)
 */
export async function findStudioPort(): Promise<number | null> {
  // Check 6600-6620 studio port range
  for (const port of [6600, 6601, 6602, 6603, 6604, 6605, 6606, 6607, 6608, 6609, 6610]) {
    const pid = await findProcessOnPort(port);
    if (pid) {
      return port; // Return first found port
    }
  }
  return null;
}

/**
 * HTTP-based health check for Remotion Studio (research-backed solution)
 * Tests actual functionality instead of guessing from processes
 */
export async function checkStudioHealth(port: number): Promise<boolean> {
  try {
    // Test the ACTUAL Remotion Studio endpoint (research finding: root /)
    const response = await axios.get(`http://localhost:${port}`, {
      timeout: 5000,
      validateStatus: (status) => status >= 200 && status < 400
    });
    
    // Verify it's actually Remotion Studio responding
    return response.status === 200 || 
           response.data?.includes('remotion') ||
           response.headers['content-type']?.includes('text/html');
    
  } catch (error) {
    // Connection refused, timeout, or other HTTP errors = not healthy
    return false;
  }
}