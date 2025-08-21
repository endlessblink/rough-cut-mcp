#!/usr/bin/env node

/**
 * Direct rendering script for simple motion graphics video
 * Uses RoughCut MCP Server API directly without MCP protocol
 */

import { RoughCutMCPServer } from '../build/index-clean.js';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// The composition code provided by the user
const compositionCode = `
import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

export const VideoComposition = () => {
  const frame = useCurrentFrame();
  
  // Bouncing ball animation
  const ballY = Math.abs(Math.sin(frame * 0.1)) * 300 + 100;
  
  // Color transitions
  const bgHue = interpolate(frame, [0, 90], [200, 320], {
    extrapolateRight: 'clamp',
  });
  
  return (
    <AbsoluteFill style={{ backgroundColor: \`hsl(\${bgHue}, 70%, 50%)\` }}>
      {/* Bouncing Ball */}
      <div
        style={{
          position: 'absolute',
          width: 80,
          height: 80,
          backgroundColor: '#ff4444',
          borderRadius: '50%',
          left: '50%',
          top: ballY,
          transform: 'translateX(-50%)',
          boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
        }}
      />
      
      {/* Moving Circles */}
      {[0, 1, 2].map((i) => {
        const offset = i * 30;
        const x = interpolate(
          frame + offset,
          [0, 90],
          [100, 1820],
          { extrapolateRight: 'clamp' }
        );
        
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: 60,
              height: 60,
              backgroundColor: i % 2 === 0 ? '#4444ff' : '#44ff44',
              borderRadius: '50%',
              left: x,
              top: 540 + Math.sin((frame + offset) * 0.05) * 100,
              opacity: 0.7,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
`;

async function renderVideo() {
  console.log('🎬 Starting direct video rendering...');
  
  try {
    // Initialize the server
    console.log('📦 Initializing RoughCut MCP Server...');
    const server = new RoughCutMCPServer();
    
    // Prepare the request
    const videoRequest = {
      animationDesc: 'Simple motion graphics with moving shapes and color transitions',
      duration: 3,
      fps: 30,
      compositionCode: compositionCode,
      projectName: `simple-motion-${Date.now()}`,
      dimensions: {
        width: 1920,
        height: 1080
      }
    };
    
    console.log('🎨 Video Configuration:');
    console.log(`  - Duration: ${videoRequest.duration} seconds`);
    console.log(`  - FPS: ${videoRequest.fps}`);
    console.log(`  - Resolution: ${videoRequest.dimensions.width}x${videoRequest.dimensions.height}`);
    console.log(`  - Total Frames: ${videoRequest.duration * videoRequest.fps}`);
    
    // Call the video creation method
    console.log('\n🚀 Starting video creation...');
    const startTime = Date.now();
    
    const result = await server.createCompleteVideo(videoRequest);
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    // Parse the result
    if (result && result.content && result.content[0]) {
      const responseText = result.content[0].text;
      console.log('\n✅ Video creation completed!');
      console.log(`⏱️  Rendering time: ${duration.toFixed(2)} seconds`);
      
      // Extract paths from the response
      const videoPathMatch = responseText.match(/Video Path: ([^\n]+)/);
      const projectPathMatch = responseText.match(/Studio Project: ([^\n]+)/);
      
      if (videoPathMatch) {
        console.log(`\n📹 Video saved to: ${videoPathMatch[1]}`);
      }
      
      if (projectPathMatch) {
        console.log(`📁 Project created at: ${projectPathMatch[1]}`);
        console.log('\n💡 You can edit this project in Remotion Studio by running:');
        console.log(`   cd "${projectPathMatch[1]}" && npm start`);
      }
      
      console.log('\n🎉 Success! Your motion graphics video has been rendered.');
    } else {
      throw new Error('Unexpected response format from server');
    }
    
  } catch (error) {
    console.error('\n❌ Error rendering video:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the rendering
console.log('🎬 RoughCut Direct Video Renderer');
console.log('================================\n');

renderVideo().then(() => {
  console.log('\n✨ Done!');
  process.exit(0);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});