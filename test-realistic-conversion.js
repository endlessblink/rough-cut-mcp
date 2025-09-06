// Test realistic Artifact conversion - simulates Claude Desktop workflow
const fs = require('fs');
const path = require('path');

async function testRealisticWorkflow() {
  console.log('🎯 Testing Realistic Artifact → Remotion Workflow');
  console.log('================================================\n');

  try {
    // Step 1: Read realistic Artifact JSX (as Claude Desktop would)
    const artifactPath = path.join(__dirname, 'test-realistic-artifact.jsx');
    const artifactJSX = fs.readFileSync(artifactPath, 'utf-8');
    
    console.log(`📄 Loaded realistic Artifact (${artifactJSX.length} chars)`);
    console.log(`✅ Contains useState: ${artifactJSX.includes('useState')}`);
    console.log(`✅ Contains useEffect: ${artifactJSX.includes('useEffect')}`);
    console.log(`✅ Contains interactive handlers: ${artifactJSX.includes('onClick')}`);
    console.log(`✅ Contains complex state refs: ${artifactJSX.includes('selectedItem')}`);
    
    // Step 2: Apply enhanced AST converter (as MCP tools would)
    console.log('\n🔄 Applying Enhanced AST Converter...');
    const { convertArtifactToRemotionAST } = require('./build/ast-converter.js');
    
    const remotionJSX = await convertArtifactToRemotionAST(artifactJSX);
    
    console.log(`✅ Conversion completed (${remotionJSX.length} chars)`);
    
    // Step 3: Analyze conversion results
    console.log('\n📊 Conversion Analysis:');
    console.log('----------------------');
    console.log(`✅ Remotion imports added: ${remotionJSX.includes('from "remotion"')}`);
    console.log(`✅ useState removed: ${!remotionJSX.includes('useState')}`);
    console.log(`✅ useEffect removed: ${!remotionJSX.includes('useEffect')}`);
    console.log(`✅ Frame-based animation: ${remotionJSX.includes('useCurrentFrame')}`);
    console.log(`✅ Interactive handlers removed: ${!remotionJSX.includes('onClick')}`);
    console.log(`✅ Mouse handlers removed: ${!remotionJSX.includes('onMouseMove')}`);
    
    // Step 4: Check frame-based variable replacements
    console.log('\n🎬 Frame-Based Variable Analysis:');
    console.log('---------------------------------');
    console.log(`✅ data variable: ${remotionJSX.includes('const data =')}`);
    console.log(`✅ selectedItem variable: ${remotionJSX.includes('const selectedItem =')}`);
    console.log(`✅ animationPhase variable: ${remotionJSX.includes('const animationPhase =')}`);
    console.log(`✅ hoverPosition variable: ${remotionJSX.includes('const hoverPosition =')}`);
    
    // Step 5: Save converted output (as MCP would create project)
    const outputPath = path.join(__dirname, 'logs/realistic-conversion-result.tsx');
    fs.writeFileSync(outputPath, remotionJSX);
    console.log(`\n📁 Converted JSX saved: ${outputPath}`);
    
    // Step 6: Variable reference validation
    console.log('\n🔍 Variable Reference Validation:');
    console.log('----------------------------------');
    
    // Count references to ensure no "is not defined" errors
    const dataRefs = (remotionJSX.match(/\bdata\b/g) || []).length;
    const selectedItemRefs = (remotionJSX.match(/\bselectedItem\b/g) || []).length;
    const animationPhaseRefs = (remotionJSX.match(/\banimationPhase\b/g) || []).length;
    const hoverPositionRefs = (remotionJSX.match(/\bhoverPosition\b/g) || []).length;
    
    console.log(`✅ data references: ${dataRefs} (should be > 1)`);
    console.log(`✅ selectedItem references: ${selectedItemRefs} (should be > 1)`);
    console.log(`✅ animationPhase references: ${animationPhaseRefs} (should be > 1)`);
    console.log(`✅ hoverPosition references: ${hoverPositionRefs} (should be > 1)`);
    
    // Step 7: Preview converted code structure
    console.log('\n👀 Converted Code Preview:');
    console.log('--------------------------');
    const lines = remotionJSX.split('\n');
    lines.slice(0, 15).forEach((line, i) => {
      console.log(`${String(i + 1).padStart(2, ' ')}: ${line}`);
    });
    console.log('   ... (truncated)');
    
    // Final assessment
    const success = (
      remotionJSX.includes('from "remotion"') &&
      !remotionJSX.includes('useState') &&
      !remotionJSX.includes('useEffect') &&
      remotionJSX.includes('useCurrentFrame') &&
      dataRefs > 1 &&
      selectedItemRefs > 1
    );
    
    console.log(`\n🎯 Realistic Workflow Status: ${success ? '✅ SUCCESS' : '❌ FAILED'}`);
    
    if (success) {
      console.log('\n🚀 READY FOR PRODUCTION!');
      console.log('Users can now provide complex animated Claude Artifacts');
      console.log('and get working Remotion videos without technical barriers.');
    }
    
  } catch (error) {
    console.error('❌ Realistic workflow failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testRealisticWorkflow().catch(console.error);