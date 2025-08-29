/**
 * Studio Discovery Service
 * Discovers existing Remotion Studio instances across the system
 * Solves the core problem: MCP reusing healthy studios instead of spawning new ones
 */
import { DiscoveredStudio, StudioDiscoveryOptions } from '../types/studio-discovery.js';
export declare class StudioDiscoveryService {
    private logger;
    private defaultOptions;
    /**
     * Main discovery method - finds all running Remotion studios
     */
    discoverRunningStudios(options?: StudioDiscoveryOptions): Promise<DiscoveredStudio[]>;
    /**
     * Check if a specific port is running a Remotion studio
     */
    identifyStudio(port: number, options?: StudioDiscoveryOptions): Promise<DiscoveredStudio | null>;
    /**
     * Find the best studio to reuse based on criteria
     */
    findBestStudio(preferredProject?: string): Promise<DiscoveredStudio | null>;
    /**
     * Get all listening ports in specified range
     */
    private getListeningPorts;
    /**
     * Get process information from port
     */
    private getProcessInfoFromPort;
    /**
     * Perform health check on a potential studio
     */
    private performHealthCheck;
    /**
     * Detect if HTML response is from Remotion Studio
     */
    private detectRemotionStudio;
    /**
     * Extract project information from studio HTML
     */
    private extractProjectInfo;
    /**
     * Extract Remotion version from HTML
     */
    private extractRemotionVersion;
    /**
     * Get process uptime in milliseconds
     */
    private getProcessUptime;
    /**
     * Quick ping to check if studio is responsive
     */
    pingStudio(port: number, timeout?: number): Promise<boolean>;
    /**
     * Check if a studio is running a specific project
     */
    isStudioRunningProject(port: number, projectName: string): Promise<boolean>;
    /**
     * Get detailed information about all discovered studios
     */
    getStudioReport(): Promise<{
        totalStudios: number;
        healthyStudios: number;
        unhealthyStudios: number;
        studios: DiscoveredStudio[];
        portUsage: number[];
        recommendations: string[];
    }>;
}
//# sourceMappingURL=studio-discovery.d.ts.map