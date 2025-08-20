#!/usr/bin/env node

/**
 * Test MCP server communication
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Testing MCP Server Communication\n');

// Start the MCP server
const serverPath = path.join(__dirname, 'build', 'index.js');
console.log('Starting server:', serverPath);

const server = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe'],
  cwd: __dirname
});

// Handle server stderr (errors)
server.stderr.on('data', (data) => {
  console.error('❌ Server Error:', data.toString());
});

// Handle server stdout
server.stdout.on('data', (data) => {
  console.log('📤 Server Output:', data.toString());
});

// Send initialization request
const initRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '0.1.0',
    capabilities: {}
  }
};

console.log('📝 Sending initialization request...\n');
server.stdin.write(JSON.stringify(initRequest) + '\n');

// Send list tools request after a delay
setTimeout(() => {
  const listToolsRequest = {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/list',
    params: {}
  };
  
  console.log('📝 Sending list tools request...\n');
  server.stdin.write(JSON.stringify(listToolsRequest) + '\n');
}, 1000);

// Exit after 5 seconds
setTimeout(() => {
  console.log('\n✅ Test completed. Shutting down...');
  server.kill();
  process.exit(0);
}, 5000);

server.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

server.on('exit', (code) => {
  console.log(`\nServer exited with code ${code}`);
});