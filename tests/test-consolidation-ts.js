// Test TypeScript source directly for Phase 1 consolidated tools
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Phase 1 Tool Consolidation (TypeScript Source)');
console.log('======================================================');

try {
  // Read the tools.ts source file
  const toolsSource = fs.readFileSync(path.join(__dirname, 'src', 'tools.ts'), 'utf8');
  
  // Test 1: Check for consolidated tool definitions
  const consolidatedTools = ['manage_project', 'edit_project', 'control_studio'];
  let foundCount = 0;
  
  consolidatedTools.forEach(toolName => {
    if (toolsSource.includes(`name: '${toolName}'`)) {
      console.log(`✅ Found ${toolName} tool definition`);
      foundCount++;
      
      // Check for progressive disclosure
      const toolSection = toolsSource.substring(
        toolsSource.indexOf(`name: '${toolName}'`),
        toolsSource.indexOf('}', toolsSource.indexOf(`name: '${toolName}'`) + 500)
      );
      
      if (toolSection.includes("enum: ['") || toolSection.includes('action')) {
        console.log(`   ✅ ${toolName} has progressive disclosure (action parameter)`);
      }
    } else {
      console.log(`❌ Missing ${toolName} tool definition`);
    }
  });
  
  // Test 2: Check for handlers
  let handlerCount = 0;
  consolidatedTools.forEach(toolName => {
    if (toolsSource.includes(`case '${toolName}':`)) {
      console.log(`✅ Found ${toolName} handler`);
      handlerCount++;
    } else {
      console.log(`❌ Missing ${toolName} handler`);
    }
  });
  
  // Test 3: Check for implementation functions
  const expectedFunctions = ['manageProject', 'editProjectIntelligent', 'controlStudio'];
  let functionCount = 0;
  
  expectedFunctions.forEach(funcName => {
    if (toolsSource.includes(`async function ${funcName}`)) {
      console.log(`✅ Found ${funcName} implementation`);
      functionCount++;
    } else {
      console.log(`❌ Missing ${funcName} implementation`);
    }
  });
  
  // Test 4: Verify existing tools preserved
  const existingTools = ['create_project', 'launch_studio', 'list_projects', 'delete_project'];
  let existingCount = 0;
  
  existingTools.forEach(toolName => {
    if (toolsSource.includes(`case '${toolName}':`)) {
      existingCount++;
    }
  });
  
  console.log(`✅ Found ${existingCount}/4 existing tool handlers (backward compatibility)`);
  
  // Test 5: Check for intelligent routing logic
  if (toolsSource.includes('isComplexEditInstruction')) {
    console.log('✅ Found intelligent routing logic for edit_project');
  }
  
  // Summary
  console.log('\n📊 CONSOLIDATION TEST RESULTS:');
  console.log(`Tool Definitions: ${foundCount}/3`);
  console.log(`Tool Handlers: ${handlerCount}/3`);
  console.log(`Implementation Functions: ${functionCount}/3`);
  console.log(`Backward Compatibility: ${existingCount}/4`);
  
  if (foundCount === 3 && handlerCount === 3 && functionCount === 3) {
    console.log('\n🎉 Phase 1 Consolidation Implementation COMPLETE');
    console.log('Ready for Windows build and Phase 2 development');
  } else {
    console.log('\n❌ Phase 1 Consolidation needs completion');
  }
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
}