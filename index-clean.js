#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { writeFileSync, existsSync, mkdirSync, readdirSync, statSync, readFileSync, unlinkSync } from 'fs';
import fs from 'fs';
import { join, basename } from 'path';
import { spawn, execSync, exec } from 'child_process';
import { createWriteStream } from 'fs';
import os from 'os';
import http from 'http';
import net from 'net';

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
                },
                {
                    name: 'fix-project-config',
                    description: 'Fix configuration issues in existing Remotion projects (adds missing config files)',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            projectPath: { 
                                type: 'string', 
                                description: 'Path to project (optional, uses last created if not provided)' 
                            },
                            updateDependencies: { 
                                type: 'boolean', 
                                description: 'Also update package.json dependencies',
                                default: false
                            }
                        }
                    }
                },
                {
                    name: 'list-video-projects',
                    description: 'List all available video projects with their details',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            sortBy: {
                                type: 'string',
                                enum: ['name', 'date', 'size'],
                                description: 'Sort projects by name, creation date, or size',
                                default: 'date'
                            },
                            showDetails: {
                                type: 'boolean',
                                description: 'Show detailed project information',
                                default: true
                            }
                        }
                    }
                },
                {
                    name: 'open-specific-project',
                    description: 'Open a specific video project in Remotion Studio',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            projectName: {
                                type: 'string',
                                description: 'Name of the project directory to open'
                            },
                            port: {
                                type: 'number',
                                description: 'Port to run studio on (default: auto-detect)',
                                default: 7400
                            },
                            clearCache: {
                                type: 'boolean',
                                description: 'Clear all caches before opening',
                                default: true
                            }
                        },
                        required: ['projectName']
                    }
                },
                {
                    name: 'clear-project-cache',
                    description: 'Clear all cache files for a specific project or all projects',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            projectName: {
                                type: 'string',
                                description: 'Project name (optional, clears all if not specified)'
                            },
                            killProcesses: {
                                type: 'boolean',
                                description: 'Also kill any running Remotion processes',
                                default: true
                            }
                        }
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
                    case 'fix-project-config':
                        return await this.fixProjectConfig(args);
                    case 'list-video-projects':
                        return await this.listVideoProjects(args);
                    case 'open-specific-project':
                        return await this.openSpecificProject(args);
                    case 'clear-project-cache':
                        return await this.clearProjectCache(args);
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
                    "react-dom": "^18.0.0",
                    "remotion": "^4.0.0",
                    "@remotion/cli": "^4.0.0"
                }
            };
            writeFileSync(join(projectPath, 'package.json'), JSON.stringify(packageJson, null, 2));
            
            // Create remotion.config.ts for proper webpack configuration with cache disabled
            const remotionConfig = `import { Config } from '@remotion/cli/config';

// Set the image format for videos
Config.setVideoImageFormat('jpeg');

// Allow output files to be overwritten
Config.setOverwriteOutput(true);

// IMPORTANT: Disable caching to prevent stale content issues
Config.setCachingEnabled(false);

// Webpack overrides to handle Node.js modules and fix HMR
Config.overrideWebpackConfig((config) => {
  return {
    ...config,
    cache: false, // Disable webpack cache
    resolve: {
      ...config.resolve,
      fallback: {
        ...config.resolve?.fallback,
        // These Node.js modules aren't needed in the browser
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        buffer: false,
        util: false,
        assert: false,
        process: false,
      },
    },
  };
});`;
            writeFileSync(join(projectPath, 'remotion.config.ts'), remotionConfig);
            
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
            
            // Auto-launch Remotion Studio after successful video creation
            process.stderr.write(`[INFO] Auto-launching Remotion Studio...\n`);
            try {
                // Try to kill any existing studio processes first to free up ports
                try {
                    process.stderr.write(`[INFO] Checking for existing studio processes...\n`);
                    execSync('pkill -f "remotion studio" 2>/dev/null || true', { shell: true });
                    // Give it a moment to clean up
                    await new Promise(r => setTimeout(r, 1000));
                } catch (e) {
                    // Ignore errors from pkill if no processes found
                }
                
                const studioResult = await this.launchRemotionStudio({ projectPath });
                
                return {
                    success: true,
                    message: `Animation created and studio launched successfully! 

📁 Project: ${projectPath}
🎬 Video: ${videoPath}
🌐 Studio: ${studioResult.url}

Remotion Studio is now running and should open automatically in your browser.`,
                    projectPath,
                    videoPath,
                    studioUrl: studioResult.url,
                    studioPort: studioResult.port,
                    logFile: result.logFile
                };
            } catch (studioError) {
                // If studio launch fails, still return success for video creation
                process.stderr.write(`[WARN] Studio auto-launch failed: ${studioError.message}\n`);
                process.stderr.write(`[INFO] You can manually launch the studio later.\n`);
                return {
                    success: true,
                    message: `Animation created successfully! 

📁 Project: ${projectPath}
🎬 Video: ${videoPath}

The video has been rendered. Studio auto-launch failed but you can use the 'launch-remotion-studio' tool to open it manually.`,
                    projectPath,
                    videoPath,
                    logFile: result.logFile,
                    studioError: studioError.message
                };
            }
            
        } catch (error) {
            process.stderr.write(`[ERROR] Video creation failed: ${error}\n`);
            throw error;
        }
    }
    
    async waitForServer(port, maxAttempts = 30) {
        for (let i = 0; i < maxAttempts; i++) {
            try {
                await new Promise((resolve, reject) => {
                    const req = http.get(`http://localhost:${port}`, (res) => {
                        resolve(true);
                    });
                    req.on('error', reject);
                    req.setTimeout(1000, () => {
                        req.destroy();
                        reject(new Error('Timeout'));
                    });
                });
                return true;
            } catch {
                // Wait 1 second before retrying
                await new Promise(r => setTimeout(r, 1000));
                if (i % 5 === 4) {
                    process.stderr.write(`[INFO] Waiting for studio to start... (${i + 1}/${maxAttempts})\n`);
                }
            }
        }
        return false;
    }
    
    async openBrowser(url) {
        const platform = process.platform;
        
        // Check if we're in WSL2
        const isWSL = existsSync('/proc/version') && 
                      readFileSync('/proc/version', 'utf8').toLowerCase().includes('microsoft');
        
        let command;
        if (platform === 'win32') {
            // Native Windows
            command = `start "" "${url}"`;
        } else if (platform === 'darwin') {
            // macOS
            command = `open "${url}"`;
        } else if (isWSL) {
            // WSL2 - use Windows commands via cmd.exe
            // First try wslview (if wslu is installed), then fallback to cmd.exe
            command = `wslview "${url}" 2>/dev/null || cmd.exe /c start "" "${url}"`;
        } else {
            // Native Linux
            command = `xdg-open "${url}" || sensible-browser "${url}" || x-www-browser "${url}" || gnome-open "${url}"`;
        }
        
        process.stderr.write(`[INFO] Opening browser with command: ${command}\n`);
        
        exec(command, { shell: true }, (error) => {
            if (error) {
                process.stderr.write(`[INFO] Could not auto-open browser. Please open ${url} manually.\n`);
                process.stderr.write(`[DEBUG] Error: ${error.message}\n`);
            } else {
                process.stderr.write(`[INFO] Browser opened successfully at ${url}\n`);
            }
        });
    }
    
    async findAvailablePort(startPort = 7400, maxPort = 7410) {
        for (let port = startPort; port <= maxPort; port++) {
            const isAvailable = await new Promise((resolve) => {
                const server = net.createServer();
                
                server.once('error', () => {
                    resolve(false);
                });
                
                server.once('listening', () => {
                    server.close();
                    resolve(true);
                });
                
                server.listen(port, 'localhost');
            });
            
            if (isAvailable) {
                process.stderr.write(`[INFO] Found available port: ${port}\n`);
                return port;
            }
        }
        
        throw new Error(`No available ports found between ${startPort} and ${maxPort}`);
    }
    
    async launchRemotionStudio(params) {
        const { projectPath, port: requestedPort } = params;
        
        // Use last created project if no specific path provided
        const targetPath = projectPath || this.getLastCreatedProject();
        
        if (!targetPath || !existsSync(targetPath)) {
            throw new Error('No project path specified and no recent projects found');
        }
        
        process.stderr.write(`[INFO] Launching Remotion Studio for: ${targetPath}\n`);
        
        // Find an available port
        let actualPort;
        try {
            actualPort = requestedPort || await this.findAvailablePort(7400, 7410);
            process.stderr.write(`[INFO] Using port: ${actualPort}\n`);
        } catch (error) {
            throw new Error(`Could not find available port: ${error.message}`);
        }
        
        const npxCmd = getNpxCommand();
        
        // Use regular spawn for studio (not spawnIsolated) with detached mode
        const studioProcess = spawn(npxCmd, [
            'remotion', 'studio',
            '--port', actualPort.toString()
        ], {
            cwd: targetPath,
            detached: true,
            stdio: 'ignore',
            shell: true,
            env: {
                ...process.env,
                NODE_ENV: 'development'
            }
        });
        
        // Unref so MCP doesn't wait for studio to exit
        studioProcess.unref();
        
        process.stderr.write(`[INFO] Studio process spawned, waiting for server to be ready...\n`);
        
        // Wait for server to be ready
        const serverReady = await this.waitForServer(actualPort);
        
        if (!serverReady) {
            throw new Error(`Studio failed to start on port ${actualPort} after 30 seconds. Please check if there are any errors in the project.`);
        }
        
        process.stderr.write(`[INFO] Remotion Studio is now running at http://localhost:${actualPort}\n`);
        
        // Open browser automatically
        const studioUrl = `http://localhost:${actualPort}`;
        await this.openBrowser(studioUrl);
        
        return {
            success: true,
            message: `Remotion Studio is running on port ${actualPort}`,
            url: studioUrl,
            projectPath: targetPath,
            port: actualPort,
            note: 'Studio is running in the background. Browser should open automatically.'
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
    
    async fixProjectConfig(params) {
        const { projectPath, updateDependencies = false } = params;
        
        // Use provided path or get last created project
        const targetPath = projectPath || this.getLastCreatedProject();
        if (!targetPath || !existsSync(targetPath)) {
            throw new Error('Project not found. Please provide a valid project path.');
        }
        
        let fixed = [];
        
        // Check and create remotion.config.ts if missing
        const configPath = join(targetPath, 'remotion.config.ts');
        if (!existsSync(configPath)) {
            const remotionConfig = `import { Config } from '@remotion/cli/config';

// Set the image format for videos
Config.setVideoImageFormat('jpeg');

// Allow output files to be overwritten
Config.setOverwriteOutput(true);

// Webpack overrides to handle Node.js modules and fix HMR
Config.overrideWebpackConfig((config) => {
  return {
    ...config,
    resolve: {
      ...config.resolve,
      fallback: {
        ...config.resolve?.fallback,
        // These Node.js modules aren't needed in the browser
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        buffer: false,
        util: false,
        assert: false,
        process: false,
      },
    },
  };
});`;
            writeFileSync(configPath, remotionConfig);
            fixed.push('Created remotion.config.ts');
            process.stderr.write(`[INFO] Created remotion.config.ts in ${targetPath}\n`);
        }
        
        // Check and create tsconfig.json if missing
        const tsconfigPath = join(targetPath, 'tsconfig.json');
        if (!existsSync(tsconfigPath)) {
            const tsConfig = {
                compilerOptions: {
                    target: "ES2018",
                    module: "ESNext",
                    jsx: "react-jsx",
                    strict: true,
                    esModuleInterop: true,
                    skipLibCheck: true,
                    forceConsistentCasingInFileNames: true,
                    moduleResolution: "node",
                    resolveJsonModule: true,
                    allowSyntheticDefaultImports: true,
                    noEmit: true
                },
                include: ["src"]
            };
            writeFileSync(tsconfigPath, JSON.stringify(tsConfig, null, 2));
            fixed.push('Created tsconfig.json');
            process.stderr.write(`[INFO] Created tsconfig.json in ${targetPath}\n`);
        }
        
        // Check if Root.tsx is in the wrong location and move it if needed
        const oldRootPath = join(targetPath, 'src', 'Root.tsx');
        const newRootPath = join(targetPath, 'Root.tsx');
        if (existsSync(oldRootPath) && !existsSync(newRootPath)) {
            // Read the content and update the import path
            let rootContent = readFileSync(oldRootPath, 'utf-8');
            rootContent = rootContent.replace('./index', './src/index');
            writeFileSync(newRootPath, rootContent);
            unlinkSync(oldRootPath);
            fixed.push('Moved Root.tsx to project root and fixed imports');
            process.stderr.write(`[INFO] Moved Root.tsx to project root\n`);
        }
        
        // Optionally update package.json dependencies
        if (updateDependencies) {
            const packageJsonPath = join(targetPath, 'package.json');
            if (existsSync(packageJsonPath)) {
                const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
                let updated = false;
                
                if (!packageJson.dependencies) {
                    packageJson.dependencies = {};
                }
                
                if (!packageJson.dependencies['react-dom']) {
                    packageJson.dependencies['react-dom'] = '^18.0.0';
                    updated = true;
                }
                if (!packageJson.dependencies['@remotion/cli']) {
                    packageJson.dependencies['@remotion/cli'] = '^4.0.0';
                    updated = true;
                }
                
                if (updated) {
                    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
                    fixed.push('Updated package.json dependencies');
                    process.stderr.write(`[INFO] Updated dependencies in package.json\n`);
                }
            }
        }
        
        return {
            success: true,
            projectPath: targetPath,
            fixes: fixed.length > 0 ? fixed : ['Project already has correct configuration'],
            message: fixed.length > 0 
                ? `Fixed ${fixed.length} configuration issue(s). ${updateDependencies ? "Run 'npm install' to install new dependencies." : ""}`
                : 'Project configuration is already correct.'
        };
    }
    
    async listVideoProjects(params) {
        const { sortBy = 'date', showDetails = true } = params;
        
        if (!existsSync(this.projectsDir)) {
            return { success: true, projects: [], message: 'No projects found' };
        }
        
        const projects = [];
        const dirs = readdirSync(this.projectsDir);
        
        for (const dir of dirs) {
            const projectPath = join(this.projectsDir, dir);
            const stats = statSync(projectPath);
            
            if (stats.isDirectory()) {
                const project = {
                    name: dir,
                    path: projectPath,
                    created: stats.birthtime,
                    modified: stats.mtime,
                    size: 0
                };
                
                if (showDetails) {
                    // Check for key files
                    project.hasVideo = existsSync(join(this.videosDir, `${dir}.mp4`));
                    project.hasStudioConfig = existsSync(join(projectPath, 'remotion.config.ts'));
                    project.hasRegisterRoot = false;
                    
                    // Check if registerRoot exists in index.tsx
                    const indexPath = join(projectPath, 'src', 'index.tsx');
                    if (existsSync(indexPath)) {
                        const content = readFileSync(indexPath, 'utf8');
                        project.hasRegisterRoot = content.includes('registerRoot(');
                        
                        // Get composition details if available
                        if (project.hasRegisterRoot) {
                            const matches = content.match(/durationInFrames={(\d+)}/);
                            if (matches) {
                                project.duration = parseInt(matches[1]) / 30; // Assuming 30fps
                            }
                        }
                    }
                }
                
                projects.push(project);
            }
        }
        
        // Sort projects
        if (sortBy === 'name') {
            projects.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortBy === 'date') {
            projects.sort((a, b) => b.modified - a.modified);
        }
        
        return {
            success: true,
            count: projects.length,
            projects,
            message: `Found ${projects.length} video project(s)`
        };
    }
    
    async openSpecificProject(params) {
        const { projectName, port = 7400, clearCache = true } = params;
        
        const projectPath = join(this.projectsDir, projectName);
        
        if (!existsSync(projectPath)) {
            throw new Error(`Project "${projectName}" not found`);
        }
        
        // Clear cache if requested
        if (clearCache) {
            process.stderr.write(`[INFO] Clearing cache for ${projectName}...\n`);
            
            // Kill any existing Remotion processes
            try {
                execSync('pkill -f "remotion" 2>/dev/null || true', { shell: true });
                await new Promise(r => setTimeout(r, 1000));
            } catch (e) {
                // Ignore errors
            }
            
            // Clear cache directories
            const cacheDirs = ['.cache', '.next', '.remotion', 'node_modules/.cache'];
            for (const cacheDir of cacheDirs) {
                const cachePath = join(projectPath, cacheDir);
                if (existsSync(cachePath)) {
                    execSync(`rm -rf "${cachePath}"`, { shell: true });
                    process.stderr.write(`[INFO] Cleared ${cacheDir}\n`);
                }
            }
        }
        
        // Fix project config if needed
        await this.fixProjectConfig({ projectPath });
        
        // Launch studio with cache disabled
        process.stderr.write(`[INFO] Launching ${projectName} with cache disabled...\n`);
        
        const actualPort = await this.findAvailablePort(port, port + 10);
        const npxCmd = getNpxCommand();
        
        const studioProcess = spawn(npxCmd, [
            'remotion', 'studio',
            '--port', actualPort.toString(),
            '--bundle-cache=false'
        ], {
            cwd: projectPath,
            detached: true,
            stdio: 'ignore',
            shell: true,
            env: {
                ...process.env,
                NODE_ENV: 'development',
                DISABLE_CACHE: 'true'
            }
        });
        
        studioProcess.unref();
        
        // Wait for server and open browser
        const serverReady = await this.waitForServer(actualPort);
        
        if (!serverReady) {
            throw new Error(`Failed to start studio for ${projectName}`);
        }
        
        const studioUrl = `http://localhost:${actualPort}`;
        await this.openBrowser(studioUrl);
        
        return {
            success: true,
            message: `Opened ${projectName} in Remotion Studio`,
            projectName,
            projectPath,
            url: studioUrl,
            port: actualPort,
            cacheCleared: clearCache
        };
    }
    
    async clearProjectCache(params) {
        const { projectName, killProcesses = true } = params;
        
        // Kill processes if requested
        if (killProcesses) {
            process.stderr.write(`[INFO] Killing Remotion processes...\n`);
            try {
                execSync('pkill -f "remotion" 2>/dev/null || true', { shell: true });
                await new Promise(r => setTimeout(r, 1000));
            } catch (e) {
                // Ignore errors
            }
        }
        
        let clearedProjects = [];
        
        if (projectName) {
            // Clear specific project
            const projectPath = join(this.projectsDir, projectName);
            if (existsSync(projectPath)) {
                await this.clearProjectCacheDir(projectPath);
                clearedProjects.push(projectName);
            } else {
                throw new Error(`Project "${projectName}" not found`);
            }
        } else {
            // Clear all projects
            if (existsSync(this.projectsDir)) {
                const dirs = readdirSync(this.projectsDir);
                for (const dir of dirs) {
                    const projectPath = join(this.projectsDir, dir);
                    if (statSync(projectPath).isDirectory()) {
                        await this.clearProjectCacheDir(projectPath);
                        clearedProjects.push(dir);
                    }
                }
            }
        }
        
        return {
            success: true,
            message: `Cleared cache for ${clearedProjects.length} project(s)`,
            projects: clearedProjects,
            processesKilled: killProcesses
        };
    }
    
    async clearProjectCacheDir(projectPath) {
        const cacheDirs = ['.cache', '.next', '.remotion', 'node_modules/.cache'];
        
        for (const cacheDir of cacheDirs) {
            const cachePath = join(projectPath, cacheDir);
            if (existsSync(cachePath)) {
                execSync(`rm -rf "${cachePath}"`, { shell: true });
                process.stderr.write(`[INFO] Cleared ${cacheDir} in ${basename(projectPath)}\n`);
            }
        }
    }
}

// Start the server
const server = new RoughCutMCPServer();
server.run().catch(console.error);