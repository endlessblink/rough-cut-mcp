// Configuration management and validation
import { config } from 'dotenv';
import { z } from 'zod';
import path from 'path';
import { fileURLToPath } from 'url';
// Load environment variables
config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Zod schema for configuration validation
const ConfigSchema = z.object({
    assetsDir: z.string().default('./assets'),
    apiKeys: z.object({
        elevenlabs: z.string().optional(),
        freesound: z.string().optional(),
        flux: z.string().optional(),
    }),
    apiEndpoints: z.object({
        elevenlabs: z.string().url().default('https://api.elevenlabs.io/v1'),
        flux: z.string().url().default('https://api.bfl.ai/v1'),
    }),
    remotion: z.object({
        browserExecutable: z.string().optional(),
        concurrency: z.number().int().positive().default(1),
        timeout: z.number().int().positive().default(30000),
    }),
    fileManagement: z.object({
        cleanupTempFiles: z.boolean().default(true),
        maxAssetAgeHours: z.number().positive().default(24),
    }),
    logging: z.object({
        level: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
        file: z.string().optional(),
    }),
});
/**
 * Load and validate configuration from environment variables
 */
export function loadConfig() {
    // Resolve assets directory - Windows paths only
    let assetsDir = process.env.REMOTION_ASSETS_DIR;
    if (!assetsDir) {
        // Fallback: resolve relative to the build directory (where index.js is located)
        // For Windows: Need to go up from build/ to project root, then to assets/
        const projectRoot = path.resolve(__dirname, '../../');
        assetsDir = path.join(projectRoot, 'assets');
        // logger.info(`REMOTION_ASSETS_DIR not set, using fallback: ${assetsDir}`);
    }
    else {
        // logger.info(`REMOTION_ASSETS_DIR set to: ${assetsDir}`);
    }
    const rawConfig = {
        assetsDir: assetsDir,
        apiKeys: {
            elevenlabs: process.env.ELEVENLABS_API_KEY,
            freesound: process.env.FREESOUND_API_KEY,
            flux: process.env.FLUX_API_KEY,
        },
        apiEndpoints: {
            elevenlabs: process.env.ELEVENLABS_API_URL || 'https://api.elevenlabs.io/v1',
            flux: process.env.FLUX_API_URL || 'https://api.bfl.ai/v1',
        },
        remotion: {
            browserExecutable: process.env.REMOTION_BROWSER_EXECUTABLE,
            concurrency: parseInt(process.env.REMOTION_CONCURRENCY || '1'),
            timeout: parseInt(process.env.REMOTION_TIMEOUT || '30000'),
        },
        fileManagement: {
            cleanupTempFiles: process.env.CLEANUP_TEMP_FILES !== 'false',
            maxAssetAgeHours: parseFloat(process.env.MAX_ASSET_AGE_HOURS || '24'),
        },
        logging: {
            level: process.env.LOG_LEVEL || 'info',
            file: process.env.LOG_FILE,
        },
    };
    try {
        return ConfigSchema.parse(rawConfig);
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            // logger.error('Configuration validation failed:');
            error.errors.forEach((err) => {
                // logger.error(`  ${err.path.join('.')}: ${err.message}`);
            });
            throw new Error('Invalid configuration. Please check your environment variables.');
        }
        throw error;
    }
}
/**
 * Validate that required API keys are present for specific services
 */
export function validateApiKeys(config, requiredServices) {
    const missingKeys = [];
    for (const service of requiredServices) {
        switch (service) {
            case 'elevenlabs':
                if (!config.apiKeys.elevenlabs) {
                    missingKeys.push('ELEVENLABS_API_KEY');
                }
                break;
            case 'freesound':
                if (!config.apiKeys.freesound) {
                    missingKeys.push('FREESOUND_API_KEY');
                }
                break;
            case 'flux':
                if (!config.apiKeys.flux) {
                    missingKeys.push('FLUX_API_KEY');
                }
                break;
            default:
            // logger.warn(`Unknown service: ${service}`);
        }
    }
    if (missingKeys.length > 0) {
        throw new Error(`Missing required API keys: ${missingKeys.join(', ')}`);
    }
}
/**
 * Get absolute path for assets directory
 */
export function getAssetPath(config, subpath = '') {
    // Use the configured assets directory, which should always be an absolute Windows path
    const basePath = path.isAbsolute(config.assetsDir)
        ? config.assetsDir
        : path.resolve(config.assetsDir); // Avoid process.cwd() to prevent WSL paths
    return subpath ? path.join(basePath, subpath) : basePath;
}
/**
 * Log configuration (without sensitive information)
 */
export function logConfig(config) {
    const safeConfig = {
        ...config,
        apiKeys: Object.keys(config.apiKeys).reduce((acc, key) => {
            acc[key] = config.apiKeys[key] ? '[SET]' : '[NOT SET]';
            return acc;
        }, {}),
    };
    // Debug logging to stderr to avoid breaking MCP protocol
    if (process.env.MCP_DEBUG === 'true') {
        // logger.debug('Loaded configuration:', JSON.stringify(safeConfig, null, 2));
    }
}
//# sourceMappingURL=config.js.map