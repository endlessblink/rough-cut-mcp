#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

console.error('Starting minimal MCP server...');

const server = new Server(
  {
    name: 'test-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

const transport = new StdioServerTransport();

console.error('Connecting transport...');
server.connect(transport).then(() => {
  console.error('Server connected and running');
}).catch(err => {
  console.error('Failed to connect:', err);
  process.exit(1);
});