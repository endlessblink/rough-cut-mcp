#!/usr/bin/env node

// Test the enhanced design prism transition fixes on real project
const fs = require('fs-extra');
const path = require('path');

async function testTransitionFixes() {
  console.log("🔧 Testing Enhanced Design Prism Transition Fixes\n");
  
  const projectPath = path.join(__dirname, 'assets', 'projects', 'github-test-1', 'src', 'VideoComposition.tsx');
  
  if (!await fs.pathExists(projectPath)) {
    console.log("❌ github-test-1 project not found. Run this from MCP server root.");
    return;
  }
  
  const originalJSX = await fs.readFile(projectPath, 'utf-8');
  console.log(`📝 Original JSX: ${originalJSX.length} characters\n`);
  
  // Analyze the transition patterns that cause the overlap issue
  console.log("🔍 Analyzing Transition Patterns:");
  console.log("─".repeat(50));
  
  // Look for the problematic patterns from your screenshot
  const shotTransitions = analyzeTransitionPatterns(originalJSX);
  
  shotTransitions.forEach((transition, i) => {
    console.log(`Shot ${i + 1} Transition:`);
    console.log(`  • Fade Out: frames ${transition.fadeOut.start} → ${transition.fadeOut.end}`);
    console.log(`  • Fade In:  frames ${transition.fadeIn.start} → ${transition.fadeIn.end}`);
    console.log(`  • Gap/Overlap: ${transition.gap} frames`);
    
    if (transition.gap < 5) {
      console.log(`  🚨 OVERLAP ISSUE: Only ${transition.gap} frame gap - causes text bleeding!`);
    } else if (transition.gap < 15) {
      console.log(`  ⚠️  SHORT GAP: ${transition.gap} frames - may cause issues`);
    } else {
      console.log(`  ✅ GOOD GAP: ${transition.gap} frames - clean transition`);
    }
    console.log();
  });
  
  // Test the fixes that the enhanced design prism would apply
  console.log("🔧 Applying Enhanced Design Prism Fixes:");
  console.log("─".repeat(50));
  
  const fixes = generateTransitionFixes(shotTransitions);
  fixes.forEach(fix => {
    console.log(`✅ ${fix}`);
  });
  
  console.log("\n📊 Results Summary:");
  const criticalIssues = shotTransitions.filter(t => t.gap < 5).length;
  const minorIssues = shotTransitions.filter(t => t.gap >= 5 && t.gap < 15).length;
  const goodTransitions = shotTransitions.filter(t => t.gap >= 15).length;
  
  console.log(`• Critical Issues (overlap): ${criticalIssues}`);
  console.log(`• Minor Issues (short gap): ${minorIssues}`);
  console.log(`• Good Transitions: ${goodTransitions}`);
  
  if (criticalIssues > 0) {
    console.log("\n🎯 THE ENHANCED DESIGN PRISM WOULD AUTOMATICALLY FIX THESE!");
    console.log("   → Adjusts frame timings to ensure 15-frame minimum gaps");
    console.log("   → Prevents text bleeding through during transitions");
    console.log("   → Creates smooth, professional shot changes");
  } else {
    console.log("\n🎉 No critical transition issues found!");
  }
}

function analyzeTransitionPatterns(jsx) {
  const transitions = [];
  
  // Extract fade transition patterns
  const fadeOutPattern = /interpolate\s*\(\s*frame\s*,\s*\[(\d+),\s*(\d+)\]\s*,\s*\[1,\s*0\]/g;
  const fadeInPattern = /interpolate\s*\(\s*frame\s*,\s*\[(\d+),\s*(\d+)\]\s*,\s*\[0,\s*1\]/g;
  
  const fadeOuts = [];
  const fadeIns = [];
  
  let match;
  while ((match = fadeOutPattern.exec(jsx)) !== null) {
    fadeOuts.push({
      start: parseInt(match[1]),
      end: parseInt(match[2])
    });
  }
  
  while ((match = fadeInPattern.exec(jsx)) !== null) {
    fadeIns.push({
      start: parseInt(match[1]),
      end: parseInt(match[2])
    });
  }
  
  // Pair up fade-outs with subsequent fade-ins
  fadeOuts.forEach(fadeOut => {
    // Find the next fade-in after this fade-out
    const nextFadeIn = fadeIns.find(fadeIn => fadeIn.start >= fadeOut.start);
    
    if (nextFadeIn) {
      const gap = nextFadeIn.start - fadeOut.end;
      transitions.push({
        fadeOut,
        fadeIn: nextFadeIn,
        gap
      });
    }
  });
  
  return transitions;
}

function generateTransitionFixes(transitions) {
  const fixes = [];
  
  transitions.forEach((transition, i) => {
    if (transition.gap < 15) {
      const recommendedStart = transition.fadeOut.end + 15;
      const adjustment = recommendedStart - transition.fadeIn.start;
      
      fixes.push(
        `Shot ${i + 1}: Move fade-in from frame ${transition.fadeIn.start} to ${recommendedStart} (+${adjustment} frames)`
      );
      fixes.push(
        `Shot ${i + 1}: Adjust fade-in end from frame ${transition.fadeIn.end} to ${transition.fadeIn.end + adjustment}`
      );
    }
  });
  
  if (fixes.length === 0) {
    fixes.push("All transitions already have proper timing - no fixes needed!");
  }
  
  return fixes;
}

// Run the test
testTransitionFixes().catch(console.error);