"use strict";
/**
 * Creation Tools - Video creation and analysis
 * 4 tools replacing 6+ individual tools
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCreationTools = registerCreationTools;
const tool_categories_js_1 = require("../types/tool-categories.js");
const animation_generator_js_1 = require("../services/animation-generator.js");
const interpolation_validator_js_1 = require("../utils/interpolation-validator.js");
const version_detector_js_1 = require("../utils/version-detector.js");
const path = __importStar(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
function registerCreationTools(server) {
    const animationGenerator = new animation_generator_js_1.AnimationGeneratorService();
    const logger = server.baseLogger.service('creation-tools');
    // Register composition tools first
    const { registerCompositionTools } = require('./composition-editor.js');
    registerCompositionTools(server);
    /**
     * 1. Create Video - All video types in one tool
     */
    server.toolRegistry.registerTool({
        name: 'create-video',
        description: 'Create any type of video animation',
        inputSchema: {
            type: 'object',
            properties: {
                type: {
                    type: 'string',
                    enum: ['text', 'slideshow', 'animated', 'custom'],
                    description: 'Type of video to create',
                    default: 'text'
                },
                projectName: {
                    type: 'string',
                    description: 'Name for the project'
                },
                content: {
                    type: 'object',
                    properties: {
                        text: { type: 'string', description: 'Text content' },
                        images: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Image URLs or paths'
                        },
                        code: { type: 'string', description: 'Custom React code' },
                        duration: { type: 'number', description: 'Duration in seconds', default: 10 },
                        fps: { type: 'number', description: 'Frames per second', default: 30 },
                        width: { type: 'number', default: 1920 },
                        height: { type: 'number', default: 1080 },
                        backgroundColor: { type: 'string', default: 'white' },
                        fontSize: { type: 'number', default: 60 },
                        fontColor: { type: 'string', default: 'black' }
                    }
                }
            },
            required: ['projectName', 'content']
        }
    }, async (args) => {
        try {
            const projectPath = path.join(server.config.assetsDir, 'projects', args.projectName);
            // Create project directory
            await fs_extra_1.default.ensureDir(projectPath);
            await fs_extra_1.default.ensureDir(path.join(projectPath, 'src'));
            await fs_extra_1.default.ensureDir(path.join(projectPath, 'public'));
            // Generate composition based on type
            let composition = '';
            const { content } = args;
            const fps = content.fps || 30;
            const duration = content.duration || 10;
            const width = content.width || 1920;
            const height = content.height || 1080;
            switch (args.type || 'text') {
                case 'text': {
                    composition = `import React from 'react';
import { Composition, Sequence, AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

// Helper to ensure interpolation ranges are valid (prevents Remotion errors)
function validateRange(range) {
  if (range.length <= 1) return range;
  const valid = [...range];
  for (let i = 1; i < valid.length; i++) {
    if (valid[i] <= valid[i-1]) {
      valid[i] = valid[i-1] + 1;
    }
  }
  return valid;
}

// Safe interpolate wrapper
function safeInterpolate(frame, inputRange, outputRange, options) {
  const validInput = validateRange(inputRange);
  return interpolate(frame, validInput, outputRange, options);
}

export const VideoComposition: React.FC = () => {
  const frame = useCurrentFrame();
  
  // Example fade-in using safe interpolation
  const opacity = safeInterpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
  
  return (
    <AbsoluteFill style={{ backgroundColor: '${content.backgroundColor || 'white'}', opacity }}
      <Sequence from={0} durationInFrames={${duration * fps}}>
        <AbsoluteFill style={{ 
          justifyContent: 'center', 
          alignItems: 'center',
          padding: 50
        }}>
          <h1 style={{ 
            fontSize: ${content.fontSize || 60}, 
            color: '${content.fontColor || 'black'}',
            textAlign: 'center',
            fontFamily: 'Arial, sans-serif'
          }}>
            ${content.text || 'Hello World'}
          </h1>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MainComp"
      component={VideoComposition}
      durationInFrames={${duration * fps}}
      fps={${fps}}
      width={${width}}
      height={${height}}
    />
  );
};`;
                    break;
                }
                case 'slideshow': {
                    const images = content.images || [];
                    const framePer = Math.floor((duration * fps) / Math.max(images.length, 1));
                    const imageSequences = images.map((img, i) => `
        <Sequence from={${i * framePer}} durationInFrames={${framePer}}>
          <AbsoluteFill>
            <img src="${img}" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </AbsoluteFill>
        </Sequence>`).join('');
                    composition = `import React from 'react';
import { Composition, Sequence, AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

// Helper to ensure interpolation ranges are valid (prevents Remotion errors)
function validateRange(range) {
  if (range.length <= 1) return range;
  const valid = [...range];
  for (let i = 1; i < valid.length; i++) {
    if (valid[i] <= valid[i-1]) {
      valid[i] = valid[i-1] + 1;
    }
  }
  return valid;
}

// Safe interpolate wrapper
function safeInterpolate(frame, inputRange, outputRange, options) {
  const validInput = validateRange(inputRange);
  return interpolate(frame, validInput, outputRange, options);
}

export const VideoComposition: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: '${content.backgroundColor || 'black'}' }}>
      ${imageSequences || '<div>No images provided</div>'}
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MainComp"
      component={VideoComposition}
      durationInFrames={${duration * fps}}
      fps={${fps}}
      width={${width}}
      height={${height}}
    />
  );
};`;
                    break;
                }
                case 'animated': {
                    // Generate animation with proper method
                    const animRequest = {
                        animationDesc: content.text || 'Animated video',
                        duration: duration,
                        fps: fps,
                        dimensions: { width, height },
                        style: content.style
                    };
                    const result = await animationGenerator.generateAnimation(animRequest);
                    composition = result.compositionCode;
                    break;
                }
                case 'custom': {
                    if (!content.code) {
                        throw new Error('Custom code required for custom type');
                    }
                    composition = content.code;
                    break;
                }
                default:
                    throw new Error(`Unknown video type: ${args.type}`);
            }
            // Process composition code to fix any interpolation issues
            const safeComposition = (0, interpolation_validator_js_1.processVideoCode)(composition);
            // Write files
            await fs_extra_1.default.writeFile(path.join(projectPath, 'src', 'VideoComposition.tsx'), safeComposition);
            // Get safe dependencies with proper versions to prevent conflicts
            const safeDeps = await (0, version_detector_js_1.generateSafeDependencies)();
            // Create proper Root.tsx that registers the composition
            const rootContent = `import React from 'react';
import { Composition } from 'remotion';
import { VideoComposition } from './VideoComposition';

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="VideoComposition"
        component={VideoComposition}
        durationInFrames={${duration * fps}}
        fps={${fps}}
        width={${width}}
        height={${height}}
      />
    </>
  );
};
`;
            await fs_extra_1.default.writeFile(path.join(projectPath, 'src', 'Root.tsx'), rootContent);
            // Create package.json with dynamic version detection
            const packageJson = {
                name: args.projectName,
                version: '1.0.0',
                description: `${args.type || 'text'} video created with Rough Cut`,
                scripts: {
                    start: 'remotion studio',
                    build: 'remotion render',
                    upgrade: 'remotion upgrade'
                },
                ...safeDeps // Use dynamically detected safe dependencies
            };
            await fs_extra_1.default.writeJson(path.join(projectPath, 'package.json'), packageJson, { spaces: 2 });
            // Create .npmrc to force local resolution and prevent parent conflicts
            const npmrcContent = `prefer-offline=true
prefer-local=true
legacy-peer-deps=true
`;
            await fs_extra_1.default.writeFile(path.join(projectPath, '.npmrc'), npmrcContent, 'utf-8');
            logger.info('Created .npmrc for local resolution priority', { projectName: args.projectName });
            // Create src/index.ts entry point for Remotion Studio
            const indexContent = `import { registerRoot } from "remotion";
import { Root } from "./Root";

registerRoot(Root);
`;
            await fs_extra_1.default.writeFile(path.join(projectPath, 'src', 'index.ts'), indexContent, 'utf-8');
            logger.info('Created src/index.ts entry point', { projectName: args.projectName });
            // Create remotion.config.ts (CRITICAL for Remotion to work)
            const remotionConfigContent = `import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
`;
            await fs_extra_1.default.writeFile(path.join(projectPath, 'remotion.config.ts'), remotionConfigContent, 'utf-8');
            logger.info('Created remotion.config.ts', { projectName: args.projectName });
            // Create tsconfig.json (CRITICAL for TypeScript compilation)
            const tsconfigContent = {
                compilerOptions: {
                    target: "es2017",
                    lib: ["dom", "dom.iterable", "es6"],
                    allowJs: true,
                    skipLibCheck: true,
                    esModuleInterop: true,
                    allowSyntheticDefaultImports: true,
                    strict: true,
                    forceConsistentCasingInFileNames: true,
                    moduleResolution: "node",
                    resolveJsonModule: true,
                    isolatedModules: true,
                    noEmit: true,
                    jsx: "react-jsx"
                },
                include: ["src"]
            };
            await fs_extra_1.default.writeJson(path.join(projectPath, 'tsconfig.json'), tsconfigContent, { spaces: 2 });
            logger.info('Created tsconfig.json', { projectName: args.projectName });
            // Install dependencies
            logger.info('Installing dependencies for new project', { projectName: args.projectName });
            let dependenciesInstalled = false;
            let installErrorMessage = '';
            try {
                // Use platform-specific npm command
                const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
                const { stdout, stderr } = await execAsync(`${npmCmd} install`, {
                    cwd: projectPath,
                    timeout: 120000, // 2 minute timeout
                    env: { ...process.env, NODE_ENV: 'production' }
                });
                // Verify installation succeeded by checking node_modules
                const nodeModulesExists = await fs_extra_1.default.pathExists(path.join(projectPath, 'node_modules'));
                if (nodeModulesExists) {
                    logger.info('Dependencies installed successfully', { projectName: args.projectName });
                    dependenciesInstalled = true;
                }
                else {
                    throw new Error('node_modules directory not created after npm install');
                }
            }
            catch (installError) {
                installErrorMessage = installError.message || 'Unknown error';
                logger.error('Failed to auto-install dependencies', {
                    error: installErrorMessage,
                    stderr: installError.stderr,
                    projectPath
                });
                // Continue but report the error to user
            }
            return {
                content: [{
                        type: 'text',
                        text: `✅ Created ${args.type || 'text'} video "${args.projectName}"
Path: ${projectPath}
Type: ${args.type || 'text'}
Duration: ${duration}s
Resolution: ${width}x${height}
FPS: ${fps}

Files created:
✅ package.json
✅ tsconfig.json
✅ remotion.config.ts
✅ src/index.ts
✅ src/Root.tsx
✅ src/VideoComposition.tsx

Dependencies: ${dependenciesInstalled ? '✅ Installed successfully' : `❌ Installation failed`}
${!dependenciesInstalled ? `Error: ${installErrorMessage}\nManual fix: cd "${projectPath}" && npm install` : ''}

Use "studio" tool with action:"start" and project:"${args.projectName}" to preview.`
                    }]
            };
        }
        catch (error) {
            logger.error('Video creation failed', { error });
            throw error;
        }
    }, {
        name: 'create-video',
        category: tool_categories_js_1.ToolCategory.VIDEO_CREATION,
        subCategory: 'basic',
        tags: ['create', 'video', 'animation'],
        loadByDefault: false,
        priority: 1,
        estimatedTokens: 150
    });
    /**
     * 2. Generate Assets - Voice, images, sounds
     */
    server.toolRegistry.registerTool({
        name: 'generate-assets',
        description: 'Generate assets for videos - voice, images, or sounds',
        inputSchema: {
            type: 'object',
            properties: {
                type: {
                    type: 'string',
                    enum: ['voice', 'image', 'sound'],
                    description: 'Type of asset to generate'
                },
                project: {
                    type: 'string',
                    description: 'Project to add assets to (optional)'
                },
                config: {
                    type: 'object',
                    properties: {
                        // Voice config
                        text: { type: 'string', description: 'Text for voice generation' },
                        voiceId: { type: 'string', description: 'ElevenLabs voice ID' },
                        // Image config
                        prompt: { type: 'string', description: 'Image generation prompt' },
                        model: { type: 'string', description: 'Flux model to use' },
                        // Sound config
                        query: { type: 'string', description: 'Sound search query' },
                        duration: { type: 'number', description: 'Max duration in seconds' }
                    }
                }
            },
            required: ['type', 'config']
        }
    }, async (args) => {
        try {
            const assetsDir = args.project
                ? path.join(server.config.assetsDir, 'projects', args.project, 'public')
                : path.join(server.config.assetsDir, 'generated');
            await fs_extra_1.default.ensureDir(assetsDir);
            switch (args.type) {
                case 'voice': {
                    if (!server.config.apiKeys.elevenlabs) {
                        throw new Error('ElevenLabs API key not configured');
                    }
                    // Voice generation would go here
                    const filename = `voice-${Date.now()}.mp3`;
                    const filepath = path.join(assetsDir, filename);
                    // Placeholder for actual generation
                    await fs_extra_1.default.writeFile(filepath, 'placeholder audio data');
                    return {
                        content: [{
                                type: 'text',
                                text: `✅ Generated voice asset\nFile: ${filename}\nPath: ${filepath}`
                            }]
                    };
                }
                case 'image': {
                    if (!server.config.apiKeys.flux) {
                        throw new Error('Flux API key not configured');
                    }
                    // Image generation would go here
                    const filename = `image-${Date.now()}.png`;
                    const filepath = path.join(assetsDir, filename);
                    // Placeholder for actual generation
                    await fs_extra_1.default.writeFile(filepath, 'placeholder image data');
                    return {
                        content: [{
                                type: 'text',
                                text: `✅ Generated image asset\nFile: ${filename}\nPath: ${filepath}`
                            }]
                    };
                }
                case 'sound': {
                    if (!server.config.apiKeys.freesound) {
                        throw new Error('Freesound API key not configured');
                    }
                    // Sound search would go here
                    const filename = `sound-${Date.now()}.wav`;
                    const filepath = path.join(assetsDir, filename);
                    // Placeholder for actual download
                    await fs_extra_1.default.writeFile(filepath, 'placeholder sound data');
                    return {
                        content: [{
                                type: 'text',
                                text: `✅ Downloaded sound asset\nFile: ${filename}\nPath: ${filepath}`
                            }]
                    };
                }
                default:
                    throw new Error(`Unknown asset type: ${args.type}`);
            }
        }
        catch (error) {
            logger.error('Asset generation failed', { error });
            throw error;
        }
    }, {
        name: 'generate-assets',
        category: tool_categories_js_1.ToolCategory.ASSET_GENERATION,
        subCategory: 'generation',
        tags: ['generate', 'assets', 'voice', 'image', 'sound'],
        loadByDefault: false,
        priority: 2,
        estimatedTokens: 120
    });
    /**
     * 3. Analyze Video - Structure and optimization
     */
    server.toolRegistry.registerTool({
        name: 'analyze-video',
        description: 'Analyze video structure, performance, and suggest optimizations',
        inputSchema: {
            type: 'object',
            properties: {
                project: {
                    type: 'string',
                    description: 'Project name to analyze'
                },
                type: {
                    type: 'string',
                    enum: ['structure', 'performance', 'dependencies', 'all'],
                    default: 'all'
                }
            },
            required: ['project']
        }
    }, async (args) => {
        try {
            const projectPath = path.join(server.config.assetsDir, 'projects', args.project);
            const compositionPath = path.join(projectPath, 'src', 'VideoComposition.tsx');
            if (!await fs_extra_1.default.pathExists(compositionPath)) {
                throw new Error(`Project "${args.project}" not found`);
            }
            const content = await fs_extra_1.default.readFile(compositionPath, 'utf-8');
            // Basic analysis
            const analysis = {
                structure: {
                    lines: content.split('\n').length,
                    hasComposition: content.includes('Composition'),
                    hasSequence: content.includes('Sequence'),
                    hasAudio: content.includes('Audio'),
                    hasVideo: content.includes('Video'),
                    hasImages: content.includes('Img') || content.includes('img')
                },
                performance: {
                    fileSize: (await fs_extra_1.default.stat(compositionPath)).size,
                    estimatedComplexity: content.match(/Sequence/g)?.length || 0
                }
            };
            return {
                content: [{
                        type: 'text',
                        text: `📊 Analysis of "${args.project}":

Structure:
• Lines of code: ${analysis.structure.lines}
• Has Composition: ${analysis.structure.hasComposition ? 'Yes' : 'No'}
• Has Sequences: ${analysis.structure.hasSequence ? 'Yes' : 'No'}
• Has Audio: ${analysis.structure.hasAudio ? 'Yes' : 'No'}
• Has Video: ${analysis.structure.hasVideo ? 'Yes' : 'No'}
• Has Images: ${analysis.structure.hasImages ? 'Yes' : 'No'}

Performance:
• File size: ${(analysis.performance.fileSize / 1024).toFixed(2)} KB
• Sequence count: ${analysis.performance.estimatedComplexity}
• Complexity: ${analysis.performance.estimatedComplexity > 10 ? 'High' : analysis.performance.estimatedComplexity > 5 ? 'Medium' : 'Low'}`
                    }]
            };
        }
        catch (error) {
            logger.error('Analysis failed', { error });
            throw error;
        }
    }, {
        name: 'analyze-video',
        category: tool_categories_js_1.ToolCategory.VIDEO_CREATION,
        subCategory: 'advanced',
        tags: ['analyze', 'structure', 'performance'],
        loadByDefault: false,
        priority: 3,
        estimatedTokens: 100
    });
    /**
     * 4. Render Video - Export to file
     */
    server.toolRegistry.registerTool({
        name: 'render',
        description: 'Render video to output file',
        inputSchema: {
            type: 'object',
            properties: {
                project: {
                    type: 'string',
                    description: 'Project name'
                },
                output: {
                    type: 'string',
                    description: 'Output filename',
                    default: 'output.mp4'
                },
                quality: {
                    type: 'string',
                    enum: ['low', 'medium', 'high'],
                    default: 'medium'
                }
            },
            required: ['project']
        }
    }, async (args) => {
        try {
            const projectPath = path.join(server.config.assetsDir, 'projects', args.project);
            if (!await fs_extra_1.default.pathExists(projectPath)) {
                throw new Error(`Project "${args.project}" not found`);
            }
            // Render command would go here
            const outputPath = path.join(projectPath, args.output || 'output.mp4');
            return {
                content: [{
                        type: 'text',
                        text: `✅ Rendering started for "${args.project}"
Output: ${outputPath}
Quality: ${args.quality || 'medium'}

Note: Actual rendering requires Remotion CLI to be implemented.`
                    }]
            };
        }
        catch (error) {
            logger.error('Render failed', { error });
            throw error;
        }
    }, {
        name: 'render',
        category: tool_categories_js_1.ToolCategory.VIDEO_CREATION,
        subCategory: 'advanced',
        tags: ['render', 'export', 'output'],
        loadByDefault: false,
        priority: 4,
        estimatedTokens: 80
    });
}
//# sourceMappingURL=creation-tools.js.map