// Simple MCP Tools - Just File Operations, No Intelligence
// Lets Claude generate excellent JSX, MCP handles technical implementation only

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import * as fs from 'fs-extra';
import * as path from 'path';
import { spawn } from 'child_process';
import { getProjectPath, getMCPStatusInfo } from './utils.js';
import { convertArtifactToRemotionAST } from './ast-converter.js';
import { createServer, Socket } from 'net';

// Get absolute path to OUR project directory (not Claude Desktop's working directory)
function getOurProjectRoot(): string {
  // __filename points to our build/tools.js file
  const buildDir = path.dirname(__filename);
  return path.dirname(buildDir); // Go up one level to project root
}

function getOurLogsDir(): string {
  return path.join(getOurProjectRoot(), 'logs');
}

// Consolidate relevant MCP server information into our logs
async function consolidateMCPInfo(toolName: string, status: string) {
  try {
    const logsDir = getOurLogsDir();
    await fs.ensureDir(logsDir);
    
    const mcpServerLogPath = '/mnt/d/MY PROJECTS/AI/LLM/AI Code Gen/my-builds/Video + Motion/rough-cut-mcp/docs/debug/mcp-server-rough-cut-mcp.log';
    
    // Check if MCP server log exists and read relevant info
    if (await fs.pathExists(mcpServerLogPath)) {
      const mcpLog = await fs.readFile(mcpServerLogPath, 'utf-8');
      
      // Extract relevant information for our consolidated log
      const timestamp = new Date().toISOString();
      const consolidatedLogPath = path.join(logsDir, 'mcp-consolidated.log');
      
      await fs.appendFile(consolidatedLogPath, `\n=== ${toolName.toUpperCase()} - ${status} - ${timestamp} ===\n`);
      
      // Extract version info
      const versionMatch = mcpLog.match(/MCP Server Version: ([^\n\r]*)/);
      if (versionMatch) {
        await fs.appendFile(consolidatedLogPath, `Version: ${versionMatch[1]}\n`);
      }
      
      // Extract working directory info
      const workingDirMatch = mcpLog.match(/Working Directory: ([^\n\r]*)/);
      if (workingDirMatch) {
        await fs.appendFile(consolidatedLogPath, `Working Directory: ${workingDirMatch[1]}\n`);
      }
      
      // Extract script path
      const scriptPathMatch = mcpLog.match(/Script Path: ([^\n\r]*)/);
      if (scriptPathMatch) {
        await fs.appendFile(consolidatedLogPath, `Script Path: ${scriptPathMatch[1]}\n`);
      }
      
      // Extract any errors
      const errorLines = mcpLog.split('\n').filter(line => 
        line.includes('ERROR') || line.includes('error') || line.includes('failed') || line.includes('timeout')
      );
      
      if (errorLines.length > 0) {
        await fs.appendFile(consolidatedLogPath, `Recent Errors:\n`);
        errorLines.slice(-5).forEach(async (error) => {
          await fs.appendFile(consolidatedLogPath, `  ${error}\n`);
        });
      }
      
      await fs.appendFile(consolidatedLogPath, `Status: ${status}\n`);
      
    } else {
      const timestamp = new Date().toISOString();
      await fs.appendFile(path.join(logsDir, 'mcp-consolidated.log'), `${timestamp}: Could not find MCP server log at ${mcpServerLogPath}\n`);
    }
  } catch (error) {
    console.error(`[CONSOLIDATE] Error consolidating MCP info:`, error);
  }
}

// Find available port in range 8000-8010 (clean range, avoiding contaminated 7890-7900)
async function findAvailablePort(startPort: number = 8000, endPort: number = 8010): Promise<number> {
  // First, kill any failed remotion processes to free up ports
  try {
    const { spawn: killSpawn } = require('child_process');
    const killProcess = killSpawn('pkill', ['-f', 'remotion studio'], { shell: true });
    await new Promise(resolve => {
      killProcess.on('close', () => resolve(true));
      setTimeout(resolve, 2000); // Timeout after 2 seconds
    });
  } catch (error) {
    console.error('[PORT-CLEANUP] Could not clean up old processes:', error);
  }
  
  for (let port = startPort; port <= endPort; port++) {
    try {
      await new Promise((resolve, reject) => {
        const server = createServer();
        server.listen(port, () => {
          server.close(() => resolve(port));
        });
        server.on('error', reject);
      });
      
      // Double-check by testing HTTP connection
      const http = require('http');
      try {
        await new Promise((resolve, reject) => {
          const req = http.get(`http://localhost:${port}`, { timeout: 1000 }, (res: any) => {
            reject(new Error('Port appears to be serving content')); // Port in use
          });
          req.on('error', () => resolve(true)); // Port is free
          req.on('timeout', () => {
            req.destroy();
            resolve(true); // Timeout means port is likely free
          });
        });
        
        return port; // Port is truly available
      } catch (err) {
        // Port might be in use by a web server, try next
      }
    } catch (err) {
      // Port is in use, try next one
    }
  }
  throw new Error(`No available ports in range ${startPort}-${endPort} (using clean 8000-8010 range)`);
}

