// Test the composition transformation logic

const testCode = `import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

export const VideoComposition: React.FC = () => {
  const frame = useCurrentFrame();
  
  return (
    <AbsoluteFill>
      {frame < 120 && <Scene1 />}
      {frame >= 120 && <Scene2 />}
    </AbsoluteFill>
  );
};

const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  return <AbsoluteFill>Scene 1 content</AbsoluteFill>;
};

const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const scene2Frame = frame - 120;
  if (scene2Frame < 0) return null;
  return <AbsoluteFill>Scene 2 content</AbsoluteFill>;
};`;

// Mock logger to avoid import issues
global.logger = {
  debug: console.log,
  info: console.log,
  warn: console.warn,
  error: console.error
};

async function testTransformation() {
  try {
    // Import the transformation functions (this would normally be from the compiled JS)
    const { analyzeCompositionStructure, transformToSeriesStructure } = await import('./src/utils/composition-templates.js');
    
    console.log('🔍 Analyzing composition structure...');
    const analysis = analyzeCompositionStructure(testCode);
    
    console.log('📊 Analysis Results:');
    console.log('  - Multiple scenes:', analysis.hasMultipleScenes);
    console.log('  - Scene count:', analysis.sceneCount);
    console.log('  - Uses Series:', analysis.usesSeries);
    console.log('  - Uses conditional rendering:', analysis.usesConditionalRendering);
    console.log('  - Needs transformation:', analysis.needsTransformation);
    console.log('  - Detected scenes:', analysis.detectedScenes.length);
    
    if (analysis.needsTransformation) {
      console.log('\n🔧 Transforming to Series structure...');
      const transformedCode = transformToSeriesStructure(testCode, analysis);
      
      console.log('\n✅ Transformed Code:');
      console.log('='.repeat(80));
      console.log(transformedCode);
      console.log('='.repeat(80));
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

testTransformation();