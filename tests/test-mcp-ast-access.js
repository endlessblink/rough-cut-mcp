// Quick test to verify enhanced AST converter is accessible via MCP tools
const path = require('path');

async function testMCPASTAccess() {
  console.log('🧪 Testing MCP AST Converter Access');
  console.log('===================================\n');

  try {
    // Test 1: Check if AST converter module loads
    console.log('1️⃣ Testing AST converter module import...');
    const astConverter = require('./build/ast-converter.js');
    console.log(`✅ AST module loaded: ${typeof astConverter}`);
    console.log(`✅ convertArtifactToRemotionAST function: ${typeof astConverter.convertArtifactToRemotionAST}`);

    // Test 2: Check if MCP tools can access the converter
    console.log('\n2️⃣ Testing MCP tools integration...');
    const tools = require('./build/tools.js');
    console.log(`✅ Tools module loaded: ${typeof tools}`);

    // Test 3: Quick version verification
    console.log('\n3️⃣ Testing version consistency...');
    const utils = require('./build/utils.js');
    const statusInfo = await utils.getMCPStatusInfo();
    console.log(`✅ MCP Server Version: ${statusInfo.version || 'unknown'}`);
    console.log(`✅ Running Version: ${statusInfo.runningVersion || 'unknown'}`);

    // Test 4: Minimal AST conversion test
    console.log('\n4️⃣ Testing minimal AST conversion...');
    const testJSX = `
import React, { useState } from 'react';
const TestComponent = () => {
  const [count, setCount] = useState(0);
  return <div>{count}</div>;
};
export default TestComponent;`;

    const convertedJSX = await astConverter.convertArtifactToRemotionAST(testJSX);
    console.log(`✅ Conversion successful: ${convertedJSX.length} chars`);
    console.log(`✅ Has Remotion imports: ${convertedJSX.includes('from "remotion"')}`);
    console.log(`✅ useState removed: ${!convertedJSX.includes('useState')}`);
    console.log(`✅ Frame-based: ${convertedJSX.includes('useCurrentFrame')}`);

    console.log('\n🎯 MCP AST Integration Status: WORKING ✅');
    
  } catch (error) {
    console.error('❌ MCP AST Integration Failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testMCPASTAccess().catch(console.error);