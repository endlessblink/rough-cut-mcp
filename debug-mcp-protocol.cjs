// Debug MCP protocol communication with detailed tracing
const { spawn } = require('child_process');
const path = require('path');

console.log('🔍 Testing MCP protocol communication with detailed tracing...\n');

const serverPath = path.join(__dirname, 'build', 'index.js');
console.log('Server path:', serverPath);

// Create MCP server subprocess
const server = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: { ...process.env, NODE_ENV: 'test' }
});

let stdout = '';
let stderr = '';
let receivedMessages = [];
let sentMessages = [];

// Track all communication
server.stdout.on('data', (data) => {
  const str = data.toString();
  stdout += str;
  console.log('📥 STDOUT:', str.replace(/\n$/, ''));
  
  // Try to parse as JSON-RPC messages
  const lines = str.split('\n').filter(line => line.trim());
  lines.forEach(line => {
    try {
      const parsed = JSON.parse(line);
      receivedMessages.push(parsed);
      console.log('📋 Parsed JSON-RPC:', JSON.stringify(parsed, null, 2));
    } catch (e) {
      // Not JSON, just regular output
      console.log('📝 Non-JSON output:', line);
    }
  });
});

server.stderr.on('data', (data) => {
  const str = data.toString();
  stderr += str;
  console.log('📢 STDERR:', str.replace(/\n$/, ''));
});

function sendMessage(message) {
  const json = JSON.stringify(message);
  sentMessages.push(message);
  console.log('📤 Sending:', JSON.stringify(message, null, 2));
  server.stdin.write(json + '\n');
}

server.on('close', (code, signal) => {
  console.log('\n📊 Final Results:');
  console.log('Exit code:', code);
  console.log('Signal:', signal);
  console.log('Messages sent:', sentMessages.length);
  console.log('Messages received:', receivedMessages.length);
  
  if (sentMessages.length > 0) {
    console.log('\n📤 Sent Messages:');
    sentMessages.forEach((msg, i) => {
      console.log(`${i + 1}. ${msg.method} (id: ${msg.id})`);
    });
  }
  
  if (receivedMessages.length > 0) {
    console.log('\n📥 Received Messages:');
    receivedMessages.forEach((msg, i) => {
      console.log(`${i + 1}. ${msg.result ? 'Result' : 'Error'} (id: ${msg.id})`);
    });
  } else {
    console.log('\n❌ No JSON-RPC messages received - protocol issue');
  }
  
  if (stderr) {
    console.log('\n🔴 STDERR Output:');
    console.log(stderr);
  }
});

// Wait for server to start
setTimeout(() => {
  console.log('\n📤 Sending initialize request...');
  sendMessage({
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
  });
}, 1000);

// Send tools/list request
setTimeout(() => {
  console.log('\n📤 Sending tools/list request...');
  sendMessage({
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/list'
  });
}, 3000);

// Close after 8 seconds
setTimeout(() => {
  console.log('\n⏰ Test complete, closing...');
  server.kill('SIGTERM');
}, 8000);