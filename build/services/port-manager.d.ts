export interface PortInfo {
    port: number;
    pid: number;
    processName: string;
    isSystemService: boolean;
    isNodeJs: boolean;
}
export interface PortAllocationResult {
    port: number;
    available: boolean;
    conflictDetails?: PortInfo;
}
export declare class PortManager {
    private static readonly SAFE_PORT_RANGE;
    private static readonly SYSTEM_SERVICES;
    /**
     * Finds the next available port in the safe range, avoiding conflicts
     */
    static findAvailablePort(preferredPort?: number): Promise<PortAllocationResult>;
    /**
     * Gets detailed information about what process is using a specific port
     */
    static getPortInfo(port: number): Promise<PortInfo | null>;
    /**
     * Gets process information for a specific PID
     */
    private static getProcessInfo;
    /**
     * Checks if a specific port is available
     */
    static isPortAvailable(port: number): Promise<boolean>;
    /**
     * Checks if a port is occupied by a Windows system service
     */
    static isPortOccupiedBySystemService(port: number): Promise<boolean>;
    /**
     * Gets all ports currently in use within our safe range
     */
    static getPortsInUse(): Promise<PortInfo[]>;
    /**
     * Force kills a process by PID (use with caution)
     */
    static killProcess(pid: number, force?: boolean): Promise<boolean>;
    /**
     * Validates that a port is safe to use (not reserved by system)
     */
    static validatePortSafety(port: number): Promise<{
        safe: boolean;
        reason?: string;
    }>;
    /**
     * Gets comprehensive port usage report for debugging
     */
    static getPortUsageReport(): Promise<string>;
}
//# sourceMappingURL=port-manager.d.ts.map