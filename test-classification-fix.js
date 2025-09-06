// Test emergency classification fix to prevent content destruction
const fs = require('fs');
const path = require('path');

// Test Case 1: Content-heavy artifact (should preserve structure)
const githubShowcaseArtifact = `import React, { useState, useEffect } from 'react';

const GitHubShowcase = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 'welcome',
      title: 'endlessblink', 
      subtitle: 'Innovative MCP Servers for AI Enhancement',
      description: 'Welcome to endlessblink organization - home to cutting-edge Model Context Protocol servers that bridge AI assistants and development tools.'
    },
    {
      id: 'projects',
      title: 'Our Projects',
      subtitle: 'Advanced MCP Solutions',
      description: 'Like-I-Said v2: Advanced Memory & Task Management for LLMs'
    }
  ];

  return (
    <div className="w-full h-screen bg-gradient-to-br from-purple-900 to-indigo-900">
      <section className="hero-section p-8">
        <h1 className="text-6xl font-bold text-white mb-4">
          {slides[currentSlide].title}
        </h1>
        <h2 className="text-2xl text-blue-200 mb-6">
          {slides[currentSlide].subtitle}
        </h2>
        <p className="text-lg text-gray-300 max-w-4xl">
          {slides[currentSlide].description}
        </p>
      </section>
      
      <div className="grid grid-cols-3 gap-6 p-8">
        {slides.map((slide, index) => (
          <div key={slide.id} className="bg-white/10 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-white">{slide.title}</h3>
            <p className="text-gray-300">{slide.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GitHubShowcase;`;

// Test Case 2: Animation-heavy artifact (should get enhanced mode)
const cosmicWavesArtifact = `import React, { useState, useEffect } from 'react';

const CosmicWaves = () => {
  const [particles, setParticles] = useState([]);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 800,
      y: Math.random() * 600,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      size: Math.random() * 6 + 2,
      hue: Math.random() * 360,
      phase: Math.random() * Math.PI * 2
    }));
    setParticles(newParticles);

    const interval = setInterval(() => {
      setTime(t => t + 0.016);
      setParticles(prev => prev.map(p => ({
        ...p,
        x: p.x + p.vx + Math.sin(time + p.phase) * 0.5,
        y: p.y + p.vy + Math.cos(time + p.phase) * 0.5
      })));
    }, 16);

    return () => clearInterval(interval);
  }, [time]);

  return (
    <div className="w-full h-screen bg-black">
      {particles.map(particle => (
        <div
          key={particle.id}
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: 'hsl(' + particle.hue + ', 70%, 60%)'
          }}
        />
      ))}
    </div>
  );
};

export default CosmicWaves;`;

async function testClassificationFix() {
  console.log('🚨 Emergency Classification Fix Testing');
  console.log('======================================');
  console.log('Testing: Content preservation vs Animation enhancement\n');

  try {
    const { convertArtifactToRemotionAST } = require('./build/ast-converter.js');

    // Test 1: Content-heavy artifact (GitHub showcase)
    console.log('1. TESTING CONTENT-HEAVY ARTIFACT (GitHub Showcase)');
    console.log('   Expected: Preserve slides, titles, structure');
    
    const contentResult = await convertArtifactToRemotionAST(githubShowcaseArtifact);
    
    console.log(`   ✅ Conversion completed: ${contentResult.length} chars`);
    
    // Check content preservation
    const slidesPreserved = contentResult.includes('slides[') && contentResult.includes('title') && contentResult.includes('description');
    const noParticleGeneration = !contentResult.includes('Array.from({ length: 20 }');
    const hasNavigationConversion = contentResult.includes('useCurrentFrame()') && contentResult.includes('currentSlide');
    
    console.log(`   📊 Slides content preserved: ${slidesPreserved ? '✅' : '❌'}`);
    console.log(`   📊 No particle generation: ${noParticleGeneration ? '✅' : '❌'}`);
    console.log(`   📊 Navigation converted: ${hasNavigationConversion ? '✅' : '❌'}`);
    
    // Test 2: Animation-heavy artifact (Cosmic waves)  
    console.log('\n2. TESTING ANIMATION-HEAVY ARTIFACT (Cosmic Waves)');
    console.log('   Expected: Enhanced mode with visual similarity');
    
    const animationResult = await convertArtifactToRemotionAST(cosmicWavesArtifact);
    
    console.log(`   ✅ Conversion completed: ${animationResult.length} chars`);
    
    // Check enhanced mode application
    const hasEnhancedParticles = animationResult.includes('Math.sin') && animationResult.includes('vx:');
    const hasSemanticProperties = animationResult.includes('POSITION_X') || animationResult.includes('VELOCITY');
    const hasFrameBasedAnimation = animationResult.includes('useCurrentFrame()');
    
    console.log(`   📊 Enhanced particles: ${hasEnhancedParticles ? '✅' : '❌'}`);
    console.log(`   📊 Semantic properties: ${hasSemanticProperties ? '✅' : '❌'}`);
    console.log(`   📊 Frame-based animation: ${hasFrameBasedAnimation ? '✅' : '❌'}`);
    
    // Save results for inspection
    fs.writeFileSync(path.join(__dirname, 'logs/classification-content-result.tsx'), contentResult);
    fs.writeFileSync(path.join(__dirname, 'logs/classification-animation-result.tsx'), animationResult);
    
    // Assessment
    const contentPreserved = slidesPreserved && noParticleGeneration;
    const animationEnhanced = hasEnhancedParticles && hasFrameBasedAnimation;
    
    console.log('\n🎯 Classification Fix Assessment:');
    console.log('=================================');
    console.log(`Content preservation working: ${contentPreserved ? '✅ YES' : '❌ NO'}`);
    console.log(`Animation enhancement working: ${animationEnhanced ? '✅ YES' : '❌ NO'}`);
    
    if (contentPreserved && animationEnhanced) {
      console.log('\n🚀 EMERGENCY FIX SUCCESSFUL!');
      console.log('✅ Content artifacts preserve original structure');
      console.log('✅ Animation artifacts get enhanced visual similarity');
      console.log('✅ Ready for Claude Desktop testing');
    } else {
      console.log('\n⚠️  EMERGENCY FIX NEEDS REFINEMENT');
      if (!contentPreserved) console.log('❌ Content preservation failed - GitHub showcase still corrupted');
      if (!animationEnhanced) console.log('❌ Animation enhancement failed - Visual similarity lost');
    }
    
  } catch (error) {
    console.error('❌ Emergency fix test failed:', error.message);
  }
}

testClassificationFix().catch(console.error);