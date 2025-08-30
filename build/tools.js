"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTools = getTools;
exports.handleToolCall = handleToolCall;
// Simple Working Tools - No abstractions, just direct operations that work
const child_process_1 = require("child_process");
const util_1 = require("util");
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const utils_js_1 = require("./utils.js");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
function getTools() {
    return [
        {
            name: 'launch-studio',
            description: 'Launch Remotion Studio for a project on specified port (actually works!)',
            inputSchema: {
                type: 'object',
                properties: {
                    project: { type: 'string', description: 'Project name' },
                    port: { type: 'number', description: 'Port number (6600-6620)' }
                },
                required: ['project']
            }
        },
        {
            name: 'stop-studio',
            description: 'Stop Remotion Studio on specified port',
            inputSchema: {
                type: 'object',
                properties: {
                    port: { type: 'number', description: 'Port number to stop' }
                },
                required: ['port']
            }
        },
        {
            name: 'create-video',
            description: 'Create new video project with JSX template',
            inputSchema: {
                type: 'object',
                properties: {
                    name: { type: 'string', description: 'Project name' },
                    jsx: { type: 'string', description: 'Complete VideoComposition JSX code' }
                },
                required: ['name', 'jsx']
            }
        },
        {
            name: 'edit-video-jsx',
            description: 'Update video project with new JSX (unlimited editing power via Claude)',
            inputSchema: {
                type: 'object',
                properties: {
                    project: { type: 'string', description: 'Project name' },
                    jsx: { type: 'string', description: 'Complete new VideoComposition JSX code' }
                },
                required: ['project', 'jsx']
            }
        },
        {
            name: 'list-projects',
            description: 'List all video projects',
            inputSchema: {
                type: 'object',
                properties: {}
            }
        },
        {
            name: 'get-status',
            description: 'Get real status of studios and projects',
            inputSchema: {
                type: 'object',
                properties: {}
            }
        },
        {
            name: 'install-dependencies',
            description: 'Install npm dependencies for a project',
            inputSchema: {
                type: 'object',
                properties: {
                    project: { type: 'string', description: 'Project name' }
                },
                required: ['project']
            }
        },
        {
            name: 'delete-project',
            description: 'Delete a video project completely',
            inputSchema: {
                type: 'object',
                properties: {
                    project: { type: 'string', description: 'Project name to delete' }
                },
                required: ['project']
            }
        },
        {
            name: 'get-mcp-info',
            description: 'Get MCP server version and architecture info (debug tool)',
            inputSchema: {
                type: 'object',
                properties: {}
            }
        }
    ];
}
async function handleToolCall(name, args) {
    switch (name) {
        case 'launch-studio':
            return await launchStudio(args.project, args.port);
        case 'stop-studio':
            return await stopStudio(args.port);
        case 'create-video':
            return await createVideo(args.name, args.jsx);
        case 'edit-video-jsx':
            return await editVideoJSX(args.project, args.jsx);
        case 'list-projects':
            return await listProjects();
        case 'get-status':
            return await getStatus();
        case 'install-dependencies':
            return await installDependencies(args.project);
        case 'delete-project':
            return await deleteProject(args.project);
        case 'get-mcp-info':
            return await getMCPInfo();
        default:
            throw new Error(`Unknown tool: ${name}`);
    }
}
// TOOL IMPLEMENTATIONS - Simple and direct
async function launchStudio(projectName, port) {
    try {
        const projectPath = (0, utils_js_1.getWindowsProjectPath)(projectName);
        const targetPort = port || 6600; // Use 6600-6620 range as requested
        // Check if project exists
        if (!await fs.pathExists(projectPath)) {
            throw new Error(`Project '${projectName}' not found`);
        }
        // ALWAYS kill anything on the target port first (fixes same-port restart)
        const wasKilled = await (0, utils_js_1.killProcessOnPort)(targetPort);
        if (wasKilled) {
            // Wait for port to be freed
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        // Launch studio with REAL error detection
        const command = `npx.cmd remotion studio --port ${targetPort}`;
        let result;
        try {
            result = await execAsync(command, {
                cwd: projectPath,
                timeout: 30000
            });
        }
        catch (execError) {
            // Capture the REAL error from execAsync
            const stderr = execError.stderr || execError.message || String(execError);
            throw new Error(`Remotion startup failed: ${stderr.trim()}`);
        }
        // Check for actual errors in stderr (if command succeeded but had warnings)
        if (result.stderr) {
            if (result.stderr.includes('not available')) {
                throw new Error(`Port ${targetPort} is busy`);
            }
            if (result.stderr.includes('Error:')) {
                throw new Error(`Remotion error: ${result.stderr.trim()}`);
            }
        }
        // Verify studio actually started
        await new Promise(resolve => setTimeout(resolve, 3000));
        const actualPid = await (0, utils_js_1.findProcessOnPort)(targetPort);
        if (!actualPid) {
            throw new Error('Studio failed to start - no process found on port');
        }
        return {
            content: [{
                    type: 'text',
                    text: `✅ Studio launched successfully!\nProject: ${projectName}\nPort: ${targetPort}\nURL: http://localhost:${targetPort}\nReal PID: ${actualPid}`
                }]
        };
    }
    catch (error) {
        return {
            content: [{
                    type: 'text',
                    text: `❌ Failed to launch studio: ${error instanceof Error ? error.message : String(error)}`
                }]
        };
    }
}
async function stopStudio(port) {
    try {
        const killed = await (0, utils_js_1.killProcessOnPort)(port);
        return {
            content: [{
                    type: 'text',
                    text: killed ? `✅ Stopped studio on port ${port}` : `⚠️ No studio found on port ${port}`
                }]
        };
    }
    catch (error) {
        return {
            content: [{
                    type: 'text',
                    text: `❌ Error stopping studio: ${error instanceof Error ? error.message : String(error)}`
                }]
        };
    }
}
async function createVideo(name, jsx) {
    try {
        const projectPath = (0, utils_js_1.getWindowsProjectPath)(name);
        // Create proper Remotion project structure
        await fs.ensureDir(projectPath);
        await fs.ensureDir(path.join(projectPath, 'src'));
        // Ensure JSX uses default export (required for React.lazy/Remotion)
        let fixedJSX = jsx;
        if (jsx.includes('export const VideoComposition')) {
            // Convert named export to default export
            fixedJSX = jsx.replace('export const VideoComposition', 'const VideoComposition') + '\n\nexport default VideoComposition;';
        }
        // Write VideoComposition.tsx in src/
        await fs.writeFile(path.join(projectPath, 'src', 'VideoComposition.tsx'), fixedJSX);
        // Create complete package.json with all required dependencies
        const packageJson = {
            name: name,
            version: "1.0.0",
            scripts: {
                "start": "remotion studio",
                "build": "remotion render src/index.ts",
                "upgrade": "remotion upgrade"
            },
            dependencies: {
                "@remotion/cli": "4.0.340",
                "remotion": "4.0.340",
                "react": "18.2.0",
                "react-dom": "18.2.0"
            },
            devDependencies: {
                "@types/react": "^18.2.0",
                "@types/react-dom": "^18.2.0",
                "typescript": "^5.9.2"
            }
        };
        await fs.writeFile(path.join(projectPath, 'package.json'), JSON.stringify(packageJson, null, 2));
        // Install dependencies automatically so project works immediately
        await execAsync('npm install', {
            cwd: projectPath,
            timeout: 60000
        });
        // Create proper src/index.ts (Remotion entrypoint)
        const indexContent = `import { registerRoot } from 'remotion';
import { Root } from './Root';

registerRoot(Root);`;
        await fs.writeFile(path.join(projectPath, 'src', 'index.ts'), indexContent);
        // Create src/Root.tsx (using proven working direct import pattern)
        const rootContent = `import React from 'react';
import { Composition } from 'remotion';
import VideoComposition from './VideoComposition';

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="Main"
        component={VideoComposition}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};`;
        await fs.writeFile(path.join(projectPath, 'src', 'Root.tsx'), rootContent);
        // Create tsconfig.json for TypeScript support (research-backed config)
        const tsconfigContent = {
            "compilerOptions": {
                "target": "ES2022",
                "lib": ["DOM", "DOM.Iterable", "ES6"],
                "allowJs": true,
                "skipLibCheck": true,
                "esModuleInterop": true,
                "allowSyntheticDefaultImports": true,
                "strict": true,
                "forceConsistentCasingInFileNames": true,
                "moduleResolution": "bundler",
                "module": "ESNext",
                "resolveJsonModule": true,
                "isolatedModules": true,
                "noEmit": true,
                "jsx": "react-jsx"
            },
            "include": ["src"]
        };
        await fs.writeFile(path.join(projectPath, 'tsconfig.json'), JSON.stringify(tsconfigContent, null, 2));
        return {
            content: [{
                    type: 'text',
                    text: `✅ Created video project '${name}'\nPath: ${projectPath}\nFiles: VideoComposition.tsx, Root.tsx, package.json`
                }]
        };
    }
    catch (error) {
        return {
            content: [{
                    type: 'text',
                    text: `❌ Failed to create video: ${error instanceof Error ? error.message : String(error)}`
                }]
        };
    }
}
async function editVideoJSX(projectName, jsx) {
    try {
        const projectPath = (0, utils_js_1.getWindowsProjectPath)(projectName);
        const compositionFile = path.join(projectPath, 'src', 'VideoComposition.tsx');
        // Check if project exists
        if (!await fs.pathExists(compositionFile)) {
            throw new Error(`Project '${projectName}' not found`);
        }
        // Write new JSX (Claude's unlimited editing power!)
        await fs.writeFile(compositionFile, jsx);
        // Auto-restart studio if running (eliminates manual relaunch need)
        const runningPort = await (0, utils_js_1.findStudioPort)();
        if (runningPort) {
            // Restart studio on same port to show changes
            await (0, utils_js_1.killProcessOnPort)(runningPort);
            // Wait for port cleanup
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Restart studio with updated files
            try {
                const restartResult = await launchStudio(projectName, runningPort);
                return {
                    content: [{
                            type: 'text',
                            text: `✅ Updated ${projectName} and auto-restarted studio\nFile: src/VideoComposition.tsx\nStudio: http://localhost:${runningPort}\n\n${restartResult.content[0].text}`
                        }]
                };
            }
            catch (error) {
                return {
                    content: [{
                            type: 'text',
                            text: `✅ Updated ${projectName} JSX\n⚠️ Studio restart failed: ${error instanceof Error ? error.message : String(error)}\nPlease manually launch studio to see changes`
                        }]
                };
            }
        }
        else {
            return {
                content: [{
                        type: 'text',
                        text: `✅ Updated ${projectName} with new JSX\nFile: src/VideoComposition.tsx\nNo studio running - use launch-studio to see changes`
                    }]
            };
        }
    }
    catch (error) {
        return {
            content: [{
                    type: 'text',
                    text: `❌ Failed to edit video: ${error instanceof Error ? error.message : String(error)}`
                }]
        };
    }
}
async function listProjects() {
    try {
        const assetsDir = (0, utils_js_1.getAssetsDir)();
        const projectsDir = path.join(assetsDir, 'projects');
        if (!await fs.pathExists(projectsDir)) {
            return {
                content: [{
                        type: 'text',
                        text: 'No projects directory found'
                    }]
            };
        }
        const projects = await fs.readdir(projectsDir);
        const validProjects = [];
        for (const project of projects) {
            const projectPath = path.join(projectsDir, project);
            const stats = await fs.stat(projectPath);
            if (stats.isDirectory()) {
                const hasComposition = await fs.pathExists(path.join(projectPath, 'src', 'VideoComposition.tsx'));
                validProjects.push({
                    name: project,
                    path: projectPath,
                    hasComposition,
                    status: hasComposition ? 'Ready' : 'Incomplete'
                });
            }
        }
        return {
            content: [{
                    type: 'text',
                    text: validProjects.length > 0
                        ? `Found ${validProjects.length} projects:\n\n` +
                            validProjects.map(p => `• ${p.name} (${p.status})`).join('\n')
                        : 'No video projects found'
                }]
        };
    }
    catch (error) {
        return {
            content: [{
                    type: 'text',
                    text: `❌ Error listing projects: ${error instanceof Error ? error.message : String(error)}`
                }]
        };
    }
}
async function getStatus() {
    try {
        const studios = [];
        // Check 6600-6620 port range for studios
        for (const port of [6600, 6601, 6602, 6603, 6604, 6605]) {
            const pid = await (0, utils_js_1.findProcessOnPort)(port);
            if (pid) {
                studios.push(`Port ${port}: PID ${pid}`);
            }
        }
        return {
            content: [{
                    type: 'text',
                    text: studios.length > 0
                        ? `Active Studios:\n${studios.join('\n')}`
                        : 'No active studios found'
                }]
        };
    }
    catch (error) {
        return {
            content: [{
                    type: 'text',
                    text: `❌ Error getting status: ${error instanceof Error ? error.message : String(error)}`
                }]
        };
    }
}
async function installDependencies(projectName) {
    try {
        const projectPath = (0, utils_js_1.getWindowsProjectPath)(projectName);
        if (!await fs.pathExists(projectPath)) {
            throw new Error(`Project '${projectName}' not found`);
        }
        // Install dependencies
        await execAsync('npm install', {
            cwd: projectPath,
            timeout: 60000
        });
        return {
            content: [{
                    type: 'text',
                    text: `✅ Dependencies installed for ${projectName}\nProject is now ready to launch`
                }]
        };
    }
    catch (error) {
        return {
            content: [{
                    type: 'text',
                    text: `❌ Failed to install dependencies: ${error instanceof Error ? error.message : String(error)}`
                }]
        };
    }
}
async function deleteProject(projectName) {
    try {
        const projectPath = (0, utils_js_1.getWindowsProjectPath)(projectName);
        if (!await fs.pathExists(projectPath)) {
            throw new Error(`Project '${projectName}' not found`);
        }
        // Find and stop any studio running this project
        const { ports } = await (0, utils_js_1.getSystemStatus)();
        for (const portInfo of ports) {
            // Stop all studios to be safe
            await (0, utils_js_1.killProcessOnPort)(portInfo.port);
        }
        // Wait for processes to cleanup
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Delete project directory
        await fs.remove(projectPath);
        // Verify deletion
        const stillExists = await fs.pathExists(projectPath);
        if (stillExists) {
            throw new Error('Project directory could not be completely deleted');
        }
        return {
            content: [{
                    type: 'text',
                    text: `✅ Deleted project '${projectName}'\nPath: ${projectPath}`
                }]
        };
    }
    catch (error) {
        return {
            content: [{
                    type: 'text',
                    text: `❌ Failed to delete project: ${error instanceof Error ? error.message : String(error)}`
                }]
        };
    }
}
async function getMCPInfo() {
    try {
        const buildDate = new Date().toISOString();
        const toolCount = getTools().length;
        return {
            content: [{
                    type: 'text',
                    text: `🔍 MCP Server Debug Info:
Version: 4.1.0 (TypeScript 5.9.2 + Direct Import Fix)
Architecture: Direct Tools (No Complex Abstractions)
Total Tools: ${toolCount}
Port Range: 6600-6620 (NOT 3000-3010!)
Default Port: 6600 (NOT 3000!)
Build Date: ${buildDate}
Status: Simple System Active
File: build/index.js (from simple src/index.ts)

🚨 If you see port 3000 anywhere, Claude Desktop is using OLD cached MCP!
🚨 If tool count > 10, you're running the OLD complex system!`
                }]
        };
    }
    catch (error) {
        return {
            content: [{
                    type: 'text',
                    text: `❌ Error getting MCP info: ${error instanceof Error ? error.message : String(error)}`
                }]
        };
    }
}
//# sourceMappingURL=tools.js.map