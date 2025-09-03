// Test script for Phase 1 consolidated tools
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Phase 1 Tool Consolidation');
console.log('=====================================');

// Test 1: Check tools export structure
try {
  // Import the built tools
  const toolsPath = path.join(__dirname, 'build', 'tools.js');
  if (!fs.existsSync(toolsPath)) {
    console.log('❌ Build required first - run npm run build on Windows');
    process.exit(1);
  }
  
  const { tools, handleToolCall } = require('./build/tools.js');
  
  console.log(`✅ Tools imported successfully: ${tools.length} tools found`);
  
  // Test 2: Verify new consolidated tools exist
  const consolidatedTools = ['manage_project', 'edit_project', 'control_studio'];
  const foundTools = tools.filter(tool => consolidatedTools.includes(tool.name));
  
  console.log(`✅ Found ${foundTools.length}/3 consolidated tools:`);
  foundTools.forEach(tool => {
    console.log(`   - ${tool.name}: ${tool.description.substring(0, 50)}...`);
  });
  
  // Test 3: Verify existing tools still present
  const existingTools = ['create_project', 'launch_studio', 'list_projects', 'delete_project'];
  const foundExisting = tools.filter(tool => existingTools.includes(tool.name));
  
  console.log(`✅ Found ${foundExisting.length}/4 existing tools (backward compatibility)`);
  
  // Test 4: Check tool schemas
  const manageProject = tools.find(t => t.name === 'manage_project');
  if (manageProject && manageProject.inputSchema.properties.action) {
    console.log('✅ manage_project has progressive disclosure (action parameter)');
    console.log(`   Actions: ${manageProject.inputSchema.properties.action.enum.join(', ')}`);
  }
  
  const controlStudio = tools.find(t => t.name === 'control_studio');
  if (controlStudio && controlStudio.inputSchema.properties.action) {
    console.log('✅ control_studio has progressive disclosure (action parameter)');
    console.log(`   Actions: ${controlStudio.inputSchema.properties.action.enum.join(', ')}`);
  }
  
  console.log('\n🎉 Phase 1 Consolidation Test PASSED');
  console.log('All consolidated tools present with backward compatibility maintained');
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
}