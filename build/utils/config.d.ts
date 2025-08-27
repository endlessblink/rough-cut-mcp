import { MCPConfig } from '../types/index.js';
/**
 * Load and validate configuration from environment variables
 */
export declare function loadConfig(): MCPConfig;
/**
 * Validate that required API keys are present for specific services
 */
export declare function validateApiKeys(config: MCPConfig, requiredServices: string[]): void;
/**
 * Get absolute path for assets directory
 */
export declare function getAssetPath(config: MCPConfig, subpath?: string): string;
/**
 * Log configuration (without sensitive information)
 */
export declare function logConfig(config: MCPConfig): void;
//# sourceMappingURL=config.d.ts.map