#!/usr/bin/env node

// Test the Creative Pattern Library suggestions on github-test-1
const fs = require('fs-extra');
const path = require('path');

async function testPatternSuggestions() {
  console.log("🔍 Testing Pattern-Based Suggestions on GitHub-Test-1\n");
  
  const projectPath = path.join(__dirname, 'assets', 'projects', 'github-test-1', 'src', 'VideoComposition.tsx');
  
  if (!await fs.pathExists(projectPath)) {
    console.log("❌ github-test-1 project not found");
    return;
  }
  
  const jsx = await fs.readFile(projectPath, 'utf-8');
  console.log(`📝 GitHub-Test-1 JSX: ${jsx.length} characters\n`);
  
  // Analyze using the proven patterns approach
  const analysis = analyzeWithProvenPatterns(jsx);
  
  console.log("📊 CURRENT STATE ANALYSIS:");
  console.log("─".repeat(50));
  console.log(`Scale Score: ${analysis.scale.scaleScore}/100`);
  console.log(`  • Max font size: ${analysis.scale.maxFontSize}px`);
  console.log(`  • Max container: ${analysis.scale.maxContainerWidth}px`);
  console.log(`Motion Score: ${analysis.motion.motionScore}/100`);
  console.log(`  • Total animations: ${analysis.motion.totalAnimations}`);
  console.log(`  • Continuous motion: ${analysis.motion.continuousAnimations}`);
  console.log(`Content Score: ${analysis.content.richness}/100`);
  console.log(`  • Background elements: ${analysis.content.backgroundElements}`);
  console.log(`  • Visual layers: ${analysis.content.visualLayers}`);
  
  console.log("\n🎯 PATTERN-BASED SUGGESTIONS:");
  console.log("─".repeat(50));
  
  const suggestions = generatePatternSuggestions(analysis, jsx);
  
  suggestions.forEach((suggestion, i) => {
    const impact = suggestion.impact.toUpperCase();
    const priority = suggestion.priority;
    console.log(`${i + 1}. [${impact}] ${suggestion.pattern}`);
    console.log(`   Issue: ${suggestion.issue}`);
    console.log(`   Fix: ${suggestion.suggestion}`);
    console.log(`   Code: ${suggestion.implementation}`);
    console.log();
  });
  
  console.log("🏆 COMPARED TO GITHUB_4 SUCCESS:");
  console.log("─".repeat(50));
  console.log("GitHub_4 → Scale: 95/100, Motion: 90/100, Content: 100/100");
  console.log(`GitHub-Test-1 → Scale: ${analysis.scale.scaleScore}/100, Motion: ${analysis.motion.motionScore}/100, Content: ${analysis.content.richness}/100`);
  
  const totalCurrentScore = (analysis.scale.scaleScore + analysis.motion.motionScore + analysis.content.richness) / 3;
  console.log(`\nOverall Appeal Score: ${Math.round(totalCurrentScore)}/100 (GitHub_4 = 95/100)`);
  
  if (totalCurrentScore < 60) {
    console.log("🚨 NEEDS SIGNIFICANT IMPROVEMENT to match GitHub_4 success");
  } else if (totalCurrentScore < 80) {
    console.log("⚠️ Needs improvement to reach GitHub_4 quality");
  } else {
    console.log("✅ Good quality, close to GitHub_4 standards");
  }
}

