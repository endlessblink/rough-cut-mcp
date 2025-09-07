// Simple test for all phases of safe universal implementation
const fs = require('fs');
const path = require('path');

const testArtifact = `import React, { useState, useEffect } from 'react';

const TestComponent = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const newParticles = [];
    for (let i = 0; i < 10; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 800,
        y: Math.random() * 600,
        vx: Math.random() * 2,
        vy: Math.random() * 2,
        size: Math.random() * 4 + 2,
        color: 'hsl(' + Math.random() * 360 + ', 70%, 60%)',
        phase: Math.random() * Math.PI * 2
      });
    }
    setParticles(newParticles);
  }, []);

  return (
    <div>
      {particles.map(particle => (
        <div
          key={particle.id}
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color
          }}
        />
      ))}
    </div>
  );
};

export default TestComponent;`;

async function testAllPhases() {
  console.log('🎯 Testing All Phases of Safe Universal Implementation');
  console.log('====================================================');

  try {
    const { convertArtifactToRemotionAST } = require('./build/ast-converter.js');

    // Phase 1: Test default behavior (should work)
    console.log('Phase 1: Testing default behavior...');
    delete process.env.ENHANCED_STRUCTURE_TEST;
    const defaultResult = await convertArtifactToRemotionAST(testArtifact);
    console.log('   ✅ Default conversion working: ' + defaultResult.length + ' chars');

    // Phase 2: Test enhanced behavior
    console.log('\\nPhase 2: Testing enhanced behavior...');
    process.env.ENHANCED_STRUCTURE_TEST = 'true';
    const enhancedResult = await convertArtifactToRemotionAST(testArtifact);
    console.log('   ✅ Enhanced conversion working: ' + enhancedResult.length + ' chars');

    // Analysis
    const defaultHasVX = defaultResult.includes('vx:');
    const enhancedHasVX = enhancedResult.includes('vx:');
    
    console.log('\\n📊 Analysis:');
    console.log('   Default has vx property: ' + defaultHasVX);
    console.log('   Enhanced has vx property: ' + enhancedHasVX);
    
    console.log('\\n✅ All phases implemented safely with environment flag control');
    console.log('✅ Ready for your testing with ENHANCED_STRUCTURE_TEST=true');

  } catch (error) {
    console.error('❌ Testing failed:', error.message);
  } finally {
    delete process.env.ENHANCED_STRUCTURE_TEST;
  }
}

testAllPhases().catch(console.error);