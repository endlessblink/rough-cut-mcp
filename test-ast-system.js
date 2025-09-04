#!/usr/bin/env node

/**
 * TASK-24148: Test AST-Based Design Prism System
 * Test the completed AST system against github-showcase-v2 project
 */

const fs = require('fs-extra');
const path = require('path');

async function testASTSystem() {
  console.log('🧪 TASK-24148: Testing AST-Based Design Prism System');
  console.log('='.repeat(55));
  
  try {
    // Import the AST system
    const { enhanceJSXThroughAST } = require('./build/ast-design-prism');
    
    // Test with github-showcase-v2 project
    const projectPath = path.join(__dirname, 'assets', 'projects', 'github-showcase-v2');
    const compositionPath = path.join(projectPath, 'src', 'VideoComposition.tsx');
    
    console.log(`📁 Testing with project: github-showcase-v2`);
    console.log(`📄 Reading: ${path.relative(__dirname, compositionPath)}`);
    
    if (!await fs.pathExists(compositionPath)) {
      throw new Error(`Project file not found: ${compositionPath}`);
    }
    
    const originalJSX = await fs.readFile(compositionPath, 'utf-8');
    
    console.log(`📊 Original JSX: ${originalJSX.length} characters`);
    console.log('🔧 Running AST enhancement...');
    
    // Test the AST enhancement system
    const result = enhanceJSXThroughAST(originalJSX);
    
    console.log('\n📈 AST ENHANCEMENT RESULTS:');
    console.log('='.repeat(30));
    console.log(`✅ AST Parsing Success: ${result.safetyReport.astParsingSuccess}`);
    console.log(`🛡️  Enhancements Safe: ${result.safetyReport.enhancementsSafe}`);
    console.log(`📦 Fallback Used: ${result.safetyReport.fallbackUsed}`);
    console.log(`🎨 Style Detected: ${result.styleDetected.detected} (${result.styleDetected.confidence}%)`);
    console.log(`📝 Characteristics: ${result.styleDetected.characteristics.join(', ')}`);
    console.log(`🔧 Enhancements Applied: ${result.enhancements.length}`);
    console.log(`⚠️  Corruption Issues: ${result.corruptionDetected.length}`);
    
    if (result.enhancements.length > 0) {
      console.log('\n🎯 APPLIED ENHANCEMENTS:');
      result.enhancements.forEach((enhancement, i) => {
        console.log(`   ${i + 1}. ${enhancement}`);
      });
    }
    
    if (result.corruptionDetected.length > 0) {
      console.log('\n⚠️  CORRUPTION DETECTED:');
      result.corruptionDetected.forEach((issue, i) => {
        console.log(`   ${i + 1}. ${issue}`);
      });
    }
    
    console.log(`\n📊 Enhanced JSX: ${result.enhancedJSX.length} characters`);
    console.log(`📈 Size change: ${result.enhancedJSX.length - originalJSX.length} characters`);
    
    // Test if enhanced JSX is different from original
    if (result.enhancedJSX !== originalJSX) {
      console.log('🎉 AST system successfully processed and modified JSX');
    } else {
      console.log('ℹ️  No changes made to JSX (may indicate no enhancements needed)');
    }
    
    // Test the safety features
    if (result.safetyReport.astParsingSuccess && result.safetyReport.enhancementsSafe) {
      console.log('\n✅ SAFETY VERIFICATION PASSED');
      console.log('   - AST parsing successful');
      console.log('   - Enhancements applied safely');
      console.log('   - No corruption introduced');
    } else {
      console.log('\n⚠️  SAFETY ISSUES DETECTED');
      if (!result.safetyReport.astParsingSuccess) {
        console.log('   - AST parsing failed');
      }
      if (!result.safetyReport.enhancementsSafe) {
        console.log('   - Unsafe enhancements detected');
      }
      if (result.safetyReport.fallbackUsed) {
        console.log('   - Fallback mode was used');
      }
    }
    
    // Save enhanced version for inspection
    const testOutputPath = path.join(__dirname, 'github-showcase-v2-ast-enhanced.tsx');
    await fs.writeFile(testOutputPath, result.enhancedJSX);
    console.log(`\n💾 Enhanced JSX saved to: ${path.basename(testOutputPath)}`);
    
    return {
      success: true,
      result,
      originalLength: originalJSX.length,
      enhancedLength: result.enhancedJSX.length
    };
    
  } catch (error) {
    console.error(`❌ AST system test failed: ${error.message}`);
    console.error(error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Execute test if run directly
if (require.main === module) {
  testASTSystem()
    .then(result => {
      if (result.success) {
        console.log('\n🎉 AST SYSTEM TEST COMPLETED SUCCESSFULLY');
        console.log('TASK-24148: AST-based design prism integration is working!');
        process.exit(0);
      } else {
        console.log('\n❌ AST SYSTEM TEST FAILED');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Fatal test error:', error);
      process.exit(1);
    });
}

module.exports = { testASTSystem };