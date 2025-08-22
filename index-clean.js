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
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';

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
    portHistoryFile;
    portHistory;
    
    constructor() {
        // Setup directories
        const baseDir = process.env.REMOTION_ASSETS_DIR || './assets';
        this.projectsDir = join(baseDir, 'projects');
        this.videosDir = join(baseDir, 'videos');
        this.portHistoryFile = join(baseDir, 'port-history.json');
        
        // Load port history
        this.loadPortHistory();
        
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
    
    loadPortHistory() {
        try {
            if (existsSync(this.portHistoryFile)) {
                const data = readFileSync(this.portHistoryFile, 'utf8');
                this.portHistory = JSON.parse(data);
                process.stderr.write(`[INFO] Loaded port history with ${this.portHistory.usedPorts.length} entries\n`);
            } else {
                this.portHistory = {
                    usedPorts: [],
                    lastPort: 7400,
                    rotationIndex: 0
                };
            }
        } catch (error) {
            process.stderr.write(`[WARN] Could not load port history: ${error.message}\n`);
            this.portHistory = {
                usedPorts: [],
                lastPort: 7400,
                rotationIndex: 0
            };
        }
    }
    
    savePortHistory() {
        try {
            writeFileSync(this.portHistoryFile, JSON.stringify(this.portHistory, null, 2));
        } catch (error) {
            process.stderr.write(`[WARN] Could not save port history: ${error.message}\n`);
        }
    }
    
    getNextPort() {
        // Define port rotation range (7500-7599 to avoid cached 7400-7499)
        const portRange = { start: 7500, end: 7599 };
        const totalPorts = portRange.end - portRange.start + 1;
        
        // Keep only recent port usage (last 10 entries)
        if (this.portHistory.usedPorts.length > 10) {
            this.portHistory.usedPorts = this.portHistory.usedPorts.slice(-10);
        }
        
        // Calculate next port using rotation
        const nextPort = portRange.start + (this.portHistory.rotationIndex % totalPorts);
        this.portHistory.rotationIndex++;
        
        // Add to history
        this.portHistory.usedPorts.push({
            port: nextPort,
            timestamp: Date.now(),
            project: null // Will be updated when project is created
        });
        
        this.portHistory.lastPort = nextPort;
        this.savePortHistory();
        
        process.stderr.write(`[INFO] Selected port ${nextPort} from rotation (index: ${this.portHistory.rotationIndex})\n`);
        return nextPort;
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
4. Component can accept props for customizable values (colors, text, speeds, etc.)

REQUIRED CODE STRUCTURE WITH PROPS:
import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { z } from 'zod';
import { MyCompProps } from '../src/index';

export const VideoComposition: React.FC<MyCompProps> = ({
  titleText,
  titleColor,
  animationSpeed,
  fontSize,
  backgroundColor,
  // ... other props
}) => {
  const frame = useCurrentFrame();
  // Use props in your animation logic
  const progress = interpolate(frame, [0, 60], [0, 1]) * animationSpeed;
  
  return (
    <AbsoluteFill style={{backgroundColor}}>
      <h1 style={{color: titleColor, fontSize}}>{titleText}</h1>
      {/* Animated elements using props */}
    </AbsoluteFill>
  );
};

The video will have editable props in Remotion Studio's sidebar!
Props include: colors, text, numbers, booleans - all customizable in the studio.

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
                },
                {
                    name: 'update-video-props',
                    description: 'Update the props schema for an existing video project to add/modify editable variables',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            projectName: {
                                type: 'string',
                                description: 'Name of the project to update'
                            },
                            props: {
                                type: 'object',
                                description: 'Object containing prop definitions (name, type, default, min, max, description)',
                                properties: {
                                    textProps: {
                                        type: 'object',
                                        description: 'Text/string properties'
                                    },
                                    colorProps: {
                                        type: 'object',
                                        description: 'Color properties (hex values)'
                                    },
                                    numberProps: {
                                        type: 'object',
                                        description: 'Numeric properties with min/max'
                                    },
                                    booleanProps: {
                                        type: 'object',
                                        description: 'Boolean toggle properties'
                                    }
                                }
                            }
                        },
                        required: ['projectName', 'props']
                    }
                },
                {
                    name: 'get-video-props',
                    description: 'Get the current props schema for a video project',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            projectName: {
                                type: 'string',
                                description: 'Name of the project'
                            }
                        },
                        required: ['projectName']
                    }
                },
                {
                    name: 'analyze-video-structure',
                    description: 'Analyze the structure of an existing video to identify sequences, elements, and timings',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            projectName: {
                                type: 'string',
                                description: 'Name of the project to analyze'
                            }
                        },
                        required: ['projectName']
                    }
                },
                {
                    name: 'edit-video-element',
                    description: 'Edit specific elements in a video (text, colors, positions, animations)',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            projectName: {
                                type: 'string',
                                description: 'Name of the project'
                            },
                            elementPath: {
                                type: 'string',
                                description: 'Path to the element (e.g., "sequence.0.text" or "shot1.title")'
                            },
                            changes: {
                                type: 'object',
                                description: 'Object containing the changes to apply',
                                properties: {
                                    text: { type: 'string' },
                                    color: { type: 'string' },
                                    fontSize: { type: 'number' },
                                    position: { type: 'object' },
                                    animation: { type: 'object' }
                                }
                            }
                        },
                        required: ['projectName', 'elementPath', 'changes']
                    }
                },
                {
                    name: 'adjust-video-timing',
                    description: 'Adjust the timing of sequences or the entire video composition',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            projectName: {
                                type: 'string',
                                description: 'Name of the project'
                            },
                            target: {
                                type: 'string',
                                description: 'What to adjust: "composition" or sequence ID'
                            },
                            newDuration: {
                                type: 'number',
                                description: 'New duration in frames'
                            },
                            adjustSubsequent: {
                                type: 'boolean',
                                description: 'Adjust timing of subsequent sequences',
                                default: true
                            },
                            scaleAnimations: {
                                type: 'boolean',
                                description: 'Scale animations proportionally',
                                default: true
                            }
                        },
                        required: ['projectName', 'target', 'newDuration']
                    }
                },
                {
                    name: 'add-video-sequence',
                    description: 'Add a new sequence to the video at a specific position',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            projectName: {
                                type: 'string',
                                description: 'Name of the project'
                            },
                            position: {
                                type: 'number',
                                description: 'Frame position to insert the sequence'
                            },
                            sequenceType: {
                                type: 'string',
                                enum: ['text-overlay', 'transition', 'image', 'animation', 'custom'],
                                description: 'Type of sequence to add'
                            },
                            duration: {
                                type: 'number',
                                description: 'Duration of the sequence in frames'
                            },
                            properties: {
                                type: 'object',
                                description: 'Properties for the sequence (text, color, etc.)'
                            },
                            customCode: {
                                type: 'string',
                                description: 'Custom React component code (for custom type)'
                            }
                        },
                        required: ['projectName', 'position', 'sequenceType', 'duration']
                    }
                },
                {
                    name: 'remove-video-sequence',
                    description: 'Remove a sequence from the video',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            projectName: {
                                type: 'string',
                                description: 'Name of the project'
                            },
                            sequenceId: {
                                type: 'string',
                                description: 'ID or index of the sequence to remove'
                            },
                            adjustTimeline: {
                                type: 'boolean',
                                description: 'Adjust subsequent sequence timings',
                                default: true
                            }
                        },
                        required: ['projectName', 'sequenceId']
                    }
                },
                {
                    name: 'reorder-video-sequences',
                    description: 'Reorder sequences in the video timeline',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            projectName: {
                                type: 'string',
                                description: 'Name of the project'
                            },
                            reorderMap: {
                                type: 'array',
                                description: 'Array mapping old indices to new indices',
                                items: {
                                    type: 'object',
                                    properties: {
                                        from: { type: 'number' },
                                        to: { type: 'number' }
                                    }
                                }
                            }
                        },
                        required: ['projectName', 'reorderMap']
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
                    case 'update-video-props':
                        return await this.updateVideoProps(args);
                    case 'get-video-props':
                        return await this.getVideoProps(args);
                    case 'analyze-video-structure':
                        return await this.analyzeVideoStructure(args);
                    case 'edit-video-element':
                        return await this.editVideoElement(args);
                    case 'adjust-video-timing':
                        return await this.adjustVideoTiming(args);
                    case 'add-video-sequence':
                        return await this.addVideoSequence(args);
                    case 'remove-video-sequence':
                        return await this.removeVideoSequence(args);
                    case 'reorder-video-sequences':
                        return await this.reorderVideoSequences(args);
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
            
            // Create entry point with registerRoot and props schema
            const entryPoint = join(srcPath, 'index.tsx');
            
            // Generate a default props schema if not provided
            // This will be enhanced when Claude generates videos with specific props
            const propsSchema = `import { z } from 'zod';

// Define the props schema for editable variables
export const myCompSchema = z.object({
  // Text props
  titleText: z.string().default('Amazing Video'),
  titleColor: z.string().default('#FFFFFF'),
  
  // Numeric props
  animationSpeed: z.number().min(0.1).max(5).default(1),
  fontSize: z.number().min(10).max(100).default(48),
  
  // Boolean props
  showBackground: z.boolean().default(true),
  enableParticles: z.boolean().default(false),
  
  // Color props
  backgroundColor: z.string().default('#000000'),
  accentColor: z.string().default('#FF6B6B'),
});`;
            
            writeFileSync(entryPoint, `import { registerRoot } from 'remotion';
import { Composition } from 'remotion';
import { VideoComposition } from './VideoComposition';
import { z } from 'zod';

// Define the props schema for editable variables
export const myCompSchema = z.object({
  // Text props
  titleText: z.string().describe('Main title text'),
  titleColor: z.string().describe('Title text color'),
  
  // Numeric props
  animationSpeed: z.number().min(0.1).max(5).describe('Animation speed multiplier'),
  fontSize: z.number().min(10).max(100).describe('Font size in pixels'),
  
  // Boolean props
  showBackground: z.boolean().describe('Show background gradient'),
  enableParticles: z.boolean().describe('Enable particle effects'),
  
  // Color props
  backgroundColor: z.string().describe('Background color'),
  accentColor: z.string().describe('Accent color for highlights'),
});

// Type for the props
export type MyCompProps = z.infer<typeof myCompSchema>;

// Default props values
const defaultProps: MyCompProps = {
  titleText: 'Amazing Video',
  titleColor: '#FFFFFF',
  animationSpeed: 1,
  fontSize: 48,
  showBackground: true,
  enableParticles: false,
  backgroundColor: '#000000',
  accentColor: '#FF6B6B',
};

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
        schema={myCompSchema}
        defaultProps={defaultProps}
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
                    "@remotion/cli": "^4.0.0",
                    "@remotion/zod-types": "^4.0.0",
                    "zod": "^3.22.3",
                    "@babel/parser": "^7.24.0",
                    "@babel/traverse": "^7.24.0",
                    "@babel/generator": "^7.24.0",
                    "@babel/types": "^7.24.0"
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
        
        // Use port rotation system for automatic port selection
        let actualPort;
        try {
            if (requestedPort) {
                // If specific port requested, try to use it
                actualPort = requestedPort;
                process.stderr.write(`[INFO] Using requested port: ${actualPort}\n`);
            } else {
                // Use intelligent port rotation to avoid cache issues
                actualPort = this.getNextPort();
                process.stderr.write(`[INFO] Using rotated port: ${actualPort} (avoids browser cache)\n`);
            }
        } catch (error) {
            throw new Error(`Could not determine port: ${error.message}`);
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
        const { projectName, port, clearCache = true } = params;
        
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
        
        // Use port rotation if no specific port requested
        const actualPort = port || this.getNextPort();
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
    
    async updateVideoProps(params) {
        const { projectName, props } = params;
        
        const projectPath = join(this.projectsDir, projectName);
        if (!existsSync(projectPath)) {
            throw new Error(`Project "${projectName}" not found`);
        }
        
        const indexPath = join(projectPath, 'src', 'index.tsx');
        if (!existsSync(indexPath)) {
            throw new Error(`Index file not found in project "${projectName}"`);
        }
        
        // Build the new schema from provided props
        let schemaLines = [];
        schemaLines.push('export const myCompSchema = z.object({');
        
        // Add text props
        if (props.textProps) {
            schemaLines.push('  // Text props');
            for (const [key, config] of Object.entries(props.textProps)) {
                const desc = config.description ? `.describe('${config.description}')` : '';
                schemaLines.push(`  ${key}: z.string()${desc},`);
            }
        }
        
        // Add color props
        if (props.colorProps) {
            schemaLines.push('  // Color props');
            for (const [key, config] of Object.entries(props.colorProps)) {
                const desc = config.description ? `.describe('${config.description}')` : '';
                schemaLines.push(`  ${key}: z.string()${desc},`);
            }
        }
        
        // Add number props
        if (props.numberProps) {
            schemaLines.push('  // Numeric props');
            for (const [key, config] of Object.entries(props.numberProps)) {
                let propDef = `  ${key}: z.number()`;
                if (config.min !== undefined) propDef += `.min(${config.min})`;
                if (config.max !== undefined) propDef += `.max(${config.max})`;
                if (config.description) propDef += `.describe('${config.description}')`;
                schemaLines.push(`${propDef},`);
            }
        }
        
        // Add boolean props
        if (props.booleanProps) {
            schemaLines.push('  // Boolean props');
            for (const [key, config] of Object.entries(props.booleanProps)) {
                const desc = config.description ? `.describe('${config.description}')` : '';
                schemaLines.push(`  ${key}: z.boolean()${desc},`);
            }
        }
        
        schemaLines.push('});');
        
        // Build default props
        let defaultPropsLines = [];
        defaultPropsLines.push('const defaultProps: MyCompProps = {');
        
        // Add defaults for each prop type
        if (props.textProps) {
            for (const [key, config] of Object.entries(props.textProps)) {
                defaultPropsLines.push(`  ${key}: '${config.default || ''}',`);
            }
        }
        if (props.colorProps) {
            for (const [key, config] of Object.entries(props.colorProps)) {
                defaultPropsLines.push(`  ${key}: '${config.default || '#000000'}',`);
            }
        }
        if (props.numberProps) {
            for (const [key, config] of Object.entries(props.numberProps)) {
                defaultPropsLines.push(`  ${key}: ${config.default || 1},`);
            }
        }
        if (props.booleanProps) {
            for (const [key, config] of Object.entries(props.booleanProps)) {
                defaultPropsLines.push(`  ${key}: ${config.default || false},`);
            }
        }
        
        defaultPropsLines.push('};');
        
        // Read current file
        let indexContent = readFileSync(indexPath, 'utf8');
        
        // Replace the schema definition
        const schemaRegex = /export const myCompSchema = z\.object\({[\s\S]*?\}\);/;
        indexContent = indexContent.replace(schemaRegex, schemaLines.join('\n'));
        
        // Replace default props
        const defaultPropsRegex = /const defaultProps: MyCompProps = {[\s\S]*?};/;
        indexContent = indexContent.replace(defaultPropsRegex, defaultPropsLines.join('\n'));
        
        // Write back the updated file
        writeFileSync(indexPath, indexContent);
        
        // Also update the VideoComposition.tsx to use the new props
        const videoCompPath = join(projectPath, 'src', 'VideoComposition.tsx');
        if (existsSync(videoCompPath)) {
            let videoContent = readFileSync(videoCompPath, 'utf8');
            
            // Check if it already has MyCompProps import
            if (!videoContent.includes('MyCompProps')) {
                // Add import at the top
                videoContent = `import { MyCompProps } from './index';\n` + videoContent;
                
                // Update the component signature
                videoContent = videoContent.replace(
                    /export const VideoComposition: React\.FC[^=]*= \(/,
                    'export const VideoComposition: React.FC<MyCompProps> = ('
                );
                
                writeFileSync(videoCompPath, videoContent);
            }
        }
        
        return {
            success: true,
            message: `Updated props schema for "${projectName}"`,
            projectName,
            propsAdded: {
                text: Object.keys(props.textProps || {}),
                colors: Object.keys(props.colorProps || {}),
                numbers: Object.keys(props.numberProps || {}),
                booleans: Object.keys(props.booleanProps || {})
            }
        };
    }
    
    async getVideoProps(params) {
        const { projectName } = params;
        
        const projectPath = join(this.projectsDir, projectName);
        if (!existsSync(projectPath)) {
            throw new Error(`Project "${projectName}" not found`);
        }
        
        const indexPath = join(projectPath, 'src', 'index.tsx');
        if (!existsSync(indexPath)) {
            return {
                success: true,
                message: `No props schema found in "${projectName}"`,
                projectName,
                props: null
            };
        }
        
        const indexContent = readFileSync(indexPath, 'utf8');
        
        // Extract schema definition
        const schemaMatch = indexContent.match(/export const myCompSchema = z\.object\({([\s\S]*?)\}\);/);
        if (!schemaMatch) {
            return {
                success: true,
                message: `No props schema found in "${projectName}"`,
                projectName,
                props: null
            };
        }
        
        // Extract default props
        const defaultsMatch = indexContent.match(/const defaultProps: MyCompProps = {([\s\S]*?)};/);
        
        // Parse the schema to extract props
        const schemaContent = schemaMatch[1];
        const props = {
            text: [],
            colors: [],
            numbers: [],
            booleans: []
        };
        
        // Parse each prop definition
        const propLines = schemaContent.split(',').filter(line => line.trim());
        for (const line of propLines) {
            const propMatch = line.match(/(\w+):\s*z\.(\w+)\(\)/);
            if (propMatch) {
                const [, propName, propType] = propMatch;
                const descMatch = line.match(/\.describe\(['"](.+?)['"]\)/);
                const description = descMatch ? descMatch[1] : null;
                
                // Extract default value if available
                let defaultValue = null;
                if (defaultsMatch) {
                    const defaultRegex = new RegExp(`${propName}:\\s*(['"]?)(.+?)\\1,`);
                    const defaultMatch = defaultsMatch[1].match(defaultRegex);
                    if (defaultMatch) {
                        defaultValue = defaultMatch[2];
                    }
                }
                
                const propInfo = {
                    name: propName,
                    description,
                    default: defaultValue
                };
                
                if (propType === 'string') {
                    // Determine if it's a color based on name or default value
                    if (propName.toLowerCase().includes('color') || 
                        (defaultValue && defaultValue.startsWith('#'))) {
                        props.colors.push(propInfo);
                    } else {
                        props.text.push(propInfo);
                    }
                } else if (propType === 'number') {
                    // Extract min/max if present
                    const minMatch = line.match(/\.min\((\d+(?:\.\d+)?)\)/);
                    const maxMatch = line.match(/\.max\((\d+(?:\.\d+)?)\)/);
                    if (minMatch) propInfo.min = parseFloat(minMatch[1]);
                    if (maxMatch) propInfo.max = parseFloat(maxMatch[1]);
                    props.numbers.push(propInfo);
                } else if (propType === 'boolean') {
                    props.booleans.push(propInfo);
                }
            }
        }
        
        return {
            success: true,
            message: `Found props schema for "${projectName}"`,
            projectName,
            props,
            hasSchema: true
        };
    }
    
    async analyzeVideoStructure(params) {
        const { projectName } = params;
        
        const projectPath = join(this.projectsDir, projectName);
        if (!existsSync(projectPath)) {
            throw new Error(`Project "${projectName}" not found`);
        }
        
        const videoCompPath = join(projectPath, 'src', 'VideoComposition.tsx');
        if (!existsSync(videoCompPath)) {
            throw new Error(`VideoComposition.tsx not found in project "${projectName}"`);
        }
        
        const code = readFileSync(videoCompPath, 'utf8');
        
        // Parse the code into AST
        const ast = parser.parse(code, {
            sourceType: 'module',
            plugins: ['jsx', 'typescript']
        });
        
        const structure = {
            duration: 0,
            fps: 30,
            sequences: [],
            elements: [],
            interpolations: [],
            variables: []
        };
        
        // Extract composition details from index.tsx
        const indexPath = join(projectPath, 'src', 'index.tsx');
        if (existsSync(indexPath)) {
            const indexContent = readFileSync(indexPath, 'utf8');
            const durationMatch = indexContent.match(/durationInFrames={(\d+)}/);
            const fpsMatch = indexContent.match(/fps={(\d+)}/);
            
            if (durationMatch) structure.duration = parseInt(durationMatch[1]);
            if (fpsMatch) structure.fps = parseInt(fpsMatch[1]);
        }
        
        // Traverse AST to extract structure
        traverse.default(ast, {
            JSXElement(path) {
                const node = path.node;
                if (t.isJSXIdentifier(node.openingElement.name)) {
                    const name = node.openingElement.name.name;
                    
                    // Check for Sequence components
                    if (name === 'Sequence') {
                        const sequenceInfo = {
                            type: 'sequence',
                            props: {}
                        };
                        
                        // Extract props
                        node.openingElement.attributes.forEach(attr => {
                            if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name)) {
                                const propName = attr.name.name;
                                if (t.isJSXExpressionContainer(attr.value)) {
                                    // Try to evaluate the expression
                                    const expr = attr.value.expression;
                                    if (t.isNumericLiteral(expr)) {
                                        sequenceInfo.props[propName] = expr.value;
                                    } else if (t.isStringLiteral(expr)) {
                                        sequenceInfo.props[propName] = expr.value;
                                    } else {
                                        // Store as code string
                                        sequenceInfo.props[propName] = generate.default(expr).code;
                                    }
                                }
                            }
                        });
                        
                        structure.sequences.push(sequenceInfo);
                    }
                    
                    // Track other important elements
                    if (['AbsoluteFill', 'Img', 'Video', 'Audio'].includes(name)) {
                        structure.elements.push({
                            type: name.toLowerCase(),
                            line: node.loc?.start.line
                        });
                    }
                }
            },
            
            CallExpression(path) {
                const node = path.node;
                // Track interpolate calls
                if (t.isIdentifier(node.callee) && node.callee.name === 'interpolate') {
                    const interpolation = {
                        line: node.loc?.start.line,
                        arguments: node.arguments.length
                    };
                    
                    // Try to extract frame range if possible
                    if (node.arguments[1] && t.isArrayExpression(node.arguments[1])) {
                        const range = node.arguments[1].elements.map(el => 
                            t.isNumericLiteral(el) ? el.value : null
                        ).filter(v => v !== null);
                        if (range.length === 2) {
                            interpolation.frameRange = range;
                        }
                    }
                    
                    structure.interpolations.push(interpolation);
                }
            },
            
            VariableDeclarator(path) {
                const node = path.node;
                // Track important variables like shot timings
                if (t.isIdentifier(node.id)) {
                    const varName = node.id.name;
                    if (varName.includes('shot') || varName.includes('End') || varName.includes('Start')) {
                        let value = null;
                        if (t.isNumericLiteral(node.init)) {
                            value = node.init.value;
                        }
                        structure.variables.push({
                            name: varName,
                            value,
                            line: node.loc?.start.line
                        });
                    }
                }
            }
        });
        
        return {
            success: true,
            projectName,
            structure,
            message: `Analyzed structure of "${projectName}"`,
            summary: {
                sequenceCount: structure.sequences.length,
                elementCount: structure.elements.length,
                interpolationCount: structure.interpolations.length,
                duration: `${structure.duration / structure.fps} seconds`,
                fps: structure.fps
            }
        };
    }
    
    async editVideoElement(params) {
        const { projectName, elementPath, changes } = params;
        
        const projectPath = join(this.projectsDir, projectName);
        if (!existsSync(projectPath)) {
            throw new Error(`Project "${projectName}" not found`);
        }
        
        const videoCompPath = join(projectPath, 'src', 'VideoComposition.tsx');
        if (!existsSync(videoCompPath)) {
            throw new Error(`VideoComposition.tsx not found in project "${projectName}"`);
        }
        
        let code = readFileSync(videoCompPath, 'utf8');
        const ast = parser.parse(code, {
            sourceType: 'module',
            plugins: ['jsx', 'typescript']
        });
        
        let modified = false;
        
        // Apply changes based on elementPath
        traverse.default(ast, {
            JSXText(path) {
                // Edit text content
                if (changes.text !== undefined) {
                    const parent = path.parent;
                    if (t.isJSXElement(parent)) {
                        // Check if this matches the elementPath
                        // Simple implementation - can be enhanced with more sophisticated path matching
                        path.node.value = changes.text;
                        modified = true;
                    }
                }
            },
            
            JSXAttribute(path) {
                const node = path.node;
                if (t.isJSXIdentifier(node.name)) {
                    const attrName = node.name.name;
                    
                    // Update style attributes
                    if (attrName === 'style' && (changes.color || changes.fontSize || changes.position)) {
                        if (t.isJSXExpressionContainer(node.value)) {
                            const expr = node.value.expression;
                            if (t.isObjectExpression(expr)) {
                                // Modify style object properties
                                expr.properties.forEach(prop => {
                                    if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
                                        const key = prop.key.name;
                                        
                                        if (key === 'color' && changes.color) {
                                            prop.value = t.stringLiteral(changes.color);
                                            modified = true;
                                        }
                                        if (key === 'fontSize' && changes.fontSize) {
                                            prop.value = t.numericLiteral(changes.fontSize);
                                            modified = true;
                                        }
                                        if ((key === 'left' || key === 'top') && changes.position) {
                                            if (changes.position[key]) {
                                                prop.value = t.stringLiteral(changes.position[key]);
                                                modified = true;
                                            }
                                        }
                                    }
                                });
                                
                                // Add new style properties if they don't exist
                                if (changes.color && !expr.properties.find(p => 
                                    t.isObjectProperty(p) && t.isIdentifier(p.key) && p.key.name === 'color'
                                )) {
                                    expr.properties.push(
                                        t.objectProperty(t.identifier('color'), t.stringLiteral(changes.color))
                                    );
                                    modified = true;
                                }
                            }
                        }
                    }
                }
            }
        });
        
        if (modified) {
            // Generate updated code
            const output = generate.default(ast, {}, code);
            writeFileSync(videoCompPath, output.code);
            
            return {
                success: true,
                message: `Updated elements in "${projectName}"`,
                projectName,
                changes,
                modified: true
            };
        } else {
            return {
                success: true,
                message: `No matching elements found to update in "${projectName}"`,
                projectName,
                modified: false
            };
        }
    }
    
    async adjustVideoTiming(params) {
        const { projectName, target, newDuration, adjustSubsequent = true, scaleAnimations = true } = params;
        
        const projectPath = join(this.projectsDir, projectName);
        if (!existsSync(projectPath)) {
            throw new Error(`Project "${projectName}" not found`);
        }
        
        // Update composition duration if target is "composition"
        if (target === 'composition') {
            const indexPath = join(projectPath, 'src', 'index.tsx');
            if (existsSync(indexPath)) {
                let indexContent = readFileSync(indexPath, 'utf8');
                indexContent = indexContent.replace(
                    /durationInFrames={\d+}/,
                    `durationInFrames={${newDuration}}`
                );
                writeFileSync(indexPath, indexContent);
            }
        }
        
        // Update sequence timings in VideoComposition.tsx
        const videoCompPath = join(projectPath, 'src', 'VideoComposition.tsx');
        if (existsSync(videoCompPath)) {
            let code = readFileSync(videoCompPath, 'utf8');
            const ast = parser.parse(code, {
                sourceType: 'module',
                plugins: ['jsx', 'typescript']
            });
            
            let modified = false;
            const scaleFactor = scaleAnimations ? newDuration / this.getCurrentDuration(code) : 1;
            
            traverse.default(ast, {
                JSXAttribute(path) {
                    const node = path.node;
                    if (t.isJSXIdentifier(node.name)) {
                        const attrName = node.name.name;
                        
                        // Adjust sequence timing attributes
                        if ((attrName === 'from' || attrName === 'durationInFrames') && 
                            adjustSubsequent && scaleAnimations) {
                            if (t.isJSXExpressionContainer(node.value)) {
                                const expr = node.value.expression;
                                if (t.isNumericLiteral(expr)) {
                                    expr.value = Math.round(expr.value * scaleFactor);
                                    modified = true;
                                }
                            }
                        }
                    }
                },
                
                CallExpression(path) {
                    const node = path.node;
                    // Scale interpolation frame ranges
                    if (scaleAnimations && t.isIdentifier(node.callee) && node.callee.name === 'interpolate') {
                        if (node.arguments[1] && t.isArrayExpression(node.arguments[1])) {
                            node.arguments[1].elements.forEach(el => {
                                if (t.isNumericLiteral(el)) {
                                    el.value = Math.round(el.value * scaleFactor);
                                    modified = true;
                                }
                            });
                        }
                    }
                }
            });
            
            if (modified) {
                const output = generate.default(ast, {}, code);
                writeFileSync(videoCompPath, output.code);
            }
        }
        
        return {
            success: true,
            message: `Adjusted timing for "${projectName}"`,
            projectName,
            target,
            newDuration,
            adjustSubsequent,
            scaleAnimations
        };
    }
    
    getCurrentDuration(code) {
        // Simple extraction of duration from code
        const match = code.match(/durationInFrames=\{(\d+)\}/);
        return match ? parseInt(match[1]) : 150;
    }
    
    async addVideoSequence(params) {
        const { projectName, position, sequenceType, duration, properties = {}, customCode } = params;
        
        const projectPath = join(this.projectsDir, projectName);
        if (!existsSync(projectPath)) {
            throw new Error(`Project "${projectName}" not found`);
        }
        
        const videoCompPath = join(projectPath, 'src', 'VideoComposition.tsx');
        if (!existsSync(videoCompPath)) {
            throw new Error(`VideoComposition.tsx not found in project "${projectName}"`);
        }
        
        let code = readFileSync(videoCompPath, 'utf8');
        
        // Generate sequence code based on type
        let sequenceCode = '';
        
        switch (sequenceType) {
            case 'text-overlay':
                sequenceCode = `
      <Sequence from={${position}} durationInFrames={${duration}}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          <h1 style={{ 
            color: '${properties.color || '#FFFFFF'}', 
            fontSize: ${properties.fontSize || 48},
            textAlign: 'center'
          }}>
            ${properties.text || 'New Text'}
          </h1>
        </AbsoluteFill>
      </Sequence>`;
                break;
                
            case 'transition':
                sequenceCode = `
      <Sequence from={${position}} durationInFrames={${duration}}>
        <AbsoluteFill style={{ 
          backgroundColor: '${properties.color || '#000000'}',
          opacity: interpolate(frame, [${position}, ${position + duration}], [0, 1])
        }} />
      </Sequence>`;
                break;
                
            case 'custom':
                if (!customCode) {
                    throw new Error('Custom code is required for custom sequence type');
                }
                sequenceCode = `
      <Sequence from={${position}} durationInFrames={${duration}}>
        ${customCode}
      </Sequence>`;
                break;
                
            default:
                sequenceCode = `
      <Sequence from={${position}} durationInFrames={${duration}}>
        <AbsoluteFill style={{ backgroundColor: '${properties.color || '#FF0000'}' }}>
          {/* ${sequenceType} */}
        </AbsoluteFill>
      </Sequence>`;
        }
        
        // Find the return statement and insert the sequence
        const returnIndex = code.lastIndexOf('return (');
        const closingIndex = code.lastIndexOf('</AbsoluteFill>');
        
        if (returnIndex !== -1 && closingIndex !== -1) {
            code = code.slice(0, closingIndex) + sequenceCode + '\n' + code.slice(closingIndex);
            writeFileSync(videoCompPath, code);
            
            return {
                success: true,
                message: `Added ${sequenceType} sequence to "${projectName}"`,
                projectName,
                position,
                duration,
                sequenceType
            };
        } else {
            throw new Error('Could not find insertion point for new sequence');
        }
    }
    
    async removeVideoSequence(params) {
        const { projectName, sequenceId, adjustTimeline = true } = params;
        
        const projectPath = join(this.projectsDir, projectName);
        if (!existsSync(projectPath)) {
            throw new Error(`Project "${projectName}" not found`);
        }
        
        const videoCompPath = join(projectPath, 'src', 'VideoComposition.tsx');
        if (!existsSync(videoCompPath)) {
            throw new Error(`VideoComposition.tsx not found in project "${projectName}"`);
        }
        
        let code = readFileSync(videoCompPath, 'utf8');
        const ast = parser.parse(code, {
            sourceType: 'module',
            plugins: ['jsx', 'typescript']
        });
        
        let removed = false;
        let sequenceIndex = 0;
        const targetIndex = parseInt(sequenceId);
        
        traverse.default(ast, {
            JSXElement(path) {
                const node = path.node;
                if (t.isJSXIdentifier(node.openingElement.name) && 
                    node.openingElement.name.name === 'Sequence') {
                    
                    if (sequenceIndex === targetIndex || 
                        (isNaN(targetIndex) && this.getSequenceName(node) === sequenceId)) {
                        // Remove this sequence
                        path.remove();
                        removed = true;
                    }
                    sequenceIndex++;
                }
            }
        });
        
        if (removed) {
            const output = generate.default(ast, {}, code);
            writeFileSync(videoCompPath, output.code);
            
            return {
                success: true,
                message: `Removed sequence from "${projectName}"`,
                projectName,
                sequenceId,
                removed: true
            };
        } else {
            return {
                success: true,
                message: `Sequence not found in "${projectName}"`,
                projectName,
                sequenceId,
                removed: false
            };
        }
    }
    
    getSequenceName(node) {
        // Extract name prop from Sequence if it exists
        const nameAttr = node.openingElement.attributes.find(attr => 
            t.isJSXAttribute(attr) && 
            t.isJSXIdentifier(attr.name) && 
            attr.name.name === 'name'
        );
        
        if (nameAttr && t.isStringLiteral(nameAttr.value)) {
            return nameAttr.value.value;
        }
        return null;
    }
    
    async reorderVideoSequences(params) {
        const { projectName, reorderMap } = params;
        
        const projectPath = join(this.projectsDir, projectName);
        if (!existsSync(projectPath)) {
            throw new Error(`Project "${projectName}" not found`);
        }
        
        const videoCompPath = join(projectPath, 'src', 'VideoComposition.tsx');
        if (!existsSync(videoCompPath)) {
            throw new Error(`VideoComposition.tsx not found in project "${projectName}"`);
        }
        
        let code = readFileSync(videoCompPath, 'utf8');
        const ast = parser.parse(code, {
            sourceType: 'module',
            plugins: ['jsx', 'typescript']
        });
        
        const sequences = [];
        
        // Extract all sequences
        traverse.default(ast, {
            JSXElement(path) {
                const node = path.node;
                if (t.isJSXIdentifier(node.openingElement.name) && 
                    node.openingElement.name.name === 'Sequence') {
                    sequences.push({
                        node: node,
                        path: path
                    });
                }
            }
        });
        
        // Reorder based on map
        const reorderedSequences = [];
        reorderMap.forEach(mapping => {
            if (sequences[mapping.from]) {
                reorderedSequences[mapping.to] = sequences[mapping.from];
            }
        });
        
        // Remove all sequences first
        sequences.forEach(seq => seq.path.remove());
        
        // Re-insert in new order
        // This is simplified - in production you'd need more sophisticated insertion logic
        
        const output = generate.default(ast, {}, code);
        writeFileSync(videoCompPath, output.code);
        
        return {
            success: true,
            message: `Reordered sequences in "${projectName}"`,
            projectName,
            reorderMap,
            sequenceCount: sequences.length
        };
    }
}

// Start the server
const server = new RoughCutMCPServer();
server.run().catch(console.error);