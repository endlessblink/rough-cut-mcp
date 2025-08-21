import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the composition code
const compositionCode = fs.readFileSync(path.join(__dirname, 'space-journey-code.tsx'), 'utf-8');

// MCP request to create video
const request = {
  jsonrpc: "2.0",
  method: "tools/call",
  params: {
    name: "create-complete-video",
    arguments: {
      animationDesc: "Space journey with planets, stars, and a rocket traveling through space",
      duration: 6,
      compositionCode: compositionCode
    }
  },
  id: 1
};

console.log('Starting RoughCut MCP server...');

// Start the MCP server
const server = spawn('node', ['build/index.js'], {
  cwd: __dirname,
  stdio: ['pipe', 'pipe', 'pipe']
});

let responseBuffer = '';

server.stdout.on('data', (data) => {
  const text = data.toString();
  responseBuffer += text;
  
  // Try to parse complete JSON responses
  const lines = responseBuffer.split('\n');
  for (let i = 0; i < lines.length - 1; i++) {
    const line = lines[i].trim();
    if (line) {
      try {
        const response = JSON.parse(line);
        if (response.result) {
          console.log('Success:', response.result);
          if (response.result.videoPath) {
            console.log(`Video created at: ${response.result.videoPath}`);
          }
        } else if (response.error) {
          console.error('Error:', response.error);
        }
      } catch (e) {
        // Not JSON, might be a log message
        if (!line.includes('Content-Length')) {
          console.log('Server:', line);
        }
      }
    }
  }
  // Keep the last incomplete line in the buffer
  responseBuffer = lines[lines.length - 1];
});

server.stderr.on('data', (data) => {
  console.error('Server error:', data.toString());
});

// Wait a moment for server to initialize
setTimeout(() => {
  console.log('Sending video creation request...');
  
  // Send the request
  const requestStr = JSON.stringify(request);
  const message = `Content-Length: ${Buffer.byteLength(requestStr)}\r\n\r\n${requestStr}`;
  server.stdin.write(message);
  
  // Give it time to process
  setTimeout(() => {
    console.log('Checking for output...');
    
    // List videos in the output directory
    const videosDir = path.join(__dirname, 'assets', 'videos');
    if (fs.existsSync(videosDir)) {
      const files = fs.readdirSync(videosDir);
      console.log('Videos in output directory:', files);
      
      // Find the most recent video
      const videoFiles = files.filter(f => f.endsWith('.mp4'));
      if (videoFiles.length > 0) {
        const latestVideo = videoFiles.sort().pop();
        console.log(`Latest video: ${path.join(videosDir, latestVideo)}`);
      }
    }
    
    // Wait a bit more then close
    setTimeout(() => {
      console.log('Closing server...');
      server.stdin.end();
      process.exit(0);
    }, 5000);
  }, 30000); // Wait 30 seconds for video generation
}, 2000);