#!/usr/bin/env node

/**
 * End-to-End Test for Rough Cut MCP Server
 * Tests the complete workflow: animation generation -> project creation -> state management
 */

import { RoughCutMCPServer } from './build/index-clean.js';
import { writeFileSync, readFileSync, existsSync, rmSync, mkdirSync } from 'fs';
import { join } from 'path';

class MCPEndToEndTest {
  constructor() {
    this.testDir = './test-e2e-output';
    this.server = null;
    this.results = {
      serverStart: false,
      videoCreation: false,
      projectCreation: false,
      stateTracking: false,
      errors: []
    };
  }

  async setup() {
    console.log('🧪 Setting up end-to-end test environment...');
    
    // Clean up previous test runs
    if (existsSync(this.testDir)) {
      rmSync(this.testDir, { recursive: true, force: true });
    }
    mkdirSync(this.testDir, { recursive: true });
    
    // Set test environment variables
    process.env.REMOTION_ASSETS_DIR = this.testDir;
    
    console.log(`✅ Test environment set up at: ${this.testDir}`);
  }

  async testServerInitialization() {
    console.log('\n🚀 Testing MCP Server initialization...');
    
    try {
      this.server = new RoughCutMCPServer();
      
      // Check if server initialized properly
      if (this.server && this.server.animationGenerator && this.server.stateManager) {
        this.results.serverStart = true;
        console.log('✅ MCP Server initialized successfully');
        return true;
      } else {
        throw new Error('Server components not properly initialized');
      }
    } catch (error) {
      this.results.errors.push(`Server initialization: ${error.message}`);
      console.log(`❌ Server initialization failed: ${error.message}`);
      return false;
    }
  }

  async testVideoCreation() {
    console.log('\n🎬 Testing video creation workflow...');
    
    try {
      // Simulate the create-complete-video tool call
      const testRequest = {
        animationDesc: 'bouncing ball physics animation with colorful background',
        projectName: 'test-bouncing-ball',
        dimensions: { width: 1280, height: 720 },
        duration: 90, // 3 seconds
        fps: 30
      };
      
      // Call the video creation method directly
      const result = await this.server.createCompleteVideo(testRequest);
      
      // Verify the result
      if (result && result.content && result.content[0].text.includes('Video created successfully')) {
        this.results.videoCreation = true;
        console.log('✅ Video creation workflow completed');
        
        // Check if project files were created
        const projectPath = join(this.testDir, 'projects', testRequest.projectName);
        const videoPath = join(this.testDir, 'videos', `${testRequest.projectName}.mp4`);
        
        if (existsSync(projectPath)) {
          this.results.projectCreation = true;
          console.log('✅ Project files created successfully');
          
          // Check project structure
          const expectedFiles = [
            join(projectPath, 'package.json'),
            join(projectPath, 'src', 'VideoComposition.tsx'),
            join(projectPath, 'src', 'index.tsx'),
            join(projectPath, 'src', 'Root.tsx')
          ];
          
          const missingFiles = expectedFiles.filter(file => !existsSync(file));
          if (missingFiles.length === 0) {
            console.log('✅ All project files present');
          } else {
            console.log(`⚠️  Missing files: ${missingFiles.join(', ')}`);
          }
          
          // Verify the composition code quality
          const compositionFile = join(projectPath, 'src', 'VideoComposition.tsx');
          if (existsSync(compositionFile)) {
            const compositionCode = readFileSync(compositionFile, 'utf8');
            if (this.analyzeCompositionQuality(compositionCode)) {
              console.log('✅ Generated composition is high quality');
            } else {
              console.log('⚠️  Composition quality issues detected');
            }
          }
        } else {
          console.log('❌ Project files not created');
        }
        
        return true;
      } else {
        throw new Error('Video creation did not return expected result');
      }
    } catch (error) {
      this.results.errors.push(`Video creation: ${error.message}`);
      console.log(`❌ Video creation failed: ${error.message}`);
      return false;
    }
  }

  analyzeCompositionQuality(code) {
    const quality = {
      hasImports: code.includes('import React') && code.includes('from \'remotion\''),
      hasExport: code.includes('export const VideoComposition'),
      hasAnimations: code.includes('interpolate') || code.includes('useCurrentFrame'),
      noPlaceholders: !code.includes('Generating Animation') && !code.includes('CLAUDE_ANIMATION_REQUEST'),
      hasRealContent: code.includes('ball') || code.includes('bounce') || code.includes('physics')
    };
    
    const score = Object.values(quality).filter(Boolean).length;
    return score >= 4; // Need at least 4/5 for good quality
  }

