#!/usr/bin/env node

// Investigate why same MCP created GitHub_4 (amazing) vs GitHub-Test-1 (basic)
const fs = require('fs-extra');
const path = require('path');

async function investigateCreationDifferences() {
  console.log("🔍 Investigating Creation Differences: GitHub_4 vs GitHub-Test-1\n");
  
  const github4Path = path.join(__dirname, 'assets', 'projects', 'github_4', 'src', 'VideoComposition.tsx');
  const githubTest1Path = path.join(__dirname, 'assets', 'projects', 'github-test-1', 'src', 'VideoComposition.tsx');
  
  // Read both projects
  const github4JSX = await fs.readFile(github4Path, 'utf-8');
  const githubTest1JSX = await fs.readFile(githubTest1Path, 'utf-8');
  
  console.log("📊 SIZE COMPARISON:");
  console.log("─".repeat(50));
  console.log(`GitHub_4: ${github4JSX.length} characters (${github4JSX.split('\n').length} lines)`);
  console.log(`GitHub-Test-1: ${githubTest1JSX.length} characters (${githubTest1JSX.split('\n').length} lines)`);
  console.log(`Difference: ${github4JSX.length - githubTest1JSX.length} characters (${Math.round((github4JSX.length / githubTest1JSX.length) * 100)}% larger)\n`);
  
  // Analyze content patterns
  console.log("🧩 CONTENT ANALYSIS:");
  console.log("─".repeat(50));
  
  const github4Analysis = analyzeContent(github4JSX, 'GitHub_4');
  const githubTest1Analysis = analyzeContent(githubTest1JSX, 'GitHub-Test-1');
  
  console.log("GitHub_4 Content:");
  console.log(`• Custom Components: ${github4Analysis.components}`);
  console.log(`• Data Arrays: ${github4Analysis.dataArrays}`);
  console.log(`• Real Numbers: ${github4Analysis.realNumbers}`);
  console.log(`• Animation Systems: ${github4Analysis.animationSystems}`);
  console.log(`• Visual Layers: ${github4Analysis.visualLayers}`);
  
  console.log("\nGitHub-Test-1 Content:");
  console.log(`• Custom Components: ${githubTest1Analysis.components}`);
  console.log(`• Data Arrays: ${githubTest1Analysis.dataArrays}`);
  console.log(`• Real Numbers: ${githubTest1Analysis.realNumbers}`);
  console.log(`• Animation Systems: ${githubTest1Analysis.animationSystems}`);
  console.log(`• Visual Layers: ${githubTest1Analysis.visualLayers}`);
  
  console.log("\n🎯 KEY DIFFERENCES:");
  console.log("━".repeat(50));
  
  // Content richness comparison
  if (github4Analysis.dataArrays > githubTest1Analysis.dataArrays) {
    console.log(`✅ GitHub_4 has ${github4Analysis.dataArrays - githubTest1Analysis.dataArrays} more data arrays`);
  }
  
  if (github4Analysis.realNumbers > githubTest1Analysis.realNumbers * 2) {
    console.log(`✅ GitHub_4 has ${Math.round(github4Analysis.realNumbers / githubTest1Analysis.realNumbers)}x more real data points`);
  }
  
  if (github4Analysis.components > githubTest1Analysis.components) {
    console.log(`✅ GitHub_4 has ${github4Analysis.components - githubTest1Analysis.components} more custom components`);
  }
  
  // Check creation timeline
  console.log("\n📅 CREATION TIMELINE:");
  console.log("─".repeat(50));
  
  // Check for backup files to understand evolution
  const github4Backups = await getBackupTimeline('github_4');
  const githubTest1Backups = await getBackupTimeline('github-test-1');
  
  console.log("GitHub_4 Evolution:");
  github4Backups.forEach(backup => {
    console.log(`  ${backup.date}: ${backup.size} chars (${backup.description})`);
  });
  
  console.log("\nGitHub-Test-1 Evolution:");
  githubTest1Backups.forEach(backup => {
    console.log(`  ${backup.date}: ${backup.size} chars (${backup.description})`);
  });
  
  // Look for clues about the original creation intent
  console.log("\n🔍 ORIGINAL CREATION CLUES:");
  console.log("─".repeat(50));
  
  const github4Clues = extractCreationClues(github4JSX);
  const githubTest1Clues = extractCreationClues(githubTest1JSX);
  
  console.log("GitHub_4 Content Clues:");
  github4Clues.forEach(clue => console.log(`  • ${clue}`));
  
  console.log("\nGitHub-Test-1 Content Clues:");
  githubTest1Clues.forEach(clue => console.log(`  • ${clue}`));
  
  console.log("\n🎯 HYPOTHESIS:");
  console.log("━".repeat(50));
  
  if (github4Analysis.realNumbers > 100 && githubTest1Analysis.realNumbers < 50) {
    console.log("💡 GitHub_4 was created with REAL DATA (contributions, stats)");
    console.log("💡 GitHub-Test-1 was created with GENERIC CONTENT (basic showcase)");
    console.log("\n🔑 KEY INSIGHT: Rich data input → Rich animated output");
    console.log("🔑 KEY INSIGHT: Generic input → Generic animated output");
    
    console.log("\n🚀 SOLUTION:");
    console.log("Instead of enhancement systems, provide RICHER INPUT DATA:");
    console.log("• Real GitHub stats, contribution data, project metrics");
    console.log("• Specific achievements, milestones, growth stories");
    console.log("• Actual numbers, dates, meaningful information");
    console.log("• Rich content naturally creates rich animations");
  } else {
    console.log("🤔 Content difference doesn't fully explain the gap");
    console.log("🔍 Need to investigate MCP generation logic differences");
  }
}

