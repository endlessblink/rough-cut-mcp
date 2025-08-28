"use strict";
/**
 * Network Utilities for Remote Access Support
 * Detects network IP addresses for remote studio access
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNetworkAddress = getNetworkAddress;
exports.isLocalEnvironment = isLocalEnvironment;
exports.buildNetworkUrls = buildNetworkUrls;
exports.getFirewallInstructions = getFirewallInstructions;
exports.formatStudioUrls = formatStudioUrls;
const os_1 = __importDefault(require("os"));
const logger_js_1 = require("./logger.js");
const logger = (0, logger_js_1.getLogger)().service('NetworkUtils');
/**
 * Get the primary network IPv4 address of the machine
 * Prioritizes Ethernet/WiFi interfaces over virtual ones
 */
function getNetworkAddress() {
    try {
        const interfaces = os_1.default.networkInterfaces();
        const addresses = [];
        // Priority order for network interfaces
        const priorityPrefixes = ['Ethernet', 'Wi-Fi', 'eth', 'wlan', 'en'];
        for (const [name, iface] of Object.entries(interfaces)) {
            if (!iface)
                continue;
            for (const details of iface) {
                // Skip internal (loopback) and non-IPv4 addresses
                if (details.internal || details.family !== 'IPv4')
                    continue;
                // Skip link-local addresses (169.254.x.x)
                if (details.address.startsWith('169.254'))
                    continue;
                // Add to candidates
                addresses.push(details.address);
                // Check if this is a priority interface
                const isPriority = priorityPrefixes.some(prefix => name.toLowerCase().includes(prefix.toLowerCase()));
                if (isPriority) {
                    logger.debug('Found priority network interface', {
                        interface: name,
                        address: details.address
                    });
                    return details.address;
                }
            }
        }
        // If no priority interface found, return first available
        if (addresses.length > 0) {
            logger.debug('Using first available network address', {
                address: addresses[0]
            });
            return addresses[0];
        }
        // Fallback to localhost
        logger.warn('No network interfaces found, using localhost');
        return '127.0.0.1';
    }
    catch (error) {
        logger.error('Error detecting network address', { error });
        return '127.0.0.1';
    }
}
/**
 * Check if the current environment is local (not remote)
 */
function isLocalEnvironment() {
    // Check for common remote desktop environment variables
    const remoteVars = [
        'SSH_CLIENT',
        'SSH_TTY',
        'SSH_CONNECTION',
        'REMOTEHOST',
        'REMOTE_HOST',
        'RDP_SESSION',
        'SESSIONNAME' // Windows Remote Desktop
    ];
    for (const varName of remoteVars) {
        if (process.env[varName]) {
            logger.debug('Detected remote environment', { variable: varName });
            return false;
        }
    }
    // Check if running in Windows Terminal Services
    if (process.platform === 'win32' && process.env.SESSIONNAME === 'Console') {
        return true;
    }
    return true;
}
/**
 * Build network URLs for studio access
 */
function buildNetworkUrls(port) {
    const localUrl = `http://localhost:${port}`;
    const networkAddress = getNetworkAddress();
    const networkUrl = networkAddress !== '127.0.0.1'
        ? `http://${networkAddress}:${port}`
        : null;
    // Check for tunnel URL from environment
    const tunnelUrl = process.env.REMOTION_TUNNEL_URL || null;
    // Check for public host override
    const publicHost = process.env.REMOTION_PUBLIC_HOST;
    const overrideUrl = publicHost ? `http://${publicHost}:${port}` : null;
    // Determine primary URL based on environment
    let primaryUrl = localUrl;
    if (tunnelUrl) {
        primaryUrl = tunnelUrl;
    }
    else if (overrideUrl) {
        primaryUrl = overrideUrl;
    }
    else if (!isLocalEnvironment() && networkUrl) {
        primaryUrl = networkUrl;
    }
    logger.info('Network URLs built', {
        local: localUrl,
        network: networkUrl,
        tunnel: tunnelUrl,
        primary: primaryUrl,
        isLocal: isLocalEnvironment()
    });
    return {
        local: localUrl,
        network: networkUrl,
        tunnel: tunnelUrl,
        primary: primaryUrl
    };
}
/**
 * Get firewall instructions for Windows
 */
function getFirewallInstructions(port) {
    if (process.platform !== 'win32') {
        return [];
    }
    return [
        'If you cannot access the studio from a remote PC:',
        '',
        '1. Windows Firewall may be blocking the connection.',
        '   Allow the Node.js application when prompted, or manually add a rule:',
        '',
        '   PowerShell (Admin):',
        `   New-NetFirewallRule -DisplayName "Remotion Studio" -Direction Inbound -LocalPort ${port} -Protocol TCP -Action Allow`,
        '',
        '2. Ensure your network profile is set to "Private" not "Public"',
        '',
        '3. For secure remote access, consider using a tunnel:',
        '   npx localtunnel --port ' + port,
        '   or',
        '   ngrok http ' + port
    ];
}
/**
 * Format studio URLs for display
 */
function formatStudioUrls(urls, includeFirewall = false) {
    const lines = [];
    lines.push('Studio is accessible at:');
    lines.push('');
    lines.push(`  Local:   ${urls.local}`);
    if (urls.network) {
        lines.push(`  Network: ${urls.network}`);
    }
    if (urls.tunnel) {
        lines.push(`  Tunnel:  ${urls.tunnel}`);
    }
    if (urls.primary !== urls.local) {
        lines.push('');
        lines.push(`  Primary: ${urls.primary} (recommended)`);
    }
    if (includeFirewall && urls.network && process.platform === 'win32') {
        lines.push('');
        lines.push(...getFirewallInstructions(parseInt(urls.local.split(':').pop() || '7400')));
    }
    return lines;
}
//# sourceMappingURL=network-utils.js.map