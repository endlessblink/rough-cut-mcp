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

import { loadConfig, logConfig, validateApiKeys, getAssetPath } from './utils/config.js';
import { initLogger, getLogger } from './utils/logger.js';
import { FileManagerService } from './services/file-manager.js';
import { EnhancedToolRegistry } from './services/enhanced-tool-registry.js';
import { ToolCategory, TOOL_SUBCATEGORIES } from './types/tool-categories.js';
import { ToolHandlers } from './types/index.js';

// Tool imports
// Import consolidated tools
import { registerAllTools } from './tools/index.js';

/**
 * Main server class for Remotion Creative MCP Server
 */
export class RemotionCreativeMCPServer {
  private server: Server;
  public config: any;
  public logger: any;
  private fileManager: FileManagerService;
  public toolRegistry: EnhancedToolRegistry;
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

    // Initialize enhanced tool registry with all features
    this.toolRegistry = new EnhancedToolRegistry({
      baseConfig: this.config,
      enableLayers: true,
      enableDependencies: true,
      enableContextManagement: true,
      enableAudit: true,
      maxContextWeight: 10000,
    });

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

    this.logger.info('Rough Cut MCP Server initializing', { 
      mode: 'layered' 
    });
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
   * Helper to find sub-category for a tool
   */
  private findToolSubCategory(toolName: string, categoryKey: string): string {
    const subCategories = TOOL_SUBCATEGORIES[categoryKey as keyof typeof TOOL_SUBCATEGORIES] || {};
    for (const [subCat, tools] of Object.entries(subCategories)) {
      if ((tools as string[]).includes(toolName)) {
        return subCat;
      }
    }
    return 'general'; // Default sub-category
  }

  /**
   * Register all MCP tools
   */
  private async registerTools(): Promise<void> {
    // Register all consolidated tools
    await registerAllTools(this);
    
    const initialActiveTools = this.toolRegistry.getActiveTools();
    const stats = this.toolRegistry.getUsageStatistics();
    this.logger.info('Consolidated tools registered', {
      totalTools: (stats as any).totalTools || 20,
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

    // Initialize default tools
    this.toolRegistry.initializeDefaults();
    
    const finalActiveTools = this.toolRegistry.getActiveTools();
    const enhancedStats = (this.toolRegistry as any).getEnhancedStatistics?.();
    
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
  private getAssetHandlers(): ToolHandlers {
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
  }

  /**
   * Register asset management tools
   */
  private registerAssetManagementTools(): void {
    const assetHandlers = this.getAssetHandlers();
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
          type: 'object' as const,
          properties: {},
        },
      },
      {
        name: 'cleanup-old-assets',
        description: 'Clean up old assets based on age',
        inputSchema: {
          type: 'object' as const,
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
          type: 'object' as const,
          properties: {},
        },
      },
      {
        name: 'get-disk-usage',
        description: 'Get disk usage information for asset directories',
        inputSchema: {
          type: 'object' as const,
          properties: {},
        },
      },
    ];
  }

  /**
   * Set up MCP request handlers
   */
  private setupRequestHandlers(): void {
    // List tools handler - now uses tool registry with proper serialization
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      try {
        const activeTools = this.toolRegistry.getActiveTools();
        
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
          } catch (e) {
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
      } catch (error) {
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
            throw new Error(
              `Tool '${name}' is registered but handler is missing. ` +
              `This is a bug in the MCP server. Tool category: ${tool.metadata.category}`
            );
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
  } catch (error) {
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

// Already exported as a class above
export type MCPServer = RemotionCreativeMCPServer;