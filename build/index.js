#!/usr/bin/env node
// Main MCP server entry point for Remotion Creative MCP Server
// Platform validation - must be Windows for Claude Desktop
if (process.platform !== 'win32') {
    // Use stderr to avoid breaking MCP protocol on stdout
    process.stderr.write('❌ ERROR: This MCP server only runs on Windows\n');
    process.stderr.write(`Current platform: ${process.platform}\n`);
    process.stderr.write('Claude Desktop is a Windows application and requires Windows execution.\n');
    process.exit(1);
}
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { loadConfig } from './utils/config.js';
import { initLogger } from './utils/logger.js';
import { FileManagerService } from './services/file-manager.js';
import { ToolRegistry } from './services/tool-registry.js';
import { ToolCategory } from './types/tool-categories.js';
// Tool imports
import { createVideoCreationTools, createVideoCreationHandlers } from './tools/video-creation.js';
import { createVoiceTools, createVoiceHandlers } from './tools/voice-tools.js';
import { createSoundTools, createSoundHandlers } from './tools/sound-tools.js';
import { createImageTools, createImageHandlers } from './tools/image-tools.js';
import { createStudioTools, createStudioHandlers } from './tools/studio-tools.js';
import { createProjectManagementTools, createProjectManagementHandlers } from './tools/project-management.js';
import { createDiscoveryTools, createDiscoveryHandlers, getDiscoveryToolsMetadata } from './tools/discovery-tools.js';
/**
 * Main server class for Remotion Creative MCP Server
 */
