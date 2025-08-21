#!/usr/bin/env node

/**
 * Test harness for Rough Cut MCP Server
 * Tests the Smart Animation Generator with various animation types
 */

import { SmartAnimationGenerator } from './build/generators/smart-animation-generator.js';
import { McpStateManager } from './build/state/mcp-state-manager.js';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const generator = new SmartAnimationGenerator();
const stateManager = new McpStateManager();

// Test configuration
const testOutputDir = './test-output';
const testCases = [
  {
    id: 'bouncing-ball',
    animationDesc: 'bouncing ball physics animation',
    expectedPattern: 'bouncing ball'
  },
  {
    id: 'dashboard',
    animationDesc: 'dashboard showing server metrics and analytics',
    expectedPattern: 'dashboard'
  },
  {
    id: 'server-monitoring', 
    animationDesc: 'server status monitoring with health indicators',
    expectedPattern: 'server monitoring'
  },
  {
    id: 'text-animation',
    animationDesc: 'animated text with typewriter effect',
    expectedPattern: 'text animation'
  },
  {
    id: 'logo-reveal',
    animationDesc: 'logo reveal animation with rotation',
    expectedPattern: 'logo reveal'
  },
  {
    id: 'progress-bar',
    animationDesc: 'loading progress bar animation',
    expectedPattern: 'progress animation'
  },
  {
    id: 'generic-fallback',
    animationDesc: 'abstract floating shapes animation',
    expectedPattern: 'generic (no keywords)'
  }
];

function createTestDirs() {
  if (!existsSync(testOutputDir)) {
    mkdirSync(testOutputDir, { recursive: true });
  }
}

function testAnimationGeneration(testCase) {
  console.log(`\n🧪 Testing: ${testCase.id}`);
  console.log(`Description: ${testCase.animationDesc}`);
  
  try {
    const animationRequest = {
      animationDesc: testCase.animationDesc,
      dimensions: { width: 1920, height: 1080 },
      duration: 150, // 5 seconds at 30fps
      fps: 30
    };

    const generatedCode = generator.generateDynamicComposition(animationRequest);
    
    // Save generated code to file for inspection
    const outputFile = join(testOutputDir, `${testCase.id}.tsx`);
    writeFileSync(outputFile, generatedCode);
    
    // Analyze the generated code
    const analysis = analyzeGeneratedCode(generatedCode, testCase);
    
    console.log(`✅ Generated: ${outputFile}`);
    console.log(`📊 Analysis:`);
    console.log(`   - Pattern detected: ${analysis.patternDetected ? '✅' : '❌'}`);
    console.log(`   - Has animations: ${analysis.hasAnimations ? '✅' : '❌'}`);
    console.log(`   - Valid React: ${analysis.validReact ? '✅' : '❌'}`);
    console.log(`   - Uses Remotion: ${analysis.usesRemotion ? '✅' : '❌'}`);
    console.log(`   - No placeholders: ${analysis.noPlaceholders ? '✅' : '❌'}`);
    
    return analysis;
    
  } catch (error) {
    console.log(`❌ Error generating animation: ${error.message}`);
    return {
      error: error.message,
      patternDetected: false,
      hasAnimations: false,
      validReact: false,
      usesRemotion: false,
      noPlaceholders: false
    };
  }
}

function analyzeGeneratedCode(code, testCase) {
  const analysis = {
    patternDetected: false,
    hasAnimations: false,
    validReact: true, // Assume true unless we find issues
    usesRemotion: false,
    noPlaceholders: false
  };
  
  // Check if it's not a placeholder
  analysis.noPlaceholders = !code.includes('Generating Animation') && 
                           !code.includes('CLAUDE_ANIMATION_REQUEST');
  
  // Check for Remotion imports
  analysis.usesRemotion = code.includes('from \'remotion\'') || 
                          code.includes('useCurrentFrame') ||
                          code.includes('AbsoluteFill');
  
  // Check for animations (interpolate, frame usage, transforms)
  analysis.hasAnimations = code.includes('interpolate') ||
                          code.includes('useCurrentFrame') ||
                          code.includes('transform:') ||
                          code.includes('Math.sin') ||
                          code.includes('frame');
  
  // Check for React structure
  analysis.validReact = code.includes('export const VideoComposition') &&
                       code.includes('React.FC') &&
                       code.includes('return (');
  
  // Analyze pattern detection based on test case
  switch (testCase.id) {
    case 'bouncing-ball':
      analysis.patternDetected = code.includes('bouncing') || 
                                code.includes('ball') ||
                                code.includes('physics') ||
                                code.includes('ground');
      break;
    case 'dashboard':
      analysis.patternDetected = code.includes('dashboard') ||
                                code.includes('metrics') ||
                                code.includes('CPU') ||
                                code.includes('grid');
      break;
    case 'server-monitoring':
      analysis.patternDetected = code.includes('server') ||
                                code.includes('status') ||
                                code.includes('monitoring') ||
                                code.includes('terminal');
      break;
    case 'text-animation':
      analysis.patternDetected = code.includes('typewriter') ||
                                code.includes('charactersShown') ||
                                code.includes('substring');
      break;
    case 'logo-reveal':
      analysis.patternDetected = code.includes('logo') ||
                                code.includes('reveal') ||
                                code.includes('rotation') ||
                                code.includes('scale');
      break;
    case 'progress-bar':
      analysis.patternDetected = code.includes('progress') ||
                                code.includes('loading') ||
                                code.includes('circle') ||
                                code.includes('strokeDasharray');
      break;
    case 'generic-fallback':
      analysis.patternDetected = code.includes('float') ||
                                code.includes('generic') ||
                                code.includes('floating');
      break;
    default:
      analysis.patternDetected = false;
  }
  
  return analysis;
}