  async testStateTracking() {
    console.log('\n🗄️ Testing state management...');
    
    try {
      // Get current state
      const state = this.server.stateManager.loadState();
      
      if (state && state.lastCreatedProjectPath && state.sessionId) {
        this.results.stateTracking = true;
        console.log('✅ State tracking working correctly');
        console.log(`   - Project path: ${state.lastCreatedProjectPath}`);
        console.log(`   - Session ID: ${state.sessionId.substring(0, 20)}...`);
        return true;
      } else {
        throw new Error('State not properly tracked');
      }
    } catch (error) {
      this.results.errors.push(`State tracking: ${error.message}`);
      console.log(`❌ State tracking failed: ${error.message}`);
      return false;
    }
  }

  async testStudioLaunch() {
    console.log('\n🎨 Testing Studio launch simulation...');
    
    try {
      // Simulate studio launch (without actually launching)
      const state = this.server.stateManager.loadState();
      const projectPath = state.lastCreatedProjectPath;
      
      if (!projectPath || !existsSync(projectPath)) {
        throw new Error('No valid project path for studio launch');
      }
      
      // Check if project has proper structure for studio
      const packageJsonPath = join(projectPath, 'package.json');
      if (existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
        if (packageJson.dependencies && packageJson.dependencies.remotion) {
          console.log('✅ Project ready for Studio launch');
          return true;
        } else {
          throw new Error('Project missing Remotion dependencies');
        }
      } else {
        throw new Error('Project missing package.json');
      }
    } catch (error) {
      this.results.errors.push(`Studio preparation: ${error.message}`);
      console.log(`❌ Studio preparation failed: ${error.message}`);
      return false;
    }
  }

  generateReport() {
    console.log('\n📋 END-TO-END TEST REPORT');
    console.log('=' .repeat(60));
    
    const tests = [
      { name: 'Server Initialization', result: this.results.serverStart },
      { name: 'Video Creation', result: this.results.videoCreation },
      { name: 'Project Creation', result: this.results.projectCreation },
      { name: 'State Tracking', result: this.results.stateTracking }
    ];
    
    let passed = 0;
    let total = tests.length;
    
    tests.forEach(test => {
      console.log(`  ${test.result ? '✅' : '❌'} ${test.name}`);
      if (test.result) passed++;
    });
    
    if (this.results.errors.length > 0) {
      console.log('\n❌ ERRORS ENCOUNTERED:');
      this.results.errors.forEach(error => {
        console.log(`     - ${error}`);
      });
    }
    
    console.log('\n📊 SUMMARY:');
    console.log(`  Tests Passed: ${passed}/${total}`);
    console.log(`  Success Rate: ${Math.round((passed/total) * 100)}%`);
    console.log(`  Errors: ${this.results.errors.length}`);
    
    if (passed === total && this.results.errors.length === 0) {
      console.log('\n🎉 ALL END-TO-END TESTS PASSED!');
      console.log('   The MCP server is ready for production use.');
      console.log('   Users can now create videos and launch Studio seamlessly.');
    } else {
      console.log('\n⚠️  Some tests failed or had errors.');
      console.log('   Review the issues above before deploying.');
    }
    
    return passed === total && this.results.errors.length === 0;
  }

  async cleanup() {
    console.log('\n🧹 Cleaning up test environment...');
    try {
      if (existsSync(this.testDir)) {
        // Keep some files for inspection but clean up test state
        console.log(`📁 Test files preserved at: ${this.testDir}`);
      }
    } catch (error) {
      console.log(`⚠️  Cleanup warning: ${error.message}`);
    }
  }

  async run() {
    console.log('🚀 Starting End-to-End MCP Server Tests');
    console.log('=' .repeat(60));
    
    await this.setup();
    
    // Run tests in sequence
    const serverOk = await this.testServerInitialization();
    if (!serverOk) {
      console.log('❌ Cannot continue - server failed to initialize');
      return false;
    }
    
    const videoOk = await this.testVideoCreation();
    if (videoOk) {
      await this.testStateTracking();
      await this.testStudioLaunch();
    }
    
    const success = this.generateReport();
    await this.cleanup();
    
    return success;
  }
}

// Run the end-to-end test
const test = new MCPEndToEndTest();
test.run().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Test runner failed:', error);
  process.exit(1);
});