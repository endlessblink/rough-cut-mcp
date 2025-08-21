#!/usr/bin/env node

// Absolute minimal MCP server that works
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server(
  {
    name: 'minimal-test',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

const transport = new StdioServerTransport();
server.connect(transport);

// Server is now ready and listening