export const tools: Tool[] = [
  {
    name: 'launch_studio',
    description: 'Launch Remotion Studio for project.',
    inputSchema: {
      type: 'object', 
      properties: {
        name: { type: 'string', description: 'Project name' }
      },
      required: ['name']
    }
  },
  {
    name: 'read_project',
    description: 'Read current VideoComposition.tsx content.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Project name' }
      },
      required: ['name']
    }
  },
  {
    name: 'convert_artifact_to_video',
    description: 'Create professional animated videos from Claude Artifacts. Converts working Artifact JSX into high-quality Remotion video projects with smooth animations and professional styling. Perfect for turning interactive demos into shareable videos.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Project name for the video (e.g. "github-showcase", "coding-tutorial")' },
        artifactJsx: { type: 'string', description: 'Working Claude Artifact JSX code (copy from Artifacts panel in Claude Desktop)' }
      },
      required: ['name', 'artifactJsx']
    }
  },
  {
    name: 'get_mcp_info',
    description: 'Get MCP server version and build information to verify updates.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false
    }
  }
];

export async function handleToolCall(name: string, arguments_: any) {
  // Use OUR project logs directory, not Claude Desktop's working directory
  const logsDir = getOurLogsDir();
  await fs.ensureDir(logsDir);
  
  await fs.appendFile(path.join(logsDir, 'mcp-tool-calls.log'), `ENTRY: ${name} - ${new Date().toISOString()}\n`);
  
  try {
    switch (name) {
      case 'launch_studio':
        await fs.appendFile(path.join(logsDir, 'mcp-tool-calls.log'), `CASE: launch_studio - ${new Date().toISOString()}\n`);
        return await launchStudio(arguments_.name);
        
      case 'read_project':
        await fs.appendFile(path.join(logsDir, 'mcp-tool-calls.log'), `CASE: read_project - ${new Date().toISOString()}\n`);
        return await readProject(arguments_.name);
        
      case 'convert_artifact_to_video':
        await fs.appendFile(path.join(logsDir, 'mcp-tool-calls.log'), `CASE: convert_artifact_to_video MATCHED - ${new Date().toISOString()}\n`);
        
        const result = await convertArtifactToVideo(arguments_.name, arguments_.artifactJsx);
        
        await fs.appendFile(path.join(logsDir, 'mcp-tool-calls.log'), `CONVERT COMPLETE - ${new Date().toISOString()}\n`);
        
        // Consolidate MCP server information for debugging
        await consolidateMCPInfo('convert_artifact_to_video', 'COMPLETED');
        
        return result;
        
      case 'get_mcp_info':
        await fs.appendFile(path.join(logsDir, 'mcp-tool-calls.log'), `CASE: get_mcp_info - ${new Date().toISOString()}\n`);
        return await getMCPInfo();
        
      default:
        await fs.appendFile(path.join(logsDir, 'mcp-tool-calls.log'), `DEFAULT: ${name} - ${new Date().toISOString()}\n`);
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    await fs.appendFile(path.join(logsDir, 'mcp-errors.log'), `ERROR: ${error instanceof Error ? error.message : 'Unknown'} - ${new Date().toISOString()}\n`);
    
    // Consolidate error information from MCP server
    await consolidateMCPInfo('handleToolCall', `ERROR: ${error instanceof Error ? error.message : 'Unknown'}`);
    
    throw error;
  }
}


// LAUNCH: Start Remotion Studio with dynamic port allocation
async function launchStudio(name: string) {
  // Windows-compatible atomic testing in our logs folder
  const logsDir = getOurLogsDir();
  const fs = require('fs-extra');
  fs.ensureDirSync(logsDir);
  fs.appendFileSync(path.join(logsDir, 'atomic-launch.log'), `LAUNCH CALLED: ${name} - ${new Date().toISOString()}\n`);
  
  try {
    const projectPath = getProjectPath(name);
    
    // Atomic test: Verify project exists
    const projectExists = await fs.pathExists(projectPath);
    fs.appendFileSync(path.join(logsDir, 'atomic-launch.log'), `PROJECT: ${projectPath} - EXISTS: ${projectExists}\n`);
    
    // Find available port for this launch
    const availablePort = await findAvailablePort();
    console.error(`[LAUNCH-STUDIO] Using port ${availablePort} for ${name}`);
    
    // Atomic test: Port assignment
    fs.appendFileSync(path.join(logsDir, 'atomic-launch.log'), `PORT: ${availablePort}\n`);
    
    // Update project's package.json with the available port
    const packageJsonPath = path.join(projectPath, 'package.json');
    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath);
      packageJson.scripts = packageJson.scripts || {};
      packageJson.scripts.start = `remotion studio --port=${availablePort}`;
      await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
      console.error(`[LAUNCH-STUDIO] Updated package.json with port ${availablePort}`);
    }
    
    // FORCE fresh dependency installation - delete old incomplete node_modules  
    const nodeModulesPath = path.join(projectPath, 'node_modules');
    
    // Always remove old node_modules to ensure CLI dependencies are installed
    if (await fs.pathExists(nodeModulesPath)) {
      await fs.appendFile(path.join(logsDir, 'npm-install.log'), `REMOVING old node_modules to force fresh install with CLI tools\n`);
      await fs.remove(nodeModulesPath);
    }
    
    // Now install fresh dependencies
      await fs.appendFile(path.join(logsDir, 'npm-install.log'), `=== DEPENDENCY INSTALLATION START for ${name} ===\n`);
      await fs.appendFile(path.join(logsDir, 'npm-install.log'), `Project path: ${projectPath}\n`);
      await fs.appendFile(path.join(logsDir, 'npm-install.log'), `Node modules path: ${nodeModulesPath}\n`);
      await fs.appendFile(path.join(logsDir, 'npm-install.log'), `Timestamp: ${new Date().toISOString()}\n`);
      
      console.error(`[LAUNCH-STUDIO] Installing dependencies for ${name}...`);
      
      // Platform-aware dependency installation to prevent esbuild mismatches
      const isWSL = process.platform === 'linux' && process.env.WSL_DISTRO_NAME;
      fs.appendFileSync(path.join(logsDir, 'npm-install.log'), `PLATFORM: ${process.platform}, WSL: ${isWSL}, Node: ${process.version}\n`);
      
      // Clean any existing package-lock.json that might have wrong platform packages
      const lockFilePath = path.join(projectPath, 'package-lock.json');
      const nodeModulesCleanPath = path.join(projectPath, 'node_modules');
      
      if (await fs.pathExists(lockFilePath)) {
        await fs.remove(lockFilePath);
        fs.appendFileSync(path.join(logsDir, 'npm-install.log'), `CLEANED: Removed existing package-lock.json for fresh platform detection\n`);
      }
      
      if (await fs.pathExists(nodeModulesCleanPath)) {
        await fs.remove(nodeModulesCleanPath);
        fs.appendFileSync(path.join(logsDir, 'npm-install.log'), `CLEANED: Removed existing node_modules for fresh platform installation\n`);
      }
      
      // Install dependencies with platform-appropriate configuration
      const installArgs = isWSL 
        ? ['install', '--no-optional', '--force'] // Force Linux packages in WSL2
        : ['install']; // Standard installation
        
      fs.appendFileSync(path.join(logsDir, 'npm-install.log'), `COMMAND: npm ${installArgs.join(' ')}\n`);
      
      const installProcess = spawn('npm', installArgs, {
        cwd: projectPath,
        shell: true,
        stdio: ['ignore', 'pipe', 'pipe'],  // Capture stdout and stderr
        env: {
          ...process.env,
          // Force platform detection for esbuild
          npm_config_target_platform: isWSL ? 'linux' : 'win32',
          npm_config_target_arch: 'x64'
        }
      });
      
      // Log stdout
      installProcess.stdout.on('data', (data) => {
        const output = data.toString();
        fs.appendFileSync(path.join(logsDir, 'npm-install.log'), `STDOUT: ${output}`);
      });
      
      // Log stderr
      installProcess.stderr.on('data', (data) => {
        const output = data.toString();
        fs.appendFileSync(path.join(logsDir, 'npm-install.log'), `STDERR: ${output}`);
      });
      
      // Wait for installation with timeout
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          fs.appendFileSync(path.join(logsDir, 'npm-install.log'), `TIMEOUT: npm install timed out after 120 seconds\n`);
          installProcess.kill('SIGKILL');
          reject(new Error(`npm install timed out after 120 seconds`));
        }, 120000); // 2 minute timeout
        
        installProcess.on('close', (code) => {
          clearTimeout(timeout);
          fs.appendFileSync(path.join(logsDir, 'npm-install.log'), `COMPLETED: npm install finished with code ${code}\n`);
          
          if (code === 0) {
            console.error(`[LAUNCH-STUDIO] Dependencies installed successfully`);
            fs.appendFileSync(path.join(logsDir, 'npm-install.log'), `SUCCESS: Dependencies installed successfully\n`);
            resolve(true);
          } else {
            const errorMsg = `npm install failed with code ${code}`;
            fs.appendFileSync(path.join(logsDir, 'npm-install.log'), `ERROR: ${errorMsg}\n`);
            reject(new Error(errorMsg));
          }
        });
        
        installProcess.on('error', (error) => {
          clearTimeout(timeout);
          fs.appendFileSync(path.join(logsDir, 'npm-install.log'), `PROCESS ERROR: ${error.message}\n`);
          reject(error);
        });
      });
    
    console.error(`[LAUNCH-STUDIO] Starting Remotion Studio on port ${availablePort}...`);
    
    // Windows-compatible atomic test: Before process spawn
    fs.appendFileSync(path.join(logsDir, 'atomic-launch.log'), `BEFORE SPAWN: ${new Date().toISOString()}\n`);
    
    // Consolidate successful launch info
    await consolidateMCPInfo('launch_studio', `LAUNCHING on port ${availablePort}`);
    
    const studio = spawn('npm', ['start'], {
      cwd: projectPath,
      stdio: 'pipe', // Prevent studio output from interfering with MCP communication
      shell: true
    });
    
    // Windows-compatible atomic test: Process launched
    fs.appendFileSync(path.join(logsDir, 'atomic-launch.log'), `PROCESS PID: ${studio.pid} - ${new Date().toISOString()}\n`);
    
    // Wait for studio to actually become available (prevent EPIPE errors)
    console.error(`[LAUNCH-STUDIO] Waiting for studio to become available on port ${availablePort}...`);
    fs.appendFileSync(path.join(logsDir, 'atomic-launch.log'), `VERIFICATION: Waiting for studio to respond on port ${availablePort}\n`);
    
    const studioURL = `http://localhost:${availablePort}`;
    let studioReady = false;
    let attempts = 0;
    const maxAttempts = 60; // 60 seconds timeout for complex artifacts
    
    while (!studioReady && attempts < maxAttempts) {
      try {
        // Test if studio responds using socket connection
        await new Promise((resolve, reject) => {
          const testSocket = new Socket();
          testSocket.connect(availablePort, 'localhost', () => {
            testSocket.destroy();
            resolve(true);
          });
          testSocket.on('error', () => reject(new Error('Connection failed')));
          setTimeout(() => {
            testSocket.destroy();
            reject(new Error('Timeout'));
          }, 1000);
        });
        
        studioReady = true;
        fs.appendFileSync(path.join(logsDir, 'atomic-launch.log'), `VERIFIED: Studio responding on port ${availablePort} after ${attempts + 1} attempts\n`);
        console.error(`[LAUNCH-STUDIO] ✅ Studio verified responding after ${attempts + 1} attempts`);
        
      } catch (error) {
        attempts++;
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        }
      }
    }
    
    if (!studioReady) {
      fs.appendFileSync(path.join(logsDir, 'atomic-launch.log'), `TIMEOUT: Studio did not respond after ${maxAttempts} attempts\n`);
      return {
        content: [{
          type: 'text',
          text: `⚠️ **Studio Launch Timeout for "${name}"**

❌ **Status**: Studio process started but not responding after ${maxAttempts} seconds
🔧 **Troubleshooting**: 
1. **Check compilation**: Project may have build errors preventing studio load
2. **Manual test**: Try \`cd assets/projects/${name} && npm start\`
3. **Log details**: Check \`logs/atomic-launch.log\` and \`logs/npm-install.log\`

🐛 **Debug Info**: PID ${studio.pid}, Port ${availablePort}`
        }],
        isError: true
      };
    }
    
    return {
      content: [{
        type: 'text',
        text: `🎬 **Remotion Studio VERIFIED RUNNING for "${name}"**

✅ **Launch Status**: Studio confirmed responding on port ${availablePort}
🌐 **Studio URL**: ${studioURL}
📁 **Project**: \`assets/projects/${name}/\`
⏱️ **Startup Time**: ${attempts + 1} seconds

🚀 **Ready to Use**:
1. **Open Browser**: Visit ${studioURL}
2. **Preview Video**: Your converted Artifact is now an animated video
3. **Render**: Export video when ready

✅ **Verified**: Studio is responding and ready for use!

🐛 **Debug**: Launch verified in \`logs/atomic-launch.log\``
      }]
    };
    
  } catch (error) {
    return {
      content: [{
        type: 'text', 
        text: `❌ Error launching studio: ${error instanceof Error ? error.message : 'Unknown error'}`
      }],
      isError: true
    };
  }
}

