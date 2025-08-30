/**
 * Get Windows project path for a project name
 */
export declare function getWindowsProjectPath(projectName: string): string;
/**
 * Get assets directory using Windows paths
 */
export declare function getAssetsDir(): string;
/**
 * Find what process is actually using a port
 * Uses modern Windows commands instead of deprecated WMIC
 */
export declare function findProcessOnPort(port: number): Promise<number | null>;
/**
 * Kill process on specific port
 * Uses direct Windows commands that actually work
 */
export declare function killProcessOnPort(port: number): Promise<boolean>;
/**
 * Validate that Remotion is actually available
 */
export declare function validateRemotionAvailable(): Promise<boolean>;
/**
 * Get real system status - no lies, just facts
 */
export declare function getSystemStatus(): Promise<{
    ports: Array<{
        port: number;
        pid: number;
    }>;
    remotionAvailable: boolean;
}>;
/**
 * Find which port a studio is running on (if any)
 */
export declare function findStudioPort(): Promise<number | null>;
//# sourceMappingURL=utils.d.ts.map