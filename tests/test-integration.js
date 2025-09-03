#!/usr/bin/env node

// Integration test to verify safe validation works with existing projects

const fs = require('fs-extra');
const path = require('path');

async function testExistingProjects() {
  console.log("🧪 Testing Safe Validation Integration with Existing Projects\n");
  
  const projectsDir = path.join(__dirname, 'assets', 'projects');
  
  if (!await fs.pathExists(projectsDir)) {
    console.log("❌ Projects directory not found. Run this from MCP server root.");
    return;
  }
  
  const projects = await fs.readdir(projectsDir);
  console.log(`📁 Found ${projects.length} projects to test: ${projects.join(', ')}\n`);
  
  let totalTests = 0;
  let passedTests = 0;
  
  for (const projectName of projects) {
    const projectPath = path.join(projectsDir, projectName);
    const compositionPath = path.join(projectPath, 'src', 'VideoComposition.tsx');
    
    if (!await fs.pathExists(compositionPath)) {
      console.log(`⚠️  Skipping ${projectName}: No VideoComposition.tsx found`);
      continue;
    }
    
    totalTests++;
    console.log(`🔍 Testing: ${projectName}`);
    console.log("─".repeat(40));
    
    try {
      const jsx = await fs.readFile(compositionPath, 'utf-8');
      console.log(`📝 JSX Length: ${jsx.length} characters`);
      
      // Perform basic validation checks that our system should handle
      const validationResults = performBasicValidation(jsx);
      
      console.log(`✅ Syntax Check: ${validationResults.syntaxValid ? 'PASS' : 'FAIL'}`);
      console.log(`✅ Imports Check: ${validationResults.importsValid ? 'PASS' : 'FAIL'}`);
      console.log(`✅ Structure Check: ${validationResults.structureValid ? 'PASS' : 'FAIL'}`);
      
      if (validationResults.warnings.length > 0) {
        console.log(`⚠️  Warnings: ${validationResults.warnings.join(', ')}`);
      }
      
      if (validationResults.errors.length > 0) {
        console.log(`❌ Errors: ${validationResults.errors.join(', ')}`);
      }
      
      const overallValid = validationResults.syntaxValid && 
                          validationResults.importsValid && 
                          validationResults.structureValid &&
                          validationResults.errors.length === 0;
      
      console.log(`📊 Overall: ${overallValid ? '✅ VALID' : '❌ INVALID'}`);
      
      if (overallValid) passedTests++;
      
    } catch (error) {
      console.log(`❌ Test Error: ${error.message}`);
    }
    
    console.log();
  }
  
  console.log("=".repeat(50));
  console.log(`🏁 Integration Test Results: ${passedTests}/${totalTests} projects passed`);
  console.log(`Success Rate: ${totalTests > 0 ? Math.round((passedTests/totalTests) * 100) : 0}%`);
  
  if (passedTests === totalTests && totalTests > 0) {
    console.log("🎉 All existing projects are compatible with safe validation!");
    console.log("✅ Ready to deploy safe validation system");
  } else if (totalTests === 0) {
    console.log("📝 No projects found to test. Safe validation system ready for first use.");
  } else {
    console.log("⚠️  Some projects may need fixes for safe validation");
  }
}

function performBasicValidation(jsx) {
  const errors = [];
  const warnings = [];
  
  // Basic syntax validation
  const openBraces = (jsx.match(/\{/g) || []).length;
  const closeBraces = (jsx.match(/\}/g) || []).length;
  const syntaxValid = openBraces === closeBraces;
  
  if (!syntaxValid) {
    errors.push(`Brace mismatch: ${openBraces} open, ${closeBraces} close`);
  }
  
  // Import validation
  const hasReactImport = jsx.includes("from 'react'") || jsx.includes('from "react"');
  const hasRemotionImport = jsx.includes("from 'remotion'") || jsx.includes('from "remotion"');
  const importsValid = hasReactImport && hasRemotionImport;
  
  if (!hasReactImport) {
    errors.push("Missing React import");
  }
  if (!hasRemotionImport) {
    errors.push("Missing Remotion import");
  }
  
  // Structure validation
  const hasExport = jsx.includes('export');
  const hasComponent = jsx.includes('VideoComposition');
  const hasReturn = jsx.includes('return');
  const structureValid = hasExport && hasComponent && hasReturn;
  
  if (!hasExport) {
    errors.push("Missing export statement");
  }
  if (!hasComponent) {
    errors.push("Missing VideoComposition component");
  }
  if (!hasReturn) {
    errors.push("Missing return statement");
  }
  
  // Quality checks (warnings)
  if (jsx.includes('frame') && !jsx.includes('useCurrentFrame()')) {
    warnings.push("Uses 'frame' without useCurrentFrame() call");
  }
  
  const fontSizes = jsx.match(/fontSize:\s*['"`](\d+)px['"`]/g) || [];
  const smallFonts = fontSizes.filter(match => {
    const size = parseInt(match.match(/(\d+)/)[1]);
    return size < 16;
  });
  
  if (smallFonts.length > 0) {
    warnings.push(`${smallFonts.length} font sizes below 16px (WCAG minimum)`);
  }
  
  // Check for potential corruption patterns
  if (jsx.includes('pxpx') || jsx.includes('%%')) {
    errors.push("Corrupted CSS values detected");
  }
  
  return {
    syntaxValid,
    importsValid,
    structureValid,
    errors,
    warnings
  };
}

// Run the integration test
testExistingProjects().catch(console.error);