class RemotionCreativeMCPServer {
    server;
    config;
    logger;
    fileManager;
    toolRegistry;
    toolHandlers = {};
    tools = [];
    constructor() {
        // Load configuration
        this.config = loadConfig();
        // Check for legacy mode from environment or config
        const legacyMode = process.env.MCP_LEGACY_MODE === 'true' ||
            this.config.toolOrganization?.legacyMode === true;
        // Initialize logging (disable file logging for MCP compatibility)
        this.logger = initLogger(this.config.logging.level, undefined // Disable file logging to avoid blocking
        ).service('MCPServer');
        // Initialize file manager
        this.fileManager = new FileManagerService(this.config);
        // Initialize tool registry
        this.toolRegistry = new ToolRegistry(this.config, legacyMode);
        // Create MCP server
        this.server = new Server({
            name: 'rough-cut-mcp',
            version: '1.0.0',
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.logger.info('Rough Cut MCP Server initializing', {
            mode: legacyMode ? 'legacy' : 'layered'
        });
    }
    /**
     * Initialize the server and register all tools
     */
    async initialize() {
        try {
            this.logger.info('Starting server initialization');
            // Validate configuration
            await this.validateConfiguration();
            // Initialize asset directories
            this.logger.info('Initializing asset directories');
            await this.fileManager.initializeDirectories();
            // Register all tools and handlers
            this.logger.info('Registering tools and handlers');
            await this.registerTools();
            // Set up request handlers
            this.logger.info('Setting up request handlers');
            this.setupRequestHandlers();
            this.logger.info('Server initialization completed successfully');
        }
        catch (error) {
            this.logger.error('Server initialization failed', {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            });
            throw error;
        }
    }
    /**
     * Validate configuration and environment
     */
    async validateConfiguration() {
        this.logger.info('Validating configuration', {
            assetsDir: this.config.assetsDir,
            platform: process.platform,
            workingDir: process.cwd(),
            apiKeysSet: {
                elevenlabs: !!this.config.apiKeys.elevenlabs,
                freesound: !!this.config.apiKeys.freesound,
                flux: !!this.config.apiKeys.flux,
            }
        });
        // Check if we can write to assets directory
        try {
            const fs = await import('fs-extra');
            const path = await import('path');
            const testFile = path.join(this.config.assetsDir, 'test-write.tmp');
            await fs.ensureFile(testFile);
            await fs.remove(testFile);
            this.logger.info('Asset directory write test passed');
        }
        catch (error) {
            this.logger.error('Asset directory write test failed', {
                assetsDir: this.config.assetsDir,
                error: error instanceof Error ? error.message : String(error)
            });
            throw new Error(`Cannot write to assets directory: ${this.config.assetsDir}`);
        }
        // Test Remotion dependencies
        try {
            const { bundle } = await import('@remotion/bundler');
            this.logger.info('Remotion bundler import successful');
        }
        catch (error) {
            this.logger.error('Remotion bundler import failed', {
                error: error instanceof Error ? error.message : String(error)
            });
            throw new Error('Remotion dependencies not available');
        }
    }
    /**
     * Register all MCP tools
     */
    async registerTools() {
        // First, always register discovery tools (they're always active)
        const discoveryTools = createDiscoveryTools(this.toolRegistry);
        const discoveryHandlers = createDiscoveryHandlers(this.toolRegistry);
        const discoveryMetadata = getDiscoveryToolsMetadata();
        for (let i = 0; i < discoveryTools.length; i++) {
            this.toolRegistry.registerTool(discoveryTools[i], discoveryHandlers[discoveryTools[i].name], discoveryMetadata[i]);
        }
        this.logger.info('Discovery tools registered');
        // Register all other tools to the registry (but not necessarily activate them)
        // The registry will handle activation based on mode and defaults
        // Video creation tools (core functionality)
        const videoTools = createVideoCreationTools(this.config);
        const videoHandlers = createVideoCreationHandlers(this.config);
        for (const tool of videoTools) {
            this.toolRegistry.registerTool(tool, videoHandlers[tool.name], {
                name: tool.name,
                category: ToolCategory.VIDEO_CREATION,
                tags: ['video', 'creation', 'animation'],
                loadByDefault: false,
                priority: 20,
                estimatedTokens: 200,
            });
        }
        // Voice generation tools (if ElevenLabs API key available)
        if (this.config.apiKeys.elevenlabs) {
            const voiceTools = createVoiceTools(this.config);
            const voiceHandlers = createVoiceHandlers(this.config);
            for (const tool of voiceTools) {
                this.toolRegistry.registerTool(tool, voiceHandlers[tool.name], {
                    name: tool.name,
                    category: ToolCategory.VOICE_GENERATION,
                    tags: ['voice', 'audio', 'elevenlabs', 'tts'],
                    loadByDefault: false,
                    priority: 30,
                    requiresApiKey: 'elevenlabs',
                    estimatedTokens: 150,
                });
            }
            this.logger.info('Voice generation tools registered');
        }
        else {
            this.logger.warn('ElevenLabs API key not found - voice tools disabled');
        }
        // Sound effects tools (if Freesound API key available)
        if (this.config.apiKeys.freesound) {
            const soundTools = createSoundTools(this.config);
            const soundHandlers = createSoundHandlers(this.config);
            for (const tool of soundTools) {
                this.toolRegistry.registerTool(tool, soundHandlers[tool.name], {
                    name: tool.name,
                    category: ToolCategory.SOUND_EFFECTS,
                    tags: ['sound', 'audio', 'effects', 'freesound'],
                    loadByDefault: false,
                    priority: 35,
                    requiresApiKey: 'freesound',
                    estimatedTokens: 140,
                });
            }
            this.logger.info('Sound effects tools registered');
        }
        else {
            this.logger.warn('Freesound API key not found - sound tools disabled');
        }
        // Image generation tools (if Flux API key available)
        if (this.config.apiKeys.flux) {
            const imageTools = createImageTools(this.config);
            const imageHandlers = createImageHandlers(this.config);
            for (const tool of imageTools) {
                this.toolRegistry.registerTool(tool, imageHandlers[tool.name], {
                    name: tool.name,
                    category: ToolCategory.IMAGE_GENERATION,
                    tags: ['image', 'generation', 'ai', 'flux'],
                    loadByDefault: false,
                    priority: 40,
                    requiresApiKey: 'flux',
                    estimatedTokens: 160,
                });
            }
            this.logger.info('Image generation tools registered');
        }
        else {
            this.logger.warn('Flux API key not found - image tools disabled');
        }
        // Asset management tools (always available)
        this.registerAssetManagementTools();
        const assetTools = this.getAssetManagementTools();
        const assetHandlers = this.getAssetHandlers();
        for (const tool of assetTools) {
            this.toolRegistry.registerTool(tool, assetHandlers[tool.name], {
                name: tool.name,
                category: ToolCategory.MAINTENANCE,
                tags: ['assets', 'cleanup', 'maintenance', 'disk'],
                loadByDefault: false,
                priority: 50,
                estimatedTokens: 120,
            });
        }
        // Remotion Studio tools (always available)
        const studioTools = createStudioTools(this.config);
        const studioHandlers = createStudioHandlers(this.config);
        for (const tool of studioTools) {
            this.toolRegistry.registerTool(tool, studioHandlers[tool.name], {
                name: tool.name,
                category: ToolCategory.STUDIO_MANAGEMENT,
                tags: ['studio', 'remotion', 'preview', 'development'],
                loadByDefault: false,
                priority: 25,
                estimatedTokens: 125,
            });
        }
        this.logger.info('Remotion Studio tools registered');
        // Project management and video editing tools (always available)
        const projectTools = createProjectManagementTools(this.config);
        const projectHandlers = createProjectManagementHandlers(this.config);
        // These are core operations - should be loaded by default
        const coreProjectTools = ['list-video-projects', 'get-project-status', 'launch-project-studio'];
        for (const tool of projectTools) {
            const isCore = coreProjectTools.includes(tool.name);
            this.toolRegistry.registerTool(tool, projectHandlers[tool.name], {
                name: tool.name,
                category: isCore ? ToolCategory.CORE_OPERATIONS : ToolCategory.VIDEO_CREATION,
                tags: ['project', 'management', 'video', 'editing'],
                loadByDefault: isCore,
                priority: isCore ? 10 : 22,
                estimatedTokens: 180,
            });
        }
        this.logger.info('Project management tools registered');
        // Initialize default tools based on mode
        this.toolRegistry.initializeDefaults();
        const activeTools = this.toolRegistry.getActiveTools();
        this.logger.info(`Tool registration complete`, {
            mode: this.toolRegistry.getMode(),
            totalRegistered: assetTools.length + discoveryTools.length + videoTools.length +
                studioTools.length + projectTools.length,
            currentlyActive: activeTools.length,
        });
    }
    /**
     * Get asset management handlers
     */
    getAssetHandlers() {
        return {
            'get-asset-statistics': async () => {
                this.logger.info('Getting asset statistics');
                const stats = await this.fileManager.getAssetStatistics();
                return {
                    success: true,
                    totalFiles: stats.summary.totalFiles,
                    totalSize: stats.summary.totalSize,
                    totalSizeFormatted: stats.summary.totalSize,
                    breakdown: stats.diskUsage.directories,
                    oldestFile: stats.summary.oldestFile,
                    newestFile: stats.summary.newestFile,
                    diskUsage: stats.diskUsage,
                };
            },
            'cleanup-old-assets': async (args) => {
                this.logger.info('Cleaning up old assets', {
                    maxAgeHours: args.maxAgeHours,
                    dryRun: args.dryRun
                });
                const cleanedAssets = await this.fileManager.cleanupOldAssets(args.maxAgeHours, args.dryRun || false);
                return {
                    success: true,
                    cleanedAssets: cleanedAssets.map(asset => ({
                        path: asset.path,
                        type: asset.type,
                        size: asset.size,
                        age: Math.round(asset.age * 100) / 100, // Round to 2 decimal places
                    })),
                    summary: {
                        count: cleanedAssets.length,
                        totalSize: cleanedAssets.reduce((sum, asset) => sum + asset.size, 0),
                    },
                };
            },
            'organize-assets': async () => {
                this.logger.info('Organizing assets');
                const result = await this.fileManager.organizeAssets();
                return {
                    success: true,
                    result,
                };
            },
            'get-disk-usage': async () => {
                this.logger.info('Getting disk usage');
                const usage = await this.fileManager.getAssetDiskUsage();
                return {
                    success: true,
                    diskUsage: usage,
                };
            },
        };
    }
    /**
     * Register asset management tools
     */
    registerAssetManagementTools() {
        const assetHandlers = this.getAssetHandlers();
        Object.assign(this.toolHandlers, assetHandlers);
    }
    /**
     * Get asset management tool definitions
     */
    getAssetManagementTools() {
        return [
            {
                name: 'get-asset-statistics',
                description: 'Get comprehensive statistics about stored assets',
                inputSchema: {
                    type: 'object',
                    properties: {},
                },
            },
            {
                name: 'cleanup-old-assets',
                description: 'Clean up old assets based on age',
                inputSchema: {
                    type: 'object',
                    properties: {
                        maxAgeHours: {
                            type: 'number',
                            description: 'Maximum age in hours (default from config)',
                            minimum: 1,
                        },
                        dryRun: {
                            type: 'boolean',
                            description: 'Preview what would be cleaned without actually deleting',
                            default: false,
                        },
                    },
                },
            },
            {
                name: 'organize-assets',
                description: 'Organize assets by moving them to appropriate directories',
                inputSchema: {
                    type: 'object',
                    properties: {},
                },
            },
            {
                name: 'get-disk-usage',
                description: 'Get disk usage information for asset directories',
                inputSchema: {
                    type: 'object',
                    properties: {},
                },
            },
        ];
    }
    /**
     * Set up MCP request handlers
     */
    setupRequestHandlers() {
        // List tools handler - now uses tool registry
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            const activeTools = this.toolRegistry.getActiveTools();
            return {
                tools: activeTools,
            };
        });
        // Call tool handler - now uses tool registry
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            this.logger.info(`Tool called: ${name}`, { args: Object.keys(args || {}) });
            try {
                // Get handler from registry (which also tracks usage)
                const handler = this.toolRegistry.getToolHandler(name);
                if (!handler) {
                    // Check if tool exists but is not active
                    const searchResults = this.toolRegistry.searchTools({ query: name, limit: 1 });
                    if (searchResults.length > 0) {
                        const tool = searchResults[0];
                        throw new Error(`Tool '${name}' exists but is not active. ` +
                            `Use 'activate-toolset' with category '${tool.metadata.category}' to enable it.`);
                    }
                    throw new Error(`Unknown tool: ${name}`);
                }
                const result = await handler(args || {});
                this.logger.info(`Tool completed: ${name}`);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            catch (error) {
                this.logger.error(`Tool failed: ${name}`, {
                    error: error instanceof Error ? error.message : String(error),
                    stack: error instanceof Error ? error.stack : undefined
                });
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                success: false,
                                error: error instanceof Error ? error.message : String(error),
                                tool: name,
                            }, null, 2),
                        },
                    ],
                    isError: true,
                };
            }
        });
    }
    /**
     * Connect transport immediately for MCP communication
     */
    connectTransport() {
        const transport = new StdioServerTransport();
        // Connect immediately - this enables JSON-RPC communication
        this.server.connect(transport);
        this.logger.info('MCP Server connected to stdio transport');
    }
    /**
     * Get registered tools (for testing)
     */
    getTools() {
        return this.toolRegistry.getActiveTools();
    }
    /**
     * Get tool handlers (for testing)
     */
    getToolHandlers() {
        // Return a proxy object that uses the registry
        return new Proxy({}, {
            get: (target, prop) => {
                if (typeof prop === 'string') {
                    return this.toolRegistry.getToolHandler(prop);
                }
                return undefined;
            }
        });
    }
    /**
     * Get tool registry (for advanced testing)
     */
    getToolRegistry() {
        return this.toolRegistry;
    }
    /**
     * Graceful shutdown
     */
    async shutdown() {
        this.logger.info('Shutting down server');
        try {
            // Cleanup any resources
            if (this.config.fileManagement.cleanupTempFiles) {
                await this.fileManager.cleanupOldAssets(0.1); // Clean up files older than 6 minutes
            }
            this.logger.info('Server shutdown completed');
        }
        catch (error) {
            this.logger.error('Error during shutdown', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }
}
/**
 * Main entry point - Connect immediately for JSON-RPC, then initialize
 */
function main() {
    let server = null;
    try {
        // MCP servers must not output to console - use logger instead
        // logger.info('Starting Rough Cut MCP Server...');
        server = new RemotionCreativeMCPServer();
        // Connect transport immediately - CRITICAL for MCP protocol
        server.connectTransport();
        // Initialize tools and assets asynchronously (won't block protocol)
        server.initialize().then(() => {
            // logger.info('✅ Rough Cut MCP Server fully initialized and ready');
        }).catch((error) => {
            // logger.warn('⚠️  Initialization warning:', error.message || error);
            // logger.warn('Server can still respond to basic protocol messages');
            // Log more details for debugging
            if (error.stack) {
                // logger.debug('Stack trace:', error.stack);
            }
        });
    }
    catch (error) {
        // logger.error('❌ Failed to start MCP Server:', error);
        process.exit(1);
    }
    // Handle process signals for graceful shutdown
    process.on('SIGINT', async () => {
        // logger.info('Received SIGINT, shutting down gracefully...');
        if (server) {
            await server.shutdown();
        }
        process.exit(0);
    });
    process.on('SIGTERM', async () => {
        // logger.info('Received SIGTERM, shutting down gracefully...');
        if (server) {
            await server.shutdown();
        }
        process.exit(0);
    });
    process.on('uncaughtException', (error) => {
        // logger.error('Uncaught Exception:', error);
        process.exit(1);
    });
    process.on('unhandledRejection', (reason, promise) => {
        // logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
        // Don't exit on unhandled rejections - log and continue
    });
}
// Start the server immediately when this module is run directly
main();
export { RemotionCreativeMCPServer };
//# sourceMappingURL=index.js.map