// Analyze using proven patterns (simplified version of the TypeScript class)
function analyzeWithProvenPatterns(jsx) {
  // Extract font sizes
  const fontSizeMatches = jsx.match(/fontSize:\s*['"`]?(\d+)px?['"`]?/g) || [];
  const fontSizes = fontSizeMatches.map(match => {
    const size = match.match(/(\d+)/);
    return size ? parseInt(size[1]) : 0;
  });
  
  // Extract container sizes
  const widthMatches = jsx.match(/width:\s*['"`]?(\d+)px['"`]?/g) || [];
  const maxWidthMatches = jsx.match(/maxWidth:\s*['"`]?(\d+)px['"`]?/g) || [];
  const containerSizes = [...widthMatches, ...maxWidthMatches].map(match => {
    const size = match.match(/(\d+)/);
    return size ? parseInt(size[1]) : 0;
  }).filter(size => size > 100);
  
  // Count animations
  const springs = (jsx.match(/spring\s*\(/g) || []).length;
  const interpolations = (jsx.match(/interpolate\s*\(/g) || []).length;
  const continuous = (jsx.match(/Math\.(sin|cos)\(/g) || []).length;
  
  // Background complexity
  const backgroundElements = (jsx.match(/background.*?gradient/g) || []).length;
  
  // Content richness
  const dataPoints = (jsx.match(/\d{2,}/g) || []).length;
  const layers = (jsx.match(/<AbsoluteFill/g) || []).length;
  
  return {
    scale: {
      maxFontSize: Math.max(...fontSizes, 0),
      maxContainerWidth: Math.max(...containerSizes, 0),
      scaleScore: calculateScaleScore(fontSizes, containerSizes)
    },
    motion: {
      totalAnimations: springs + interpolations + continuous,
      continuousAnimations: continuous,
      motionScore: calculateMotionScore({ total: springs + interpolations + continuous, continuous })
    },
    content: {
      backgroundElements,
      visualLayers: layers,
      richness: calculateContentScore({ dataPoints, layers })
    }
  };
}

function calculateScaleScore(fontSizes, containerSizes) {
  const maxFont = Math.max(...fontSizes, 0);
  const maxContainer = Math.max(...containerSizes, 0);
  
  let score = 0;
  if (maxFont >= 64) score += 40;
  else if (maxFont >= 48) score += 25;
  else if (maxFont >= 32) score += 10;
  
  if (maxContainer >= 650) score += 40;
  else if (maxContainer >= 500) score += 25;
  else if (maxContainer >= 350) score += 10;
  
  return Math.min(score, 100);
}

function calculateMotionScore(animations) {
  let score = 0;
  
  if (animations.continuous > 20) score += 40;
  else if (animations.continuous > 10) score += 25;
  else if (animations.continuous > 5) score += 10;
  
  if (animations.total > 40) score += 40;
  else if (animations.total > 20) score += 25;
  else if (animations.total > 10) score += 10;
  
  return Math.min(score, 100);
}

function calculateContentScore(content) {
  let score = 0;
  
  if (content.dataPoints > 200) score += 40;
  else if (content.dataPoints > 50) score += 25;
  else if (content.dataPoints > 10) score += 10;
  
  if (content.layers > 7) score += 40;
  else if (content.layers > 4) score += 25;
  else if (content.layers > 2) score += 10;
  
  return Math.min(score, 100);
}

function generatePatternSuggestions(analysis, jsx) {
  const suggestions = [];
  
  // Scale suggestions
  if (analysis.scale.maxFontSize < 60) {
    suggestions.push({
      pattern: "Big Bold Typography",
      issue: `Main title only ${analysis.scale.maxFontSize}px - feels small compared to GitHub_4's 64-84px`,
      suggestion: `Increase to 64-84px for dramatic impact`,
      implementation: `fontSize: '64px' // GitHub_4 proven size`,
      impact: 'dramatic',
      priority: 1
    });
  }
  
  if (analysis.scale.maxContainerWidth < 600) {
    suggestions.push({
      pattern: "Wide Layout Containers", 
      issue: `Max width only ${analysis.scale.maxContainerWidth}px - GitHub_4 uses 650-900px`,
      suggestion: `Use wider containers for more presence`,
      implementation: `width: '650px' // GitHub_4 proven width`,
      impact: 'high',
      priority: 2
    });
  }
  
  // Motion suggestions
  if (analysis.motion.continuousAnimations < 10) {
    suggestions.push({
      pattern: "Continuous Micro-Motion",
      issue: `Only ${analysis.motion.continuousAnimations} continuous animations - GitHub_4 has 27`,
      suggestion: `Add more gentle floating/rotating effects`,
      implementation: `Math.sin(frame * 0.02) * 3 // Proven gentle motion`,
      impact: 'high',
      priority: 3
    });
  }
  
  // Content richness
  if (analysis.content.backgroundElements < 5) {
    suggestions.push({
      pattern: "Rich Animated Background",
      issue: `Background too simple - GitHub_4 has animated code scrolling`,
      suggestion: `Add animated background system`,
      implementation: `Scrolling text, particles, or data animations`,
      impact: 'dramatic',
      priority: 1
    });
  }
  
  return suggestions.sort((a, b) => a.priority - b.priority);
}

// Run the test
testPatternSuggestions().catch(console.error);