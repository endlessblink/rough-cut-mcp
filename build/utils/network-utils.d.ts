/**
 * Network Utilities for Remote Access Support
 * Detects network IP addresses for remote studio access
 */
export interface NetworkUrls {
    local: string;
    network: string | null;
    tunnel: string | null;
    primary: string;
}
/**
 * Get the primary network IPv4 address of the machine
 * Prioritizes Ethernet/WiFi interfaces over virtual ones
 */
export declare function getNetworkAddress(): string;
/**
 * Check if the current environment is local (not remote)
 */
export declare function isLocalEnvironment(): boolean;
/**
 * Build network URLs for studio access
 */
export declare function buildNetworkUrls(port: number): NetworkUrls;
/**
 * Get firewall instructions for Windows
 */
export declare function getFirewallInstructions(port: number): string[];
/**
 * Format studio URLs for display
 */
export declare function formatStudioUrls(urls: NetworkUrls, includeFirewall?: boolean): string[];
//# sourceMappingURL=network-utils.d.ts.map