function analyzeContent(jsx, name) {
  const components = (jsx.match(/const\s+\w+\s*[=:][^{]*=>/g) || []).length;
  const dataArrays = (jsx.match(/\[[^\]]{50,}\]/g) || []).length; // Arrays with 50+ chars
  const realNumbers = (jsx.match(/\b\d{2,}\b/g) || []).length; // Numbers with 2+ digits
  const animationSystems = (jsx.match(/(spring|interpolate)\s*\(/g) || []).length;
  const visualLayers = (jsx.match(/<AbsoluteFill/g) || []).length;
  
  return {
    components,
    dataArrays,
    realNumbers,
    animationSystems,
    visualLayers
  };
}

async function getBackupTimeline(projectName) {
  const backupDir = path.join(__dirname, 'assets', 'projects', projectName, 'backups');
  
  if (!await fs.pathExists(backupDir)) {
    return [];
  }
  
  const backupFiles = await fs.readdir(backupDir);
  const timeline = [];
  
  for (const file of backupFiles) {
    if (file.includes('VideoComposition')) {
      const filePath = path.join(backupDir, file);
      const stats = await fs.stat(filePath);
      const content = await fs.readFile(filePath, 'utf-8');
      
      // Extract date from filename
      const dateMatch = file.match(/(\d{4}-\d{2}-\d{2})/);
      const date = dateMatch ? dateMatch[1] : 'unknown';
      
      let description = "Unknown change";
      if (content.length > 50000) description = "Major expansion";
      else if (content.length > 30000) description = "Significant additions";
      else if (content.length > 15000) description = "Moderate changes";
      else description = "Basic version";
      
      timeline.push({
        date,
        size: content.length,
        description
      });
    }
  }
  
  return timeline.sort((a, b) => new Date(a.date) - new Date(b.date));
}

function extractCreationClues(jsx) {
  const clues = [];
  
  // Look for specific data patterns
  if (jsx.includes('contributionData')) {
    clues.push('Contains real GitHub contribution data');
  }
  
  if (jsx.includes('693 contributions')) {
    clues.push('Shows specific contribution count');
  }
  
  if (jsx.includes('achievements')) {
    clues.push('Has achievement system with milestones');
  }
  
  if (jsx.includes('CodeBackground')) {
    clues.push('Has dedicated code background component');
  }
  
  if (jsx.includes('ContributionGraph')) {
    clues.push('Has dedicated contribution graph visualization');
  }
  
  // Look for content hints
  const projectMentions = jsx.match(/['"]([\w\s-]+MCP|[\w\s-]+AI|[\w\s-]+tool)['"]/g) || [];
  if (projectMentions.length > 0) {
    clues.push(`Mentions specific projects: ${projectMentions.slice(0, 3).join(', ')}`);
  }
  
  const dataCount = (jsx.match(/\b\d{2,}\b/g) || []).length;
  if (dataCount > 100) {
    clues.push(`Contains ${dataCount} data points suggesting real information input`);
  }
  
  const complexAnimations = jsx.includes('Array.from({ length:') && jsx.includes('contributionData');
  if (complexAnimations) {
    clues.push('Has complex data-driven animations');
  }
  
  if (jsx.includes('endlessblink') && jsx.includes('showcase')) {
    clues.push('Generic portfolio showcase structure');
  }
  
  return clues;
}

// Run investigation
investigateCreationDifferences().catch(console.error);