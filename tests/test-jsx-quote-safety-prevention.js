// JSX Quote Safety Prevention Testing Framework
// Comprehensive testing to prevent future quote escaping issues

const { validateJSXQuoteSafety, generateSafeFontFamily } = require('./build/jsx-quote-safety-validator');
const { enhanceJSXThroughAST } = require('./build/ast-design-prism');

console.log('🧪 JSX Quote Safety Prevention Testing Framework');
console.log('='.repeat(60));

// Test Cases for Quote Safety Issues
const testCases = [
  {
    name: 'Font Family Quote Escaping (Original Bug)',
    jsx: `<div style={{fontFamily: 'SF Pro Display'", -apple-system, BlinkMacSystemFont, sans-serif'}}>Test</div>`,
    expectedIssues: ['quote-escape'],
    shouldFail: true
  },
  {
    name: 'Mixed Quote Styles',
    jsx: `<div style={{fontFamily: '"Inter", \'SF Pro Display\', system-ui'}}>Test</div>`,
    expectedIssues: ['embedded-quotes'],
    shouldFail: true
  },
  {
    name: 'CSS Unit Corruption',
    jsx: `<div style={{fontSize: '16pxpx', margin: '10%%'}}>Test</div>`,
    expectedIssues: ['css-corruption'],
    shouldFail: false // Medium severity
  },
  {
    name: 'Safe Font Family',
    jsx: `<div style={{fontFamily: 'Inter, SF Pro Display, system-ui, sans-serif'}}>Test</div>`,
    expectedIssues: [],
    shouldFail: false
  },
  {
    name: 'Complex Safe JSX',
    jsx: `
      <AbsoluteFill style={{
        fontFamily: 'Roboto, Helvetica Neue, sans-serif',
        fontSize: '18px',
        display: 'flex',
        gap: '24px'
      }}>
        <div>Content</div>
      </AbsoluteFill>
    `,
    expectedIssues: [],
    shouldFail: false
  }
];

// Prevention Tests
async function runPreventionTests() {
  console.log('🔍 Running Quote Safety Prevention Tests...\n');
  
  let passed = 0;
  let failed = 0;
  
  for (const testCase of testCases) {
    console.log(`Testing: ${testCase.name}`);
    console.log('-'.repeat(40));
    
    try {
      const result = validateJSXQuoteSafety(testCase.jsx);
      
      console.log(`Issues Found: ${result.issues.length}`);
      if (result.issues.length > 0) {
        result.issues.forEach(issue => {
          console.log(`  - ${issue.severity}: ${issue.type} in ${issue.property}`);
          console.log(`    ${issue.description}`);
          console.log(`    Fix: ${issue.suggestedFix}`);
        });
      }
      
      console.log(`Validation Passed: ${result.validationPassed}`);
      console.log(`Has Corrections: ${result.correctedJSX !== testCase.jsx}`);
      
      // Check if test behaved as expected
      const hasExpectedIssues = testCase.expectedIssues.every(expectedType => 
        result.issues.some(issue => issue.type === expectedType)
      );
      
      const validationMatchesExpectation = testCase.shouldFail ? 
        !result.validationPassed : result.validationPassed;
      
      if (hasExpectedIssues && validationMatchesExpectation) {
        console.log('✅ PASS - Test behaved as expected');
        passed++;
      } else {
        console.log('❌ FAIL - Test did not behave as expected');
        console.log(`   Expected Issues: ${testCase.expectedIssues.join(', ')}`);
        console.log(`   Should Fail: ${testCase.shouldFail}`);
        failed++;
      }
      
    } catch (error) {
      console.log('💥 ERROR - Test threw exception:', error.message);
      failed++;
    }
    
    console.log('');
  }
  
  console.log('📊 Prevention Test Results:');
  console.log(`✅ Passed: ${passed}/${testCases.length}`);
  console.log(`❌ Failed: ${failed}/${testCases.length}`);
  console.log(`🎯 Success Rate: ${Math.round(passed / testCases.length * 100)}%`);
  
  return { passed, failed, total: testCases.length };
}

