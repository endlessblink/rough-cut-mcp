// Test real dependency management via MCP tools to debug the actual failure
const fs = require('fs-extra');
const path = require('path');

async function testRealDependencyManagement() {
  console.log('🔧 Testing Real Dependency Management via MCP Tools');
  console.log('==================================================');
  console.log('This will call the actual convert_artifact_to_video with lucide-react\n');

  try {
    // Load the actual MCP tools
    const { handleToolCall } = require('./build/tools.js');
    
    // Create test artifact with lucide-react (simplified GitHub showcase)
    const testArtifact = `import React, { useState } from 'react';
import { GitBranch, Star, Monitor, Brain } from 'lucide-react';

const TestShowcase = () => {
  const [currentScene, setCurrentScene] = useState(0);
  
  const scenes = [
    { id: 'intro', title: 'EndlessBlink', subtitle: 'MCP Tools' },
    { id: 'projects', title: 'Projects', subtitle: 'Our Work' }
  ];

  return (
    <div className="w-full h-screen bg-gradient-to-br from-purple-900 to-indigo-900">
      <div className="text-center">
        <GitBranch className="w-8 h-8 text-blue-400" />
        <h1 className="text-4xl font-bold text-white">{scenes[currentScene].title}</h1>
        <Star size={24} className="text-yellow-400" />
        <Monitor className="mx-auto" size={48} />
        <Brain className="text-purple-400" />
      </div>
    </div>
  );
};

export default TestShowcase;`;

    console.log('📄 Test artifact with lucide-react icons created');
    console.log('   Icons: GitBranch, Star, Monitor, Brain');
    console.log('   Should trigger dependency debugging during conversion\n');
    
    // Call the real MCP convert tool (this will trigger dependency management)
    console.log('🎯 Calling convert_artifact_to_video tool...');
    
    const result = await handleToolCall('convert_artifact_to_video', {
      name: 'test-dependency-debug-project',
      artifactJsx: testArtifact
    });
    
    console.log('✅ Conversion completed');
    console.log('📊 Tool result:', result.isError ? 'ERROR' : 'SUCCESS');
    
    if (result.isError) {
      console.log('❌ Conversion failed:', result.content[0].text);
      return;
    }
    
    // Check the created project's package.json
    console.log('\n📋 Checking created project package.json...');
    
    const projectPath = path.join(__dirname, 'assets/projects/test-dependency-debug-project');
    const packageJsonPath = path.join(projectPath, 'package.json');
    
    if (await fs.pathExists(packageJsonPath)) {
      const finalPackageJson = await fs.readJson(packageJsonPath);
      console.log('📊 Final dependencies:', Object.keys(finalPackageJson.dependencies));
      
      const hasLucideReact = finalPackageJson.dependencies['lucide-react'];
      console.log(`🎯 lucide-react in final package.json: ${hasLucideReact ? '✅ YES' : '❌ NO'}`);
      
      if (hasLucideReact) {
        console.log(`✅ SUCCESS: Dependency management working properly!`);
        console.log(`✅ Professional icons should render without errors`);
        console.log(`✅ Version: ${finalPackageJson.dependencies['lucide-react']}`);
      } else {
        console.log(`❌ CONFIRMED BUG: Dependency management logs success but doesn't add to package.json`);
        console.log(`❌ This confirms WSL2 filesystem issue or race condition`);
        console.log(`❌ Professional icons will fail with "Cannot find module" errors`);
      }
      
    } else {
      console.log('❌ Project package.json not found - project creation failed');
    }
    
    // Check logs for debugging output
    const debugLogPath = path.join(__dirname, 'logs/npm-install.log');
    if (await fs.pathExists(debugLogPath)) {
      const logs = await fs.readFile(debugLogPath, 'utf-8');
      const debugEntries = logs.split('\n').filter(line => 
        line.includes('DEBUG-DEPS') || line.includes('DEPENDENCY-') || line.includes('test-dependency-debug-project')
      );
      
      if (debugEntries.length > 0) {
        console.log('\n🔍 Dependency Debug Logs:');
        console.log('-------------------------');
        debugEntries.slice(-10).forEach(entry => {
          if (entry.trim()) console.log('   ' + entry.trim());
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Real dependency test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testRealDependencyManagement().catch(console.error);