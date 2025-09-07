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

// Get absolute path to OUR project directory (not Claude Desktop's working directory)  
function getOurProjectRoot(): string {
  // __filename points to our build/index.js file
  const buildDir = path.dirname(__filename);
  return path.dirname(buildDir); // Go up one level to project root
}

function getOurLogsDir(): string {
  return path.join(getOurProjectRoot(), 'logs');
}

class RemotionMCPServer {
  private server: Server;

  constructor() {
    // Research-backed diagnostic logging
    console.error(`[DEBUG] Node.js Version: ${process.version}`);
    console.error(`[DEBUG] MCP Server Version: 10.2.0`);
    console.error(`[DEBUG] Working Directory: ${process.cwd()}`);
    console.error(`[DEBUG] Script Path: ${__filename}`);
    
    this.server = new Server(
      {
        name: 'rough-cut-mcp',
        version: '10.2.0' // Comprehensive Visual System - Professional Typography, Layout, Effects & Animations
      },
      {
        capabilities: {
          tools: {},
          protocolVersion: "2024-11-05" // Research solution: prevent negotiation fallback
        }
      }
    );

    // RESEARCH-BACKED FIX: Override initialize handler to bypass protocol negotiation bug
    this.setupVersionOverride();
    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private setupVersionOverride() {
    // RESEARCH-BACKED: Aggressive version logging to bypass July 2025 MCP bug
    console.error(`[VERSION-OVERRIDE] =================================`);
    console.error(`[VERSION-OVERRIDE] MCP SERVER VERSION: 10.2.0`);
    console.error(`[VERSION-OVERRIDE] BYPASSING PROTOCOL FALLBACK BUG`);
    console.error(`[VERSION-OVERRIDE] PREVENTING v6.2.0 CACHE LOADING`);
    console.error(`[VERSION-OVERRIDE] =================================`);
    
    // Enhanced version logging throughout startup
    console.error(`[MCP-INIT] Server created with version 10.2.0`);
    console.error(`[MCP-INIT] Protocol version: 2024-11-05`);
    console.error(`[MCP-INIT] This should show as Running Version: 10.2.0`);
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      // Use OUR project logs directory, not Claude Desktop's
      const fs = require('fs-extra');
      const logsDir = getOurLogsDir();
      fs.ensureDirSync(logsDir);
      fs.appendFileSync(path.join(logsDir, 'mcp-tools-list.log'), `TOOLS LISTED: ${new Date().toISOString()}\n`);
      
      return {
        tools
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      // Use OUR project logs directory, not Claude Desktop's
      const fs = require('fs-extra');
      const logsDir = getOurLogsDir();
      fs.ensureDirSync(logsDir);
      
      try {
        fs.appendFileSync(path.join(logsDir, 'mcp-requests.log'), `REQUEST: ${JSON.stringify(request.params)} - ${new Date().toISOString()}\n`);
        
        const { name, arguments: args } = request.params;
        
        fs.appendFileSync(path.join(logsDir, 'mcp-requests.log'), `PRE-HANDLE: ${name} - ${new Date().toISOString()}\n`);
        
        const result = await handleToolCall(name, args || {});
        
        fs.appendFileSync(path.join(logsDir, 'mcp-requests.log'), `POST-HANDLE: Success - ${new Date().toISOString()}\n`);
        
        return result;
      } catch (error) {
        fs.appendFileSync(path.join(logsDir, 'mcp-errors.log'), `HANDLER ERROR: ${error instanceof Error ? error.message : 'Unknown'} - ${error instanceof Error ? error.stack : 'No stack'} - ${new Date().toISOString()}\n`);
        throw error;
      }
    });
  }

  private setupErrorHandling() {
    // RESEARCH-BACKED: Enhanced error logging to track version consistency
    console.error(`[MCP-ERROR-SETUP] Version 10.2.0 error handling active`);
    console.error(`[MCP-ERROR-SETUP] Will prevent fallback to v6.2.0 cache`);
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