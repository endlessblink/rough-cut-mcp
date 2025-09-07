// Test enhanced dependency debugging to find root cause
const fs = require('fs-extra');
const path = require('path');

async function testDependencyDebugging() {
  console.log('🔍 Testing Enhanced Dependency Debugging');
  console.log('========================================');
  console.log('Goal: Find out WHY dependency management claims success but fails\n');

  try {
    // Create test project manually to isolate dependency management
    const testProjectPath = path.join(__dirname, 'test-dependency-debug');
    await fs.ensureDir(path.join(testProjectPath, 'src'));
    
    // Create initial package.json (same as MCP does)
    const initialPackageJson = {
      name: 'test-dependency-debug',
      version: '1.0.0',
      scripts: {
        start: 'remotion studio --port=8099'
      },
      dependencies: {
        '@remotion/bundler': '^4.0.341',
        '@remotion/cli': '^4.0.341',
        'react': '^18.2.0',
        'react-dom': '^18.2.0',
        'remotion': '^4.0.340'
      }
    };
    
    const packageJsonPath = path.join(testProjectPath, 'package.json');
    await fs.writeJson(packageJsonPath, initialPackageJson, { spaces: 2 });
    
    console.log('✅ Test project created');
    console.log('📄 Initial package.json written');
    
    // Read initial state to verify
    const beforeDeps = await fs.readJson(packageJsonPath);
    console.log('📊 Initial dependencies:', Object.keys(beforeDeps.dependencies));
    
    // Test JSX with lucide-react import
    const testJsx = `import React from 'react';
import { GitBranch, Star, Monitor } from 'lucide-react';

const TestComponent = () => (
  <div>
    <GitBranch className="w-8 h-8" />
    <Star size={24} />
    <Monitor />
  </div>
);`;

    console.log('\\n🧪 Testing addMissingDependencies function...');
    
    // Import our dependency management function  
    const tools = require('./build/tools.js');
    
    // This will run with comprehensive debugging
    await tools.addMissingDependencies(testProjectPath, testJsx, 'test-dependency-debug');
    
    console.log('\\n📋 Dependency addition completed - checking results...');
    
    // Read final state
    const afterDeps = await fs.readJson(packageJsonPath);
    console.log('📊 Final dependencies:', Object.keys(afterDeps.dependencies));
    
    // Check if lucide-react was actually added
    const hasLucideReact = afterDeps.dependencies['lucide-react'];
    console.log(`🎯 lucide-react added: ${hasLucideReact ? '✅ YES' : '❌ NO'}`);
    
    if (hasLucideReact) {
      console.log(`✅ DEPENDENCY MANAGEMENT WORKING: lucide-react version ${afterDeps.dependencies['lucide-react']}`);
      console.log('✅ Professional icons should render properly');
    } else {
      console.log('❌ DEPENDENCY MANAGEMENT BROKEN: lucide-react not found in final package.json');
      console.log('❌ This confirms the fs.writeJson silent failure issue');
      console.log('❌ Need to investigate WSL2 filesystem or timing problems');
    }
    
    // Cleanup
    await fs.remove(testProjectPath);
    
  } catch (error) {
    console.error('❌ Dependency debugging test failed:', error.message);
    console.error('This indicates the dependency management system has fundamental issues');
  }
}

testDependencyDebugging().catch(console.error);