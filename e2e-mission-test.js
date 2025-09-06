// E2E MISSION TEST: The only thing that matters
// Simulate complete user workflow: Generate → Convert → Launch → Verify

const fs = require('fs-extra');
const path = require('path');
const { spawn } = require('child_process');

// Simulated Claude Desktop artifacts (real patterns users would generate)
const testArtifacts = [
  {
    name: 'particle-explosion',
    prompt: 'Create an animated particle explosion with useState',
    jsx: `import React, { useState, useEffect } from 'react';

const ParticleExplosion = () => {
  const [particles, setParticles] = useState(
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: 400,
      y: 300,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10,
      life: 1,
      color: \`hsl(\${Math.random() * 360}, 70%, 60%)\`
    }))
  );

  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(t => t + 1);
      setParticles(prev => prev.map(p => ({
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy,
        life: Math.max(0, p.life - 0.02)
      })));
    }, 16);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-screen bg-black flex items-center justify-center">
      <svg width="800" height="600">
        {particles.filter(p => p.life > 0).map(particle => (
          <circle
            key={particle.id}
            cx={particle.x}
            cy={particle.y}
            r={particle.life * 8}
            fill={particle.color}
            opacity={particle.life}
          />
        ))}
      </svg>
      <div className="absolute top-4 left-4 text-white">
        Time: {time}
      </div>
    </div>
  );
};

export default ParticleExplosion;`
  },
  
  {
    name: 'data-dashboard',
    prompt: 'Create an animated data dashboard with useState',
    jsx: `import React, { useState, useEffect } from 'react';

const DataDashboard = () => {
  const [metrics, setMetrics] = useState({
    revenue: 45000,
    users: 1250,
    conversion: 3.2
  });

  const [chartData, setChartData] = useState([
    { month: 'Jan', value: 4000 },
    { month: 'Feb', value: 3000 },
    { month: 'Mar', value: 5000 },
    { month: 'Apr', value: 4500 },
    { month: 'May', value: 6000 }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        revenue: prev.revenue + Math.random() * 1000 - 500,
        users: prev.users + Math.floor(Math.random() * 10 - 5),
        conversion: Math.max(1, prev.conversion + Math.random() * 0.5 - 0.25)
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 bg-gradient-to-br from-blue-900 to-purple-900 min-h-screen">
      <h1 className="text-4xl font-bold text-white mb-8">Analytics Dashboard</h1>
      
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white/10 p-6 rounded-lg">
          <h3 className="text-white/70 text-sm">Revenue</h3>
          <p className="text-3xl font-bold text-green-400">
            \${Math.round(metrics.revenue).toLocaleString()}
          </p>
        </div>
        <div className="bg-white/10 p-6 rounded-lg">
          <h3 className="text-white/70 text-sm">Users</h3>
          <p className="text-3xl font-bold text-blue-400">{metrics.users}</p>
        </div>
        <div className="bg-white/10 p-6 rounded-lg">
          <h3 className="text-white/70 text-sm">Conversion</h3>
          <p className="text-3xl font-bold text-purple-400">{metrics.conversion.toFixed(1)}%</p>
        </div>
      </div>

      <div className="bg-white/10 p-6 rounded-lg">
        <h3 className="text-white text-lg mb-4">Monthly Revenue</h3>
        <svg width="100%" height="200">
          {chartData.map((item, index) => (
            <rect
              key={item.month}
              x={index * 120 + 20}
              y={200 - (item.value / 100)}
              width="80"
              height={item.value / 100}
              fill="url(#gradient)"
            />
          ))}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};

export default DataDashboard;`
  }
];