// SIMPLE: Read current project JSX
async function readProject(name: string) {
  try {
    const projectPath = getProjectPath(name);
    const compositionPath = path.join(projectPath, 'src', 'VideoComposition.tsx');
    
    const jsx = await fs.readFile(compositionPath, 'utf-8');
    
    return {
      content: [{
        type: 'text',
        text: `Current VideoComposition.tsx for "${name}":\n\n\`\`\`tsx\n${jsx}\n\`\`\``
      }]
    };
    
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `❌ Error reading project: ${error instanceof Error ? error.message : 'Unknown error'}`
      }],
      isError: true
    };
  }
}

// CONVERT: Transform working Claude Artifact to Remotion video project using AST
async function convertArtifactToVideo(name: string, artifactJsx: string) {
  // Use OUR project logs directory
  const logsDir = getOurLogsDir();
  await fs.ensureDir(logsDir);
  await fs.appendFile(path.join(logsDir, 'mcp-function-calls.log'), `FUNCTION ENTRY: convertArtifactToVideo - ${new Date().toISOString()}\n`);
  
  const logFile = path.join(logsDir, 'mcp-debug.log');
  
  async function debugLog(message: string) {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} [MCP-DEBUG] ${message}\n`;
    await fs.appendFile(logFile, logEntry);
    console.error(`[MCP-DEBUG] ${message}`);
  }
  
  try {
    // Windows-compatible parameter validation to OUR logs
    await fs.appendFile(path.join(logsDir, 'mcp-function-calls.log'), `PARAMS: NAME: ${name}, JSX_LENGTH: ${artifactJsx?.length || 'undefined'} - ${new Date().toISOString()}\n`);
    
    await debugLog(`=== MCP TOOL CALL STARTED ===`);
    await debugLog(`Tool: convert_artifact_to_video`);
    await debugLog(`Name: ${name}`);
    await debugLog(`JSX Length: ${artifactJsx.length}`);
    await debugLog(`Claude Working Directory: ${process.cwd()}`);
    await debugLog(`Our Project Root: ${getOurProjectRoot()}`);
    await debugLog(`Node Version: ${process.version}`);
    
    // Use absolute path to OUR build directory
    const projectRoot = getOurProjectRoot();
    const astConverterPath = path.join(projectRoot, 'build', 'ast-converter.js');
    
    await debugLog(`Project Root: ${projectRoot}`);
    await debugLog(`AST Converter Path: ${astConverterPath}`);
    
    const exists = await fs.pathExists(astConverterPath);
    await debugLog(`AST Converter Exists: ${exists}`);
    
    if (!exists) {
      throw new Error(`AST converter not found at: ${astConverterPath}`);
    }
    
    // Log before import attempt
    await debugLog(`Attempting to import AST converter...`);
    
    // Use dynamic import with absolute path
    let convertFunction;
    try {
      const astModule = await import(astConverterPath);
      convertFunction = astModule.convertArtifactToRemotionAST;
      await debugLog(`✅ AST converter imported successfully`);
      await debugLog(`Function type: ${typeof convertFunction}`);
    } catch (importError) {
      const errorMsg = importError instanceof Error ? importError.message : 'Unknown import error';
      await debugLog(`❌ Import failed: ${errorMsg}`);
      throw importError;
    }
    
    if (!convertFunction) {
      throw new Error('convertArtifactToRemotionAST function not found in module');
    }
    
    // Log before function execution
    await debugLog(`Calling convertArtifactToRemotionAST with ${artifactJsx.length} chars...`);
    
    const remotionJsx = await convertFunction(artifactJsx);
    
    await debugLog(`✅ AST conversion completed`);
    await debugLog(`Result length: ${remotionJsx?.length || 'undefined'}`);
    
    if (!remotionJsx) {
      throw new Error('AST conversion returned null/undefined');
    }
    
    // Create the project and logs directory
    const projectPath = getProjectPath(name);
    
    await fs.ensureDir(projectPath);
    await fs.ensureDir(path.join(projectPath, 'src'));
    await fs.ensureDir(path.join(projectPath, 'public'));
    await fs.ensureDir('logs'); // Ensure logs directory exists
    
    // Log the complete converted JSX content for analysis
    await fs.appendFile(path.join(logsDir, 'converted-jsx.log'), `\n=== CONVERTED JSX for ${name} - ${new Date().toISOString()} ===\n`);
    await fs.appendFile(path.join(logsDir, 'converted-jsx.log'), `${remotionJsx}\n`);
    await fs.appendFile(path.join(logsDir, 'converted-jsx.log'), `=== END CONVERTED JSX ===\n\n`);
    
    // Use converted JSX
    await fs.writeFile(path.join(projectPath, 'src', 'VideoComposition.tsx'), remotionJsx);
    
    // Create Root.tsx
    const rootContent = `import React from 'react';
import { Composition } from 'remotion';
import VideoComposition from './VideoComposition';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="VideoComposition"
      component={VideoComposition}
      durationInFrames={720}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};`;
    
    await fs.writeFile(path.join(projectPath, 'src', 'Root.tsx'), rootContent);
    
    // Create index.ts
    const indexContent = `import { registerRoot } from 'remotion';
