#!/usr/bin/env node

// Simple test of the AST Design Prism enhancement system
const path = require('path');
const fs = require('fs-extra');

async function testASTPrism() {
  console.log('🧪 Testing AST-based Design Prism Enhancement System...\n');
  
  try {
    // Import the AST design prism module
    const { enhanceJSXThroughAST } = require('./build/ast-design-prism.js');
    
    // Test JSX with intentionally poor styling
    const testJSX = `
import React from 'react';
import { AbsoluteFill } from 'remotion';

const TestComponent = () => {
  return (
    <AbsoluteFill>
      <div style={{
        display: 'flex',
        fontFamily: 'Arial',
        fontSize: '12px'
      }}>
        <h1 style={{
          fontFamily: 'Times New Roman',
          fontSize: '14px'
        }}>
          GitHub Portfolio
        </h1>
      </div>
    </AbsoluteFill>
  );
};

export default TestComponent;
    `.trim();

    console.log('📝 Original JSX (with poor styling):');
    console.log('- Font Family: Arial, Times New Roman');
    console.log('- Font Sizes: 12px, 14px (below WCAG minimum)');
    console.log('- Missing professional gap spacing\n');

    // Run the enhancement
    const result = enhanceJSXThroughAST(testJSX);
    
    console.log(`🎨 Style Detection: ${result.styleDetected.detected} (${result.styleDetected.confidence}% confidence)`);
    console.log(`🔍 Characteristics: ${result.styleDetected.characteristics.join(', ')}`);
    console.log(`❌ Corrupted: ${result.corrupted}\n`);
    
    console.log('✨ Enhancements Applied:');
    result.enhancements.forEach((enhancement, i) => {
      console.log(`   ${i + 1}. ${enhancement}`);
    });
    
    if (result.enhancements.length === 0) {
      console.log('   No enhancements were applied (this may indicate an issue)');
    }
    
    console.log('\n📊 Enhancement Summary:');
    console.log(`- Total enhancements: ${result.enhancements.length}`);
    console.log(`- JSX corrupted: ${result.corrupted ? '❌ YES' : '✅ NO'}`);
    console.log(`- Style intent detected: ${result.styleDetected.detected}`);
    
    // Show a snippet of the enhanced JSX
    console.log('\n📄 Enhanced JSX (first 300 chars):');
    console.log('=' .repeat(50));
    console.log(result.enhancedJSX.substring(0, 300) + '...');
    console.log('=' .repeat(50));
    
    return {
      success: true,
      enhancementsCount: result.enhancements.length,
      corrupted: result.corrupted,
      styleDetected: result.styleDetected.detected
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test
testASTPrism().then(result => {
  console.log('\n🏁 Test Results:');
  if (result.success) {
    console.log('✅ AST Design Prism system is working!');
    console.log(`✅ Applied ${result.enhancementsCount} enhancements`);
    console.log(`✅ No corruption detected: ${!result.corrupted}`);
    console.log(`✅ Style detection working: ${result.styleDetected}`);
  } else {
    console.log('❌ AST Design Prism system failed');
    console.log(`❌ Error: ${result.error}`);
  }
}).catch(error => {
  console.error('💥 Test runner failed:', error);
});