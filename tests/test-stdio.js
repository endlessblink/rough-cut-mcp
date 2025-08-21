#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serverPath = join(__dirname, 'build', 'index.js');

console.error('Testing MCP server communication...');

const proc = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'inherit']
});

// Send initialization
const msg = JSON.stringify({
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'test', version: '1.0' }
  }
});

console.error('Sending:', msg);
proc.stdin.write(msg + '\n');

// Read response
proc.stdout.on('data', (data) => {
  console.log('Response:', data.toString());
  proc.kill();
  process.exit(0);
});

// Timeout
setTimeout(() => {
  console.error('No response after 3 seconds');
  proc.kill();
  process.exit(1);
}, 3000);