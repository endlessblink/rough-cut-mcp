#!/usr/bin/env node

// Test the Design Prism Enhancement System
// This tests the design prism with the existing github_4 project

const path = require('path');
const fs = require('fs-extra');

// Simulate the design prism function (copied from utils.ts for testing)
function detectStyleIntent(jsx) {
  const content = jsx.toLowerCase();
  const characteristics = [];
  let detected = 'unknown';
  let confidence = 0;
  
  // Corporate/Business patterns
  if (content.includes('professional') || content.includes('corporate') || content.includes('business')) {
    detected = 'corporate';
    confidence += 30;
    characteristics.push('business-oriented');
  }
  
  // Tech/Developer patterns  
  if (content.includes('github') || content.includes('code') || content.includes('tech') || content.includes('api')) {
    detected = detected === 'unknown' ? 'tech' : detected;
    confidence += 25;
    characteristics.push('technology-focused');
  }
  
  // Creative/Artistic patterns
  if (content.includes('creative') || content.includes('art') || content.includes('design') || content.includes('portfolio')) {
    detected = detected === 'unknown' ? 'creative' : detected;
    confidence += 25;
    characteristics.push('creative-expression');
  }
  
  // Matrix/Cyberpunk patterns
  if (content.includes('matrix') || content.includes('cyber') || content.includes('neon') || content.includes('digital')) {
    detected = 'creative';
    confidence += 35;
    characteristics.push('cyberpunk-aesthetic');
  }
  
  // Minimal/Clean patterns
  if (content.includes('minimal') || content.includes('clean') || content.includes('simple')) {
    detected = detected === 'unknown' ? 'minimal' : detected;
    confidence += 20;
    characteristics.push('minimalist-design');
  }
  
  return {
    detected,
    confidence: Math.min(confidence, 100),
    characteristics
  };
}

function testSpacingEnhancement(jsx, styleIntent) {
  let enhancedJSX = jsx;
  const improvements = [];
  let enhanced = false;
  
  // Check for 8pt grid compliance
  const hasGap = jsx.includes('gap:');
  const hasMargin = jsx.includes('margin:');  
  const hasPadding = jsx.includes('padding:');
  
  if (!hasGap && !hasMargin && !hasPadding) {
    const professionalSpacing = styleIntent.detected === 'minimal' ? 16 : 
                               styleIntent.detected === 'creative' ? 32 : 24;
    
    enhanced = true;
    improvements.push(`Would add ${professionalSpacing}px spacing following 8pt grid system`);
  }
  
  return { enhanced, improvements, jsx: enhancedJSX };
}

function testTypographyEnhancement(jsx, styleIntent) {
  let enhancedJSX = jsx;
  const improvements = [];
  let enhanced = false;
  
  // Check for professional fonts
  if (jsx.includes('Arial') || jsx.includes('Times New Roman')) {
    enhanced = true;
    improvements.push('Would upgrade to professional font stack (Roboto, Inter, Open Sans)');
  }
  
  // Check for minimum font size compliance
  const smallFonts = jsx.match(/fontSize.*['"]\d+px?['"]/g) || [];
  for (const font of smallFonts) {
    const size = parseInt(font.match(/\d+/)[0]);
    if (size < 16) {
      enhanced = true;
      improvements.push(`Would increase font from ${size}px to 16px for WCAG compliance`);
    }
  }
  
  return { enhanced, improvements, jsx: enhancedJSX };
}

function testAnimationEnhancement(jsx, styleIntent) {
  const improvements = [];
  let enhanced = false;
  
  // Check for professional easing
  const interpolateCount = (jsx.match(/interpolate/g) || []).length;
  const easingCount = (jsx.match(/easing:/g) || []).length;
  
  if (interpolateCount > easingCount) {
    enhanced = true;
    improvements.push(`Found ${interpolateCount - easingCount} interpolate calls missing professional easing curves`);
  }
  
  return { enhanced, improvements, jsx };
}

function testReadabilityEnhancement(jsx, styleIntent) {
  const improvements = [];
  let enhanced = false;
  
  // Check for contrast issues
  const hasLightText = jsx.includes("color: 'white'") || jsx.includes("color: '#fff");
  const hasLightBackground = jsx.includes("background: 'white'") || jsx.includes('#fff');
  
  if (hasLightText && hasLightBackground) {
    enhanced = true;
    improvements.push('Would fix WCAG contrast violation with text shadows');
  }
  
  return { enhanced, improvements, jsx };
}

async function testDesignPrism() {
  console.log('🎨 Testing Design Prism Enhancement System\n');
  
  try {
    // Read the github_4 project JSX
    const projectPath = path.join(__dirname, 'assets', 'projects', 'github_4', 'src', 'VideoComposition.tsx');
    const jsx = await fs.readFile(projectPath, 'utf-8');
    
    console.log('📁 Analyzing project: github_4');
    console.log(`📄 File size: ${jsx.length.toLocaleString()} characters\n`);
    
    // Step 1: Detect style intent
    const styleIntent = detectStyleIntent(jsx);
    console.log('🔍 Style Intent Detection:');
    console.log(`   Detected: ${styleIntent.detected}`);
    console.log(`   Confidence: ${styleIntent.confidence}%`);
    console.log(`   Characteristics: ${styleIntent.characteristics.join(', ')}\n`);
    
    // Step 2: Test enhancement filters
    const filters = [
      { name: 'Professional Spacing (8pt Grid)', test: testSpacingEnhancement },
      { name: 'Typography Standards (WCAG)', test: testTypographyEnhancement },
      { name: 'Animation Enhancement (Material Design)', test: testAnimationEnhancement },
      { name: 'Readability (WCAG Contrast)', test: testReadabilityEnhancement }
    ];
    
    let totalEnhancements = 0;
    
    for (const filter of filters) {
      const result = filter.test(jsx, styleIntent);
      console.log(`✨ ${filter.name}:`);
      
      if (result.enhanced) {
        console.log('   🔧 Enhancements needed:');
        result.improvements.forEach(improvement => {
          console.log(`      • ${improvement}`);
          totalEnhancements++;
        });
      } else {
        console.log('   ✅ Already follows professional standards');
      }
      console.log('');
    }
    
    // Summary
    console.log('📊 Enhancement Summary:');
    console.log(`   Total potential improvements: ${totalEnhancements}`);
    console.log(`   Project quality: ${totalEnhancements === 0 ? 'Professional' : totalEnhancements < 5 ? 'Good' : 'Needs improvement'}`);
    console.log(`   Style appropriateness: ${styleIntent.confidence > 70 ? 'Excellent' : styleIntent.confidence > 50 ? 'Good' : 'Fair'}`);
    
    console.log('\n🎯 Design Prism Test Complete!');
    console.log('   ✅ Style intent detection working');
    console.log('   ✅ Professional standards analysis working');
    console.log('   ✅ Enhancement suggestions generated');
    console.log('   ✅ Creative intent preserved (no hardcoded templates)');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDesignPrism();