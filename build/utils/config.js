"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = loadConfig;
exports.validateApiKeys = validateApiKeys;
exports.getAssetPath = getAssetPath;
exports.logConfig = logConfig;
// Configuration management and validation
const dotenv_1 = require("dotenv");
const zod_1 = require("zod");
const paths_js_1 = require("../config/paths.js");
// Load environment variables
(0, dotenv_1.config)();
// Zod schema for configuration validation
const ConfigSchema = zod_1.z.object({
    assetsDir: zod_1.z.string().default('./assets'),
    apiKeys: zod_1.z.object({
        elevenlabs: zod_1.z.string().optional(),
        freesound: zod_1.z.string().optional(),
        flux: zod_1.z.string().optional(),
    }),
    apiEndpoints: zod_1.z.object({
        elevenlabs: zod_1.z.string().url().default('https://api.elevenlabs.io/v1'),
        flux: zod_1.z.string().url().default('https://api.bfl.ai/v1'),
    }),
    remotion: zod_1.z.object({
        browserExecutable: zod_1.z.string().optional(),
        concurrency: zod_1.z.number().int().positive().default(1),
        timeout: zod_1.z.number().int().positive().default(30000),
    }),
    fileManagement: zod_1.z.object({
        cleanupTempFiles: zod_1.z.boolean().default(true),
        maxAssetAgeHours: zod_1.z.number().positive().default(24),
    }),
    logging: zod_1.z.object({
        level: zod_1.z.enum(['error', 'warn', 'info', 'debug']).default('info'),
        file: zod_1.z.string().optional(),
    }),
});
/**
 * Load and validate configuration from environment variables
 */
function loadConfig() {
    // Use centralized path management
    const assetsDir = process.env.REMOTION_ASSETS_DIR || paths_js_1.paths.getWindowsPath('assets');
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
        if (error instanceof zod_1.z.ZodError) {
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
function validateApiKeys(config, requiredServices) {
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
function getAssetPath(config, subpath = '') {
    // Always use centralized path management for consistency
    const basePath = config.assetsDir || paths_js_1.paths.assetsDir;
    return subpath ? paths_js_1.paths.getWindowsPath(`assets/${subpath}`) : basePath;
}
/**
 * Log configuration (without sensitive information)
 */
function logConfig(config) {
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