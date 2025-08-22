#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import fs from 'fs';
import { join, basename } from 'path';
import { spawn, execSync } from 'child_process';
import { createWriteStream } from 'fs';
import os from 'os';

// Windows-optimized process isolation
function spawnIsolated(command, args, options = {}) {
    const timestamp = Date.now();
    const logFile = join(os.tmpdir(), `process-${timestamp}.log`);
    const logStream = createWriteStream(logFile, { flags: 'a' });
    
    // Force Windows mode since Claude Desktop is Windows app
    const isWindows = true;
    
    const spawnOptions = {
        ...options,
        stdio: ['ignore', 'pipe', 'pipe'], // stdin ignored, stdout/stderr piped
        shell: isWindows, // Use shell on Windows
        env: {
            ...process.env,
            ...options.env,
            // Remotion-specific environment variables
            REMOTION_QUIET: 'true',
            REMOTION_DISABLE_UPDATE_CHECK: 'true',
            REMOTION_LOG_LEVEL: 'error',
            PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: 'true',
            NODE_ENV: 'production',
            // Windows-specific
            FORCE_COLOR: '0', // Disable ANSI colors
            NO_COLOR: '1',
            // Let Remotion auto-detect browser
        }
    };
    
    // For Windows, handle command quoting to avoid path issues with spaces
    let finalCommand = command;
    let finalArgs = args;
    
    if (isWindows && spawnOptions.shell) {
        // On Windows with shell, quote command if it has spaces
        if (command.includes(' ') && !command.startsWith('"')) {
            finalCommand = `"${command}"`;
        }
        // Quote any args that contain spaces
        finalArgs = args.map(arg => {
            if (typeof arg === 'string' && arg.includes(' ') && !arg.startsWith('"')) {
                return `"${arg}"`;
            }
            return arg;
        });
    }
    
    const child = spawn(finalCommand, finalArgs, spawnOptions);
    let stdoutData = '';
    let stderrData = '';
    
    // Capture all output without sending to parent
    if (child.stdout) {
        child.stdout.on('data', (data) => {
            const content = data.toString();
            stdoutData += content;
            logStream.write(`[STDOUT] ${content}`);
        });
    }
    if (child.stderr) {
        child.stderr.on('data', (data) => {
            const content = data.toString();
            stderrData += content;
            logStream.write(`[STDERR] ${content}`);
        });
    }
    
    const promise = new Promise((resolve, reject) => {
        let resolved = false;
        child.on('exit', (code) => {
            if (!resolved) {
                resolved = true;
                logStream.end();
                resolve({
                    code: code || 0,
                    stdout: stdoutData,
                    stderr: stderrData,
                    logFile
                });
            }
        });
        child.on('error', (error) => {
            if (!resolved) {
                resolved = true;
                logStream.end();
                reject(error);
            }
        });
    });
    
    return { child, promise };
}

// Get NPX command with Windows resolution
function getNpxCommand() {
    try {
        // Try to find npx using 'where' on Windows or 'which' on Unix
        const command = process.platform === 'win32' ? 'where npx' : 'which npx';
        const npxPath = execSync(command, { encoding: 'utf8', timeout: 5000 }).trim().split('\n')[0];
        if (npxPath && existsSync(npxPath)) {
            return npxPath;
        }
    } catch (error) {
        // Fall back to hardcoded paths
    }
    
    // For Windows paths
    const windowsPaths = [
        'C:\\Program Files\\nodejs\\npx.cmd',
        'C:\\Program Files (x86)\\nodejs\\npx.cmd'
    ];
    for (const path of windowsPaths) {
        try {
            if (existsSync(path)) {
                return path;
            }
        } catch {
            continue;
        }
    }
    
    // Fallback
    return process.platform === 'win32' ? 'npx.cmd' : 'npx';
}

// Get NPM command with Windows resolution
function getNpmCommand() {
    try {
        const command = process.platform === 'win32' ? 'where npm' : 'which npm';
        const npmPath = execSync(command, { encoding: 'utf8', timeout: 5000 }).trim().split('\n')[0];
        if (npmPath && existsSync(npmPath)) {
            return npmPath;
        }
    } catch (error) {
        // Fall back to hardcoded paths
    }
    
    // For Windows paths
    const windowsPaths = [
        'C:\\Program Files\\nodejs\\npm.cmd',
        'C:\\Program Files (x86)\\nodejs\\npm.cmd'
    ];
    for (const path of windowsPaths) {
        try {
            if (existsSync(path)) {
                return path;
            }
        } catch {
            continue;
        }
    }
    
    return process.platform === 'win32' ? 'npm.cmd' : 'npm';
}

export class RoughCutMCPServer {
    server;
    projectsDir;
    videosDir;
    
