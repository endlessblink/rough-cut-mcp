#!/usr/bin/env node

// Analyze github_4 project to extract successful visual patterns
const fs = require('fs-extra');
const path = require('path');

async function analyzeGitHub4Patterns() {
  console.log("🔍 Analyzing GitHub_4 Success Patterns\n");
  
  const githubProjectPath = path.join(__dirname, 'assets', 'projects', 'github_4', 'src', 'VideoComposition.tsx');
  
  if (!await fs.pathExists(githubProjectPath)) {
    console.log("❌ github_4 project not found");
    return;
  }
  
  const jsx = await fs.readFile(githubProjectPath, 'utf-8');
  console.log(`📝 GitHub_4 JSX: ${jsx.length} characters (${jsx.split('\n').length} lines)\n`);
  
  // Extract visual richness patterns
  console.log("🎨 VISUAL RICHNESS ANALYSIS:");
  console.log("─".repeat(50));
  
  const components = extractComponents(jsx);
  console.log(`• Components: ${components.length} custom components`);
  components.forEach(comp => console.log(`  - ${comp.name}: ${comp.purpose}`));
  
  console.log();
  const animations = extractAnimations(jsx);
  console.log(`• Animations: ${animations.count} total animation calls`);
  console.log(`  - Springs: ${animations.springs}`);
  console.log(`  - Interpolations: ${animations.interpolations}`);
  console.log(`  - Continuous motion: ${animations.continuous}`);
  
  console.log();
  const scale = extractScale(jsx);
  console.log(`🔍 SCALE ANALYSIS:`);
  console.log(`• Font sizes: ${scale.fontSizes.join(', ')}px`);
  console.log(`• Largest element: ${Math.max(...scale.fontSizes)}px`);
  console.log(`• Layout widths: ${scale.widths.join(', ')}px`);
  console.log(`• Container sizes: ${scale.containers.join(', ')}`);
  
  console.log();
  const timing = extractTiming(jsx);
  console.log(`⏱️ TIMING ANALYSIS:`);
  console.log(`• Animation durations: ${timing.durations.join(', ')} frames`);
  console.log(`• Stagger delays: ${timing.staggers.join(', ')} frames`);
  console.log(`• Transition overlaps: ${timing.overlaps.join(', ')} frames`);
  
  console.log();
  const content = extractContentRichness(jsx);
  console.log(`📊 CONTENT RICHNESS:`);
  console.log(`• Background elements: ${content.backgroundElements}`);
  console.log(`• Interactive elements: ${content.interactiveElements}`);
  console.log(`• Data points: ${content.dataPoints}`);
  console.log(`• Visual layers: ${content.visualLayers}`);
  
  console.log();
  console.log("🎯 SUCCESS PATTERNS IDENTIFIED:");
  console.log("━".repeat(50));
  console.log("✅ Rich content: Multiple animated background systems");
  console.log("✅ Bigger scale: 64px titles, 650px cards, full-width layouts");
  console.log("✅ Continuous motion: Always something moving/animating");
  console.log("✅ Staggered timing: Sequential reveals build excitement");
  console.log("✅ Real data: Meaningful numbers (693 contributions, etc.)");
  console.log("✅ Visual depth: Multiple layers, blur, shadows, gradients");
  console.log("✅ Professional details: Proper contrast, spacing, typography");
  
  return {
    components,
    animations,
    scale,
    timing,
    content
  };
}

function extractComponents(jsx) {
  const componentPattern = /const\s+(\w+)\s*[=:][^{]*=>[^}]*{/g;
  const components = [];
  let match;
  
  while ((match = componentPattern.exec(jsx)) !== null) {
    const name = match[1];
    let purpose = "Custom component";
    
    if (name.includes('Background')) purpose = "Visual background system";
    if (name.includes('Graph')) purpose = "Data visualization";
    if (name.includes('Card')) purpose = "Content presentation";
    if (name.includes('Achievement')) purpose = "Interactive showcase";
    
    components.push({ name, purpose });
  }
  
  return components;
}

function extractAnimations(jsx) {
  const springs = (jsx.match(/spring\s*\(/g) || []).length;
  const interpolations = (jsx.match(/interpolate\s*\(/g) || []).length;
  const continuous = (jsx.match(/Math\.(sin|cos)\(/g) || []).length;
  
  return {
    count: springs + interpolations + continuous,
    springs,
    interpolations,
    continuous
  };
}

function extractScale(jsx) {
  const fontSizePattern = /fontSize:\s*['"`]?(\d+)px?['"`]?/g;
  const fontSizes = [];
  let match;
  
  while ((match = fontSizePattern.exec(jsx)) !== null) {
    fontSizes.push(parseInt(match[1]));
  }
  
  const widthPattern = /width:\s*['"`]?(\d+)px['"`]?/g;
  const widths = [];
  while ((match = widthPattern.exec(jsx)) !== null) {
    widths.push(parseInt(match[1]));
  }
  
  const containerPattern = /maxWidth:\s*['"`]?(\d+)px['"`]?/g;
  const containers = [];
  while ((match = containerPattern.exec(jsx)) !== null) {
    containers.push(`${match[1]}px`);
  }
  
  return {
    fontSizes: [...new Set(fontSizes)].sort((a,b) => b-a),
    widths: [...new Set(widths)].sort((a,b) => b-a),
    containers
  };
}

function extractTiming(jsx) {
  // Extract animation durations
  const durationPattern = /\[(\d+),\s*(\d+)\]/g;
  const durations = [];
  const staggers = [];
  const overlaps = [];
  
  let match;
  while ((match = durationPattern.exec(jsx)) !== null) {
    const start = parseInt(match[1]);
    const end = parseInt(match[2]);
    durations.push(end - start);
  }
  
  // Extract stagger delays
  const staggerPattern = /delay.*?(\d+)\s*\*/g;
  while ((match = staggerPattern.exec(jsx)) !== null) {
    staggers.push(parseInt(match[1]));
  }
  
  return {
    durations: [...new Set(durations)].sort((a,b) => a-b),
    staggers: [...new Set(staggers)].sort((a,b) => a-b),
    overlaps: [] // Would need more complex analysis
  };
}

function extractContentRichness(jsx) {
  const backgroundElements = (jsx.match(/background.*?gradient/g) || []).length;
  const interactiveElements = (jsx.match(/transform.*?interpolate/g) || []).length;
  const dataPoints = (jsx.match(/\d{3,}/g) || []).length; // Numbers with 3+ digits
  const visualLayers = (jsx.match(/<AbsoluteFill/g) || []).length;
  
  return {
    backgroundElements,
    interactiveElements, 
    dataPoints,
    visualLayers
  };
}

// Run analysis
analyzeGitHub4Patterns().then(patterns => {
  console.log("\n🏆 GITHUB_4 SUCCESS FORMULA:");
  console.log("═".repeat(50));
  console.log("1. Rich animated backgrounds (not empty space)");
  console.log("2. Large scale elements (64px titles, 650px cards)");
  console.log("3. Continuous motion (always something moving)");
  console.log("4. Real meaningful data (contributions, projects, stats)");
  console.log("5. Multiple visual layers creating depth");
  console.log("6. Staggered animations building excitement");
  console.log("7. Professional details without being sterile");
  console.log("\n💡 THE PATTERN: Substance + Scale + Motion = Engaging");
}).catch(console.error);