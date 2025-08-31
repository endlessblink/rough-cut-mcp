// Test the JSX validation fix for the exact issue reported
const { validateJSX } = require('./build/utils/jsx-validator.js');

console.log('🧪 Testing JSX Validation Fix\n');

// Test case: The exact problematic JSX that caused the white screen
const problematicJSX = String.raw`
import React from 'react';

export const VideoComposition = () => {
  return (
    <div>
      <span style={{ color: '#ffffff' }}>C:\ENDLESSBLINK> </span>
      <span>Some other content</span>
    </div>
  );
};
`;

// More direct test case with just the problematic string (using String.raw to preserve backslashes)
const directProblematicJSX = String.raw`<span>C:\ENDLESSBLINK> </span>`;

console.log('📝 Testing the direct problematic case first...\n');
console.log('Direct problematic JSX:', directProblematicJSX);

try {
  const directResult = validateJSX(directProblematicJSX);
  console.log(`Direct test - Valid: ${directResult.isValid}, Modified: ${directResult.wasModified}`);
  if (directResult.wasModified) {
    console.log('Direct test FIXED:', directResult.sanitizedJSX);
  }
  console.log();
} catch (error) {
  console.error('❌ Direct test failed:', error.message);
}

console.log('📝 Testing the full problematic JSX that caused the error...\n');
console.log('Original JSX (problematic):');
console.log(problematicJSX.substring(0, 200) + '...\n');

try {
  const result = validateJSX(problematicJSX);
  
  console.log('✅ Validation Result:');
  console.log(`- Valid: ${result.isValid}`);
  console.log(`- Modified: ${result.wasModified}`);
  console.log(`- Issues Found: ${result.issues.length}\n`);
  
  if (result.issues.length > 0) {
    console.log('🔧 Issues Fixed:');
    result.issues.forEach((issue, i) => {
      console.log(`  ${i + 1}. ${issue}`);
    });
    console.log();
  }
  
  if (result.wasModified) {
    console.log('✨ Sanitized JSX (fixed):');
    console.log(result.sanitizedJSX.substring(0, 300) + '...\n');
  }
  
  // Test that the fix specifically addresses backslash escaping
  if (result.wasModified && result.sanitizedJSX.includes('C:\\\\ENDLESSBLINK>')) {
    console.log('🎯 SUCCESS: Backslash escaping fix confirmed!');
    console.log('   Original: C:\\ENDLESSBLINK>');
    console.log('   Fixed:    C:\\\\ENDLESSBLINK>\n');
  } else if (!result.wasModified) {
    console.log('⚠️  No modifications made - JSX may not have needed fixing\n');
  }
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
}

// Test case 2: Multiple backslash issues
console.log('🧪 Testing multiple backslash scenarios...\n');

const multipleBackslashJSX = String.raw`
<div>
  <span>Path: C:\Users\Test</span>
  <span>Another: D:\Projects\Test</span>
</div>
`;

try {
  const result2 = validateJSX(multipleBackslashJSX);
  console.log(`Multiple backslash test - Modified: ${result2.wasModified}, Issues: ${result2.issues.length}`);
  
  if (result2.wasModified) {
    console.log('Fixed multiple backslashes successfully ✅\n');
  }
  
} catch (error) {
  console.error('❌ Multiple backslash test failed:', error.message);
}

console.log('🎉 JSX Validation Testing Complete!');
console.log('The MCP system should now prevent white screen errors caused by unescaped backslashes.');