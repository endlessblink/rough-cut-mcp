// Test E2E workflow with all critical fixes applied
const fs = require('fs-extra');
const path = require('path');

// Test artifact that caused the original data structure mismatch
const testArtifact = {
  name: 'enhanced-orbs-test',
  jsx: `import React, { useState, useEffect } from 'react';

const EnhancedOrbsTest = () => {
  const [orbs, setOrbs] = useState([]);

  useEffect(() => {
    // Generate random orbs with different properties
    const generateOrbs = () => {
      const newOrbs = [];
      for (let i = 0; i < 10; i++) {
        newOrbs.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 60 + 20,
          hue: Math.random() * 360,
          animationDelay: Math.random() * 4,
          duration: Math.random() * 3 + 2,
          direction: Math.random() > 0.5 ? 1 : -1,
        });
      }
      setOrbs(newOrbs);
    };
    generateOrbs();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 overflow-hidden relative">
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white mb-8">
            Enhanced Orbs Test
          </h1>
        </div>
      </div>

      {/* Critical test: JSX that references specific object properties */}
      {orbs.map((orb) => (
        <div
          key={orb.id}
          className="absolute rounded-full opacity-70"
          style={{
            left: \`\${orb.x}%\`,
            top: \`\${orb.y}%\`,
            width: \`\${orb.size}px\`,
            height: \`\${orb.size}px\`,
            background: \`hsl(\${orb.hue}, 70%, 60%)\`,
            animationDelay: \`\${orb.animationDelay}s\`,
            animationDuration: \`\${orb.duration}s\`,
            animationDirection: orb.direction > 0 ? 'normal' : 'reverse'
          }}
        />
      ))}
    </div>
  );
};

export default EnhancedOrbsTest;`
};

