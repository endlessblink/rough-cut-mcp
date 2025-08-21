#!/usr/bin/env node

import { spawn } from 'child_process';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the composition code
const compositionCode = readFileSync(join(__dirname, 'space-journey-code.tsx'), 'utf-8');

// Create the MCP request
const request = {
  jsonrpc: "2.0",
  method: "tools/call",
  params: {
    name: "create-complete-video",
    arguments: {
      animationDesc: "Space journey with planets, stars, and a rocket traveling through space",
      duration: 6,
      compositionCode: compositionCode,
      fps: 30,
      dimensions: {
        width: 1920,
        height: 1080
      }
    }
  },
  id: 1
};

console.log('🚀 Starting Rough Cut MCP Server...\n');

// Start the MCP server
const server = spawn('node', ['build/index.js'], {
  cwd: __dirname,
  stdio: ['pipe', 'pipe', 'inherit'],
  env: {
    ...process.env,
    NODE_ENV: 'production'
  }
});

let responseBuffer = '';
let videoCreated = false;

server.stdout.on('data', (data) => {
  const text = data.toString();
  responseBuffer += text;
  
  // Try to parse each line as JSON
  const lines = responseBuffer.split('\n');
  for (let i = 0; i < lines.length - 1; i++) {
    const line = lines[i].trim();
    if (line && !line.includes('Content-Length')) {
      try {
        const response = JSON.parse(line);
        
        if (response.result) {
          console.log('\n✅ Success!');
          console.log('Response:', JSON.stringify(response.result, null, 2));
          
          // Look for video path in the response
          if (response.result.content && response.result.content[0]) {
            const content = response.result.content[0].text;
            const videoPathMatch = content.match(/Video created at: (.+\.mp4)/);
            if (videoPathMatch) {
              console.log(`\n🎥 Video saved to: ${videoPathMatch[1]}`);
              videoCreated = true;
            }
          }
        } else if (response.error) {
          console.error('\n❌ Error:', response.error.message);
        }
      } catch (e) {
        // Not JSON, ignore
      }
    }
  }
  responseBuffer = lines[lines.length - 1];
});

server.on('error', (error) => {
  console.error('Server error:', error);
});

// Wait for server to initialize
setTimeout(() => {
  console.log('📤 Sending video creation request...\n');
  
  // Send the MCP request
  const requestStr = JSON.stringify(request);
  const message = `Content-Length: ${Buffer.byteLength(requestStr)}\r\n\r\n${requestStr}`;
  server.stdin.write(message);
  
  console.log('⏳ Generating video (this may take 30-60 seconds)...\n');
}, 2000);

// Exit after 90 seconds
setTimeout(() => {
  if (videoCreated) {
    console.log('\n🎉 Video creation completed successfully!');
  } else {
    console.log('\n⚠️  Video creation may still be in progress...');
  }
  
  server.kill();
  process.exit(0);
}, 90000);