#!/usr/bin/env node

/**
 * TASK-64610: Quote/Syntax Corruption Validation and Cleanup
 * 
 * This script validates all existing Remotion projects for quote corruption
 * and syntax errors, then applies fixes using the existing correction system.
 */

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Quote corruption patterns from the existing fix system
const CORRUPTION_PATTERNS = {
  // Double quotes corruption (''110px, ""20px, etc.)
  quoteCorruption: /([\w]+:\s*)(['"]{2,})([^'"]*)/g,
  
  // Trailing quote corruption ('110px', "20px"', etc.)
  trailingQuotes: /(['"`])([^'"]*\d+(?:px|%|em|rem))(['"]+)/g,
  
  // CSS value with space issues
  cssSpacing: /:\s*(['"]+)\s*([^'"]*?)\s*(['"]+)/g,
  
  // Mixed quote types in same property
  mixedQuotes: /:\s*['"]([^'"]*?)["']/g,
  
  // Empty quotes
  emptyQuotes: /:\s*['"]{2,}/g,
  
  // Quote sequences without content
  quoteSequences: /['"]{3,}/g
};

/**
 * Analyze a file for quote/syntax corruption
 */
function analyzeFileCorruption(filePath, content) {
  const issues = [];
  const lines = content.split('\n');
  
  // Check each corruption pattern
  Object.entries(CORRUPTION_PATTERNS).forEach(([patternName, pattern]) => {
    let match;
    const globalPattern = new RegExp(pattern.source, pattern.flags);
    
    while ((match = globalPattern.exec(content)) !== null) {
      // Find line number
      const beforeMatch = content.substring(0, match.index);
      const lineNumber = beforeMatch.split('\n').length;
      const line = lines[lineNumber - 1];
      
      issues.push({
        type: patternName,
        match: match[0],
        line: lineNumber,
        lineContent: line.trim(),
        fullMatch: match,
        index: match.index
      });
    }
  });
  
  return issues;
}

/**
 * Apply the existing quote corruption fixes from tools.ts
 */
function applyQuoteCorruptionFixes(content) {
  let cleanContent = content;
  let fixCount = 0;
  const appliedFixes = [];
  
  // Fix quote corruption patterns (from tools.ts)
  const quoteCorruptionPattern = /([\w]+:\s*)(['"]{2,})([^'"]*)/g;
  cleanContent = cleanContent.replace(quoteCorruptionPattern, (match, property, corruptedQuotes, value) => {
    fixCount++;
    const fix = `${property}'${value.replace(/['"]/g, '')}'`;
    appliedFixes.push(`Fixed quote corruption: ${match} → ${fix}`);
    return fix;
  });
  
  // Fix trailing quote corruption
  const trailingQuotePattern = /(['"`])([^'"]*\d+(?:px|%|em|rem))(['"]+)/g;
  cleanContent = cleanContent.replace(trailingQuotePattern, (match, startQuote, value, corruptedEnd) => {
    fixCount++;
    const fix = `'${value.replace(/['"]/g, '')}'`;
    appliedFixes.push(`Fixed trailing quotes: ${match} → ${fix}`);
    return fix;
  });
  
  // Fix empty quote sequences
  const emptyQuotePattern = /:\s*['"]{2,}/g;
  cleanContent = cleanContent.replace(emptyQuotePattern, (match) => {
    fixCount++;
    const fix = `: ''`;
    appliedFixes.push(`Fixed empty quotes: ${match} → ${fix}`);
    return fix;
  });
  
  // Fix quote sequences (3+ quotes in a row)
  const quoteSequencePattern = /['"]{3,}/g;
  cleanContent = cleanContent.replace(quoteSequencePattern, (match) => {
    fixCount++;
    const fix = `'`;
    appliedFixes.push(`Fixed quote sequence: ${match} → ${fix}`);
    return fix;
  });
  
  return {
    content: cleanContent,
    fixCount,
    fixes: appliedFixes,
    hasChanges: fixCount > 0
  };
}

/**
 * Validate a single project file
 */
async function validateProjectFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const issues = analyzeFileCorruption(filePath, content);
    
    return {
      filePath,
      hasIssues: issues.length > 0,
      issues,
      content,
      fileSize: content.length,
      lineCount: content.split('\n').length
    };
  } catch (error) {
    return {
      filePath,
      hasIssues: true,
      error: error.message,
      issues: [{ type: 'file_error', message: error.message }]
    };
  }
}

/**
 * Fix a corrupted file and create backup
 */
async function fixCorruptedFile(fileData) {
  if (!fileData.hasIssues || fileData.error) {
    return { success: false, reason: 'No issues to fix or file error' };
  }
  
  const result = applyQuoteCorruptionFixes(fileData.content);
  
  if (!result.hasChanges) {
    return { success: false, reason: 'No changes needed after applying fixes' };
  }
  
  // Create backup
  const backupDir = path.join(path.dirname(fileData.filePath), 'backups');
  await fs.ensureDir(backupDir);
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `${path.basename(fileData.filePath, '.tsx')}-corruption-fix-${timestamp}.tsx`);
  
  await fs.writeFile(backupPath, fileData.content);
  
  // Write fixed content
  await fs.writeFile(fileData.filePath, result.content);
  
  return {
    success: true,
    fixCount: result.fixCount,
    fixes: result.fixes,
    backupPath,
    originalSize: fileData.content.length,
    fixedSize: result.content.length
  };
}

/**
 * Main validation and cleanup function
 */
async function validateAndCleanupProjects() {
  log('cyan', '🔍 TASK-64610: Quote/Syntax Corruption Validation');
  log('white', '='.repeat(60));
  
  try {
    // Find all VideoComposition.tsx files
    const projectsDir = path.join(__dirname, 'assets', 'projects');
    const pattern = path.join(projectsDir, '**/src/VideoComposition.tsx');
    
    log('blue', `📁 Scanning projects directory: ${projectsDir}`);
    
    const files = glob.sync(pattern);
    
    if (files.length === 0) {
      log('yellow', '⚠️  No VideoComposition.tsx files found');
      return;
    }
    
    log('white', `📋 Found ${files.length} project files to validate`);
    
    // Validate all files
    const validationResults = [];
    for (const filePath of files) {
      log('blue', `\n🔍 Validating: ${path.relative(projectsDir, filePath)}`);
      const result = await validateProjectFile(filePath);
      validationResults.push(result);
      
      if (result.hasIssues && !result.error) {
        log('yellow', `   ⚠️  ${result.issues.length} issues found`);
        result.issues.forEach(issue => {
          log('white', `   • ${issue.type}: ${issue.match || issue.message} (line ${issue.line || 'N/A'})`);
        });
      } else if (result.error) {
        log('red', `   ❌ Error: ${result.error}`);
      } else {
        log('green', '   ✅ No issues found');
      }
    }
    
    // Summary of validation
    const corruptedFiles = validationResults.filter(r => r.hasIssues && !r.error);
    const errorFiles = validationResults.filter(r => r.error);
    const cleanFiles = validationResults.filter(r => !r.hasIssues && !r.error);
    
    log('cyan', '\n📊 VALIDATION SUMMARY');
    log('white', '='.repeat(30));
    log('green', `✅ Clean files: ${cleanFiles.length}`);
    log('yellow', `⚠️  Corrupted files: ${corruptedFiles.length}`);
    log('red', `❌ Error files: ${errorFiles.length}`);
    log('white', `📈 Total files: ${validationResults.length}`);
    
    // Apply fixes to corrupted files  
    let fixedCount = 0;
    let totalFixes = 0;
    
    if (corruptedFiles.length > 0) {
      log('cyan', '\n🔧 APPLYING FIXES');
      log('white', '='.repeat(20));
      
      for (const fileData of corruptedFiles) {
        log('blue', `\n🛠️  Fixing: ${path.relative(projectsDir, fileData.filePath)}`);
        
        const fixResult = await fixCorruptedFile(fileData);
        
        if (fixResult.success) {
          fixedCount++;
          totalFixes += fixResult.fixCount;
          log('green', `   ✅ Fixed ${fixResult.fixCount} issues`);
          log('white', `   📁 Backup: ${path.relative(projectsDir, fixResult.backupPath)}`);
          
          fixResult.fixes.forEach(fix => {
            log('white', `   • ${fix}`);
          });
        } else {
          log('yellow', `   ⚠️  Skipped: ${fixResult.reason}`);
        }
      }
      
      log('cyan', '\n🎯 FIX SUMMARY');
      log('white', '='.repeat(20));
      log('green', `✅ Files fixed: ${fixedCount}/${corruptedFiles.length}`);
      log('green', `🔧 Total fixes applied: ${totalFixes}`);
    }
    
    // Final validation
    log('cyan', '\n🧪 POST-FIX VALIDATION');
    log('white', '='.repeat(25));
    
    let finalCleanCount = 0;
    let finalIssueCount = 0;
    
    for (const filePath of files) {
      const result = await validateProjectFile(filePath);
      if (result.hasIssues && !result.error) {
        finalIssueCount++;
        log('red', `❌ Still has issues: ${path.relative(projectsDir, filePath)}`);
      } else if (!result.error) {
        finalCleanCount++;
      }
    }
    
    log('green', `✅ Clean files: ${finalCleanCount}/${files.length}`);
    log('red', `❌ Files with remaining issues: ${finalIssueCount}`);
    
    // Generate final report
    const report = {
      timestamp: new Date().toISOString(),
      taskId: 'TASK-64610',
      validationType: 'Quote/Syntax Corruption Cleanup',
      summary: {
        totalFiles: validationResults.length,
        initialCleanFiles: cleanFiles.length,
        initialCorruptedFiles: corruptedFiles.length,
        filesFixed: fixedCount || 0,
        totalFixesApplied: totalFixes || 0,
        finalCleanFiles: finalCleanCount,
        finalIssuesRemaining: finalIssueCount
      },
      detailedResults: validationResults.map(r => ({
        filePath: path.relative(projectsDir, r.filePath),
        hasIssues: r.hasIssues,
        issueCount: r.issues?.length || 0,
        issues: r.issues,
        error: r.error
      }))
    };
    
    const reportPath = path.join(__dirname, 'quote-corruption-cleanup-report.json');
    await fs.writeJson(reportPath, report, { spaces: 2 });
    
    log('blue', `\n📄 Detailed report saved: ${reportPath}`);
    
    // Final status
    if (finalIssueCount === 0) {
      log('green', '\n🎉 SUCCESS: All projects are now clean of quote/syntax corruption!');
      log('white', 'TASK-64610 can be marked as COMPLETED ✅');
      return { success: true, allClean: true, report };
    } else {
      log('yellow', `\n⚠️  ${finalIssueCount} files still have issues that need manual attention`);
      log('white', 'TASK-64610 needs additional work ⚠️');
      return { success: false, allClean: false, report };
    }
    
  } catch (error) {
    log('red', `❌ Validation failed: ${error.message}`);
    console.error(error);
    return { success: false, error: error.message };
  }
}

// Execute validation if run directly
if (require.main === module) {
  validateAndCleanupProjects()
    .then(result => {
      process.exit(result.success && result.allClean ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { validateAndCleanupProjects, analyzeFileCorruption, applyQuoteCorruptionFixes };