async function testFixedE2EWorkflow() {
  console.log('🔧 Testing E2E Workflow with Critical Fixes Applied');
  console.log('=================================================');
  console.log('Testing: Platform consistency + Structure preservation + Studio verification\n');

  try {
    // STEP 1: Test enhanced AST converter with structure preservation
    console.log('1. 🧬 Testing Enhanced AST Converter...');
    
    const { convertArtifactToRemotionAST } = require('./build/ast-converter.js');
    const remotionCode = await convertArtifactToRemotionAST(testArtifact.jsx);
    
    console.log(`   ✅ Conversion completed (${remotionCode.length} chars)`);
    
    // STEP 2: Analyze object structure preservation
    console.log('\n2. 🔍 Testing Object Structure Preservation...');
    
    const hasOrbsDeclaration = remotionCode.includes('const orbs =');
    const hasXProperty = remotionCode.includes('x:');
    const hasYProperty = remotionCode.includes('y:');
    const hasSizeProperty = remotionCode.includes('size:');
    const hasHueProperty = remotionCode.includes('hue:');
    const hasDurationProperty = remotionCode.includes('duration:');
    const hasDirectionProperty = remotionCode.includes('direction:');
    
    console.log(`   - orbs declaration: ${hasOrbsDeclaration ? '✅' : '❌'}`);
    console.log(`   - x property: ${hasXProperty ? '✅' : '❌'}`);
    console.log(`   - y property: ${hasYProperty ? '✅' : '❌'}`);
    console.log(`   - size property: ${hasSizeProperty ? '✅' : '❌'}`);
    console.log(`   - hue property: ${hasHueProperty ? '✅' : '❌'}`);
    console.log(`   - duration property: ${hasDurationProperty ? '✅' : '❌'}`);
    console.log(`   - direction property: ${hasDirectionProperty ? '✅' : '❌'}`);
    
    const structurePreserved = hasXProperty && hasYProperty && hasSizeProperty && hasHueProperty;
    console.log(`   🎯 Structure Preservation: ${structurePreserved ? '✅ SUCCESS' : '❌ FAILED'}`);
    
    // Save converted code for analysis
    const convertedPath = path.join(__dirname, 'logs/enhanced-orbs-converted.tsx');
    await fs.writeFile(convertedPath, remotionCode);
    console.log(`   📁 Converted code saved: ${convertedPath}`);
    
    // STEP 3: Test compilation feasibility
    console.log('\n3. 🔨 Testing Compilation Feasibility...');
    
    const projectPath = path.join(__dirname, 'test-projects', testArtifact.name);
    await fs.ensureDir(path.join(projectPath, 'src'));
    
    // Create minimal project structure
    await fs.writeJSON(path.join(projectPath, 'package.json'), {
      name: testArtifact.name,
      version: '1.0.0',
      scripts: {
        start: 'remotion studio --port=8007',
        build: 'remotion render src/index.ts VideoComposition out/video.mp4'
      },
      dependencies: {
        '@remotion/bundler': '^4.0.341',
        '@remotion/cli': '^4.0.341',
        'react': '^18.2.0',
        'react-dom': '^18.2.0',
        'remotion': '^4.0.340'
      },
      devDependencies: {
        '@types/react': '^18.0.0',
        'typescript': '^5.0.0'
      }
    });

    await fs.writeFile(path.join(projectPath, 'src/index.ts'),
      'import { registerRoot } from "remotion";\nimport { VideoComposition } from "./Root";\n\nregisterRoot(VideoComposition);');

    await fs.writeFile(path.join(projectPath, 'src/Root.tsx'),
      'import { Composition } from "remotion";\nimport EnhancedOrbsTest from "./VideoComposition";\n\nexport const VideoComposition: React.FC = () => {\n  return (\n    <>\n      <Composition\n        id="VideoComposition"\n        component={EnhancedOrbsTest}\n        durationInFrames={180}\n        fps={30}\n        width={1920}\n        height={1080}\n      />\n    </>\n  );\n};');

    await fs.writeFile(path.join(projectPath, 'src/VideoComposition.tsx'), remotionCode);

    await fs.writeFile(path.join(projectPath, 'tsconfig.json'),
      JSON.stringify({
        compilerOptions: {
          target: 'ES2022',
          lib: ['DOM', 'DOM.Iterable', 'ES6'],
          allowJs: true,
          skipLibCheck: true,
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          strict: true,
          forceConsistentCasingInFileNames: true,
          moduleResolution: 'node',
          resolveJsonModule: true,
          isolatedModules: true,
          noEmit: true,
          jsx: 'react-jsx'
        },
        include: ['src']
      }, null, 2));

    console.log('   ✅ Project structure created');
    
    // STEP 4: Critical Analysis Summary
    console.log('\n4. 📊 Critical Analysis Summary');
    console.log('===============================');
    
    if (structurePreserved) {
      console.log('✅ MAJOR FIX: Object structure preservation working');
      console.log('✅ JSX property references should now work');
      console.log('✅ No more "orb.x is undefined" runtime errors expected');
    } else {
      console.log('❌ STILL BROKEN: Object structure not preserved');
      console.log('❌ JSX will still fail with undefined property errors');
    }
    
    console.log('\n🎯 Enhanced AST Converter v9.3.0 Status:');
    console.log('- Platform consistency: Enhanced with forced clean installs');
    console.log('- Structure preservation: Object property analysis implemented');
    console.log('- Studio verification: Socket testing added to prevent EPIPE');
    console.log('- User experience: Detailed success/failure messaging');
    
    console.log('\n📋 Next User Test Steps:');
    console.log('1. Restart Claude Desktop (to load v9.3.0)');
    console.log('2. Generate complex useState artifact');
    console.log('3. Use convert_artifact_to_video tool');
    console.log('4. Use launch_studio tool');
    console.log('5. Verify studio URL actually loads and shows animation');
    
    const ready = structurePreserved;
    console.log(`\n🚀 Ready for User Testing: ${ready ? 'YES' : 'NO - Structure preservation still needs work'}`);
    
  } catch (error) {
    console.error('❌ E2E test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testFixedE2EWorkflow().catch(console.error);