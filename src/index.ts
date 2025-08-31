// RoughCut MCP Server - Simple & Working Edition
// Focuses on core functionality that actually works instead of complex abstractions

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema,
  InitializeRequestSchema,
  InitializedNotificationSchema 
} from '@modelcontextprotocol/sdk/types.js';

import { getTools, handleToolCall } from './tools.js';

/**
 * Simple MCP Server - No layers, no registries, just working tools
 */
class SimpleMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server({
      name: 'rough-cut-mcp',
      version: '4.4.0',
      description: 'Simple & Reliable Video Creation MCP - Actually Works!'
    }, {
      capabilities: { tools: {} }
    });

    this.setupHandlers();
  }

  private setupHandlers() {
    // Initialize
    this.server.setRequestHandler(InitializeRequestSchema, async () => {
      return {
        protocolVersion: '2025-06-18',
        capabilities: { tools: {} },
        serverInfo: {
          name: 'rough-cut-mcp',
          version: '4.4.0',
          description: 'Simple & Reliable Video Creation MCP'
        }
      };
    });

    // Initialized notification
    this.server.setRequestHandler(InitializedNotificationSchema, async () => {
      return {};
    });

    // List tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return { tools: getTools() };
    });

    // Call tool
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      try {
        const result = await handleToolCall(name, args || {});
        return result;
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `❌ Error in ${name}: ${error instanceof Error ? error.message : String(error)}`
          }],
          isError: true
        };
      }
    });
  }

  start() {
    const transport = new StdioServerTransport();
    this.server.connect(transport);
  }
}

// Start the server
function main() {
  try {
    const server = new SimpleMCPServer();
    server.start();
  } catch (error) {
    process.exit(1);
  }
}

main();