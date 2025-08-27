// Debug tool registry directly
const { spawn } = require('child_process');
const path = require('path');

console.log('🔍 Testing tool registry directly...\n');

const serverPath = path.join(__dirname, 'build', 'index.js');
console.log('Server path:', serverPath);

// Create MCP server subprocess
const server = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: { ...process.env, NODE_ENV: 'test' }
});

let stdout = '';
let stderr = '';

server.stdout.on('data', (data) => {
  stdout += data.toString();
  console.log('STDOUT:', data.toString());
});

server.stderr.on('data', (data) => {
  stderr += data.toString();
  console.log('STDERR:', data.toString());
});

server.on('close', (code, signal) => {
  console.log('\n📊 Server Process Results:');
  console.log('Exit code:', code);
  console.log('Signal:', signal);
  console.log('STDOUT length:', stdout.length);
  console.log('STDERR length:', stderr.length);
  
  if (stderr) {
    console.log('\n🔴 STDERR Content:');
    console.log(stderr);
  }
  
  if (stdout) {
    console.log('\n🟢 STDOUT Content:');
    console.log(stdout);
  }
});

// Send initialize request
setTimeout(() => {
  console.log('\n📤 Sending initialize request...');
  server.stdin.write(JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'debug-test',
        version: '1.0.0'
      }
    }
  }) + '\n');
}, 1000);

// Send tools/list request
setTimeout(() => {
  console.log('\n📤 Sending tools/list request...');
  server.stdin.write(JSON.stringify({
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/list'
  }) + '\n');
}, 2000);

// Close after 5 seconds
setTimeout(() => {
  console.log('\n⏰ Timeout reached, closing...');
  server.kill('SIGTERM');
}, 5000);