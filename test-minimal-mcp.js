#!/usr/bin/env node

/**
 * Minimal test to check if the MCP server starts at all
 */

import { spawn } from 'child_process';

console.log('Starting MCP server directly...\n');

const server = spawn('node', ['build/index.js'], {
  stdio: 'inherit',  // Show all output directly
  cwd: process.cwd()
});

server.on('error', (err) => {
  console.error('Failed to start:', err);
});

server.on('exit', (code) => {
  console.log(`Server exited with code ${code}`);
});

// Give it 2 seconds then exit
setTimeout(() => {
  console.log('\nStopping test...');
  server.kill();
  process.exit(0);
}, 2000);