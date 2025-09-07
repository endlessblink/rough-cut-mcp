// Test dependency-free approach - no external imports
const fs = require('fs');
const path = require('path');

const showcaseWithIcons = `import React, { useState } from 'react';
import { GitBranch, Brain, Star, Bug, Monitor } from 'lucide-react';

const Showcase = () => {
  const [currentScene, setCurrentScene] = useState(0);
  
  const scenes = [
    { id: 'intro', title: 'EndlessBlink', subtitle: 'MCP Innovation' },
    { id: 'projects', title: 'Projects', subtitle: 'Our Tools' }
  ];

  return (
    <div className="w-full h-screen bg-gradient-to-br from-purple-900 to-indigo-900">
      <div className="text-center">
        <GitBranch className="w-8 h-8 text-blue-400" />
        <h1>{scenes[currentScene].title}</h1>
        <Brain size={48} className="text-purple-400" />
        <Star className="text-yellow-400" size={24} />
        <Bug className="animate-bounce" />
        <Monitor size={64} />
      </div>
    </div>
  );
};

export default Showcase;`;

async function testDependencyFree() {
  console.log('🧪 Testing Dependency-Free Approach');
  console.log('===================================');
  console.log('Testing: lucide-react removal + emoji replacement\\n');

  try {
    const { convertArtifactToRemotionAST } = require('./build/ast-converter.js');
    
    console.log('📄 Input: Showcase with lucide-react icons');
    console.log('   Expected: Icons → emoji, imports removed');
    
    const result = await convertArtifactToRemotionAST(showcaseWithIcons);
    
    console.log(`✅ Conversion completed: ${result.length} chars`);
    
    // Check if lucide-react was removed
    const hasLucideReact = result.includes('lucide-react');
    console.log(`📊 lucide-react import removed: ${!hasLucideReact ? '✅' : '❌'}`);
    
    // Check if icons were converted to emoji
    const hasEmojis = result.includes('🌿') || result.includes('🧠') || result.includes('⭐');
    console.log(`📊 Icons converted to emoji: ${hasEmojis ? '✅' : '❌'}`);
    
    // Check content preservation
    const scenesPreserved = result.includes('scenes[') && result.includes('EndlessBlink');
    console.log(`📊 Content structure preserved: ${scenesPreserved ? '✅' : '❌'}`);
    
    // Save for inspection
    fs.writeFileSync(path.join(__dirname, 'logs/dependency-free-result.tsx'), result);
    console.log('\\n📁 Result saved: logs/dependency-free-result.tsx');
    
    // Assessment
    const success = !hasLucideReact && hasEmojis && scenesPreserved;
    console.log(`\\n🎯 Dependency-Free Success: ${success ? '✅ YES' : '❌ NO'}`);
    
    if (success) {
      console.log('✅ No external dependencies - should work in Remotion Studio');
      console.log('✅ Icons replaced with emoji - no module import errors expected'); 
      console.log('✅ Content preserved - GitHub showcase structure maintained');
      console.log('\\n📋 Ready for user testing - NO MORE CLAIMS until verified');
    } else {
      console.log('❌ Dependency removal failed');
      console.log('❌ Runtime errors still expected');
    }
    
  } catch (error) {
    console.error('❌ Dependency-free test failed:', error.message);
  }
}

testDependencyFree().catch(console.error);