"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortManager = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
const logger_js_1 = require("../utils/logger.js");
const logger = (0, logger_js_1.getLogger)().service('PortManager');
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class PortManager {
    static SAFE_PORT_RANGE = {
        start: 3000,
        end: 3020,
        reserved: [] // Will be populated dynamically
    };
    static SYSTEM_SERVICES = [
        'svchost.exe',
        'System',
        'services.exe',
        'winlogon.exe',
        'csrss.exe'
    ];
    /**
     * Finds the next available port in the safe range, avoiding conflicts
     */
    static async findAvailablePort(preferredPort) {
        const startPort = preferredPort || PortManager.SAFE_PORT_RANGE.start;
        // First check if preferred port is available
        if (preferredPort) {
            const portInfo = await PortManager.getPortInfo(preferredPort);
            if (!portInfo) {
                return { port: preferredPort, available: true };
            }
            // If occupied, return conflict details
            return {
                port: preferredPort,
                available: false,
                conflictDetails: portInfo
            };
        }
        // Search for available port in range
        for (let port = startPort; port <= PortManager.SAFE_PORT_RANGE.end; port++) {
            const portInfo = await PortManager.getPortInfo(port);
            if (!portInfo) {
                return { port, available: true };
            }
            logger.debug(`Port ${port} occupied by ${portInfo.processName} (PID: ${portInfo.pid})`);
        }
        throw new Error(`No available ports found in range ${startPort}-${PortManager.SAFE_PORT_RANGE.end}`);
    }
    /**
     * Gets detailed information about what process is using a specific port
     */
    static async getPortInfo(port) {
        try {
            // Use netstat to find the process using the port
            const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
            if (!stdout.trim()) {
                return null; // Port is available
            }
            // Parse netstat output to find the PID
            const lines = stdout.trim().split('\n');
            let pid = null;
            for (const line of lines) {
                // Look for LISTENING connections
                if (line.includes('LISTENING')) {
                    const parts = line.trim().split(/\s+/);
                    const pidStr = parts[parts.length - 1];
                    pid = parseInt(pidStr, 10);
                    if (!isNaN(pid)) {
                        break;
                    }
                }
            }
            if (!pid) {
                logger.warn(`Could not extract PID for port ${port} from netstat output`);
                return null;
            }
            // Get process information using tasklist
            const processInfo = await PortManager.getProcessInfo(pid);
            if (!processInfo) {
                logger.warn(`Could not get process info for PID ${pid}`);
                return null;
            }
            return {
                port,
                pid,
                processName: processInfo.processName,
                isSystemService: PortManager.SYSTEM_SERVICES.includes(processInfo.processName.toLowerCase()),
                isNodeJs: processInfo.processName.toLowerCase().includes('node.exe')
            };
        }
        catch (error) {
            logger.error(`Error checking port ${port}:`, error);
            return null;
        }
    }
    /**
     * Gets process information for a specific PID
     */
    static async getProcessInfo(pid) {
        try {
            // Get process name from tasklist
            const { stdout } = await execAsync(`tasklist | findstr ${pid}`);
            if (!stdout.trim()) {
                return null;
            }
            const lines = stdout.trim().split('\n');
            const line = lines[0];
            const parts = line.trim().split(/\s+/);
            const processName = parts[0];
            return { processName };
        }
        catch (error) {
            logger.error(`Error getting process info for PID ${pid}:`, error);
            return null;
        }
    }
    /**
     * Checks if a specific port is available
     */
    static async isPortAvailable(port) {
        const portInfo = await PortManager.getPortInfo(port);
        return portInfo === null;
    }
    /**
     * Checks if a port is occupied by a Windows system service
     */
    static async isPortOccupiedBySystemService(port) {
        const portInfo = await PortManager.getPortInfo(port);
        return portInfo?.isSystemService ?? false;
    }
    /**
     * Gets all ports currently in use within our safe range
     */
    static async getPortsInUse() {
        const portsInUse = [];
        for (let port = PortManager.SAFE_PORT_RANGE.start; port <= PortManager.SAFE_PORT_RANGE.end; port++) {
            const portInfo = await PortManager.getPortInfo(port);
            if (portInfo) {
                portsInUse.push(portInfo);
            }
        }
        return portsInUse;
    }
    /**
     * Force kills a process by PID (use with caution)
     */
    static async killProcess(pid, force = false) {
        try {
            // First check if process exists
            const processInfo = await PortManager.getProcessInfo(pid);
            if (!processInfo) {
                logger.warn(`Process ${pid} not found`);
                return false;
            }
            // Don't kill system services
            if (PortManager.SYSTEM_SERVICES.includes(processInfo.processName.toLowerCase())) {
                logger.error(`Refusing to kill system service: ${processInfo.processName}`);
                return false;
            }
            // Kill the process
            const killCommand = force ? `taskkill /F /PID ${pid}` : `taskkill /PID ${pid}`;
            await execAsync(killCommand);
            logger.info(`Successfully killed process ${processInfo.processName} (PID: ${pid})`);
            return true;
        }
        catch (error) {
            logger.error(`Error killing process ${pid}:`, error);
            return false;
        }
    }
    /**
     * Validates that a port is safe to use (not reserved by system)
     */
    static async validatePortSafety(port) {
        // Check if port is in system reserved range
        if (port < 1024) {
            return { safe: false, reason: 'Port is in system reserved range (< 1024)' };
        }
        // Check if port is outside our safe range
        if (port < PortManager.SAFE_PORT_RANGE.start || port > PortManager.SAFE_PORT_RANGE.end) {
            return { safe: false, reason: `Port is outside safe range (${PortManager.SAFE_PORT_RANGE.start}-${PortManager.SAFE_PORT_RANGE.end})` };
        }
        // Check if port is occupied by system service
        const isSystemService = await PortManager.isPortOccupiedBySystemService(port);
        if (isSystemService) {
            return { safe: false, reason: 'Port is occupied by Windows system service' };
        }
        return { safe: true };
    }
    /**
     * Gets comprehensive port usage report for debugging
     */
    static async getPortUsageReport() {
        const portsInUse = await PortManager.getPortsInUse();
        let report = `\n=== PORT USAGE REPORT ===\n`;
        report += `Safe range: ${PortManager.SAFE_PORT_RANGE.start}-${PortManager.SAFE_PORT_RANGE.end}\n`;
        report += `Ports in use: ${portsInUse.length}\n\n`;
        if (portsInUse.length === 0) {
            report += `No ports in use in safe range.\n`;
        }
        else {
            for (const portInfo of portsInUse) {
                report += `Port ${portInfo.port}: ${portInfo.processName} (PID: ${portInfo.pid})`;
                if (portInfo.isSystemService) {
                    report += ` [SYSTEM SERVICE]`;
                }
                if (portInfo.isNodeJs) {
                    report += ` [NODE.JS]`;
                }
                report += `\n`;
            }
        }
        report += `\n========================\n`;
        return report;
    }
}
exports.PortManager = PortManager;
//# sourceMappingURL=port-manager.js.map