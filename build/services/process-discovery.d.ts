import { PortInfo } from './port-manager.js';
export interface StudioProcess {
    pid: number;
    port: number;
    processName: string;
    isResponding: boolean;
    projectPath?: string;
    projectName?: string;
    startupTime?: Date;
    responseTime?: number;
    discoveryMethod: 'http-scan';
}
export interface ProcessDiscoveryResult {
    totalNodeProcesses: number;
    remotionStudios: StudioProcess[];
    otherNodeProcesses: StudioProcess[];
    conflicts: PortInfo[];
}
export declare class ProcessDiscovery {
    private static readonly HTTP_TIMEOUT;
    private static readonly PORT_RANGE;
    private static readonly AVOID_PORTS;
    /**
     * Simple, reliable studio discovery using HTTP scanning only
     */
    static discoverStudioProcesses(): Promise<ProcessDiscoveryResult>;
    /**
     * Scan ports for HTTP servers (simple and reliable)
     */
    private static scanPortsForStudios;
    /**
     * Test HTTP endpoint with proper error handling
     */
    private static testHttpEndpoint;
    /**
     * Test if a server is likely a Remotion Studio
     */
    private static isRemotionStudio;
    /**
     * Detect project information from a running studio
     */
    private static detectProjectFromStudio;
    /**
     * Get all active Remotion Studio processes (main interface)
     */
    static getActiveStudios(): Promise<StudioProcess[]>;
    /**
     * Get a specific studio process by port
     */
    static getStudioByPort(port: number): Promise<StudioProcess | null>;
    /**
     * Check if a specific PID is still running (simplified)
     */
    static isProcessRunning(pid: number): Promise<boolean>;
    /**
     * Get comprehensive discovery report
     */
    static getDiscoveryReport(): Promise<string>;
}
//# sourceMappingURL=process-discovery.d.ts.map