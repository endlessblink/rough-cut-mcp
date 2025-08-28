// Test the interpolation validator to ensure it's not too aggressive
const path = require('path');
const { validateInterpolationRange, validateRangePair, isValidRange } = require('./build/utils/interpolation-validator.js');

console.log('================================================');
console.log('   INTERPOLATION VALIDATOR TEST SUITE');
console.log('================================================\n');

let passed = 0;
let failed = 0;

function test(name, input, expected, fn = validateInterpolationRange) {
  const result = fn(input);
  const pass = JSON.stringify(result) === JSON.stringify(expected);
  
  if (pass) {
    console.log(`✅ PASS: ${name}`);
    console.log(`   Input:    ${JSON.stringify(input)}`);
    console.log(`   Output:   ${JSON.stringify(result)}`);
    passed++;
  } else {
    console.log(`❌ FAIL: ${name}`);
    console.log(`   Input:    ${JSON.stringify(input)}`);
    console.log(`   Expected: ${JSON.stringify(expected)}`);
    console.log(`   Got:      ${JSON.stringify(result)}`);
    failed++;
  }
  console.log();
}

console.log('=== TESTING validateInterpolationRange ===\n');

// Test 1: Already valid ranges should NOT be changed
test('Valid ascending range [0, 30, 60, 90]', 
  [0, 30, 60, 90], 
  [0, 30, 60, 90]
);

test('Valid ascending range [0, 100, 200]', 
  [0, 100, 200], 
  [0, 100, 200]
);

// Test 2: Single value should remain unchanged
test('Single value [42]', 
  [42], 
  [42]
);

// Test 3: Empty array should remain unchanged
test('Empty array []', 
  [], 
  []
);

// Test 4: Fix duplicate values
test('Duplicates [0, 30, 30, 90]', 
  [0, 30, 30, 90], 
  [0, 30, 31, 90]
);

// Test 5: Fix decreasing values (the original problem)
test('Non-monotonic [60, 90, 70, 90]', 
  [60, 90, 70, 90], 
  [60, 90, 91, 92]
);

// Test 6: Fix multiple issues
test('Multiple issues [0, 50, 40, 40, 100]', 
  [0, 50, 40, 40, 100], 
  [0, 50, 51, 52, 100]
);

// Test 7: All same values
test('All same [30, 30, 30, 30]', 
  [30, 30, 30, 30], 
  [30, 31, 32, 33]
);

// Test 8: Negative values should work
test('Negative values [-100, -50, 0, 50]', 
  [-100, -50, 0, 50], 
  [-100, -50, 0, 50]
);

// Test 9: Large jumps should be preserved
test('Large jumps [0, 1000, 2000]', 
  [0, 1000, 2000], 
  [0, 1000, 2000]
);

console.log('\n=== TESTING isValidRange ===\n');

function testValid(name, input, expected) {
  const result = isValidRange(input);
  const pass = result === expected;
  
  if (pass) {
    console.log(`✅ PASS: ${name}`);
    console.log(`   Input: ${JSON.stringify(input)} -> ${result}`);
    passed++;
  } else {
    console.log(`❌ FAIL: ${name}`);
    console.log(`   Input: ${JSON.stringify(input)}`);
    console.log(`   Expected: ${expected}, Got: ${result}`);
    failed++;
  }
  console.log();
}

testValid('Valid range [0, 30, 60]', [0, 30, 60], true);
testValid('Invalid range [0, 30, 30]', [0, 30, 30], false);
testValid('Invalid range [60, 90, 70]', [60, 90, 70], false);
testValid('Single value [42]', [42], true);
testValid('Empty array []', [], true);

console.log('\n=== TESTING REAL REMOTION SCENARIOS ===\n');

// Common Remotion animation patterns
test('Fade in [0, 30] frames',
  [0, 30],
  [0, 30]
);

test('Complex animation keyframes [0, 30, 60, 120, 150]',
  [0, 30, 60, 120, 150],
  [0, 30, 60, 120, 150]
);

test('Bounce effect frames [0, 15, 30, 45, 60]',
  [0, 15, 30, 45, 60],
  [0, 15, 30, 45, 60]
);

// Edge case that might happen with dynamic calculations
test('Calculated frames that overlap [0, 30, 25, 60]',
  [0, 30, 25, 60],
  [0, 30, 31, 60]
);

console.log('\n=== TESTING validateRangePair ===\n');

function testPair(name, inputRange, outputRange, expectedInput, expectedOutput) {
  const result = validateRangePair(inputRange, outputRange);
  const passInput = JSON.stringify(result.input) === JSON.stringify(expectedInput);
  const passOutput = JSON.stringify(result.output) === JSON.stringify(expectedOutput);
  
  if (passInput && passOutput) {
    console.log(`✅ PASS: ${name}`);
    console.log(`   Input Range:  ${JSON.stringify(inputRange)} -> ${JSON.stringify(result.input)}`);
    console.log(`   Output Range: ${JSON.stringify(outputRange)} -> ${JSON.stringify(result.output)}`);
    passed++;
  } else {
    console.log(`❌ FAIL: ${name}`);
    console.log(`   Input Range:  Expected ${JSON.stringify(expectedInput)}, Got ${JSON.stringify(result.input)}`);
    console.log(`   Output Range: Expected ${JSON.stringify(expectedOutput)}, Got ${JSON.stringify(result.output)}`);
    failed++;
  }
  console.log();
}

testPair('Valid pair with same length',
  [0, 30, 60], [0, 0.5, 1],
  [0, 30, 60], [0, 0.5, 1]
);

testPair('Fix input range, preserve output',
  [0, 30, 30], [0, 0.5, 1],
  [0, 30, 31], [0, 0.5, 1]
);

testPair('Mismatched lengths - output too short',
  [0, 30, 60], [0, 1],
  [0, 30, 60], [0, 1, 1]
);

testPair('Mismatched lengths - output too long',
  [0, 30], [0, 0.5, 1],
  [0, 30], [0, 0.5]
);

console.log('\n================================================');
console.log('   TEST RESULTS');
console.log('================================================');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`Total: ${passed + failed}`);
console.log(`Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

if (failed === 0) {
  console.log('\n🎉 ALL TESTS PASSED! The validator is working correctly.');
  console.log('   - It preserves valid ranges');
  console.log('   - It only fixes invalid monotonic issues');
  console.log('   - It handles edge cases properly');
  process.exit(0);
} else {
  console.log('\n⚠️ SOME TESTS FAILED! Review the validator logic.');
  process.exit(1);
}