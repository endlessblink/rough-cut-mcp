#!/usr/bin/env node

/**
 * Example: Using Remotion Creative MCP Server WITHOUT API Keys
 * 
 * This demonstrates all the video creation features you can use
 * with just Remotion - no AI services required!
 */

import { RemotionCreativeMCPServer } from '../build/index.js';

async function main() {
  console.log('🎬 Remotion-Only Video Creation Examples\n');
  console.log('No API keys required for these features!\n');
  console.log('=' .repeat(50) + '\n');
  
  // Initialize server
  const server = new RemotionCreativeMCPServer();
  await server.initialize();
  const handlers = server.getToolHandlers();
  
  // Example 1: Simple text video
  console.log('📝 Example 1: Simple Text Video');
  console.log('-' .repeat(40));
  
  try {
    const result1 = await handlers['create-text-video']({
      text: 'Welcome to Remotion!',
      duration: 5,
      fontSize: 72,
      backgroundColor: '#0f172a',
      textColor: '#38bdf8'
    });
    
    console.log('✅ Created:', result1.videoPath);
  } catch (error) {
    console.log('Note: Actual rendering requires Remotion dependencies installed');
  }
  
  // Example 2: Animated title sequence
  console.log('\n🎭 Example 2: Animated Title Sequence');
  console.log('-' .repeat(40));
  
  try {
    const result2 = await handlers['create-text-video']({
      text: 'EPIC TITLE\nComing Soon',
      duration: 8,
      fontSize: 96,
      backgroundColor: '#000000',
      textColor: '#ff0000',
      fontFamily: 'Impact, sans-serif'
    });
    
    console.log('✅ Created:', result2.videoPath);
  } catch (error) {
    console.log('Note: Actual rendering requires Remotion dependencies installed');
  }
  
  // Example 3: Create complete video with manual assets
  console.log('\n🎬 Example 3: Complete Video (Manual Assets)');
  console.log('-' .repeat(40));
  
  console.log('You can use create-complete-video with your own assets:');
  console.log('1. Place images in: ./assets/images/');
  console.log('2. Place audio in: ./assets/audio/');
  console.log('3. Then create videos that use them!');
  
  try {
    const result3 = await handlers['create-complete-video']({
      animationDesc: 'A dynamic slideshow with smooth transitions between scenes',
      duration: 30,
      style: 'modern',
      fps: 30,
      dimensions: {
        width: 1920,
        height: 1080
      }
      // Note: No narration, sfxDesc, or imageDesc - using manual assets
    });
    
    console.log('✅ Video configuration created');
  } catch (error) {
    console.log('Note: Add your own assets to the directories above');
  }
  
  // Example 4: Render time estimation
  console.log('\n⏱️  Example 4: Render Time Estimation');
  console.log('-' .repeat(40));
  
  const estimate = await handlers['estimate-render-time']({
    duration: 60,
    fps: 30,
    complexity: 'medium',
    assetCount: {
      images: 10,
      audioTracks: 2,
      effects: 5
    }
  });
  
  console.log(`Estimated render time: ${estimate.estimatedRenderTimeFormatted}`);
  console.log(`Total frames: ${estimate.factors.durationInFrames}`);
  
  // Example 5: Different video styles
  console.log('\n🎨 Example 5: Different Video Styles');
  console.log('-' .repeat(40));
  
  const styles = [
    { 
      text: 'Minimalist', 
      backgroundColor: '#ffffff', 
      textColor: '#000000',
      fontSize: 48
    },
    { 
      text: 'Neon Glow', 
      backgroundColor: '#0a0a0a', 
      textColor: '#00ff00',
      fontSize: 64
    },
    { 
      text: 'Vintage', 
      backgroundColor: '#f4e4c1', 
      textColor: '#5d4e37',
      fontSize: 56,
      fontFamily: 'Georgia, serif'
    },
    { 
      text: 'Corporate', 
      backgroundColor: '#1e3a8a', 
      textColor: '#ffffff',
      fontSize: 52,
      fontFamily: 'Helvetica, Arial, sans-serif'
    }
  ];
  
  for (const style of styles) {
    try {
      const result = await handlers['create-text-video']({
        ...style,
        duration: 3
      });
      console.log(`✅ ${style.text} style video created`);
    } catch (error) {
      console.log(`• ${style.text} style configured`);
    }
  }
  
  // Tips for using Remotion without APIs
  console.log('\n' + '=' .repeat(50));
  console.log('💡 TIPS FOR USING REMOTION WITHOUT APIs:\n');
  
  console.log('1. CREATE TEXT ANIMATIONS:');
  console.log('   Use create-text-video for titles, credits, announcements\n');
  
  console.log('2. USE YOUR OWN ASSETS:');
  console.log('   Place files in ./assets/[images|audio|videos]');
  console.log('   Then reference them in your video compositions\n');
  
  console.log('3. PROGRAMMATIC VIDEOS:');
  console.log('   Create data-driven videos (charts, visualizations)');
  console.log('   Generate videos from JSON data or databases\n');
  
  console.log('4. BATCH PROCESSING:');
  console.log('   Create multiple videos with different parameters');
  console.log('   Perfect for creating video templates\n');
  
  console.log('5. CUSTOM COMPOSITIONS:');
  console.log('   Extend the templates in src/templates/');
  console.log('   Add your own Remotion compositions\n');
  
  console.log('📚 Learn more about Remotion: https://www.remotion.dev/');
  console.log('🎥 No AI needed - just pure programmatic video creation!');
}

main().catch(console.error);