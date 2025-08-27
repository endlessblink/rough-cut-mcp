#!/usr/bin/env node
// Main MCP server entry point for Remotion Creative MCP Server
// Platform validation - must be Windows for Claude Desktop (skip in test mode)
if (process.platform !== 'win32' && process.env.NODE_ENV !== 'test') {
    // Use stderr to avoid breaking MCP protocol on stdout
    process.stderr.write('❌ ERROR: This MCP server only runs on Windows\n');
    process.stderr.write(`Current platform: ${process.platform}\n`);
    process.stderr.write('Claude Desktop is a Windows application and requires Windows execution.\n');
    process.exit(1);
}
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, InitializeRequestSchema, InitializedNotificationSchema } from '@modelcontextprotocol/sdk/types.js';
import { loadConfig } from './utils/config.js';
import { initLogger } from './utils/logger.js';
import { FileManagerService } from './services/file-manager.js';
import { EnhancedToolRegistry } from './services/enhanced-tool-registry.js';
import { TOOL_SUBCATEGORIES } from './types/tool-categories.js';
// Tool imports
// Import consolidated tools
import { registerAllTools } from './tools/index.js';
/**
 * Main server class for Remotion Creative MCP Server
 */
export class RemotionCreativeMCPServer {
    server;
    config;
    logger;
    fileManager;
    toolRegistry;
    toolHandlers = {};
    tools = [];
    initializationComplete = false;
    initializationPromise = null;
    constructor() {
        if (process.env.NODE_ENV === 'test') {
            console.error('DEBUG: Loading config...');
        }
        // Load configuration
        this.config = loadConfig();
        if (process.env.NODE_ENV === 'test') {
            console.error('DEBUG: Initializing logger...');
        }
        // Initialize logging (disable file logging for MCP compatibility)
        const baseLogger = initLogger(this.config.logging.level, undefined // Disable file logging to avoid blocking
        );
        this.logger = baseLogger.service('MCPServer');
        // Store base logger for creating child services
        this.baseLogger = baseLogger;
        if (process.env.NODE_ENV === 'test') {
            console.error('DEBUG: Initializing file manager...');
        }
        // Initialize file manager
        this.fileManager = new FileManagerService(this.config);
        if (process.env.NODE_ENV === 'test') {
            console.error('DEBUG: Initializing tool registry...');
        }
        // Initialize enhanced tool registry with all features
        this.toolRegistry = new EnhancedToolRegistry({
            baseConfig: this.config,
            enableLayers: true,
            enableDependencies: true,
            enableContextManagement: true,
            enableAudit: true,
            maxContextWeight: 10000,
        });
        if (process.env.NODE_ENV === 'test') {
            console.error('DEBUG: Creating MCP server...');
        }
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
            mode: 'layered'
        });
        // Don't register tools here - will be done in initialize()
    }
    /**
     * Initialize the server and register all tools
     */
    async initialize() {
        // Store the promise so handlers can wait for it
        if (!this.initializationPromise) {
            this.initializationPromise = this.performInitialization();
        }
        return this.initializationPromise;
    }
    async performInitialization() {
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
            // Mark initialization as complete
            this.initializationComplete = true;
            // Request handlers are already set up in main() before initialize()
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
            workingDir: this.config.assetsDir, // Use config path instead of process.cwd()
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
     * Helper to find sub-category for a tool
     */
    findToolSubCategory(toolName, categoryKey) {
        const subCategories = TOOL_SUBCATEGORIES[categoryKey] || {};
        for (const [subCat, tools] of Object.entries(subCategories)) {
            if (tools.includes(toolName)) {
                return subCat;
            }
        }
        return 'general'; // Default sub-category
    }
    /**
     * Register all MCP tools
     */
    async registerTools() {
        // Register all consolidated tools
        await registerAllTools(this);
        const initialActiveTools = this.toolRegistry.getActiveTools();
        const stats = this.toolRegistry.getUsageStatistics();
        // Debug: Check what's in the registry
        const registryState = this.toolRegistry.state;
        const baseRegistry = this.toolRegistry.baseRegistry;
        this.logger.info('Tool registration debug', {
            hasBaseRegistry: !!baseRegistry,
            allToolsCount: registryState?.allTools?.size || 0,
            activeToolsCount: registryState?.activeTools?.size || 0,
            alwaysActiveCount: this.toolRegistry.alwaysActiveTools?.size || 0,
            getActiveToolsResult: initialActiveTools.length
        });
        this.logger.info('Consolidated tools registered', {
            totalTools: stats.totalTools || 20,
            activeTools: initialActiveTools.length,
            categories: Object.keys(TOOL_SUBCATEGORIES).length
        });
        // All tools are now registered via registerAllTools
        // The enhanced registry handles layered activation automatically
        // Log API key status for transparency
        if (!this.config.apiKeys.elevenlabs) {
            this.logger.info('ElevenLabs API key not configured - voice tools available but may have limited functionality');
        }
        if (!this.config.apiKeys.freesound) {
            this.logger.info('Freesound API key not configured - sound tools available but may have limited functionality');
        }
        if (!this.config.apiKeys.flux) {
            this.logger.info('Flux API key not configured - image tools available but may have limited functionality');
        }
        // All tools now registered via registerAllTools
        // The consolidated implementation reduces ~70 tools to ~16-20 tools
        // Debug before initializeDefaults
        const beforeInitDefaults = this.toolRegistry.getActiveTools();
        this.logger.info('Active tools BEFORE initializeDefaults', {
            count: beforeInitDefaults.length,
            names: beforeInitDefaults.map(t => t.name)
        });
        // Initialize default tools
        this.toolRegistry.initializeDefaults();
        const finalActiveTools = this.toolRegistry.getActiveTools();
        this.logger.info('Active tools AFTER initializeDefaults', {
            count: finalActiveTools.length,
            names: finalActiveTools.map(t => t.name)
        });
        const enhancedStats = this.toolRegistry.getEnhancedStatistics?.();
        this.logger.info('Tool registration complete', {
            totalRegistered: enhancedStats?.base?.totalTools || finalActiveTools.length,
            currentlyActive: finalActiveTools.length,
            contextWeight: enhancedStats?.context?.totalWeight || 'N/A',
            layersActive: enhancedStats?.layers?.activeLayers || 'N/A'
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
        this.logger.info('Setting up MCP request handlers...');
        // Initialize request handler - MUST be first for MCP handshake
        this.server.setRequestHandler(InitializeRequestSchema, async () => {
            this.logger.info('MCP Initialize request received');
            return {
                protocolVersion: '2024-11-05',
                capabilities: {
                    tools: {}
                },
                serverInfo: {
                    name: 'rough-cut-mcp',
                    version: '2.0.3'
                }
            };
        });
        // Initialized notification handler - completes handshake
        this.server.setRequestHandler(InitializedNotificationSchema, async () => {
            this.logger.info('MCP handshake completed - client initialized');
            return {}; // Must return empty object for notification handler
        });
        // List tools handler - now uses tool registry with proper serialization
        this.server.setRequestHandler(ListToolsRequestSchema, async (request) => {
            this.logger.info('MCP tools/list request received');
            try {
                // Wait for initialization to complete if not done yet
                if (!this.initializationComplete) {
                    this.logger.info('Waiting for initialization to complete...');
                    if (this.initializationPromise) {
                        await this.initializationPromise;
                    }
                    else {
                        // Start initialization if not started yet
                        await this.initialize();
                    }
                }
                // Debug: Check registry state
                const registryState = this.toolRegistry.state;
                const alwaysActive = this.toolRegistry.alwaysActiveTools;
                this.logger.info('Registry debug info', {
                    allToolsCount: registryState.allTools.size,
                    allToolNames: Array.from(registryState.allTools.keys()),
                    activeToolsCount: registryState.activeTools.size,
                    activeToolNames: Array.from(registryState.activeTools),
                    alwaysActiveCount: alwaysActive.size,
                    alwaysActiveNames: Array.from(alwaysActive)
                });
                const activeTools = this.toolRegistry.getActiveTools();
                this.logger.info(`Found ${activeTools.length} active tools`);
                // If no tools yet (still initializing), return a minimal status tool
                if (activeTools.length === 0) {
                    this.logger.info('Tools still initializing, returning status tool');
                    return {
                        tools: [{
                                name: 'server-status',
                                description: 'Check rough-cut-mcp server initialization status',
                                inputSchema: {
                                    type: 'object',
                                    properties: {},
                                    required: []
                                }
                            }]
                    };
                }
                // Convert enhanced registry objects to MCP-compliant format
                // This ensures no Map/Set/Proxy objects break JSON serialization
                const mcpTools = activeTools.map(tool => {
                    // Ensure we have a plain object without Maps/Proxies/Sets
                    const cleanTool = {
                        name: String(tool.name || ''),
                        description: String(tool.description || ''),
                        inputSchema: tool.inputSchema ? {
                            type: tool.inputSchema.type || 'object',
                            properties: tool.inputSchema.properties || {},
                            required: tool.inputSchema.required || []
                        } : {
                            type: 'object',
                            properties: {},
                            required: []
                        }
                    };
                    // Verify it's JSON serializable
                    try {
                        JSON.stringify(cleanTool);
                        return cleanTool;
                    }
                    catch (e) {
                        this.logger.error(`Tool ${tool.name} failed serialization`, { error: e });
                        return null;
                    }
                }).filter(tool => tool !== null);
                this.logger.info(`Returning ${mcpTools.length} tools to Claude`, {
                    tools: mcpTools.map(t => t.name)
                });
                return {
                    tools: mcpTools,
                };
            }
            catch (error) {
                this.logger.error('Error in ListToolsRequestSchema handler', { error });
                return { tools: [] };
            }
        });
        // Call tool handler - now uses tool registry
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            this.logger.info(`Tool called: ${name}`, { args: Object.keys(args || {}) });
            try {
                // Get handler from registry using safe method
                const handler = this.toolRegistry.getToolHandlerSafe(name);
                if (!handler) {
                    // Check if tool exists in registry
                    const searchResults = this.toolRegistry.searchTools({ query: name, limit: 1 });
                    if (searchResults.length > 0) {
                        const tool = searchResults[0];
                        // Handler is genuinely missing - this is a bug
                        throw new Error(`Tool '${name}' is registered but handler is missing. ` +
                            `This is a bug in the MCP server. Tool category: ${tool.metadata.category}`);
                    }
                    // Tool doesn't exist at all
                    throw new Error(`Tool '${name}' not found. Use 'discover-capabilities' to see available tools.`);
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
        if (process.env.NODE_ENV === 'test') {
            console.error('DEBUG: Creating stdio transport...');
        }
        const transport = new StdioServerTransport();
        // Connect immediately - this enables JSON-RPC communication
        this.server.connect(transport);
        this.logger.info('MCP Server connected to stdio transport');
        if (process.env.NODE_ENV === 'test') {
            console.error('DEBUG: Transport connection completed');
        }
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
    if (process.env.NODE_ENV === 'test') {
        console.error('DEBUG: Inside main() function');
    }
    let server = null;
    try {
        // Debug output in test mode only
        if (process.env.NODE_ENV === 'test') {
            console.error('DEBUG: Starting MCP Server construction...');
        }
        server = new RemotionCreativeMCPServer();
        if (process.env.NODE_ENV === 'test') {
            console.error('DEBUG: Server constructed, connecting transport...');
        }
        // Connect transport immediately - CRITICAL for MCP protocol
        server.connectTransport();
        if (process.env.NODE_ENV === 'test') {
            console.error('DEBUG: Transport connected, setting up handlers...');
        }
        // Set up request handlers immediately - MUST be before async initialization
        server.setupRequestHandlers();
        if (process.env.NODE_ENV === 'test') {
            console.error('DEBUG: Handlers set up, starting initialization...');
        }
        // Initialize tools and assets asynchronously (won't block protocol)
        server.initialize().then(() => {
            if (process.env.NODE_ENV === 'test') {
                console.error('DEBUG: Server fully initialized');
            }
            server.logger.info('✅ Rough Cut MCP Server fully initialized and ready');
        }).catch((error) => {
            if (process.env.NODE_ENV === 'test') {
                console.error('DEBUG: Initialization error:', error.message);
            }
            server.logger.warn('⚠️  Initialization warning:', error.message || error);
            server.logger.warn('Server can still respond to basic protocol messages');
            // Log more details for debugging
            if (error.stack) {
                server.logger.debug('Stack trace:', error.stack);
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
if (process.env.NODE_ENV === 'test') {
    console.error('DEBUG: About to call main()');
}
main();
//# sourceMappingURL=index.js.map