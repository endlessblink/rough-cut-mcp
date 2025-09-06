// Test complete enhanced mode with visual similarity preservation
const fs = require('fs');
const path = require('path');

// Your exact artifact that showed no visual similarity
const floatingParticlesArtifact = `import React, { useState, useEffect } from 'react';

const FloatingParticlesAnimation = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(prev => prev + 0.016); // ~60fps
    }, 16);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height
    });
  };

  // Generate particle data
  const particles = Array.from({ length: 20 }, (_, i) => {
    const phase = (i * 0.3) + time * 0.5;
    const mouseInfluence = 0.1;
    
    return {
      id: i,
      x: 50 + Math.sin(phase) * 30 + (mousePos.x - 0.5) * mouseInfluence * 100,
      y: 50 + Math.cos(phase * 0.7) * 25 + (mousePos.y - 0.5) * mouseInfluence * 100,
      scale: 0.8 + Math.sin(phase * 2) * 0.4,
      rotation: time * 20 + i * 18,
      opacity: 0.6 + Math.sin(phase * 1.5) * 0.3,
      hue: (time * 30 + i * 25) % 360
    };
  });

  return (
    <div className="w-full h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 overflow-hidden cursor-none relative">
      {particles.map((particle) => (
        <div
          key={particle.id}
          style={{
            left: particle.x + '%',
            top: particle.y + '%',
            width: particle.scale * 12 + 'px',
            height: particle.scale * 12 + 'px',
            backgroundColor: 'hsl(' + particle.hue + ', 80%, 70%)',
            opacity: particle.opacity,
            transform: 'rotate(' + particle.rotation + 'deg)'
          }}
        />
      ))}
    </div>
  );
};

export default FloatingParticlesAnimation;`;

async function testCompleteEnhanced() {
  console.log('🎯 Testing Complete Enhanced Mode for Visual Similarity');
  console.log('=====================================================');
  console.log('Expected improvements: Animated mousePos + proper time + preserved computed array\n');

  try {
    const { convertArtifactToRemotionAST } = require('./build/ast-converter.js');

    // Test with enhanced mode active (already set in Claude Desktop config)
    process.env.ENHANCED_STRUCTURE_TEST = 'true';
    
    console.log('📄 Testing floating particles artifact with complete enhanced mode');
    console.log('   Original: 2 useState variables (mousePos object, time number)');
    console.log('   Original: 1 computed array with 6 properties (id, x, y, scale, rotation, opacity, hue)');
    
    const result = await convertArtifactToRemotionAST(floatingParticlesArtifact);
    
    console.log(`✅ Enhanced conversion completed: ${result.length} characters`);
    
    // Visual similarity analysis
    console.log('\n🎨 Visual Similarity Analysis:');
    console.log('------------------------------');
    
    // Check for enhanced mousePos (should be animated, not static)
    const hasAnimatedMouse = result.includes('Math.sin') && result.includes('mousePos');
    console.log(`✅ Animated mousePos (not static): ${hasAnimatedMouse ? '✅ ENHANCED' : '❌ STATIC'}`);
    
    // Check for proper time simulation  
    const hasProperTime = result.includes('* 0.016') && result.includes('time');
    console.log(`✅ Proper time simulation (60fps): ${hasProperTime ? '✅ ENHANCED' : '❌ GENERIC'}`);
    
    // Check for preserved computed array properties
    const preservedProperties = ['scale', 'rotation', 'opacity', 'hue'].filter(prop => 
      result.includes(prop + ':')
    );
    console.log(`✅ Computed array properties preserved: ${preservedProperties.length}/4 (${preservedProperties.join(', ')})`);
    
    // Check for frame-based animations in computed array
    const hasFrameBasedComputed = result.includes('useCurrentFrame()') && result.includes('Array.from');
    console.log(`✅ Frame-based computed array: ${hasFrameBasedComputed ? '✅ ENHANCED' : '❌ STATIC'}`);
    
    // Save enhanced result
    fs.writeFileSync(path.join(__dirname, 'logs/complete-enhanced-result.tsx'), result);
    console.log('\n📁 Enhanced result saved: logs/complete-enhanced-result.tsx');
    
    // Overall assessment
    const enhancements = [hasAnimatedMouse, hasProperTime, preservedProperties.length >= 3, hasFrameBasedComputed];
    const enhancementScore = enhancements.filter(Boolean).length;
    
    console.log('\n🎯 Visual Similarity Enhancement Score:');
    console.log(`   ${enhancementScore}/4 enhancements applied`);
    
    if (enhancementScore >= 3) {
      console.log('✅ MAJOR IMPROVEMENT: Enhanced mode significantly improves visual similarity');
      console.log('✅ Ready for Claude Desktop testing with much richer content');
    } else if (enhancementScore >= 2) {
      console.log('⚠️  PARTIAL IMPROVEMENT: Some visual similarity enhanced');
      console.log('⚠️  May need additional refinements for full similarity');
    } else {
      console.log('❌ MINIMAL IMPROVEMENT: Enhanced mode not significantly improving similarity');
      console.log('❌ Need to investigate other conversion patterns');
    }
    
    console.log('\n📋 Next Steps:');
    console.log('1. Test in Claude Desktop (enhanced mode already active)');
    console.log('2. Generate similar floating particle artifact');
    console.log('3. Convert and verify richer visual content');
    console.log('4. Compare studio output with original artifact complexity');
    
  } catch (error) {
    console.error('❌ Complete enhanced test failed:', error.message);
  } finally {
    delete process.env.ENHANCED_STRUCTURE_TEST;
  }
}

testCompleteEnhanced().catch(console.error);