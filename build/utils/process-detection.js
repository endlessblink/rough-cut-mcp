"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findProcessesByName = findProcessesByName;
exports.getPortUsage = getPortUsage;
exports.findRemotionStudioProcesses = findRemotionStudioProcesses;
exports.getProcessWorkingDirectory = getProcessWorkingDirectory;
exports.killProcess = killProcess;
exports.isProcessRunning = isProcessRunning;
exports.waitForPortListening = waitForPortListening;
exports.findAvailablePort = findAvailablePort;
// Process detection utilities for Windows
const child_process_1 = require("child_process");
const util_1 = require("util");
const logger_js_1 = require("./logger.js");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
const logger = (0, logger_js_1.getLogger)().service('ProcessDetection');
/**
 * Get all running processes matching a pattern
 */
async function findProcessesByName(processName) {
    try {
        const cmd = `wmic process where "name like '${processName}%'" get processid,name,commandline /format:csv`;
        const { stdout } = await execAsync(cmd);
        const processes = [];
        const lines = stdout.trim().split('\n').slice(1); // Skip header
        for (const line of lines) {
            if (!line.trim())
                continue;
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
    }
    catch (error) {
        logger.warn(`Failed to find processes by name "${processName}":`, error.message);
        return [];
    }
}
/**
 * Get all processes using specific ports
 */
async function getPortUsage(portRange) {
    try {
        const cmd = 'netstat -ano';
        const { stdout } = await execAsync(cmd);
        const ports = [];
        const lines = stdout.trim().split('\n');
        for (const line of lines) {
            const parts = line.trim().split(/\s+/);
            if (parts.length >= 5 && (parts[0] === 'TCP' || parts[0] === 'UDP')) {
                const protocol = parts[0];
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
    }
    catch (error) {
        logger.warn('Failed to get port usage:', error.message);
        return [];
    }
}
/**
 * Find Remotion Studio processes specifically
 */
async function findRemotionStudioProcesses() {
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
    }
    catch (error) {
        logger.warn('Failed to find Remotion Studio processes:', error.message);
        return [];
    }
}
/**
 * Get process working directory
 */
async function getProcessWorkingDirectory(pid) {
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
    }
    catch (error) {
        logger.warn(`Failed to get working directory for PID ${pid}:`, error.message);
        return null;
    }
}
/**
 * Kill process by PID
 */
async function killProcess(pid, force = false) {
    try {
        const cmd = force ? `taskkill /PID ${pid} /F` : `taskkill /PID ${pid}`;
        await execAsync(cmd);
        logger.info(`Successfully killed process ${pid}`);
        return { success: true };
    }
    catch (error) {
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
async function isProcessRunning(pid) {
    try {
        const cmd = `tasklist /FI "PID eq ${pid}"`;
        const { stdout } = await execAsync(cmd);
        return stdout.includes(pid);
    }
    catch (error) {
        logger.warn(`Failed to check if process ${pid} is running:`, error.message);
        return false;
    }
}
/**
 * Wait for a process to start listening on a specific port
 */
async function waitForPortListening(port, timeoutMs = 10000, intervalMs = 500) {
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
        }
        catch (error) {
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
async function findAvailablePort(startPort = 7400, endPort = 7600) {
    try {
        const usedPorts = await getPortUsage({ start: startPort, end: endPort });
        const usedPortNumbers = new Set(usedPorts.map(p => p.port));
        for (let port = startPort; port <= endPort; port++) {
            if (!usedPortNumbers.has(port)) {
                // Double-check by trying to bind
                try {
                    const net = await import('net');
                    const server = net.createServer();
                    await new Promise((resolve, reject) => {
                        server.listen(port, '127.0.0.1', () => {
                            server.close(() => resolve());
                        });
                        server.on('error', reject);
                    });
                    return port;
                }
                catch {
                    // Port is actually in use, continue searching
                    continue;
                }
            }
        }
        return null; // No available port found
    }
    catch (error) {
        logger.warn('Failed to find available port:', error.message);
        return null;
    }
}
//# sourceMappingURL=process-detection.js.map