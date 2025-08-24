#!/usr/bin/env node

/**
 * Complete installation script for Rough Cut MCP Server
 * This installs both the MCP server and sets up Remotion Studio
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Rough Cut MCP Installation Script\n');
console.log('This will install everything needed for the MCP server and Remotion Studio.\n');

async function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${command} ${args.join(' ')}`);
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: process.platform === 'win32',
      ...options
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', reject);
  });
}

async function checkPrerequisites() {
  console.log('📋 Checking prerequisites...\n');
  
  // Check Node.js version
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  if (majorVersion < 18) {
    console.error('❌ Node.js 18 or higher is required');
    console.error(`   Current version: ${nodeVersion}`);
    console.error('   Please upgrade Node.js from https://nodejs.org/');
    process.exit(1);
  }
  console.log(`✅ Node.js ${nodeVersion} detected`);

  // Check npm
  try {
    await runCommand('npm', ['--version']);
    console.log('✅ npm is available');
  } catch {
    console.error('❌ npm is not available');
    process.exit(1);
  }

  console.log();
}

async function installMCPServer() {
  console.log('📦 Installing MCP Server dependencies...\n');
  
  try {
    await runCommand('npm', ['install'], { cwd: __dirname });
    console.log('✅ MCP Server dependencies installed\n');
  } catch (error) {
    console.error('❌ Failed to install MCP Server dependencies');
    throw error;
  }
}

async function buildMCPServer() {
  console.log('🔨 Building MCP Server...\n');
  
  try {
    await runCommand('npm', ['run', 'build'], { cwd: __dirname });
    console.log('✅ MCP Server built successfully\n');
  } catch (error) {
    console.error('❌ Failed to build MCP Server');
    throw error;
  }
}

async function setupRemotionStudio() {
  console.log('🎬 Setting up Remotion Studio...\n');
  
  const studioPath = path.join(__dirname, 'assets', 'studio-project');
  
  // Ensure studio project directory exists
  await fs.mkdir(studioPath, { recursive: true });
  await fs.mkdir(path.join(studioPath, 'src'), { recursive: true });
  await fs.mkdir(path.join(studioPath, 'public'), { recursive: true });
  
  console.log('📝 Creating Remotion project files...');
  
  // Create package.json if it doesn't exist
  const packageJsonPath = path.join(studioPath, 'package.json');
  const packageJsonContent = {
    name: 'remotion-studio-project',
    version: '1.0.0',
    description: 'Remotion Studio project for Rough Cut MCP',
    scripts: {
      start: 'remotion studio',
      build: 'remotion render',
      upgrade: 'remotion upgrade'
    },
    dependencies: {
      '@remotion/cli': '^4.0.0',
      'remotion': '^4.0.0',
      'react': '^18.0.0',
      'react-dom': '^18.0.0'
    },
    devDependencies: {
      '@types/react': '^18.0.0',
      '@types/react-dom': '^18.0.0',
      'typescript': '^5.0.0'
    }
  };
  
  await fs.writeFile(packageJsonPath, JSON.stringify(packageJsonContent, null, 2));
  
  // Create remotion.config.ts
  const remotionConfigPath = path.join(studioPath, 'remotion.config.ts');
  const remotionConfig = `import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);

// Webpack overrides for Remotion
Config.overrideWebpackConfig((config) => {
  return {
    ...config,
    resolve: {
      ...config.resolve,
      fallback: {
        ...config.resolve?.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
      },
    },
  };
});
`;
  
  await fs.writeFile(remotionConfigPath, remotionConfig);
  
  // Create basic Remotion entry files
  const indexPath = path.join(studioPath, 'src', 'index.tsx');
  const indexContent = `import { registerRoot } from 'remotion';
import { RemotionVideo } from './Video';

registerRoot(RemotionVideo);
`;
  
  await fs.writeFile(indexPath, indexContent);
  
  const videoPath = path.join(studioPath, 'src', 'Video.tsx');
  const videoContent = `import { Composition } from 'remotion';
import { MyComposition } from './Composition';

export const RemotionVideo = () => {
  return (
    <>
      <Composition
        id="MyComp"
        component={MyComposition}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
`;
  
  await fs.writeFile(videoPath, videoContent);
  
  const compositionPath = path.join(studioPath, 'src', 'Composition.tsx');
  const compositionContent = `import { AbsoluteFill } from 'remotion';

export const MyComposition = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#1a1a1a', color: 'white', justifyContent: 'center', alignItems: 'center' }}>
      <h1 style={{ fontSize: 80 }}>Rough Cut MCP</h1>
      <p style={{ fontSize: 40, marginTop: 20 }}>Ready to create videos!</p>
    </AbsoluteFill>
  );
};
`;
  
  await fs.writeFile(compositionPath, compositionContent);
  
  // Create tsconfig.json for the studio project
  const tsconfigPath = path.join(studioPath, 'tsconfig.json');
  const tsconfig = {
    compilerOptions: {
      target: 'ES2018',
      module: 'ESNext',
      jsx: 'react-jsx',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      moduleResolution: 'node'
    },
    include: ['src']
  };
  
  await fs.writeFile(tsconfigPath, JSON.stringify(tsconfig, null, 2));
  
  console.log('✅ Remotion project structure created\n');
  
  // Install Remotion dependencies
  console.log('📦 Installing Remotion dependencies...');
  console.log('   This may take a few minutes...\n');
  
  try {
    await runCommand('npm', ['install'], { cwd: studioPath });
    console.log('✅ Remotion dependencies installed\n');
  } catch (error) {
    console.error('⚠️  Failed to install Remotion dependencies');
    console.error('   You can install them manually later by running:');
    console.error(`   cd "${studioPath}" && npm install\n`);
  }
}

async function setupEnvironment() {
  console.log('🔧 Setting up environment...\n');
  
  const envPath = path.join(__dirname, '.env');
  const envExamplePath = path.join(__dirname, '.env.example');
  
  try {
    await fs.access(envPath);
    console.log('✅ .env file already exists');
  } catch {
    try {
      const envExample = await fs.readFile(envExamplePath, 'utf-8');
      await fs.writeFile(envPath, envExample);
      console.log('✅ Created .env file from .env.example');
      console.log('   Please edit .env to add your API keys if you want to use AI features');
    } catch {
      console.log('⚠️  No .env.example found, creating basic .env');
      const basicEnv = `# Rough Cut MCP Configuration
REMOTION_ASSETS_DIR=./assets

# Optional API Keys (leave blank if not using)
ELEVENLABS_API_KEY=
FREESOUND_API_KEY=
FLUX_API_KEY=
`;
      await fs.writeFile(envPath, basicEnv);
    }
  }
  
  console.log();
}

async function installToClaudeDesktop() {
  console.log('🤖 Claude Desktop Integration\n');
  
  const isWindows = process.platform === 'win32';
  const configPath = isWindows
    ? path.join(process.env.APPDATA || '', 'Claude', 'claude_desktop_config.json')
    : path.join(process.env.HOME || '', '.config', 'Claude', 'claude_desktop_config.json');
  
  console.log('To use with Claude Desktop, add this to your config:');
  console.log(`Location: ${configPath}\n`);
  
  const serverPath = path.join(__dirname, 'build', 'index.js').replace(/\\/g, '\\\\');
  const nodePath = isWindows ? 'node.exe' : 'node';
  
  const config = {
    'rough-cut-mcp': {
      command: nodePath,
      args: [serverPath]
    }
  };
  
  console.log('Configuration to add:');
  console.log(JSON.stringify(config, null, 2));
  
  console.log('\nOr run this command to install automatically:');
  console.log(`node install-to-claude.js\n`);
}

async function printNextSteps() {
  console.log('✨ Installation Complete!\n');
  console.log('📚 Next Steps:\n');
  console.log('1. Test the MCP server:');
  console.log('   npm test\n');
  console.log('2. Launch Remotion Studio manually:');
  console.log('   cd assets/studio-project && npm start\n');
  console.log('3. Configure Claude Desktop:');
  console.log('   node install-to-claude.js\n');
  console.log('4. Add API keys to .env file for AI features (optional)\n');
  console.log('For more information, see README.md');
}

async function main() {
  try {
    await checkPrerequisites();
    await installMCPServer();
    await buildMCPServer();
    await setupEnvironment();
    await setupRemotionStudio();
    await installToClaudeDesktop();
    await printNextSteps();
  } catch (error) {
    console.error('\n❌ Installation failed:', error.message);
    process.exit(1);
  }
}

// Run installation
main().catch(console.error);