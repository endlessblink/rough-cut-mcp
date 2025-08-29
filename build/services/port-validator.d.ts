/**
 * Cross-Platform Port Validator
 * Provides robust port checking and process management across Windows, Mac, Linux
 */
import { ProcessInfo } from '../types/studio-discovery.js';
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
export declare class PortValidator {
    private logger;
    private platform;
    /**
     * Check if a specific port is available
     */
    isPortAvailable(port: number): Promise<boolean>;
    /**
     * Find the next available port starting from a given port
     */
    findAvailablePort(startPort?: number, maxPort?: number): Promise<number>;
    /**
     * Get detailed information about what's using a port
     */
    getPortProcessInfo(port: number): Promise<ProcessInfo | null>;
    /**
     * Kill process using a specific port
     */
    killProcessOnPort(port: number, force?: boolean): Promise<boolean>;
    /**
     * Get all ports in use within a range
     */
    getPortsInUse(range: PortRange): Promise<number[]>;
    /**
     * Validate multiple ports at once
     */
    validatePortRange(range: PortRange): Promise<PortValidationResult[]>;
    /**
     * Private: Try to bind to a port to test availability
     */
    private tryBindPort;
    /**
     * Private: System-level port check
     */
    private systemPortCheck;
    /**
     * Private: Get process info on Windows
     */
    private getWindowsPortProcess;
    /**
     * Private: Get process info on Unix systems
     */
    private getUnixPortProcess;
    /**
     * Clean up TIME_WAIT connections (platform-specific)
     */
    cleanupTimeWaitConnections(port?: number): Promise<number>;
}
//# sourceMappingURL=port-validator.d.ts.map