function testStateManager() {
  console.log('\n🗄️ Testing State Manager');
  
  try {
    // Test saving state
    const testState = {
      lastCreatedProjectPath: '/test/project/path',
      lastCreatedVideoPath: '/test/video/path.mp4',
      lastUsedPort: 7400
    };
    
    stateManager.saveState(testState);
    
    // Test loading state
    const loadedState = stateManager.loadState();
    
    const stateTest = {
      saveWorks: loadedState.lastCreatedProjectPath === testState.lastCreatedProjectPath,
      loadWorks: loadedState.sessionId !== undefined,
      persistsData: loadedState.timestamp !== undefined
    };
    
    console.log(`✅ State save: ${stateTest.saveWorks ? '✅' : '❌'}`);
    console.log(`✅ State load: ${stateTest.loadWorks ? '✅' : '❌'}`);
    console.log(`✅ Data persists: ${stateTest.persistsData ? '✅' : '❌'}`);
    
    return stateTest;
    
  } catch (error) {
    console.log(`❌ State manager error: ${error.message}`);
    return { error: error.message };
  }
}

function generateTestReport(results) {
  console.log('\n📋 TEST REPORT');
  console.log('=' .repeat(50));
  
  let totalTests = results.animations.length;
  let passedTests = 0;
  
  console.log('\n🎬 Animation Generation Tests:');
  results.animations.forEach((result, index) => {
    const testCase = testCases[index];
    const score = [
      result.patternDetected,
      result.hasAnimations,
      result.validReact,
      result.usesRemotion,
      result.noPlaceholders
    ].filter(Boolean).length;
    
    const passed = score >= 4; // Need at least 4/5 to pass
    if (passed) passedTests++;
    
    console.log(`  ${passed ? '✅' : '❌'} ${testCase.id}: ${score}/5 checks passed`);
  });
  
  console.log('\n🗄️ State Management Tests:');
  const stateScore = [
    results.state.saveWorks,
    results.state.loadWorks,
    results.state.persistsData
  ].filter(Boolean).length;
  
  const statePassed = stateScore === 3;
  if (statePassed) passedTests++;
  totalTests++;
  
  console.log(`  ${statePassed ? '✅' : '❌'} State Manager: ${stateScore}/3 checks passed`);
  
  console.log('\n📊 SUMMARY:');
  console.log(`  Total Tests: ${totalTests}`);
  console.log(`  Passed: ${passedTests}`);
  console.log(`  Failed: ${totalTests - passedTests}`);
  console.log(`  Success Rate: ${Math.round((passedTests/totalTests) * 100)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED! The MCP server is ready for production.');
  } else {
    console.log('\n⚠️  Some tests failed. Review the issues above.');
  }
}

async function runAllTests() {
  console.log('🚀 Starting Rough Cut MCP Animation Tests');
  console.log('=' .repeat(50));
  
  // Setup
  createTestDirs();
  
  // Test animation generation
  const animationResults = testCases.map(testAnimationGeneration);
  
  // Test state management
  const stateResults = testStateManager();
  
  // Generate report
  generateTestReport({
    animations: animationResults,
    state: stateResults
  });
  
  console.log(`\n📁 Generated code samples saved to: ${testOutputDir}/`);
}

// Run tests
runAllTests().catch(console.error);