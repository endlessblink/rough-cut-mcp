#!/usr/bin/env node

/**
 * Example usage of the Remotion Creative MCP Server
 * This demonstrates how to call various tools through the MCP protocol
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to send MCP requests
function sendRequest(server, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * 10000);
    const request = {
      jsonrpc: '2.0',
      id,
      method,
      params
    };

    let responseData = '';
    
    const handleData = (data) => {
      responseData += data.toString();
      
      // Try to parse complete JSON responses
      const lines = responseData.split('\n');
      for (let i = 0; i < lines.length - 1; i++) {
        const line = lines[i].trim();
        if (line) {
          try {
            const response = JSON.parse(line);
            if (response.id === id) {
              server.stdout.removeListener('data', handleData);
              if (response.error) {
                reject(new Error(response.error.message || 'Request failed'));
              } else {
                resolve(response.result);
              }
              return;
            }
          } catch (e) {
            // Not valid JSON yet, continue accumulating
          }
        }
      }
      // Keep the incomplete line for next data event
      responseData = lines[lines.length - 1];
    };

    server.stdout.on('data', handleData);
    
    // Send the request
    server.stdin.write(JSON.stringify(request) + '\n');
    
    // Timeout after 30 seconds
    setTimeout(() => {
      server.stdout.removeListener('data', handleData);
      reject(new Error('Request timeout'));
    }, 30000);
  });
}

async function main() {
  console.log('🚀 Remotion Creative MCP Server - Example Usage\n');
  console.log('=' .repeat(50));
  
  // Start the MCP server
  const serverPath = path.join(__dirname, '..', 'build', 'index.js');
  console.log('📦 Starting MCP server...');
  
  const server = spawn('node', [serverPath], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  // Handle server errors
  server.stderr.on('data', (data) => {
    const message = data.toString();
    if (!message.includes('[INFO]') && !message.includes('[WARN]')) {
      console.error('⚠️  Server error:', message);
    }
  });

  server.on('error', (error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  });

  // Wait for server to initialize
  await new Promise(resolve => setTimeout(resolve, 2000));

  try {
    // Example 1: List available tools
    console.log('\n📋 Example 1: Listing available tools');
    console.log('-' .repeat(40));
    
    const toolsResponse = await sendRequest(server, 'tools/list');
    console.log(`✅ Found ${toolsResponse.tools.length} tools:`);
    toolsResponse.tools.forEach(tool => {
      console.log(`   • ${tool.name}`);
    });

    // Example 2: Create a simple text video
    console.log('\n🎬 Example 2: Creating a text video');
    console.log('-' .repeat(40));
    
    const textVideoRequest = {
      name: 'create-text-video',
      arguments: {
        text: 'Welcome to Remotion Creative MCP!',
        duration: 5,
        fontSize: 72,
        backgroundColor: '#1a1a2e',
        textColor: '#f5f5f5',
        fontFamily: 'Arial, sans-serif'
      }
    };

    console.log('📝 Creating text video with message: "Welcome to Remotion Creative MCP!"');
    
    try {
      const textVideoResponse = await sendRequest(server, 'tools/call', textVideoRequest);
      console.log('✅ Text video created successfully!');
      console.log(`   📁 Video saved to: ${textVideoResponse.content[0].text}`);
    } catch (error) {
      console.log('⚠️  Text video creation skipped (Remotion not fully configured)');
    }

    // Example 3: Estimate render time
    console.log('\n⏱️  Example 3: Estimating render time');
    console.log('-' .repeat(40));
    
    const estimateRequest = {
      name: 'estimate-render-time',
      arguments: {
        duration: 60,
        fps: 30,
        complexity: 'medium',
        assetCount: {
          images: 5,
          audioTracks: 2,
          effects: 3
        }
      }
    };

    console.log('📊 Estimating render time for 60-second video...');
    const estimateResponse = await sendRequest(server, 'tools/call', estimateRequest);
    const result = JSON.parse(estimateResponse.content[0].text);
    console.log(`✅ Estimated render time: ${result.estimatedRenderTimeFormatted}`);
    console.log(`   • Total frames: ${result.factors.durationInFrames}`);
    console.log(`   • Complexity: ${result.factors.complexity}`);

    // Example 4: Get asset statistics
    console.log('\n📊 Example 4: Getting asset statistics');
    console.log('-' .repeat(40));
    
    const statsRequest = {
      name: 'get-asset-statistics'
    };

    const statsResponse = await sendRequest(server, 'tools/call', statsRequest);
    const stats = JSON.parse(statsResponse.content[0].text);
    console.log('✅ Asset statistics retrieved:');
    console.log(`   • Total files: ${stats.totalFiles}`);
    console.log(`   • Total size: ${stats.totalSizeFormatted}`);
    console.log(`   • Videos: ${stats.breakdown.videos.count}`);
    console.log(`   • Audio: ${stats.breakdown.audio.count}`);
    console.log(`   • Images: ${stats.breakdown.images.count}`);

    // Example 5: Complex video creation (requires API keys)
    console.log('\n🎥 Example 5: Complete video creation (requires API keys)');
    console.log('-' .repeat(40));
    
    const hasApiKeys = process.env.ELEVENLABS_API_KEY || 
                       process.env.FREESOUND_API_KEY || 
                       process.env.FLUX_API_KEY;
    
    if (hasApiKeys) {
      const videoRequest = {
        name: 'create-complete-video',
        arguments: {
          animationDesc: 'A peaceful sunrise over mountains with gentle transitions',
          narration: 'Welcome to a new day, where possibilities are endless and dreams come alive.',
          sfxDesc: ['gentle breeze', 'morning birds'],
          imageDesc: ['sunrise over mountains', 'misty valley'],
          duration: 15,
          style: 'cinematic',
          fps: 30
        }
      };

      console.log('🎬 Creating complete video with AI-generated assets...');
      console.log('   • Generating voice narration...');
      console.log('   • Searching for sound effects...');
      console.log('   • Creating AI images...');
      console.log('   • Rendering video...');
      
      try {
        const videoResponse = await sendRequest(server, 'tools/call', videoRequest);
        const videoResult = JSON.parse(videoResponse.content[0].text);
        console.log('✅ Complete video created successfully!');
        console.log(`   📁 Video saved to: ${videoResult.videoPath}`);
        console.log(`   ⏱️  Duration: ${videoResult.duration} seconds`);
        console.log(`   🎵 Voice tracks: ${videoResult.assets.voiceTracks}`);
        console.log(`   🔊 Sound effects: ${videoResult.assets.soundEffects}`);
        console.log(`   🖼️  Images: ${videoResult.assets.images}`);
      } catch (error) {
        console.log('⚠️  Complete video creation requires API keys for AI services');
        console.log('   Set these environment variables:');
        console.log('   • ELEVENLABS_API_KEY (for voice generation)');
        console.log('   • FREESOUND_API_KEY (for sound effects)');
        console.log('   • FLUX_API_KEY (for image generation)');
      }
    } else {
      console.log('ℹ️  Skipping complete video example (no API keys configured)');
      console.log('   To enable AI features, set these environment variables:');
      console.log('   • ELEVENLABS_API_KEY');
      console.log('   • FREESOUND_API_KEY');
      console.log('   • FLUX_API_KEY');
    }

    console.log('\n' + '=' .repeat(50));
    console.log('✅ All examples completed successfully!');
    console.log('\n📚 Next steps:');
    console.log('   1. Configure API keys in .env file');
    console.log('   2. Try the individual tool commands');
    console.log('   3. Build your own video creation workflows');
    console.log('   4. Check the README for full documentation');

  } catch (error) {
    console.error('\n❌ Example failed:', error.message);
  } finally {
    // Clean shutdown
    console.log('\n👋 Shutting down server...');
    server.kill();
    process.exit(0);
  }
}

// Run the examples
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});