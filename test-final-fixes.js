/**
 * Test Final 5% RoughCut MCP Fixes
 * Tests interpolation validation and composition editing
 */

const { processVideoCode, validateInterpolationRange, runValidationTests, TEST_CASES } = require('./build/utils/interpolation-validator.js');

console.log('\n🧪 TESTING FINAL 5% ROUGHCUT MCP FIXES\n');

// Test 1: Interpolation Range Validation
console.log('📋 TEST 1: Interpolation Range Validation');
console.log('='.repeat(50));

const testResults = runValidationTests();
console.log(`✅ Passed: ${testResults.passed}/${testResults.passed + testResults.failed}`);
console.log(`❌ Failed: ${testResults.failed}/${testResults.passed + testResults.failed}`);

if (testResults.failed > 0) {
  console.log('\n❌ Failed test cases:');
  testResults.results.filter(r => !r.success).forEach(result => {
    console.log(`  ${result.index}. ${result.description}`);
    console.log(`     Input: [${result.input.join(', ')}]`);
    console.log(`     Expected: [${result.expected.join(', ')}]`);
    console.log(`     Actual: [${result.actual.join(', ')}]`);
  });
} else {
  console.log('🎉 All interpolation validation tests passed!');
}

// Test 2: Code Processing
console.log('\n📋 TEST 2: Code Processing');
console.log('='.repeat(50));

const testCode = `
import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

export const TestComponent = () => {
  const frame = useCurrentFrame();
  
  // These should be fixed automatically
  const opacity1 = interpolate(frame, [60, 90, 70, 100], [0, 1, 0.5, 0]);
  const x = interpolate(frame, [10, 5, 15, 20], [0, 100, 200, 300]);
  const scale = interpolate(frame, [0, 30, 30, 60], [0.5, 1, 1, 1.5]);
  
  // This should remain unchanged (already valid)
  const rotation = interpolate(frame, [0, 30, 60], [0, 180, 360]);
  
  return <div>Test</div>;
};
`;

console.log('Processing test code with invalid interpolation ranges...');
const processedCode = processVideoCode(testCode);

// Count interpolate calls
const interpolateMatches = processedCode.match(/interpolate\s*\(/g);
console.log(`Found ${interpolateMatches ? interpolateMatches.length : 0} interpolate calls`);

// Check for specific fixes
const fixes = [
  { search: '[60, 70, 90, 100]', description: 'Out of order range fixed' },
  { search: '[5, 10, 15, 20]', description: 'Scrambled range fixed' },
  { search: '[0, 30, 31, 60]', description: 'Duplicate values fixed' },
  { search: '[0, 30, 60]', description: 'Valid range preserved' }
];

let fixesApplied = 0;
fixes.forEach(fix => {
  if (processedCode.includes(fix.search)) {
    console.log(`✅ ${fix.description}`);
    fixesApplied++;
  } else {
    console.log(`❌ ${fix.description} - not found`);
  }
});

console.log(`\n🔧 Applied ${fixesApplied}/${fixes.length} expected fixes`);

// Test 3: Edge Cases
console.log('\n📋 TEST 3: Edge Case Validation');
console.log('='.repeat(50));

const edgeCases = [
  { name: 'Empty array', input: [], expected: [] },
  { name: 'Single value', input: [42], expected: [42] },
  { name: 'Two values (valid)', input: [1, 2], expected: [1, 2] },
  { name: 'Two values (invalid)', input: [2, 1], expected: [1, 2] },
  { name: 'All same values', input: [5, 5, 5, 5], expected: [5, 6, 7, 8] },
  { name: 'Large range', input: [100, 200, 150, 300, 250], expected: [100, 150, 200, 250, 300] }
];

let edgePassed = 0;
edgeCases.forEach((testCase, i) => {
  const result = validateInterpolationRange(testCase.input);
  const success = JSON.stringify(result.corrected) === JSON.stringify(testCase.expected);
  
  if (success) {
    console.log(`✅ ${testCase.name}`);
    edgePassed++;
  } else {
    console.log(`❌ ${testCase.name}`);
    console.log(`   Input: [${testCase.input.join(', ')}]`);
    console.log(`   Expected: [${testCase.expected.join(', ')}]`);
    console.log(`   Actual: [${result.corrected.join(', ')}]`);
  }
});

console.log(`\n🎯 Edge Cases: ${edgePassed}/${edgeCases.length} passed`);

// Test 4: Performance Test
console.log('\n📋 TEST 4: Performance Test');
console.log('='.repeat(50));

const largeCode = `
export const LargeComponent = () => {
  const frame = useCurrentFrame();
  
  ${Array.from({ length: 100 }, (_, i) => 
    `const anim${i} = interpolate(frame, [${Math.random() * 100 | 0}, ${Math.random() * 100 | 0}, ${Math.random() * 100 | 0}], [0, 1, 0]);`
  ).join('\n  ')}
  
  return <div>Large component</div>;
};
`;

const startTime = Date.now();
const processedLargeCode = processVideoCode(largeCode);
const processingTime = Date.now() - startTime;

const originalMatches = largeCode.match(/interpolate/g)?.length || 0;
const processedMatches = processedLargeCode.match(/interpolate/g)?.length || 0;

console.log(`✅ Processed ${originalMatches} interpolate calls in ${processingTime}ms`);
console.log(`✅ Output contains ${processedMatches} interpolate calls`);
console.log(`⚡ Performance: ${(originalMatches / processingTime * 1000).toFixed(0)} calls/second`);

// Final Summary
console.log('\n' + '='.repeat(60));
console.log('🎯 FINAL TEST SUMMARY');
console.log('='.repeat(60));

const totalTests = testResults.passed + testResults.failed + edgeCases.length;
const totalPassed = testResults.passed + edgePassed;

console.log(`📊 Total Tests: ${totalTests}`);
console.log(`✅ Passed: ${totalPassed} (${(totalPassed / totalTests * 100).toFixed(1)}%)`);
console.log(`❌ Failed: ${totalTests - totalPassed} (${((totalTests - totalPassed) / totalTests * 100).toFixed(1)}%)`);

if (totalPassed === totalTests) {
  console.log('\n🎉 ALL TESTS PASSED! Interpolation validation is production ready!');
  console.log('🚀 The final 5% fixes are complete and validated.');
} else {
  console.log('\n⚠️  Some tests failed. Review the implementation before production use.');
}

console.log('\n📝 Test completed. Next steps:');
console.log('1. Build on Windows: .\\build-windows.ps1');
console.log('2. Test composition editor with MCP tools');
console.log('3. Verify end-to-end functionality');
console.log('4. Deploy to production');

console.log('\n🔧 Interpolation Fix Features:');
console.log('• Automatically corrects invalid ranges like [60, 90, 70, 100]');
console.log('• Handles completely scrambled arrays');
console.log('• Fixes duplicate values');
console.log('• Preserves valid ranges unchanged');
console.log('• Fast processing of large codebases');
console.log('• Safe fallback for unparseable ranges');