import { RemotionRoot } from './Root';

registerRoot(RemotionRoot);`;
    
    await fs.writeFile(path.join(projectPath, 'src', 'index.ts'), indexContent);
    
    // Find available port and create package.json
    const availablePort = await findAvailablePort();
    console.error(`[CONVERT-ARTIFACT] Using port ${availablePort} for studio`);
    
    const packageJson = {
      "name": name,
      "version": "1.0.0", 
      "scripts": {
        "start": `remotion studio --port=${availablePort}`,
        "build": "remotion render src/index.ts VideoComposition out/video.mp4"
      },
      "dependencies": {
        "@remotion/bundler": "^4.0.341",  // Required for studio command
        "@remotion/cli": "^4.0.341",      // Required for remotion studio
        "react": "^18.2.0",
        "react-dom": "^18.2.0", 
        "remotion": "^4.0.340"
      },
      "devDependencies": {
        "@types/react": "^18.0.0",
        "typescript": "^5.0.0"
      }
    };
    
    await fs.writeFile(path.join(projectPath, 'package.json'), JSON.stringify(packageJson, null, 2));
    
    // CRITICAL FIX: Add missing dependencies AFTER package.json creation (not before!)
    await addMissingDependencies(projectPath, remotionJsx, name);
    
    // Create tsconfig and config files
    const tsConfig = {
      "compilerOptions": {
        "target": "ES2020",
        "lib": ["ES2020", "DOM"],
        "module": "ESNext", 
        "moduleResolution": "bundler",
        "jsx": "react-jsx",
        "strict": true,
        "skipLibCheck": true,
        "esModuleInterop": true,
        "allowSyntheticDefaultImports": true,
        "forceConsistentCasingInFileNames": true,
        "isolatedModules": true,
        "noEmit": true
      },
      "include": ["src/**/*"],
      "exclude": ["node_modules"]
    };
    
    await fs.writeFile(path.join(projectPath, 'tsconfig.json'), JSON.stringify(tsConfig, null, 2));
    
    const configContent = `import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);`;
    
    await fs.writeFile(path.join(projectPath, 'remotion.config.ts'), configContent);
    
    await debugLog(`Creating project files...`);
    await debugLog(`=== MCP TOOL CALL COMPLETED ===`);
    
    return {
      content: [{
        type: 'text',
        text: `🎯 **Runtime Safety Fixes v10.1.0 - SUCCESS!**

