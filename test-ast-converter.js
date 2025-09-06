// Test script to run enhanced AST converter on cosmic particle test case
const fs = require('fs');
const path = require('path');

// Import our AST converter (built version)
const { convertArtifactToRemotionAST } = require('./build/ast-converter.js');

async function testASTConverter() {
  console.log('🧪 Testing Enhanced AST Converter');
  console.log('================================\n');

  // Read the test case JSX
  const testJSXPath = path.join(__dirname, 'assets/projects/cosmic-particle-test/src/VideoComposition.tsx');
  
  if (!fs.existsSync(testJSXPath)) {
    console.error('❌ Test JSX file not found:', testJSXPath);
    return;
  }

  const originalJSX = fs.readFileSync(testJSXPath, 'utf-8');
  console.log(`📄 Original JSX (${originalJSX.length} chars):`);
  console.log('---');
  console.log(originalJSX.substring(0, 300) + '...\n');

  try {
    console.log('🔄 Running AST conversion...');
    const convertedJSX = await convertArtifactToRemotionAST(originalJSX);
    
    console.log(`✅ Conversion successful! (${convertedJSX.length} chars)`);
    console.log('---');
    console.log('📄 Converted JSX:');
    console.log(convertedJSX.substring(0, 500) + '...\n');

    // Save converted JSX for inspection
    const outputPath = path.join(__dirname, 'logs/converted-jsx-test.tsx');
    fs.writeFileSync(outputPath, convertedJSX);
    console.log(`📁 Full converted JSX saved to: ${outputPath}\n`);

    // Analysis
    console.log('🔍 Conversion Analysis:');
    console.log('----------------------');
    console.log(`✅ Has Remotion imports: ${convertedJSX.includes('from "remotion"')}`);
    console.log(`✅ Has useCurrentFrame: ${convertedJSX.includes('useCurrentFrame')}`);
    console.log(`❌ Still has useState: ${convertedJSX.includes('useState')}`);
    console.log(`❌ Still has useEffect: ${convertedJSX.includes('useEffect')}`);
    console.log(`✅ Has particles declaration: ${convertedJSX.includes('const particles =')}`);
    console.log(`✅ Has mousePos declaration: ${convertedJSX.includes('const mousePos =')}`);
    console.log(`❌ Still has setParticles: ${convertedJSX.includes('setParticles')}`);
    console.log(`❌ Still has handleMouseMove: ${convertedJSX.includes('handleMouseMove')}`);
    console.log(`❌ Still has onMouseMove: ${convertedJSX.includes('onMouseMove')}`);
    
    console.log('\n🎯 Expected Frame-Based Code Patterns:');
    console.log('--------------------------------------');
    if (convertedJSX.includes('Array.from({ length: 20 }')) {
      console.log('✅ Frame-based particles array detected');
    } else {
      console.log('❌ Frame-based particles array NOT found');
    }
    
    if (convertedJSX.includes('{ x: 400, y: 300 }')) {
      console.log('✅ Static mousePos object detected');
    } else {
      console.log('❌ Static mousePos object NOT found');
    }

    if (convertedJSX.includes('Math.sin') && convertedJSX.includes('Math.cos')) {
      console.log('✅ Frame-based animation functions detected');
    } else {
      console.log('❌ Frame-based animation functions NOT found');
    }

  } catch (error) {
    console.error('❌ AST conversion failed:', error.message);
    console.error('Stack:', error.stack);
  }

  // Check log file
  const logPath = path.join(__dirname, 'logs/ast-debug.log');
  if (fs.existsSync(logPath)) {
    console.log('\n📋 AST Debug Log (last 20 lines):');
    console.log('----------------------------------');
    const logContent = fs.readFileSync(logPath, 'utf-8');
    const lines = logContent.split('\n');
    const lastLines = lines.slice(-20).join('\n');
    console.log(lastLines);
  }
}

testASTConverter().catch(console.error);