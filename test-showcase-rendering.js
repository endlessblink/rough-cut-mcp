// Test enhanced ShowcaseAST pipeline with visual rendering fixes
const fs = require('fs');
const path = require('path');

// Test GitHub showcase with 6 scenes and visual rendering challenges
const githubShowcaseArtifact = `import React, { useState, useEffect } from 'react';
import { Github, Brain, Star, Monitor, Download, CheckCircle } from 'lucide-react';

const GitHubShowcase = () => {
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const scenes = [
    {
      id: 'intro',
      title: 'EndlessBlink',
      subtitle: 'Advanced AI Tools & MCP Servers',
      duration: 3000,
      color: 'from-purple-600 to-blue-600'
    },
    {
      id: 'like-i-said',
      title: 'Like-I-Said v3.0',
      subtitle: 'AI-Powered Memory & Task Management',
      duration: 4000,
      color: 'from-blue-600 to-indigo-600'
    },
    {
      id: 'comfy-guru',
      title: 'Comfy-Guru',
      subtitle: 'ComfyUI Log Debugger',
      duration: 4000,
      color: 'from-green-600 to-teal-600'
    },
    {
      id: 'features',
      title: 'Key Features',
      subtitle: '27+ MCP Tools',
      duration: 3500,
      color: 'from-orange-600 to-red-600'
    },
    {
      id: 'installation',
      title: 'Easy Installation',
      subtitle: 'One Command Setup',
      duration: 3000,
      color: 'from-pink-600 to-purple-600'
    },
    {
      id: 'dashboard',
      title: 'React Dashboard',
      subtitle: 'Visual Management',
      duration: 3500,
      color: 'from-cyan-600 to-blue-600'
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentScene((prev) => (prev + 1) % scenes.length);
    }, scenes[currentScene].duration);
    return () => clearTimeout(timer);
  }, [currentScene]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className={'absolute inset-0 bg-gradient-to-br ' + scenes[currentScene].color}>
        <div className="absolute inset-0 bg-black/20"></div>
      </div>
      
      <div className="relative z-10 p-8">
        <div className="text-center">
          <Github className="w-32 h-32 mx-auto text-white mb-4" />
          <h1 className="text-6xl font-bold text-white mb-4">
            {scenes[currentScene].title}
          </h1>
          <p className="text-2xl text-white/80">
            {scenes[currentScene].subtitle}
          </p>
          
          <div className="mt-8 grid grid-cols-3 gap-6">
            <div className="bg-white/10 rounded-lg p-4">
              <Brain className="w-12 h-12 mx-auto mb-2 text-blue-400" />
              <div className="text-white">AI Enhanced</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <Star className="w-12 h-12 mx-auto mb-2 text-yellow-400" />
              <div className="text-white">Community</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <Download className="w-12 h-12 mx-auto mb-2 text-green-400" />
              <div className="text-white">Open Source</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{\`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 1s ease-out;
        }
      \`}</style>
    </div>
  );
};

export default GitHubShowcase;`;

async function testShowcaseRendering() {
  console.log('🎨 Testing Enhanced ShowcaseAST Rendering');
  console.log('=========================================');
  console.log('Testing: Scene detection + visual rendering fixes\\n');

  try {
    const { convertArtifactToRemotionAST } = require('./build/ast-converter.js');
    
    console.log('📄 Input: GitHub showcase with 6 scenes + visual rendering challenges');
    console.log('   Expected: All 6 scenes detected');
    console.log('   Expected: Style JSX removed, gradients converted, icons enhanced');
    
    const result = await convertArtifactToRemotionAST(githubShowcaseArtifact);
    
    console.log(`✅ ShowcaseAST conversion completed: ${result.length} chars`);
    
    // Test 1: Scene Detection
    const sceneProgressionMatch = result.match(/% (\d+)/);
    const detectedScenes = sceneProgressionMatch ? parseInt(sceneProgressionMatch[1]) : 0;
    console.log(`\\n📊 Scene Detection Analysis:`);
    console.log(`   Scenes detected: ${detectedScenes}/6 ${detectedScenes === 6 ? '✅' : '❌'}`);
    
    // Test 2: Visual Rendering Fixes
    const styleJsxRemoved = !result.includes('<style jsx>');
    const gradientsConverted = result.includes('background:') && result.includes('linear-gradient');
    const iconsEnhanced = result.includes('strokeWidth') && result.includes('color="currentColor"');
    
    console.log(`\\n📊 Visual Rendering Analysis:`);
    console.log(`   Style JSX removed: ${styleJsxRemoved ? '✅' : '❌'}`);
    console.log(`   Gradients → CSS: ${gradientsConverted ? '✅' : '❌'}`);
    console.log(`   Icons enhanced: ${iconsEnhanced ? '✅' : '❌'}`);
    
    // Test 3: Content Preservation
    const allScenesPreserved = ['intro', 'like-i-said', 'comfy-guru', 'features', 'installation', 'dashboard']
      .every(sceneId => result.includes(sceneId));
    console.log(`   All scenes preserved: ${allScenesPreserved ? '✅' : '❌'}`);
    
    // Test 4: Lucide-react imports
    const lucidePreserved = result.includes('from "lucide-react"');
    console.log(`   Lucide imports preserved: ${lucidePreserved ? '✅' : '❌'}`);
    
    // Save for inspection
    fs.writeFileSync(path.join(__dirname, 'logs/showcase-rendering-result.tsx'), result);
    console.log('\\n📁 Enhanced result saved: logs/showcase-rendering-result.tsx');
    
    // Overall assessment
    const renderingScore = [detectedScenes === 6, styleJsxRemoved, gradientsConverted, iconsEnhanced, allScenesPreserved].filter(Boolean).length;
    console.log(`\\n🎯 ShowcaseAST Rendering Assessment: ${renderingScore}/5`);
    
    if (renderingScore >= 4) {
      console.log('✅ MAJOR RENDERING IMPROVEMENTS: ShowcaseAST pipeline enhanced');
      console.log('✅ Ready for user testing - should see professional showcase quality');
      console.log('✅ Navigation + visual rendering working together');
    } else {
      console.log(`⚠️  PARTIAL IMPROVEMENTS: ${renderingScore}/5 fixes applied`);
      if (detectedScenes !== 6) console.log('❌ Scene detection needs refinement');
      if (!gradientsConverted) console.log('❌ Gradient conversion needs work');
      if (!iconsEnhanced) console.log('❌ Icon rendering needs improvement');
    }
    
  } catch (error) {
    console.error('❌ ShowcaseAST rendering test failed:', error.message);
    console.error('Pipeline may have fundamental issues');
  }
}

testShowcaseRendering().catch(console.error);