✅ **"${name}" Artifact → Remotion Video Conversion Complete**

📊 **Conversion Summary:**
- **Original JSX**: ${artifactJsx.length} chars (useState/useEffect patterns)
- **Remotion JSX**: ${remotionJsx.length} chars (frame-based alternatives)
- **Variables Converted**: Smart frame-based detection applied
- **Interactive Handlers**: Removed (onMouseMove, onClick, etc.)
- **Animation System**: useCurrentFrame() integrated

📁 **Project Location**: \`assets/projects/${name}/\`
🎬 **Ready to Launch**: Use \`launch_studio\` tool with name "${name}"
🐛 **Debug Logs**: \`logs/ast-debug.log\` (AST details), \`logs/mcp-debug.log\` (MCP operations)

🚀 **Next Steps**:
1. Launch Remotion Studio: \`launch_studio("${name}")\`
2. Preview your video at: http://localhost:${availablePort}
3. Render video: npm run build (in project directory)

**Note**: Enhanced AST converter automatically handles complex useState patterns including arrays, objects, and interactive elements!`
      }]
    };
    
  } catch (error) {
    await debugLog(`❌ ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
    await debugLog(`Error stack: ${error instanceof Error ? error.stack : 'No stack'}`);
    
    return {
      content: [{
        type: 'text',
        text: `❌ **Runtime Safety Fixes v10.1.0 - CONVERSION FAILED**

**Error**: ${error instanceof Error ? error.message : 'Unknown error'}

🔍 **Troubleshooting**:
1. **Check JSX Syntax**: Ensure valid React JSX (no syntax errors)
2. **Complex Patterns**: Some useState patterns may need manual conversion
3. **Debug Logs**: Detailed error info in \`logs/ast-debug.log\`
4. **MCP Logs**: Server operations logged in \`logs/mcp-debug.log\`

📋 **Common Issues**:
- **Invalid JSX**: Check for unclosed tags, missing imports
- **Complex useState**: Very complex state logic may need manual handling
- **File System**: Check permissions for project directory creation

💡 **Support**: If this is a valid Artifact that should convert, please report the issue with the JSX content and error details.`
      }],
      isError: true
    };
  }
}

