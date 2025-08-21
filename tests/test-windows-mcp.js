#!/usr/bin/env node

/**
 * Test script to verify MCP server works with Windows Node.js
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Testing MCP Server with Windows Node.js\n');
console.log('=' .repeat(60));

// Test direct execution
console.log('\n1️⃣  Testing direct execution...');
const serverPath = path.join(__dirname, 'build', 'index.js');

// Start the server
const server = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe'],
  cwd: __dirname,
  env: { ...process.env, MCP_DEBUG: 'true' }
});

let responseReceived = false;

// Handle server stdout (MCP protocol messages)
server.stdout.on('data', (data) => {
  const output = data.toString();
  console.log('✅ Server Response:', output);
  responseReceived = true;
  
  // Try to parse as JSON
  try {
    const json = JSON.parse(output);
    if (json.jsonrpc === '2.0') {
      console.log('✅ Valid JSON-RPC response received!');
      console.log('   Protocol version:', json.result?.protocolVersion);
      console.log('   Server name:', json.result?.serverInfo?.name);
    }
  } catch (e) {
    console.log('⚠️  Response is not valid JSON');
  }
});

// Handle server stderr (debug/error messages)
server.stderr.on('data', (data) => {
  console.log('📝 Server Debug:', data.toString());
});

// Send initialization request
const initRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: {
      name: 'test',
      version: '1.0'
    }
  }
};

console.log('\n2️⃣  Sending MCP initialization request...');
server.stdin.write(JSON.stringify(initRequest) + '\n');

// Wait and check results
setTimeout(() => {
  console.log('\n' + '=' .repeat(60));
  
  if (responseReceived) {
    console.log('✅ SUCCESS: MCP server is working correctly!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Restart Claude Desktop');
    console.log('   2. The Remotion Creative tools should now be available');
    console.log('   3. Try: "Create a 5-second welcome video"');
  } else {
    console.log('❌ FAILED: No response from MCP server');
    console.log('\n🔍 Troubleshooting:');
    console.log('   1. Check build/index.js exists');
    console.log('   2. Run: npm run build');
    console.log('   3. Check for TypeScript errors');
  }
  
  server.kill();
  process.exit(responseReceived ? 0 : 1);
}, 3000);

server.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});