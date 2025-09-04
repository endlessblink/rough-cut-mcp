#!/usr/bin/env node

/**
 * Audio Enhancement System Test Script
 * Tests the rough-cut-mcp audio capabilities via direct MCP tool calls
 */

const { handleToolCall } = require('./build/tools.js');

async function testAudioEnhancementSystem() {
    console.log('🎵 Starting Audio Enhancement System Tests...\n');
    
    try {
        // Test 1: Debug current audio configuration
        console.log('📋 Test 1: Checking current audio configuration...');
        const debugResult = await handleToolCall('manage_audio', {
            action: 'debug'
        });
        
        console.log('Debug Result:', debugResult.content[0].text);
        console.log('✅ Debug test completed\n');
        
        // Test 2: Configure audio (enable without API key for testing)
        console.log('⚙️  Test 2: Configuring audio features...');
        const configResult = await handleToolCall('manage_audio', {
            action: 'configure',
            enabled: true
        });
        
        console.log('Configure Result:', configResult.content[0].text);
        console.log('✅ Configure test completed\n');
        
        // Test 3: Try generating audio without API key (should show helpful error)
        console.log('🎧 Test 3: Attempting audio generation (without API key)...');
        const generateResult = await handleToolCall('manage_audio', {
            action: 'generate',
            projectName: 'audio-test',
            prompt: 'Upbeat electronic music for a tech presentation',
            type: 'music',
            duration: 30
        });
        
        console.log('Generate Result:', generateResult.content[0].text);
        console.log('✅ Generate test completed\n');
        
        // Test 4: Debug configuration again to see changes
        console.log('📋 Test 4: Re-checking audio configuration after changes...');
        const debugResult2 = await handleToolCall('manage_audio', {
            action: 'debug'
        });
        
        console.log('Debug Result 2:', debugResult2.content[0].text);
        console.log('✅ Final debug test completed\n');
        
        console.log('🎉 All Audio Enhancement System tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

// Run the tests
if (require.main === module) {
    testAudioEnhancementSystem()
        .then(() => {
            console.log('\n✨ Audio enhancement system testing completed.');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Fatal error during testing:', error);
            process.exit(1);
        });
}

module.exports = { testAudioEnhancementSystem };