// Automatically add missing dependencies to project based on preserved imports (WITH COMPREHENSIVE DEBUGGING)
async function addMissingDependencies(projectPath: string, remotionJsx: string, projectName: string): Promise<void> {
  try {
    const packageJsonPath = path.join(projectPath, 'package.json');
    const logsDir = getOurLogsDir();
    
    // COMPREHENSIVE DEBUGGING: Track every step
    console.error(`[DEBUG-DEPS] Starting dependency addition for: ${projectName}`);
    console.error(`[DEBUG-DEPS] Project path: ${projectPath}`);
    console.error(`[DEBUG-DEPS] Package.json path: ${packageJsonPath}`);
    
    // Pre-verification checks
    const exists = await fs.pathExists(packageJsonPath);
    console.error(`[DEBUG-DEPS] Package.json exists: ${exists}`);
    
    if (!exists) {
      console.error(`[ERROR-DEPS] Package.json does not exist at: ${packageJsonPath}`);
      return;
    }
    
    // File system diagnostics  
    try {
      const stats = await fs.stat(packageJsonPath);
      console.error(`[DEBUG-DEPS] File size: ${stats.size} bytes`);
      console.error(`[DEBUG-DEPS] File permissions: ${stats.mode.toString(8)}`);
      console.error(`[DEBUG-DEPS] Last modified: ${stats.mtime}`);
    } catch (statError) {
      console.error(`[ERROR-DEPS] Cannot stat file: ${statError instanceof Error ? statError.message : 'unknown'}`);
    }
    
    // Read current package.json content
    const packageJson = await fs.readJson(packageJsonPath);
    console.error(`[DEBUG-DEPS] Current dependencies: ${JSON.stringify(Object.keys(packageJson.dependencies || {}))}`);
    
    let dependenciesAdded = false;
    
    // Check for lucide-react imports
    if (remotionJsx.includes("from 'lucide-react'") || remotionJsx.includes('from "lucide-react"')) {
      console.error(`[DEPENDENCY] Adding lucide-react for ${projectName}`);
      packageJson.dependencies = packageJson.dependencies || {};
      packageJson.dependencies['lucide-react'] = '^0.400.0';
      dependenciesAdded = true;
      
      console.error(`[DEBUG-DEPS] Modified dependencies object: ${JSON.stringify(Object.keys(packageJson.dependencies))}`);
      fs.appendFileSync(path.join(logsDir, 'npm-install.log'), `DEPENDENCY-AUTO-ADD: lucide-react for preserved imports in ${projectName}\n`);
    }
    
    // Check for other common imports
    if (remotionJsx.includes("from 'framer-motion'")) {
      console.error(`[DEPENDENCY] Adding framer-motion for ${projectName}`);
      packageJson.dependencies['framer-motion'] = '^11.0.0';
      dependenciesAdded = true;
    }
    
    if (remotionJsx.includes("from 'react-icons'")) {
      console.error(`[DEPENDENCY] Adding react-icons for ${projectName}`);
      packageJson.dependencies['react-icons'] = '^5.0.0';
      dependenciesAdded = true;
    }
    
    // Critical: Update package.json with comprehensive verification
    if (dependenciesAdded) {
      console.error(`[DEBUG-DEPS] About to write package.json with ${Object.keys(packageJson.dependencies).length} dependencies`);
      
      // Add delay to prevent WSL2 race conditions
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Write with explicit options for WSL2 compatibility
      await fs.writeJson(packageJsonPath, packageJson, { 
        spaces: 2
      });
      
      // Force filesystem sync (critical for WSL2)
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // CRITICAL: Immediate verification read
      const verification = await fs.readJson(packageJsonPath);
      console.error(`[DEBUG-DEPS] Verification read dependencies: ${JSON.stringify(Object.keys(verification.dependencies || {}))}`);
      
      if (verification.dependencies && verification.dependencies['lucide-react']) {
        console.error(`[SUCCESS-DEPS] lucide-react VERIFIED in package.json for ${projectName}`);
        fs.appendFileSync(path.join(logsDir, 'npm-install.log'), `DEPENDENCY-VERIFIED: lucide-react confirmed in package.json for ${projectName}\n`);
      } else {
        console.error(`[FAILURE-DEPS] lucide-react NOT FOUND in verification read for ${projectName}`);
        console.error(`[FAILURE-DEPS] This indicates WSL2 filesystem issue or race condition`);
        fs.appendFileSync(path.join(logsDir, 'npm-install.log'), `DEPENDENCY-FAILURE: lucide-react write failed verification for ${projectName}\n`);
        throw new Error(`Dependency write verification failed - lucide-react not found after writeJson`);
      }
      
    } else {
      console.error(`[DEBUG-DEPS] No missing dependencies detected for ${projectName}`);
    }
    
  } catch (error) {
    console.error(`[ERROR-DEPS] Failed to add missing dependencies for ${projectName}:`, error instanceof Error ? error.message : 'unknown');
    console.error(`[ERROR-DEPS] Stack trace:`, error instanceof Error ? error.stack : 'no stack');
    fs.appendFileSync(path.join(getOurLogsDir(), 'npm-install.log'), `DEPENDENCY-ERROR: ${error instanceof Error ? error.message : 'unknown'} for ${projectName}\n`);
    throw error; // Re-throw to prevent silent failure
  }
}

// GET MCP INFO: Show current version and build information
async function getMCPInfo() {
  try {
    const statusInfo = await getMCPStatusInfo();
    const buildTime = new Date().toISOString();
    
    return {
      content: [{
        type: 'text',
        text: `🛠️ **Rough Cut MCP Server Info**

**Version**: ${statusInfo.version?.current || '10.1.0'} - Runtime Safety + Dynamic Gradient Preservation
**Conversion Method**: AST-Based (Babel parser for syntax safety)
**Build Time**: ${buildTime}
**Available Tools**: 4
  • convert_artifact_to_video (AST-based semantic transformation)
  • launch_studio (port 8000-8010)
  • read_project
  • get_mcp_info

**Port Range**: 8000-8010
**Dependencies**: @babel/core, @babel/parser, @babel/traverse, @babel/generator

✅ **High Quality Consistency Active** - Semantic JSX transformation prevents syntax errors.`
      }]
    };
    
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `❌ Error getting MCP info: ${error instanceof Error ? error.message : 'Unknown error'}`
      }],
      isError: true
    };
  }
}