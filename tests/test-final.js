#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serverPath = join(__dirname, 'build', 'index.js');

console.error('Testing fixed MCP server...');

const proc = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'inherit'],
  cwd: __dirname
});

// Send initialization
const msg = JSON.stringify({
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'test', version: '1.0.0' }
  }
});

console.error('Sending:', msg);
proc.stdin.write(msg + '\n');

// Read response
let responseReceived = false;
proc.stdout.on('data', (data) => {
  const output = data.toString();
  console.log('✅ Response:', output);
  responseReceived = true;
  
  try {
    const json = JSON.parse(output);
    if (json.jsonrpc === '2.0' && json.result) {
      console.log('✅ Valid JSON-RPC response!');
      console.log('   Protocol:', json.result.protocolVersion);
      console.log('   Server:', json.result.serverInfo?.name);
      process.exit(0);
    }
  } catch (e) {
    console.error('Failed to parse response');
  }
  proc.kill();
});

// Timeout
setTimeout(() => {
  if (!responseReceived) {
    console.error('❌ No response after 2 seconds');
  }
  proc.kill();
  process.exit(responseReceived ? 0 : 1);
}, 2000);