#!/usr/bin/env node

/**
 * Complete Integration Test Suite for RoughCut MCP Server
 * Tests all tool categories and comprehensive functionality
 */

import { RoughCutMCPServer } from '../build/index.js';
import { existsSync, writeFileSync, readFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';

class IntegrationTestSuite {
  constructor() {
    this.testDir = './test-integration-output';
    this.server = null;
    this.results = {
      initialization: { passed: false, details: {} },
      toolDiscovery: { passed: false, details: {} },
      projectManagement: { passed: false, details: {} },
      videoCreation: { passed: false, details: {} },
      studioManagement: { passed: false, details: {} },
      assetManagement: { passed: false, details: {} },
      performance: { passed: false, details: {} },
      errors: [],
      totalTests: 0,
      passedTests: 0
    };
    this.startTime = Date.now();
  }

  async setup() {
    console.log('🧪 Setting up integration test environment...');
    
    // Clean up previous test runs
    if (existsSync(this.testDir)) {
      rmSync(this.testDir, { recursive: true, force: true });
    }
    mkdirSync(this.testDir, { recursive: true });
    
    // Set test environment
    process.env.REMOTION_ASSETS_DIR = this.testDir;
    process.env.NODE_ENV = 'test';
    
    console.log(`✅ Test environment ready: ${this.testDir}`);
  }

  async testInitialization() {
    console.log('\n🚀 Testing Server Initialization...');
    
    try {
      this.server = new RoughCutMCPServer();
      
      // Verify core components
      const checks = {
        serverExists: !!this.server,
        hasToolRegistry: !!this.server.toolRegistry,
        hasLogger: !!this.server.logger,
        hasStateManager: !!this.server.stateManager,
        canListTools: typeof this.server.listTools === 'function'
      };
      
      this.results.initialization.details = checks;
      this.results.initialization.passed = Object.values(checks).every(Boolean);
      
      if (this.results.initialization.passed) {
        console.log('✅ Server initialization successful');
        this.results.passedTests++;
      } else {
        console.log('❌ Server initialization failed');
        console.log('Failed checks:', Object.entries(checks).filter(([, v]) => !v).map(([k]) => k));
      }
      
      this.results.totalTests++;
      return this.results.initialization.passed;
      
    } catch (error) {
      this.results.errors.push(`Initialization: ${error.message}`);
      console.log(`❌ Initialization error: ${error.message}`);
      return false;
    }
  }

  async testToolDiscovery() {
    console.log('\n🔍 Testing Tool Discovery System...');
    
    try {
      // Test layered architecture
      const discoveryTests = {
        canDiscoverCapabilities: await this.testDiscoverCapabilities(),
        canActivateToolsets: await this.testActivateToolsets(),
        canSearchTools: await this.testSearchTools(),
        canGetActiveTools: await this.testGetActiveTools()
      };
      
      this.results.toolDiscovery.details = discoveryTests;
      this.results.toolDiscovery.passed = Object.values(discoveryTests).every(Boolean);
      
      if (this.results.toolDiscovery.passed) {
        console.log('✅ Tool discovery system working');
        this.results.passedTests++;
      } else {
        console.log('❌ Tool discovery system failed');
      }
      
      this.results.totalTests++;
      return this.results.toolDiscovery.passed;
      
    } catch (error) {
      this.results.errors.push(`Tool Discovery: ${error.message}`);
      console.log(`❌ Tool discovery error: ${error.message}`);
      return false;
    }
  }

  async testDiscoverCapabilities() {
    try {
      const result = await this.server.callTool('discover-capabilities', {});
      return result && result.content && result.content[0].text.includes('Available Tool Categories');
    } catch (error) {
      return false;
    }
  }

  async testActivateToolsets() {
    try {
      const result = await this.server.callTool('activate-toolset', {
        categories: ['video-creation'],
        exclusive: false
      });
      return result && result.content && result.content[0].text.includes('activated successfully');
    } catch (error) {
      return false;
    }
  }

  async testSearchTools() {
    try {
      const result = await this.server.callTool('search-tools', { query: 'video' });
      return result && result.content && result.content[0].text.includes('Found tools');
    } catch (error) {
      return false;
    }
  }

  async testGetActiveTools() {
    try {
      const result = await this.server.callTool('get-active-tools', {});
      return result && result.content && result.content[0].text.includes('Currently Active Tools');
    } catch (error) {
      return false;
    }
  }

  async testProjectManagement() {
    console.log('\n📁 Testing Project Management...');
    
    try {
      const tests = {
        canListProjects: await this.testListProjects(),
        canGetProjectStatus: await this.testGetProjectStatus(),
        canInstallDependencies: await this.testInstallDependencies(),
        canRepairProjects: await this.testRepairProjects()
      };
      
      this.results.projectManagement.details = tests;
      this.results.projectManagement.passed = Object.values(tests).every(Boolean);
      
      if (this.results.projectManagement.passed) {
        console.log('✅ Project management working');
        this.results.passedTests++;
      } else {
        console.log('❌ Project management failed');
      }
      
      this.results.totalTests++;
      return this.results.projectManagement.passed;
      
    } catch (error) {
      this.results.errors.push(`Project Management: ${error.message}`);
      console.log(`❌ Project management error: ${error.message}`);
      return false;
    }
  }

  async testListProjects() {
    try {
      const result = await this.server.callTool('list-video-projects', {});
      return result && result.content;
    } catch (error) {
      return false;
    }
  }

  async testGetProjectStatus() {
    try {
      // First create a test project, then get its status
      await this.createTestProject();
      const result = await this.server.callTool('get-project-status', { projectName: 'test-integration' });
      return result && result.content;
    } catch (error) {
      return false;
    }
  }

  async testInstallDependencies() {
    try {
      await this.createTestProject();
      const result = await this.server.callTool('install-project-dependencies', { 
        projectName: 'test-integration',
        skipInstall: true // Test mode
      });
      return result && result.content;
    } catch (error) {
      return false;
    }
  }

  async testRepairProjects() {
    try {
      const result = await this.server.callTool('repair-project', { 
        projectName: 'test-integration',
        dryRun: true 
      });
      return result && result.content;
    } catch (error) {
      return false;
    }
  }

  async testVideoCreation() {
    console.log('\n🎬 Testing Video Creation...');
    
    try {
      // Activate video creation tools first
      await this.server.callTool('activate-toolset', { categories: ['video-creation'] });
      
      const tests = {
        canCreateCompleteVideo: await this.testCreateCompleteVideo(),
        canCreateTextVideo: await this.testCreateTextVideo(),
        canAnalyzeVideoStructure: await this.testAnalyzeVideoStructure()
      };
      
      this.results.videoCreation.details = tests;
      this.results.videoCreation.passed = Object.values(tests).every(Boolean);
      
      if (this.results.videoCreation.passed) {
        console.log('✅ Video creation working');
        this.results.passedTests++;
      } else {
        console.log('❌ Video creation failed');
      }
      
      this.results.totalTests++;
      return this.results.videoCreation.passed;
      
    } catch (error) {
      this.results.errors.push(`Video Creation: ${error.message}`);
      console.log(`❌ Video creation error: ${error.message}`);
      return false;
    }
  }

  async testCreateCompleteVideo() {
    try {
      const result = await this.server.callTool('create-complete-video', {
        animationDesc: 'Test animation with bouncing ball',
        projectName: 'test-complete-video',
        dimensions: { width: 1280, height: 720 },
        duration: 60,
        fps: 30
      });
      return result && result.content && result.content[0].text.includes('Video created successfully');
    } catch (error) {
      return false;
    }
  }

  async testCreateTextVideo() {
    try {
      const result = await this.server.callTool('create-text-video', {
        text: 'Integration Test Video',
        projectName: 'test-text-video',
        duration: 30
      });
      return result && result.content;
    } catch (error) {
      return false;
    }
  }

  async testAnalyzeVideoStructure() {
    try {
      await this.createTestProject();
      const result = await this.server.callTool('analyze-video-structure', { 
        projectName: 'test-integration' 
      });
      return result && result.content;
    } catch (error) {
      return false;
    }
  }

  async testStudioManagement() {
    console.log('\n🎨 Testing Studio Management...');
    
    try {
      // Activate studio management tools
      await this.server.callTool('activate-toolset', { categories: ['studio-management'] });
      
      const tests = {
        canGetStudioStatus: await this.testGetStudioStatus(),
        canLaunchStudio: await this.testLaunchStudio(),
        canStopStudio: await this.testStopStudio()
      };
      
      this.results.studioManagement.details = tests;
      this.results.studioManagement.passed = Object.values(tests).every(Boolean);
      
      if (this.results.studioManagement.passed) {
        console.log('✅ Studio management working');
        this.results.passedTests++;
      } else {
        console.log('❌ Studio management failed');
      }
      
      this.results.totalTests++;
      return this.results.studioManagement.passed;
      
    } catch (error) {
      this.results.errors.push(`Studio Management: ${error.message}`);
      console.log(`❌ Studio management error: ${error.message}`);
      return false;
    }
  }

  async testGetStudioStatus() {
    try {
      const result = await this.server.callTool('get-studio-status', {});
      return result && result.content;
    } catch (error) {
      return false;
    }
  }

  async testLaunchStudio() {
    try {
      const result = await this.server.callTool('launch-remotion-studio', { dryRun: true });
      return result && result.content;
    } catch (error) {
      return false;
    }
  }

  async testStopStudio() {
    try {
      const result = await this.server.callTool('stop-remotion-studio', { dryRun: true });
      return result && result.content;
    } catch (error) {
      return false;
    }
  }

  async testAssetManagement() {
    console.log('\n🗂️ Testing Asset Management...');
    
    try {
      // Activate asset management tools
      await this.server.callTool('activate-toolset', { categories: ['asset-management'] });
      
      const tests = {
        canGetAssetStats: await this.testGetAssetStats(),
        canGetDiskUsage: await this.testGetDiskUsage(),
        canOrganizeAssets: await this.testOrganizeAssets(),
        canCleanupAssets: await this.testCleanupAssets()
      };
      
      this.results.assetManagement.details = tests;
      this.results.assetManagement.passed = Object.values(tests).every(Boolean);
      
      if (this.results.assetManagement.passed) {
        console.log('✅ Asset management working');
        this.results.passedTests++;
      } else {
        console.log('❌ Asset management failed');
      }
      
      this.results.totalTests++;
      return this.results.assetManagement.passed;
      
    } catch (error) {
      this.results.errors.push(`Asset Management: ${error.message}`);
      console.log(`❌ Asset management error: ${error.message}`);
      return false;
    }
  }

  async testGetAssetStats() {
    try {
      const result = await this.server.callTool('get-asset-statistics', {});
      return result && result.content;
    } catch (error) {
      return false;
    }
  }

  async testGetDiskUsage() {
    try {
      const result = await this.server.callTool('get-disk-usage', {});
      return result && result.content;
    } catch (error) {
      return false;
    }
  }

  async testOrganizeAssets() {
    try {
      const result = await this.server.callTool('organize-assets', { dryRun: true });
      return result && result.content;
    } catch (error) {
      return false;
    }
  }

  async testCleanupAssets() {
    try {
      const result = await this.server.callTool('cleanup-old-assets', { dryRun: true });
      return result && result.content;
    } catch (error) {
      return false;
    }
  }

  async testPerformance() {
    console.log('\n⚡ Testing Performance Metrics...');
    
    try {
      const startTime = Date.now();
      
      // Run a series of operations to measure performance
      const operations = [
        () => this.server.callTool('list-video-projects', {}),
        () => this.server.callTool('get-active-tools', {}),
        () => this.server.callTool('discover-capabilities', {}),
        () => this.server.callTool('get-asset-statistics', {}),
        () => this.server.callTool('get-studio-status', {})
      ];
      
      const results = [];
      for (const operation of operations) {
        const opStart = Date.now();
        try {
          await operation();
          results.push(Date.now() - opStart);
        } catch (error) {
          results.push(-1); // Mark as failed
        }
      }
      
      const totalTime = Date.now() - startTime;
      const avgTime = results.filter(r => r > 0).reduce((a, b) => a + b, 0) / results.filter(r => r > 0).length;
      
      this.results.performance.details = {
        totalOperations: operations.length,
        successfulOperations: results.filter(r => r > 0).length,
        totalTime,
        averageTime: avgTime,
        operationTimes: results
      };
      
      this.results.performance.passed = avgTime < 1000; // All operations should complete in under 1 second
      
      if (this.results.performance.passed) {
        console.log('✅ Performance acceptable');
        console.log(`   Average operation time: ${avgTime.toFixed(2)}ms`);
        this.results.passedTests++;
      } else {
        console.log('❌ Performance issues detected');
        console.log(`   Average operation time: ${avgTime.toFixed(2)}ms (threshold: 1000ms)`);
      }
      
      this.results.totalTests++;
      return this.results.performance.passed;
      
    } catch (error) {
      this.results.errors.push(`Performance: ${error.message}`);
      console.log(`❌ Performance test error: ${error.message}`);
      return false;
    }
  }

  async createTestProject() {
    const projectPath = join(this.testDir, 'projects', 'test-integration');
    mkdirSync(projectPath, { recursive: true });
    
    // Create minimal project structure
    writeFileSync(join(projectPath, 'package.json'), JSON.stringify({
      name: 'test-integration',
      version: '1.0.0',
      dependencies: { remotion: '^4.0.0' }
    }, null, 2));
    
    const srcDir = join(projectPath, 'src');
    mkdirSync(srcDir, { recursive: true });
    
    writeFileSync(join(srcDir, 'VideoComposition.tsx'), `
      import React from 'react';
      import { useCurrentFrame } from 'remotion';
      
      export const VideoComposition: React.FC = () => {
        const frame = useCurrentFrame();
        return <div>Test Frame: {frame}</div>;
      };
    `);
  }

  generateReport() {
    const endTime = Date.now();
    const totalTime = endTime - this.startTime;
    
    console.log('\n📊 INTEGRATION TEST REPORT');
    console.log('='.repeat(60));
    
    const categories = [
      { name: 'Server Initialization', result: this.results.initialization },
      { name: 'Tool Discovery', result: this.results.toolDiscovery },
      { name: 'Project Management', result: this.results.projectManagement },
      { name: 'Video Creation', result: this.results.videoCreation },
      { name: 'Studio Management', result: this.results.studioManagement },
      { name: 'Asset Management', result: this.results.assetManagement },
      { name: 'Performance', result: this.results.performance }
    ];
    
    categories.forEach(category => {
      console.log(`  ${category.result.passed ? '✅' : '❌'} ${category.name}`);
      
      if (category.result.details && typeof category.result.details === 'object') {
        const details = category.result.details;
        if (Object.keys(details).length > 0) {
          Object.entries(details).forEach(([key, value]) => {
            if (typeof value === 'boolean') {
              console.log(`    ${value ? '✅' : '❌'} ${key}`);
            } else if (typeof value === 'object' && value !== null) {
              console.log(`    📋 ${key}: ${JSON.stringify(value)}`);
            } else {
              console.log(`    📋 ${key}: ${value}`);
            }
          });
        }
      }
    });
    
    if (this.results.errors.length > 0) {
      console.log('\n❌ ERRORS ENCOUNTERED:');
      this.results.errors.forEach(error => {
        console.log(`     - ${error}`);
      });
    }
    
    console.log('\n📈 SUMMARY:');
    console.log(`  Tests Passed: ${this.results.passedTests}/${this.results.totalTests}`);
    console.log(`  Success Rate: ${Math.round((this.results.passedTests/this.results.totalTests) * 100)}%`);
    console.log(`  Total Runtime: ${totalTime}ms`);
    console.log(`  Errors: ${this.results.errors.length}`);
    
    const success = this.results.passedTests === this.results.totalTests && this.results.errors.length === 0;
    
    if (success) {
      console.log('\n🎉 ALL INTEGRATION TESTS PASSED!');
      console.log('   The MCP server is fully functional across all categories.');
    } else {
      console.log('\n⚠️  Some integration tests failed.');
      console.log('   Review the issues above for detailed troubleshooting.');
    }
    
    // Save detailed results to file
    const reportPath = join(this.testDir, 'integration-test-report.json');
    writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: {
        passed: this.results.passedTests,
        total: this.results.totalTests,
        successRate: Math.round((this.results.passedTests/this.results.totalTests) * 100),
        runtime: totalTime,
        errors: this.results.errors.length
      },
      results: this.results
    }, null, 2));
    
    console.log(`\n📄 Detailed report saved: ${reportPath}`);
    
    return success;
  }

  async cleanup() {
    console.log('\n🧹 Cleaning up test environment...');
    try {
      console.log(`📁 Test files preserved at: ${this.testDir}`);
    } catch (error) {
      console.log(`⚠️  Cleanup warning: ${error.message}`);
    }
  }

  async run() {
    console.log('🔬 Starting Complete Integration Test Suite');
    console.log('='.repeat(60));
    
    await this.setup();
    
    // Run all test categories
    const initOk = await this.testInitialization();
    if (!initOk) {
      console.log('❌ Cannot continue - server failed to initialize');
      return false;
    }
    
    await this.testToolDiscovery();
    await this.testProjectManagement();
    await this.testVideoCreation();
    await this.testStudioManagement();
    await this.testAssetManagement();
    await this.testPerformance();
    
    const success = this.generateReport();
    await this.cleanup();
    
    return success;
  }
}

// Run the integration test suite
const test = new IntegrationTestSuite();
test.run().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Integration test runner failed:', error);
  process.exit(1);
});