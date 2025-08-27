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
export declare function findProcessesByName(processName: string): Promise<ProcessInfo[]>;
/**
 * Get all processes using specific ports
 */
export declare function getPortUsage(portRange?: {
    start: number;
    end: number;
}): Promise<PortInfo[]>;
/**
 * Find Remotion Studio processes specifically
 */
export declare function findRemotionStudioProcesses(): Promise<(ProcessInfo & {
    port?: number;
    projectPath?: string;
})[]>;
/**
 * Get process working directory
 */
export declare function getProcessWorkingDirectory(pid: string): Promise<string | null>;
/**
 * Kill process by PID
 */
export declare function killProcess(pid: string, force?: boolean): Promise<{
    success: boolean;
    error?: string;
}>;
/**
 * Check if a process is still running
 */
export declare function isProcessRunning(pid: string): Promise<boolean>;
/**
 * Wait for a process to start listening on a specific port
 */
export declare function waitForPortListening(port: number, timeoutMs?: number, intervalMs?: number): Promise<{
    success: boolean;
    error?: string;
    pid?: string;
}>;
/**
 * Find available port in range
 */
export declare function findAvailablePort(startPort?: number, endPort?: number): Promise<number | null>;
//# sourceMappingURL=process-detection.d.ts.map