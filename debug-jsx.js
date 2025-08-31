// Debug the JSX validation to understand why it's not working
const testString = String.raw`<span>C:\ENDLESSBLINK> </span>`;

console.log('🐛 Debugging JSX Validation');
console.log('Test string:', JSON.stringify(testString));
console.log('Test string length:', testString.length);
console.log('Contains backslash:', testString.includes('\\'));
console.log('Character codes:');

for (let i = 0; i < testString.length; i++) {
  const char = testString[i];
  if (char === '\\' || char === 'C' || char === 'E' || char === '>') {
    console.log(`  Position ${i}: '${char}' (code: ${char.charCodeAt(0)})`);
  }
}

// Test the regex directly
console.log('\n🔍 Testing regex patterns:');

// My current regex
const myRegex = /(['"])((?:\\.|[^\\])*?)\1/g;
const matches = [...testString.matchAll(myRegex)];
console.log('My regex matches:', matches.length);

matches.forEach((match, i) => {
  console.log(`  Match ${i}: ${JSON.stringify(match[0])} -> content: ${JSON.stringify(match[2])}`);
  if (match[2] && match[2].includes('\\')) {
    console.log(`    Contains backslash, would need fixing`);
  }
});

// Simpler test
const simpleRegex = /"([^"]*)"/g;
const simpleMatches = [...testString.matchAll(simpleRegex)];
console.log('\nSimple regex matches:', simpleMatches.length);

simpleMatches.forEach((match, i) => {
  console.log(`  Simple match ${i}: ${JSON.stringify(match[0])} -> content: ${JSON.stringify(match[1])}`);
});

// Test the actual replacement
console.log('\n🔧 Testing replacement:');
let result = testString;
result = result.replace(/(['"])((?:\\.|[^\\])*?)\1/g, (match, quote, content) => {
  console.log(`Processing: ${JSON.stringify(match)} with content: ${JSON.stringify(content)}`);
  if (content.includes('\\')) {
    let fixedContent = content.replace(/\\(?!\\)/g, '\\\\');
    console.log(`  Fixed content: ${JSON.stringify(fixedContent)}`);
    return quote + fixedContent + quote;
  }
  return match;
});

console.log('Final result:', JSON.stringify(result));