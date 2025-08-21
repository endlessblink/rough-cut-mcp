#!/usr/bin/env node

// Basic test to check if the server can be imported and initialized
import { RemotionCreativeMCPServer } from './build/index.js';

console.log('🧪 Testing basic server initialization...\n');

try {
  console.log('📦 Creating server instance...');
  const server = new RemotionCreativeMCPServer();
  
  console.log('✅ Server instance created successfully!');
  console.log('🔧 Attempting to initialize...');
  
  await server.initialize();
  
  console.log('✅ Server initialized successfully!');
  console.log('\n🎉 Basic test passed!');
  console.log('📋 Server is ready to handle MCP requests');
  
} catch (error) {
  console.error('❌ Test failed:');
  console.error(error.message);
  console.error('\n🔍 Full error:');
  console.error(error);
  process.exit(1);
}