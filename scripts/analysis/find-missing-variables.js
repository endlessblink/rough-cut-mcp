#!/usr/bin/env node

// Find ALL Missing Variables in github-test-1 project
// Systematic approach to prevent runtime errors

const fs = require('fs-extra');
const path = require('path');

async function findMissingVariables() {
  try {
    const projectPath = path.join(__dirname, 'assets', 'projects', 'github-test-1', 'src', 'VideoComposition.tsx');
    const jsx = await fs.readFile(projectPath, 'utf-8');
    
    console.log('🔍 Finding ALL missing variables in github-test-1');
    console.log('=' .repeat(50));
    
    // Find all variable declarations
    const declarations = [];
    const declarationMatches = jsx.match(/const\s+(\w+)\s*=/g);
    if (declarationMatches) {
      declarationMatches.forEach(match => {
        const varName = match.match(/const\s+(\w+)/)[1];
        declarations.push(varName);
      });
    }
    
    console.log('📝 Declared Variables:');
    declarations.forEach(v => console.log(`   ✅ ${v}`));
    console.log('');
    
    // Find all variable references in template expressions
    const references = [];
    const templateMatches = jsx.match(/\$\{[^}]*(\w+)[^}]*\}/g);
    if (templateMatches) {
      templateMatches.forEach(match => {
        // Extract variable names from template expressions
        const variables = match.match(/\b[a-zA-Z_$]\w*\b/g);
        if (variables) {
          variables.forEach(v => {
            // Filter out known functions and keywords
            if (!['interpolate', 'Math', 'sin', 'cos', 'frame', 'fps', 'durationInFrames'].includes(v)) {
              references.push(v);
            }
          });
        }
      });
    }
    
    // Also check regular variable usage (not just templates)
    const variableUsages = jsx.match(/\b[a-zA-Z_$]\w*(?=\s*[*+\-/\s])/g);
    if (variableUsages) {
      references.push(...variableUsages);
    }
    
    const uniqueReferences = [...new Set(references)];
    
    console.log('🔗 Referenced Variables:');
    uniqueReferences.forEach(v => console.log(`   📍 ${v}`));
    console.log('');
    
    // Find missing variables
    const missing = uniqueReferences.filter(ref => !declarations.includes(ref));
    const builtin = ['React', 'frame', 'fps', 'durationInFrames', 'Math', 'Array', 'console'];
    const actuallyMissing = missing.filter(v => !builtin.includes(v));
    
    console.log('❌ Missing Variable Declarations:');
    if (actuallyMissing.length > 0) {
      actuallyMissing.forEach(v => {
        console.log(`   🚨 ${v} - REFERENCED but NOT DECLARED`);
      });
      
      console.log('');
      console.log('🔧 Suggested Fixes:');
      actuallyMissing.forEach(v => {
        console.log(`   const ${v} = /* ADD APPROPRIATE VALUE */;`);
      });
    } else {
      console.log('   ✅ No missing variables found!');
    }
    
    console.log('');
    console.log('📊 Summary:');
    console.log(`   Declared: ${declarations.length}`);
    console.log(`   Referenced: ${uniqueReferences.length}`);
    console.log(`   Missing: ${actuallyMissing.length}`);
    console.log(`   Status: ${actuallyMissing.length === 0 ? '✅ COMPLETE' : '❌ NEEDS FIXES'}`);
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
  }
}

findMissingVariables();