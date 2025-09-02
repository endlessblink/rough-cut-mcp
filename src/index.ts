#!/usr/bin/env node

// Load environment variables first with multiple path attempts
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

// Try multiple .env file locations to ensure it's found regardless of where Claude Desktop starts the process
const envPaths = [
  path.resolve(__dirname, '../.env'),           // Standard: build/../.env
  path.resolve(__dirname, '.env'),              // Same directory as build
  path.resolve(process.cwd(), '.env'),          // Current working directory
];

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    console.error(`[ENV] Loading .env from: ${envPath}`);
    dotenv.config({ path: envPath });
    break;
  }
}

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { tools, handleToolCall } from './tools.js';

class RemotionMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'rough-cut-mcp',
        version: '6.1.0'
      },
      {
        capabilities: {
          tools: {}
        }
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      return await handleToolCall(name, args || {});
    });
  }

  private setupErrorHandling() {
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

const server = new RemotionMCPServer();
server.run().catch(console.error);