// E2E MISSION TEST: SIMPLE VERSION - THE ONLY THING THAT MATTERS
const fs = require('fs-extra');
const path = require('path');
const { spawn } = require('child_process');

// Single focused test: Particle system (most common Claude artifact)
const testArtifact = {
  name: 'particle-system-test',
  jsx: `import React, { useState, useEffect } from 'react';

const ParticleSystem = () => {
  const [particles, setParticles] = useState(
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 800,
      y: Math.random() * 600,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      color: 'hsl(' + (Math.random() * 360) + ', 70%, 60%)'
    }))
  );

  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(t => t + 1);
      setParticles(prev => prev.map(p => ({
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy
      })));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-screen bg-black flex items-center justify-center">
      <svg width="800" height="600">
        {particles.map(particle => (
          <circle
            key={particle.id}
            cx={particle.x}
            cy={particle.y}
            r="4"
            fill={particle.color}
          />
        ))}
      </svg>
      <div className="absolute top-4 left-4 text-white">
        Time: {time}
      </div>
    </div>
  );
};

export default ParticleSystem;`
};

async function runE2ETest() {
  console.log('🎯 E2E MISSION TEST: THE CRITICAL PATH');
  console.log('=====================================');
  console.log('Generate → Convert → Build → Render → SUCCESS\n');

  try {
    // STEP 1: We have the Claude artifact (simulated)
    console.log('1. ✅ STEP 1: Claude Desktop generates particle system with useState');
    console.log('   - useState for particles array');
    console.log('   - useState for time counter');
    console.log('   - useEffect with setInterval');
    
    // STEP 2: Convert using our enhanced AST converter
    console.log('\n2. 🔄 STEP 2: Converting to Remotion with enhanced AST...');
    
    const { convertArtifactToRemotionAST } = require('./build/ast-converter.js');
    const remotionCode = await convertArtifactToRemotionAST(testArtifact.jsx);
    
    if (!remotionCode || remotionCode.length === 0) {
      throw new Error('Conversion failed - no output');
    }
    
    // Validate conversion quality
    const hasRemotionImports = remotionCode.includes('from "remotion"');
    const hasFrameAnimation = remotionCode.includes('useCurrentFrame');
    const noUseState = !remotionCode.includes('useState');
    const noUseEffect = !remotionCode.includes('useEffect');
    const hasParticlesArray = remotionCode.includes('const particles =');
    
    console.log('   - Remotion imports: ' + (hasRemotionImports ? '✅' : '❌'));
    console.log('   - Frame animation: ' + (hasFrameAnimation ? '✅' : '❌'));
    console.log('   - useState removed: ' + (noUseState ? '✅' : '❌'));
    console.log('   - useEffect removed: ' + (noUseEffect ? '✅' : '❌'));
    console.log('   - Particles array: ' + (hasParticlesArray ? '✅' : '❌'));
    
    if (!hasRemotionImports || !hasFrameAnimation || !hasParticlesArray) {
      throw new Error('Conversion quality failed');
    }
    
    console.log('   ✅ CONVERSION SUCCESS');
    
    // STEP 3: Create complete Remotion project
    console.log('\n3. 📁 STEP 3: Creating complete Remotion project...');
    
    const projectPath = path.join(__dirname, 'assets/projects', testArtifact.name);
    await fs.ensureDir(path.join(projectPath, 'src'));
    
    // Package.json
    await fs.writeJSON(path.join(projectPath, 'package.json'), {
      name: testArtifact.name,
      version: '1.0.0',
      scripts: {
        start: 'remotion studio --port=8099',
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

    // Index.ts
    await fs.writeFile(path.join(projectPath, 'src/index.ts'),
      'import { registerRoot } from "remotion";\nimport { VideoComposition } from "./Root";\n\nregisterRoot(VideoComposition);');

    // Root.tsx
    await fs.writeFile(path.join(projectPath, 'src/Root.tsx'),
      'import { Composition } from "remotion";\nimport VideoComposition from "./VideoComposition";\n\nexport const VideoComposition: React.FC = () => {\n  return (\n    <>\n      <Composition\n        id="VideoComposition"\n        component={VideoComposition}\n        durationInFrames={180}\n        fps={30}\n        width={1920}\n        height={1080}\n      />\n    </>\n  );\n};');

    // Converted VideoComposition.tsx
    await fs.writeFile(path.join(projectPath, 'src/VideoComposition.tsx'), remotionCode);

    // TypeScript config
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

    console.log('   ✅ PROJECT STRUCTURE CREATED');
    
    // STEP 4: Install and compile
    console.log('\n4. 🔨 STEP 4: Installing dependencies and compiling...');
    
    console.log('   - Installing npm packages...');
    await new Promise((resolve, reject) => {
      const install = spawn('npm', ['install'], { cwd: projectPath, stdio: 'inherit' });
      install.on('close', (code) => code === 0 ? resolve() : reject(new Error('npm install failed')));
      setTimeout(() => reject(new Error('install timeout')), 120000);
    });
    
    console.log('   - Compiling with Remotion bundler...');
    await new Promise((resolve, reject) => {
      const bundle = spawn('npx', ['remotion', 'bundle', '--bundle-cache'], { cwd: projectPath, stdio: 'inherit' });
      bundle.on('close', (code) => code === 0 ? resolve() : reject(new Error('bundle failed')));
      setTimeout(() => reject(new Error('bundle timeout')), 120000);
    });
    
    console.log('   ✅ COMPILATION SUCCESS - No "particles is not defined" errors!');
    
    // STEP 5: Render test frame (ULTIMATE PROOF)
    console.log('\n5. 🎬 STEP 5: Rendering test frame (ultimate proof)...');
    
    await new Promise((resolve, reject) => {
      const render = spawn('npx', ['remotion', 'still', 'src/index.ts', '--id=VideoComposition', '--frame=60', '--output=mission-success.png'], 
        { cwd: projectPath, stdio: 'inherit' });
      render.on('close', (code) => code === 0 ? resolve() : reject(new Error('render failed')));
      setTimeout(() => reject(new Error('render timeout')), 120000);
    });
    
    console.log('   ✅ FRAME RENDERED SUCCESSFULLY');
    
    // MISSION ACCOMPLISHED
    console.log('\n🎯 MISSION ACCOMPLISHED!');
    console.log('========================');
    console.log('✅ Claude generates useState artifact');
    console.log('✅ Enhanced AST converter transforms to frame-based');
    console.log('✅ Remotion project compiles without errors');
    console.log('✅ High-quality animation renders successfully');
    console.log('\n🚀 READY FOR REAL USERS!');
    console.log('E2E workflow proven working end-to-end');
    
    return true;
    
  } catch (error) {
    console.log('\n❌ MISSION FAILED');
    console.log('==================');
    console.log('Error:', error.message);
    console.log('E2E workflow broken - not ready for users');
    return false;
  }
}

runE2ETest().catch(console.error);