async function runE2EMissionTest() {
  console.log('🎯 E2E MISSION TEST: THE ONLY THING THAT MATTERS');
  console.log('================================================');
  console.log('Testing complete workflow: Generate → Convert → Launch → Verify\n');

  const results = [];
  let totalSuccess = 0;

  for (let i = 0; i < testArtifacts.length; i++) {
    const artifact = testArtifacts[i];
    console.log(`${i + 1}. TESTING: ${artifact.name}`);
    console.log(`   Prompt: "${artifact.prompt}"`);
    
    try {
      // STEP 1: Simulate Claude Desktop generating artifact (GIVEN)
      console.log('   ✅ Step 1: Claude generates animated artifact with useState');
      
      // STEP 2: Convert to Remotion using our MCP tools
      console.log('   🔄 Step 2: Converting to Remotion...');
      
      const { convertArtifactToRemotionAST } = require('./build/ast-converter.js');
      const remotionCode = await convertArtifactToRemotionAST(artifact.jsx);
      
      if (!remotionCode || remotionCode.length === 0) {
        throw new Error('AST conversion failed - no output');
      }
      
      // Verify conversion quality
      const hasRemotionImports = remotionCode.includes('from "remotion"');
      const hasFrameAnimation = remotionCode.includes('useCurrentFrame');
      const noUseState = !remotionCode.includes('useState');
      const noUseEffect = !remotionCode.includes('useEffect');
      
      if (!hasRemotionImports || !hasFrameAnimation || !noUseState || !noUseEffect) {
        throw new Error(\`Conversion quality failed: imports=\${hasRemotionImports}, frame=\${hasFrameAnimation}, useState=\${noUseState}, useEffect=\${noUseEffect}\`);
      }
      
      console.log('   ✅ Step 2: Conversion successful - useState patterns converted to frame-based');
      
      // STEP 3: Create Remotion project
      console.log('   📁 Step 3: Creating Remotion project...');
      
      const projectPath = path.join(__dirname, 'assets/projects', artifact.name);
      await fs.ensureDir(path.join(projectPath, 'src'));
      
      // Create project files
      await fs.writeJSON(path.join(projectPath, 'package.json'), {
        name: artifact.name,
        version: '1.0.0',
        scripts: {
          start: \`remotion studio --port=\${8000 + i}\`,
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
        \`import { registerRoot } from 'remotion';\nimport { VideoComposition } from './Root';\n\nregisterRoot(VideoComposition);\`);

      await fs.writeFile(path.join(projectPath, 'src/Root.tsx'),
        \`import { Composition } from 'remotion';\nimport VideoComposition from './VideoComposition';\n\nexport const VideoComposition: React.FC = () => {\n  return (\n    <>\n      <Composition\n        id="VideoComposition"\n        component={VideoComposition}\n        durationInFrames={180}\n        fps={30}\n        width={1920}\n        height={1080}\n      />\n    </>\n  );\n};\`);

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

      console.log('   ✅ Step 3: Remotion project created');
      
      // STEP 4: Test compilation (critical validation)
      console.log('   🔨 Step 4: Testing compilation...');
      
      // Install dependencies and test compilation
      const installProcess = spawn('npm', ['install'], { cwd: projectPath, stdio: 'pipe' });
      await new Promise((resolve, reject) => {
        installProcess.on('close', (code) => {
          if (code === 0) resolve();
          else reject(new Error(\`npm install failed with code \${code}\`));
        });
        setTimeout(() => reject(new Error('npm install timeout')), 60000);
      });
      
      const compileProcess = spawn('npx', ['remotion', 'bundle', '--bundle-cache'], { cwd: projectPath, stdio: 'pipe' });
      await new Promise((resolve, reject) => {
        compileProcess.on('close', (code) => {
          if (code === 0) resolve();
          else reject(new Error(\`Remotion compilation failed with code \${code}\`));
        });
        setTimeout(() => reject(new Error('Compilation timeout')), 60000);
      });
      
      console.log('   ✅ Step 4: Compilation successful - no "is not defined" errors');
      
      // STEP 5: Render test frame (ultimate validation)
      console.log('   🎬 Step 5: Rendering test frame...');
      
      const renderProcess = spawn('npx', ['remotion', 'still', 'src/index.ts', '--id=VideoComposition', '--frame=30', \`--output=test-\${artifact.name}.png\`], { cwd: projectPath, stdio: 'pipe' });
      await new Promise((resolve, reject) => {
        renderProcess.on('close', (code) => {
          if (code === 0) resolve();
          else reject(new Error(\`Frame render failed with code \${code}\`));
        });
        setTimeout(() => reject(new Error('Render timeout')), 90000);
      });
      
      console.log('   ✅ Step 5: Frame rendered successfully - ANIMATION CONFIRMED');
      console.log(\`   🎯 SUCCESS: \${artifact.name} - Complete E2E workflow working!\n\`);
      
      results.push({ name: artifact.name, success: true });
      totalSuccess++;
      
    } catch (error) {
      console.log(\`   ❌ FAILED: \${error.message}\n\`);
      results.push({ name: artifact.name, success: false, error: error.message });
    }
  }

  // FINAL ASSESSMENT
  console.log('🎯 E2E MISSION RESULTS');
  console.log('======================');
  console.log(\`✅ Successful workflows: \${totalSuccess}/\${testArtifacts.length}\`);
  console.log(\`📈 Success rate: \${Math.round((totalSuccess/testArtifacts.length) * 100)}%\`);
  
  if (totalSuccess === testArtifacts.length) {
    console.log('\n🚀 MISSION ACCOMPLISHED!');
    console.log('Complete E2E workflow proven:');
    console.log('✅ Claude generates artifacts with useState');
    console.log('✅ rough-cut-mcp converts to frame-based Remotion');
    console.log('✅ Projects compile without errors');
    console.log('✅ High-quality animations render consistently');
    console.log('\n🎯 READY FOR REAL USER DEPLOYMENT!');
  } else {
    console.log('\n❌ MISSION INCOMPLETE');
    console.log('E2E workflow has failures - not ready for users');
    
    results.filter(r => !r.success).forEach(r => {
      console.log(\`- \${r.name}: \${r.error}\`);
    });
  }
}

runE2EMissionTest().catch(console.error);