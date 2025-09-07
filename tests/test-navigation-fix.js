// Test surgical navigation fix - verify scene progression works
const fs = require('fs');
const path = require('path');

// GitHub showcase with 7 scenes (like actual one you tested)
const showcaseArtifact = `import React, { useState, useEffect } from 'react';
import { Github, Brain, Star, Monitor } from 'lucide-react';

const GitHubShowcase = () => {
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  
  const scenes = [
    { id: 'intro', title: 'EndlessBlink', subtitle: 'MCP Innovation Hub' },
    { id: 'like-i-said-overview', title: 'Like-I-Said Memory MCP', subtitle: 'Advanced Memory & Task Management' },
    { id: 'like-i-said-features', title: 'Memory Features', subtitle: 'Intelligent System' },
    { id: 'comfy-guru-overview', title: 'Comfy-Guru', subtitle: 'ComfyUI Debugger' },
    { id: 'comfy-guru-features', title: 'Smart Debugging', subtitle: 'Error Detection' },
    { id: 'ecosystem', title: 'MCP Ecosystem', subtitle: 'AI Development' },
    { id: 'outro', title: 'GitHub.com/endlessblink', subtitle: 'Future of AI' }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentScene((prev) => (prev + 1) % scenes.length);
    }, 3000);
    return () => clearTimeout(timer);
  }, [currentScene]);

  return (
    <div className="w-full h-screen bg-gradient-to-br from-purple-900 to-indigo-900">
      <h1>{scenes[currentScene].title}</h1>
      <p>{scenes[currentScene].subtitle}</p>
      <Github className="w-8 h-8" />
      <Brain size={48} />
    </div>
  );
};

export default GitHubShowcase;`;

async function testNavigationFix() {
  console.log('🔧 Testing Surgical Navigation Fix');
  console.log('=================================');
  console.log('Goal: Verify scene progression instead of static scene 0\n');

  try {
    const { convertArtifactToRemotionAST } = require('./build/ast-converter.js');
    
    console.log('📄 Input: GitHub showcase with 7 scenes and currentScene useState');
    console.log('   Expected: currentScene = Math.floor(useCurrentFrame() / 90) % 7');
    console.log('   Expected: Scene count detection working');
    
    const result = await convertArtifactToRemotionAST(showcaseArtifact);
    
    console.log(`✅ Conversion completed: ${result.length} chars`);
    
    // Critical test: Check if navigation is frame-based instead of static
    const hasStaticScene = result.includes('const currentScene = 0');
    const hasFrameBasedScene = result.includes('Math.floor') && result.includes('useCurrentFrame()') && result.includes('currentScene');
    const hasSceneModulo = result.includes('% ') && result.includes('currentScene');
    
    console.log('\n📊 Navigation Fix Analysis:');
    console.log('---------------------------');
    console.log(`Static currentScene (broken): ${hasStaticScene ? '❌' : '✅'}`);
    console.log(`Frame-based currentScene: ${hasFrameBasedScene ? '✅' : '❌'}`);
    console.log(`Scene progression modulo: ${hasSceneModulo ? '✅' : '❌'}`);
    
    // Check scene count detection
    const sceneCountMatch = result.match(/% (\d+)/);
    const detectedSceneCount = sceneCountMatch ? parseInt(sceneCountMatch[1]) : 0;
    console.log(`Scene count detected: ${detectedSceneCount}/7 ${detectedSceneCount === 7 ? '✅' : '❌'}`);
    
    // Check content preservation
    const scenesPreserved = result.includes('scenes[') && result.includes('intro') && result.includes('outro');
    console.log(`All scenes content preserved: ${scenesPreserved ? '✅' : '❌'}`);
    
    // Save for inspection
    fs.writeFileSync(path.join(__dirname, 'logs/navigation-fix-result.tsx'), result);
    console.log('\n📁 Result saved: logs/navigation-fix-result.tsx');
    
    // Assessment
    const navigationFixed = hasFrameBasedScene && hasSceneModulo && !hasStaticScene;
    const detectionWorking = detectedSceneCount === 7;
    
    console.log('\n🎯 Surgical Navigation Fix Assessment:');
    console.log(`Navigation progression: ${navigationFixed ? '✅ FIXED' : '❌ BROKEN'}`);
    console.log(`Scene count detection: ${detectionWorking ? '✅ WORKING' : '❌ BROKEN'}`);
    console.log(`Content structure: ${scenesPreserved ? '✅ PRESERVED' : '❌ BROKEN'}`);
    
    if (navigationFixed && detectionWorking && scenesPreserved) {
      console.log('\n🚀 PHASE 1 SUCCESS: Navigation fix working properly');
      console.log('✅ Ready for Phase 2: Test actual scene progression in studio');
      console.log('✅ Should show all 7 scenes with rich content');
    } else {
      console.log('\n❌ PHASE 1 ISSUES: Navigation fix needs refinement');
      if (!navigationFixed) console.log('- Frame-based progression not working');
      if (!detectionWorking) console.log('- Scene count detection failed');
      if (!scenesPreserved) console.log('- Content structure broken');
    }
    
  } catch (error) {
    console.error('❌ Navigation fix test failed:', error.message);
    console.error('This indicates fundamental AST conversion issues');
  }
}

testNavigationFix().catch(console.error);