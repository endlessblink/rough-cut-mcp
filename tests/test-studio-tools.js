#!/usr/bin/env node

import { RemotionCreativeMCPServer } from './build/index.js';

console.log('🎬 Testing Remotion Studio Integration\n');

async function main() {
  try {
    // Initialize server
    const server = new RemotionCreativeMCPServer();
    await server.initialize();
    
    // Get tools
    const tools = server.getTools();
    const handlers = server.getToolHandlers();
    
    // Find Studio tools
    const studioTools = tools.filter(t => t.name.includes('studio') || t.name.includes('browser'));
    
    console.log(`✅ Found ${studioTools.length} Studio-related tools:`);
    studioTools.forEach(tool => {
      console.log(`   • ${tool.name}: ${tool.description}`);
    });
    
    // Test get-studio-status
    console.log('\n📊 Checking Studio status...');
    const status = await handlers['get-studio-status']();
    console.log(`   Status: ${status.status}`);
    console.log(`   Running: ${status.running}`);
    
    // Test create-text-video
    console.log('\n🎥 Creating a test video...');
    const videoResult = await handlers['create-text-video']({
      text: 'Remotion Studio Test',
      duration: 3,
      fontSize: 64,
      backgroundColor: '#1e40af',
      textColor: '#ffffff'
    });
    console.log(`   Video created: ${videoResult.videoPath}`);
    
    console.log('\n✅ All tests passed!');
    console.log('\n📚 You can now use these commands in Claude Desktop:');
    console.log('   • "Launch Remotion Studio"');
    console.log('   • "Create a new Remotion project called my-video"');
    console.log('   • "Open my video in the browser"');
    console.log('   • "Check if Remotion Studio is running"');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

main();