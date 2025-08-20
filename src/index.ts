#!/usr/bin/env node

// Main MCP server entry point for Remotion Creative MCP Server
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

import { loadConfig, logConfig, validateApiKeys, getAssetPath } from './utils/config.js';
import { initLogger, getLogger } from './utils/logger.js';
import { FileManagerService } from './services/file-manager.js';

// Tool imports
import { createVideoCreationTools, createVideoCreationHandlers } from './tools/video-creation.js';
import { createVoiceTools, createVoiceHandlers } from './tools/voice-tools.js';
import { createSoundTools, createSoundHandlers } from './tools/sound-tools.js';
import { createImageTools, createImageHandlers } from './tools/image-tools.js';
import { createStudioTools, createStudioHandlers } from './tools/studio-tools.js';

/**
 * Main server class for Remotion Creative MCP Server
 */
class RemotionCreativeMCPServer {
  private server: Server;
  private config: any;
  private logger: any;
  private fileManager: FileManagerService;
  private toolHandlers: Record<string, Function> = {};
  private tools: any[] = [];

  constructor() {
    // Load configuration
    this.config = loadConfig();
    
    // Initialize logging (disable file logging for MCP compatibility)
    this.logger = initLogger(
      this.config.logging.level,
      undefined  // Disable file logging to avoid blocking
    ).service('MCPServer');

    // Initialize file manager
    this.fileManager = new FileManagerService(this.config);

    // Create MCP server
    this.server = new Server(
      {
        name: 'rough-cut-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.logger.info('Rough Cut MCP Server initializing');
  }

  /**
   * Initialize the server and register all tools
   */
  async initialize(): Promise<void> {
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

    } catch (error) {
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
  private async validateConfiguration(): Promise<void> {
    this.logger.info('Validating configuration', {
      assetsDir: this.config.assetsDir,
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
    } catch (error) {
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
    } catch (error) {
      this.logger.error('Remotion bundler import failed', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw new Error('Remotion dependencies not available');
    }
  }

  /**
   * Register all MCP tools
   */
  private async registerTools(): Promise<void> {
    const allTools = [];
    
    // Video creation tools (core functionality)
    const videoTools = createVideoCreationTools(this.config);
    const videoHandlers = createVideoCreationHandlers(this.config);
    allTools.push(...videoTools);
    Object.assign(this.toolHandlers, videoHandlers);

    // Voice generation tools (if ElevenLabs API key available)
    if (this.config.apiKeys.elevenlabs) {
      const voiceTools = createVoiceTools(this.config);
      const voiceHandlers = createVoiceHandlers(this.config);
      allTools.push(...voiceTools);
      Object.assign(this.toolHandlers, voiceHandlers);
      this.logger.info('Voice generation tools registered');
    } else {
      this.logger.warn('ElevenLabs API key not found - voice tools disabled');
    }

    // Sound effects tools (if Freesound API key available)
    if (this.config.apiKeys.freesound) {
      const soundTools = createSoundTools(this.config);
      const soundHandlers = createSoundHandlers(this.config);
      allTools.push(...soundTools);
      Object.assign(this.toolHandlers, soundHandlers);
      this.logger.info('Sound effects tools registered');
    } else {
      this.logger.warn('Freesound API key not found - sound tools disabled');
    }

    // Image generation tools (if Flux API key available)
    if (this.config.apiKeys.flux) {
      const imageTools = createImageTools(this.config);
      const imageHandlers = createImageHandlers(this.config);
      allTools.push(...imageTools);
      Object.assign(this.toolHandlers, imageHandlers);
      this.logger.info('Image generation tools registered');
    } else {
      this.logger.warn('Flux API key not found - image tools disabled');
    }

    // Asset management tools (always available)
    this.registerAssetManagementTools();
    allTools.push(...this.getAssetManagementTools());

    // Remotion Studio tools (always available)
    const studioTools = createStudioTools(this.config);
    const studioHandlers = createStudioHandlers(this.config);
    allTools.push(...studioTools);
    Object.assign(this.toolHandlers, studioHandlers);
    this.logger.info('Remotion Studio tools registered');

    this.logger.info(`Registered ${allTools.length} tools total`);

    // Store tools for list_tools handler
    this.tools = allTools;
  }

  /**
   * Register asset management tools
   */
  private registerAssetManagementTools(): void {
    const assetHandlers = {
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

      'cleanup-old-assets': async (args: any) => {
        this.logger.info('Cleaning up old assets', { 
          maxAgeHours: args.maxAgeHours,
          dryRun: args.dryRun 
        });
        
        const cleanedAssets = await this.fileManager.cleanupOldAssets(
          args.maxAgeHours,
          args.dryRun || false
        );
        
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

    Object.assign(this.toolHandlers, assetHandlers);
  }

  /**
   * Get asset management tool definitions
   */
  private getAssetManagementTools() {
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
  private setupRequestHandlers(): void {
    // List tools handler
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: this.tools || [],
      };
    });

    // Call tool handler
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      this.logger.info(`Tool called: ${name}`, { args: Object.keys(args || {}) });

      try {
        const handler = this.toolHandlers[name];
        if (!handler) {
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

      } catch (error) {
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
  connectTransport(): void {
    const transport = new StdioServerTransport();
    // Connect immediately - this enables JSON-RPC communication
    this.server.connect(transport);
    this.logger.info('MCP Server connected to stdio transport');
  }

  /**
   * Get registered tools (for testing)
   */
  getTools() {
    return this.tools;
  }

  /**
   * Get tool handlers (for testing)
   */
  getToolHandlers() {
    return this.toolHandlers;
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down server');
    
    try {
      // Cleanup any resources
      if (this.config.fileManagement.cleanupTempFiles) {
        await this.fileManager.cleanupOldAssets(0.1); // Clean up files older than 6 minutes
      }

      this.logger.info('Server shutdown completed');
    } catch (error) {
      this.logger.error('Error during shutdown', { 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  }
}

/**
 * Main entry point - Connect immediately for JSON-RPC, then initialize
 */
function main(): void {
  let server: RemotionCreativeMCPServer | null = null;

  try {
    console.error('Starting Rough Cut MCP Server...');
    server = new RemotionCreativeMCPServer();

    // Connect transport immediately - CRITICAL for MCP protocol
    server.connectTransport();
    
    // Initialize tools and assets asynchronously (won't block protocol)
    server.initialize().then(() => {
      console.error('✅ Rough Cut MCP Server fully initialized and ready');
    }).catch((error) => {
      console.error('⚠️  Initialization warning:', error.message || error);
      console.error('Server can still respond to basic protocol messages');
      // Log more details for debugging
      if (error.stack) {
        console.error('Stack trace:', error.stack);
      }
    });
  } catch (error) {
    console.error('❌ Failed to start MCP Server:', error);
    process.exit(1);
  }

  // Handle process signals for graceful shutdown
  process.on('SIGINT', async () => {
    console.error('\\nReceived SIGINT, shutting down gracefully...');
    if (server) {
      await server.shutdown();
    }
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.error('\\nReceived SIGTERM, shutting down gracefully...');
    if (server) {
      await server.shutdown();
    }
    process.exit(0);
  });

  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Don't exit on unhandled rejections - log and continue
  });
}

// Start the server immediately when this module is run directly
main();

export { RemotionCreativeMCPServer };