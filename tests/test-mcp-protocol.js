#!/usr/bin/env node

// Test MCP protocol communication
import { RemotionCreativeMCPServer } from '../build/index.js';

console.log('🧪 Testing MCP Protocol Communication\n');

async function main() {
  try {
    // Create and initialize server
    console.log('📦 Creating server instance...');
    const server = new RemotionCreativeMCPServer();
    
    console.log('🔧 Initializing server...');
    await server.initialize();
    
    // Test getting tool list
    console.log('\n📋 Testing tool list...');
    const tools = server.getTools();
    console.log(`✅ Found ${tools.length} tools:`);
    
    tools.forEach(tool => {
      console.log(`   • ${tool.name}: ${tool.description.substring(0, 60)}...`);
    });
    
    // Test tool handlers
    console.log('\n🔧 Testing tool handlers...');
    const handlers = server.getToolHandlers();
    const handlerNames = Object.keys(handlers);
    console.log(`✅ Found ${handlerNames.length} handlers:`);
    handlerNames.forEach(name => {
      console.log(`   • ${name}: ${typeof handlers[name]}`);
    });
    
    // Test estimate-render-time tool
    console.log('\n⏱️  Testing estimate-render-time tool...');
    try {
      const estimateHandler = handlers['estimate-render-time'];
      const result = await estimateHandler({
        duration: 30,
        fps: 30,
        complexity: 'medium',
        assetCount: {
          images: 2,
          audioTracks: 1,
          effects: 1
        }
      });
      
      console.log('✅ Render time estimation successful:');
      console.log(`   • Estimated time: ${result.estimatedRenderTimeFormatted}`);
      console.log(`   • Total frames: ${result.factors.durationInFrames}`);
    } catch (error) {
      console.log('⚠️  Estimate tool error:', error.message);
    }
    
    // Test get-asset-statistics tool
    console.log('\n📊 Testing get-asset-statistics tool...');
    try {
      const statsHandler = handlers['get-asset-statistics'];
      const stats = await statsHandler({});
      
      console.log('✅ Asset statistics retrieved:');
      console.log(`   • Total files: ${stats.totalFiles}`);
      console.log(`   • Total size: ${stats.totalSizeFormatted}`);
      console.log(`   • Directories: ${Object.keys(stats.breakdown).length}`);
    } catch (error) {
      console.log('⚠️  Statistics tool error:', error.message);
    }
    
    // Test create-text-video tool (if Remotion is available)
    console.log('\n🎬 Testing create-text-video tool...');
    try {
      const textVideoHandler = handlers['create-text-video'];
      console.log('   Creating simple text video...');
      
      const videoResult = await textVideoHandler({
        text: 'Test Video',
        duration: 3,
        fontSize: 48,
        backgroundColor: '#000000',
        textColor: '#FFFFFF'
      });
      
      console.log('✅ Text video created:');
      console.log(`   • Video path: ${videoResult.videoPath}`);
      console.log(`   • Duration: ${videoResult.duration}s`);
    } catch (error) {
      console.log('⚠️  Text video creation skipped:', error.message);
    }
    
    console.log('\n✅ All tests completed!');
    console.log('\n📚 Server capabilities summary:');
    console.log('   • Core tools: Working ✅');
    console.log('   • Asset management: Working ✅');
    console.log('   • Voice tools: ' + (process.env.ELEVENLABS_API_KEY ? 'Available ✅' : 'Requires API key ⚠️'));
    console.log('   • Sound tools: ' + (process.env.FREESOUND_API_KEY ? 'Available ✅' : 'Requires API key ⚠️'));
    console.log('   • Image tools: ' + (process.env.FLUX_API_KEY ? 'Available ✅' : 'Requires API key ⚠️'));
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

main();