// AST Enhancement Integration Tests
async function runASTPreventionTests() {
  console.log('\n🔬 AST Enhancement Integration Tests...\n');
  
  const testJSX = `
    <AbsoluteFill style={{
      fontFamily: 'Arial',
      fontSize: '14px',
      display: 'flex'
    }}>
      <div>Test Content</div>
    </AbsoluteFill>
  `;
  
  console.log('Input JSX (with problematic Arial font):');
  console.log(testJSX);
  console.log('');
  
  try {
    console.log('Running AST Enhancement with Quote Safety Integration...');
    const result = enhanceJSXThroughAST(testJSX);
    
    console.log('✅ AST Enhancement Result:');
    console.log(`Enhancements Applied: ${result.enhancements.length}`);
    result.enhancements.forEach((enhancement, i) => {
      console.log(`  ${i + 1}. ${enhancement}`);
    });
    
    console.log('\nStyle Detection:');
    console.log(`Detected: ${result.styleDetected.detected} (${result.styleDetected.confidence}% confidence)`);
    console.log(`Characteristics: ${result.styleDetected.characteristics.join(', ')}`);
    
    // Test the enhanced JSX for quote safety
    console.log('\nRunning Quote Safety Check on Enhanced JSX...');
    const safetyCheck = validateJSXQuoteSafety(result.enhancedJSX);
    
    if (safetyCheck.isValid) {
      console.log('✅ Enhanced JSX passes quote safety validation');
    } else {
      console.log('⚠️  Enhanced JSX has quote safety issues:');
      safetyCheck.issues.forEach(issue => {
        console.log(`  - ${issue.severity}: ${issue.description}`);
      });
    }
    
    return { 
      success: true, 
      enhancementsApplied: result.enhancements.length,
      quoteSafetyPassed: safetyCheck.isValid
    };
    
  } catch (error) {
    console.log('💥 AST Enhancement Test Failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Safe Font Family Generation Tests
function runFontFamilyGenerationTests() {
  console.log('\n🔤 Font Family Generation Safety Tests...\n');
  
  const testFonts = [
    ['Inter', 'SF Pro Display', 'system-ui', 'sans-serif'],
    ['Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
    ['Poppins', 'Montserrat', 'Georgia', 'serif'],
    ['"Times New Roman"', 'serif'], // Test with existing quotes
    ['Font With Spaces', 'Regular Font'] // Test with spaces
  ];
  
  testFonts.forEach((fonts, index) => {
    console.log(`Test ${index + 1}: [${fonts.join(', ')}]`);
    
    try {
      const safeFontFamily = generateSafeFontFamily(fonts);
      console.log(`Result: '${safeFontFamily}'`);
      
      // Check for quote safety
      const hasProblematicQuotes = safeFontFamily.includes('"') && safeFontFamily.includes("'");
      if (hasProblematicQuotes) {
        console.log('⚠️  WARNING: Generated font family may have quote issues');
      } else {
        console.log('✅ SAFE: No quote conflicts detected');
      }
      
    } catch (error) {
      console.log('❌ ERROR:', error.message);
    }
    
    console.log('');
  });
}

// Main Test Runner
async function main() {
  try {
    // Run all prevention tests
    const preventionResults = await runPreventionTests();
    const astResults = await runASTPreventionTests();
    runFontFamilyGenerationTests();
    
    // Overall summary
    console.log('🎯 OVERALL PREVENTION SYSTEM STATUS:');
    console.log('='.repeat(50));
    console.log(`Quote Safety Tests: ${preventionResults.passed}/${preventionResults.total} passed`);
    console.log(`AST Integration: ${astResults.success ? 'WORKING' : 'FAILED'}`);
    console.log(`Font Generation: IMPLEMENTED`);
    
    const overallSuccess = preventionResults.failed === 0 && astResults.success;
    console.log(`\n🏆 Prevention System Status: ${overallSuccess ? '✅ OPERATIONAL' : '❌ NEEDS ATTENTION'}`);
    
    if (overallSuccess) {
      console.log('\n✨ JSX Quote Safety Prevention System is fully operational!');
      console.log('   All future font family quote escaping issues should be prevented.');
    } else {
      console.log('\n⚠️  Some prevention tests failed - review system before deployment.');
    }
    
  } catch (error) {
    console.error('💥 Prevention test framework failed:', error);
    process.exit(1);
  }
}

// Execute tests
if (require.main === module) {
  main();
}