    constructor() {
        // Setup directories
        const baseDir = process.env.REMOTION_ASSETS_DIR || './assets';
        this.projectsDir = join(baseDir, 'projects');
        this.videosDir = join(baseDir, 'videos');
        
        // Create MCP server
        this.server = new Server({
            name: 'rough-cut-mcp',
            version: '2.0.0'
        }, {
            capabilities: {
                tools: {}
            }
        });
        
        process.stderr.write('[INFO] Rough Cut MCP Server initialized\n');
    }
    
    async run() {
        // Ensure directories exist
        this.ensureDirectories();
        // Setup tools and handlers
        this.setupTools();
        // Connect transport
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        process.stderr.write('[INFO] MCP Server connected and ready\n');
    }
    
    ensureDirectories() {
        [this.projectsDir, this.videosDir].forEach(dir => {
            if (!existsSync(dir)) {
                mkdirSync(dir, { recursive: true });
            }
        });
    }
    
    setupTools() {
        // List available tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: 'create-complete-video',
                    description: `ATTENTION CLAUDE: You MUST generate complete Remotion React component code before calling this tool.

MANDATORY STEPS:
1. Generate a complete React component using Remotion hooks
2. Include the code in the compositionCode parameter
3. The component must use useCurrentFrame() for animations

REQUIRED CODE STRUCTURE:
import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

export const VideoComposition: React.FC = () => {
  const frame = useCurrentFrame();
  // Your animation logic here
  return (
    <AbsoluteFill style={{backgroundColor: 'white'}}>
      {/* Animated elements */}
    </AbsoluteFill>
  );
};

DO NOT call this tool without providing compositionCode!`,
                    inputSchema: {
                        type: 'object',
                        properties: {
                            animationDesc: {
                                type: 'string',
                                description: 'Description of the animation to create',
                                minLength: 1,
                                maxLength: 2000
                            },
                            compositionCode: {
                                type: 'string',
                                description: 'REQUIRED: Complete Remotion React component code that you generate',
                                maxLength: 50000
                            },
                            projectName: {
                                type: 'string',
                                description: 'Name for the project (optional)'
                            },
                            dimensions: {
                                type: 'object',
                                properties: {
                                    width: { type: 'number', default: 1920 },
                                    height: { type: 'number', default: 1080 }
                                }
                            },
                            duration: { type: 'number', default: 150 },
                            fps: { type: 'number', default: 30 }
                        },
                        required: ['animationDesc', 'compositionCode']
                    }
                },
                {
                    name: 'launch-remotion-studio',
                    description: 'Launch Remotion Studio with the last created project or a specific project',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            projectPath: {
                                type: 'string',
                                description: 'Specific project path (optional, uses last created if not provided)'
                            },
                            port: {
                                type: 'number',
                                description: 'Port to run Studio on (7400-7500 range)'
                            }
                        }
                    }
                },
                {
                    name: 'get-project-status',
                    description: 'Get status of current projects and Studio',
                    inputSchema: {
                        type: 'object',
                        properties: {}
                    }
                }
            ]
        }));
        
        // Handle tool calls
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            try {
                switch (name) {
                    case 'create-complete-video':
                        return await this.createCompleteVideo(args);
                    case 'launch-remotion-studio':
                        return await this.launchRemotionStudio(args);
                    case 'get-project-status':
                        return await this.getProjectStatus();
                    default:
                        throw new Error(`Unknown tool: ${name}`);
                }
            } catch (error) {
                process.stderr.write(`[ERROR] Tool ${name} failed: ${error}\n`);
                throw error;
            }
        });
    }
    
    async createCompleteVideo(params) {
        const { 
            animationDesc, 
            compositionCode, 
            projectName = `project-${Date.now()}`, 
            dimensions = { width: 1920, height: 1080 }, 
            duration = 150, 
            fps = 30 
        } = params;
        
        // Explicit check for missing code
        if (!compositionCode || compositionCode.trim().length === 0) {
            throw new Error(`MISSING COMPOSITIONCODE: Claude must generate complete Remotion React component code and include it in the compositionCode parameter.

Example code structure needed:
import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

export const VideoComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, 150], [0, 1]);
  
  return (
    <AbsoluteFill style={{ backgroundColor: '#87CEEB' }}>
      <div style={{
        width: 100,
        height: 50,
        backgroundColor: '#FF6B6B',
        position: 'absolute',
        left: interpolate(progress, [0, 1], ['0%', '80%']),
        top: '50%',
        transform: 'translateY(-50%)'
      }} />
    </AbsoluteFill>
  );
};`);
        }
        
        try {
            process.stderr.write(`[INFO] Creating video: ${animationDesc}\n`);
            process.stderr.write(`[INFO] Using provided compositionCode: ${compositionCode.length} characters\n`);
            
            // Use the provided componentCode
            const componentCode = compositionCode;
            
            // Create project structure
            const projectPath = join(this.projectsDir, projectName);
            const srcPath = join(projectPath, 'src');
            if (!existsSync(srcPath)) {
                mkdirSync(srcPath, { recursive: true });
            }
            
            // Write main composition file
            const compositionFile = join(srcPath, 'VideoComposition.tsx');
            writeFileSync(compositionFile, componentCode);
            
            // Create entry point with registerRoot
            const entryPoint = join(srcPath, 'index.tsx');
            writeFileSync(entryPoint, `import { registerRoot } from 'remotion';
import { Composition } from 'remotion';
import { VideoComposition } from './VideoComposition';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="VideoComposition"
        component={VideoComposition}
        durationInFrames={${duration}}
        fps={${fps}}
        width={${dimensions.width}}
        height={${dimensions.height}}
      />
    </>
  );
};

registerRoot(RemotionRoot);`);
            
            // Create package.json for the project
            const packageJson = {
                name: projectName,
                version: "1.0.0",
                type: "module",
                scripts: {
                    start: "remotion studio",
                    build: "remotion render"
                },
                dependencies: {
                    "react": "^18.0.0",
                    "remotion": "^4.0.0"
                }
            };
            writeFileSync(join(projectPath, 'package.json'), JSON.stringify(packageJson, null, 2));
            
            // Create a root index file for Remotion registration in project root
            const rootIndex = join(projectPath, 'Root.tsx');
            writeFileSync(rootIndex, `import { registerRoot } from 'remotion';
import { RemotionRoot } from './src/index';

registerRoot(RemotionRoot);`);
            
            // Render the video using isolated process
            const videoPath = join(this.videosDir, `${projectName}.mp4`);
            process.stderr.write(`[INFO] Rendering video to: ${videoPath}\n`);
            
            // First, install dependencies in the project
            const npmCmd = getNpmCommand();
            const installResult = await spawnIsolated(npmCmd, ['install'], {
                cwd: projectPath
            });
            if (installResult.promise) {
                const installOutcome = await installResult.promise;
                if (installOutcome.code !== 0) {
                    process.stderr.write(`[WARN] npm install had issues: ${installOutcome.stderr}\n`);
                }
            }
            
            // Render the video
            const npxCmd = getNpxCommand();
            const { promise } = spawnIsolated(npxCmd, [
                'remotion', 'render',
                'Root.tsx',
                'VideoComposition',
                videoPath,
                '--props', '{}',
                '--quiet'
            ], {
                cwd: projectPath,
                env: {
                    NODE_PATH: join(projectPath, 'node_modules')
                }
            });
            
            const result = await promise;
            if (result.code !== 0) {
                throw new Error(`Video rendering failed with code ${result.code}: ${result.stderr}`);
            }
            
            return {
                success: true,
                message: `Animation created successfully! 

📁 Project: ${projectPath}
🎬 Video: ${videoPath}

The video has been rendered and is ready. Use the 'launch-remotion-studio' tool to open it in Remotion Studio for editing.`,
                projectPath,
                videoPath,
                logFile: result.logFile
            };
            
        } catch (error) {
            process.stderr.write(`[ERROR] Video creation failed: ${error}\n`);
            throw error;
        }
    }
    
    async launchRemotionStudio(params) {
        const { projectPath, port = 7400 } = params;
        
        // Use last created project if no specific path provided
        const targetPath = projectPath || this.getLastCreatedProject();
        
        if (!targetPath || !existsSync(targetPath)) {
            throw new Error('No project path specified and no recent projects found');
        }
        
        process.stderr.write(`[INFO] Launching Remotion Studio for: ${targetPath}\n`);
        
        const npxCmd = getNpxCommand();
        const { promise } = spawnIsolated(npxCmd, [
            'remotion', 'studio',
            '--port', port.toString()
        ], {
            cwd: targetPath
        });
        
        return {
            success: true,
            message: `Remotion Studio launching on port ${port}`,
            url: `http://localhost:${port}`,
            projectPath: targetPath
        };
    }
    
    async getProjectStatus() {
        const projects = existsSync(this.projectsDir) ? 
            fs.readdirSync(this.projectsDir) : [];
        
        return {
            success: true,
            projectsDir: this.projectsDir,
            videosDir: this.videosDir,
            projectCount: projects.length,
            recentProjects: projects.slice(-5)
        };
    }
    
    getLastCreatedProject() {
        if (!existsSync(this.projectsDir)) return null;
        
        const projects = readdirSync(this.projectsDir)
            .map(name => ({
                name,
                path: join(this.projectsDir, name),
                mtime: statSync(join(this.projectsDir, name)).mtime
            }))
            .sort((a, b) => b.mtime - a.mtime);
        
        return projects.length > 0 ? projects[0].path : null;
    }
}

// Start the server
const server = new RoughCutMCPServer();
server.run().catch(console.error);