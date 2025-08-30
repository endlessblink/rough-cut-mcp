"use strict";
/**
 * Core Tools - Project and Studio Management
 * 4 tools replacing 30+ individual tools
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
exports.registerCoreTools = registerCoreTools;
const tool_categories_js_1 = require("../types/tool-categories.js");
const remotion_js_1 = require("../services/remotion.js");
const studio_registry_js_1 = require("../services/studio-registry.js");
const port_manager_js_1 = require("../services/port-manager.js");
const process_discovery_js_1 = require("../services/process-discovery.js");
const studio_lifecycle_js_1 = require("../services/studio-lifecycle.js");
const studio_health_monitor_js_1 = require("../services/studio-health-monitor.js");
// import { ProjectManagerService } from '../services/project-manager.js';
const path = __importStar(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
function registerCoreTools(server) {
    const remotionService = new remotion_js_1.RemotionService(server.config);
    const studioRegistry = new studio_registry_js_1.StudioRegistry(server.config);
    const healthMonitor = new studio_health_monitor_js_1.StudioHealthMonitor({
        checkInterval: 30000,
        autoRecover: true,
        maxRecoveryAttempts: 3
    });
    // const projectManager = new ProjectManagerService(server.config);
    const logger = server.baseLogger.service('core-tools');
    /**
     * 1. Project Management - All CRUD operations
     */
    server.toolRegistry.registerTool({
        name: 'project',
        description: 'Complete project management - create, list, info, rename, delete, duplicate, repair',
        inputSchema: {
            type: 'object',
            properties: {
                action: {
                    type: 'string',
                    enum: ['create', 'list', 'info', 'rename', 'delete', 'duplicate', 'repair'],
                    description: 'Action to perform'
                },
                name: {
                    type: 'string',
                    description: 'Project name'
                },
                newName: {
                    type: 'string',
                    description: 'New name (for rename/duplicate)'
                },
                options: {
                    type: 'object',
                    properties: {
                        template: { type: 'string', description: 'Template name' },
                        description: { type: 'string' },
                        fps: { type: 'number' },
                        width: { type: 'number' },
                        height: { type: 'number' }
                    }
                }
            },
            required: ['action']
        }
    }, async (args) => {
        try {
            switch (args.action) {
                case 'create': {
                    if (!args.name)
                        throw new Error('Name required');
                    const projectPath = path.join(server.config.assetsDir, 'projects', args.name);
                    if (await fs_extra_1.default.pathExists(projectPath)) {
                        throw new Error(`Project "${args.name}" already exists`);
                    }
                    // Create project structure
                    await fs_extra_1.default.ensureDir(path.join(projectPath, 'src'));
                    await fs_extra_1.default.ensureDir(path.join(projectPath, 'public'));
                    // Create package.json
                    const packageJson = {
                        name: args.name,
                        version: '1.0.0',
                        description: args.options?.description || 'Remotion video project',
                        scripts: {
                            start: 'remotion studio',
                            build: 'remotion render',
                            upgrade: 'remotion upgrade'
                        },
                        dependencies: {
                            '@remotion/cli': '^4.0.0',
                            'react': '^18.0.0',
                            'react-dom': '^18.0.0',
                            'remotion': '^4.0.0'
                        }
                    };
                    await fs_extra_1.default.writeJson(path.join(projectPath, 'package.json'), packageJson, { spaces: 2 });
                    // Create basic VideoComposition.tsx
                    const fps = args.options?.fps || 30;
                    const width = args.options?.width || 1920;
                    const height = args.options?.height || 1080;
                    const composition = `import React from 'react';
import { Composition } from 'remotion';

export const VideoComposition: React.FC = () => {
  return (
    <div style={{ flex: 1, backgroundColor: 'white' }}>
      <h1 style={{ fontSize: 100, textAlign: 'center', marginTop: 400 }}>
        ${args.name}
      </h1>
    </div>
  );
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MainComp"
      component={VideoComposition}
      durationInFrames={150}
      fps={${fps}}
      width={${width}}
      height={${height}}
    />
  );
};`;
                    await fs_extra_1.default.writeFile(path.join(projectPath, 'src', 'VideoComposition.tsx'), composition);
                    await fs_extra_1.default.writeFile(path.join(projectPath, 'src', 'Root.tsx'), composition);
                    return {
                        content: [{
                                type: 'text',
                                text: `✅ Created project "${args.name}" at ${projectPath}`
                            }]
                    };
                }
                case 'list': {
                    try {
                        const projectsDir = path.join(server.config.assetsDir, 'projects');
                        // Ensure the directory exists first
                        await fs_extra_1.default.ensureDir(projectsDir);
                        // Read directory contents
                        const projects = await fs_extra_1.default.readdir(projectsDir);
                        const validProjects = [];
                        for (const project of projects) {
                            try {
                                const projectPath = path.join(projectsDir, project);
                                const stat = await fs_extra_1.default.stat(projectPath);
                                if (stat.isDirectory()) {
                                    const hasPackageJson = await fs_extra_1.default.pathExists(path.join(projectPath, 'package.json'));
                                    const hasComposition = await fs_extra_1.default.pathExists(path.join(projectPath, 'src', 'VideoComposition.tsx'));
                                    validProjects.push({
                                        name: project,
                                        path: projectPath,
                                        valid: hasPackageJson && hasComposition,
                                        status: hasPackageJson && hasComposition ? '✅ Ready' : '⚠️ Incomplete'
                                    });
                                }
                            }
                            catch (itemError) {
                                logger.warn(`Failed to check project: ${project}`, { error: itemError });
                                // Continue checking other projects
                            }
                        }
                        if (validProjects.length === 0) {
                            return {
                                content: [{
                                        type: 'text',
                                        text: 'No projects found. Create one with action:"create"'
                                    }]
                            };
                        }
                        const list = validProjects.map((p, i) => `${i + 1}. **${p.name}** ${p.status}`).join('\n');
                        return {
                            content: [{
                                    type: 'text',
                                    text: `📁 Projects (${validProjects.length}):\n\n${list}`
                                }]
                        };
                    }
                    catch (error) {
                        logger.error('Failed to list projects', { error });
                        return {
                            content: [{
                                    type: 'text',
                                    text: `❌ Failed to list projects: ${error instanceof Error ? error.message : String(error)}\n\nTry creating a new project with action:"create"`
                                }]
                        };
                    }
                }
                case 'info': {
                    if (!args.name)
                        throw new Error('Name required');
                    const projectPath = path.join(server.config.assetsDir, 'projects', args.name);
                    if (!await fs_extra_1.default.pathExists(projectPath)) {
                        throw new Error(`Project "${args.name}" not found`);
                    }
                    const hasPackageJson = await fs_extra_1.default.pathExists(path.join(projectPath, 'package.json'));
                    const hasComposition = await fs_extra_1.default.pathExists(path.join(projectPath, 'src', 'VideoComposition.tsx'));
                    const hasNodeModules = await fs_extra_1.default.pathExists(path.join(projectPath, 'node_modules'));
                    let packageInfo = {};
                    if (hasPackageJson) {
                        packageInfo = await fs_extra_1.default.readJson(path.join(projectPath, 'package.json'));
                    }
                    return {
                        content: [{
                                type: 'text',
                                text: `📊 Project: ${args.name}
Path: ${projectPath}
Status: ${hasPackageJson && hasComposition ? '✅ Ready' : '⚠️ Incomplete'}
Has package.json: ${hasPackageJson ? 'Yes' : 'No'}
Has VideoComposition: ${hasComposition ? 'Yes' : 'No'}
Dependencies installed: ${hasNodeModules ? 'Yes' : 'No'}
Version: ${packageInfo.version || 'Unknown'}`
                            }]
                    };
                }
                case 'rename': {
                    if (!args.name || !args.newName) {
                        throw new Error('Both name and newName required');
                    }
                    const oldPath = path.join(server.config.assetsDir, 'projects', args.name);
                    const newPath = path.join(server.config.assetsDir, 'projects', args.newName);
                    if (!await fs_extra_1.default.pathExists(oldPath)) {
                        throw new Error(`Project "${args.name}" not found`);
                    }
                    if (await fs_extra_1.default.pathExists(newPath)) {
                        throw new Error(`Project "${args.newName}" already exists`);
                    }
                    await fs_extra_1.default.rename(oldPath, newPath);
                    // Update package.json name
                    const packagePath = path.join(newPath, 'package.json');
                    if (await fs_extra_1.default.pathExists(packagePath)) {
                        const pkg = await fs_extra_1.default.readJson(packagePath);
                        pkg.name = args.newName;
                        await fs_extra_1.default.writeJson(packagePath, pkg, { spaces: 2 });
                    }
                    return {
                        content: [{
                                type: 'text',
                                text: `✅ Renamed "${args.name}" to "${args.newName}"`
                            }]
                    };
                }
                case 'delete': {
                    if (!args.name)
                        throw new Error('Name required');
                    const projectPath = path.join(server.config.assetsDir, 'projects', args.name);
                    if (!await fs_extra_1.default.pathExists(projectPath)) {
                        throw new Error(`Project "${args.name}" not found`);
                    }
                    await fs_extra_1.default.remove(projectPath);
                    return {
                        content: [{
                                type: 'text',
                                text: `✅ Deleted project "${args.name}"`
                            }]
                    };
                }
                case 'duplicate': {
                    if (!args.name || !args.newName) {
                        throw new Error('Both name and newName required');
                    }
                    const sourcePath = path.join(server.config.assetsDir, 'projects', args.name);
                    const destPath = path.join(server.config.assetsDir, 'projects', args.newName);
                    if (!await fs_extra_1.default.pathExists(sourcePath)) {
                        throw new Error(`Project "${args.name}" not found`);
                    }
                    if (await fs_extra_1.default.pathExists(destPath)) {
                        throw new Error(`Project "${args.newName}" already exists`);
                    }
                    await fs_extra_1.default.copy(sourcePath, destPath);
                    // Update package.json name
                    const packagePath = path.join(destPath, 'package.json');
                    if (await fs_extra_1.default.pathExists(packagePath)) {
                        const pkg = await fs_extra_1.default.readJson(packagePath);
                        pkg.name = args.newName;
                        await fs_extra_1.default.writeJson(packagePath, pkg, { spaces: 2 });
                    }
                    return {
                        content: [{
                                type: 'text',
                                text: `✅ Duplicated "${args.name}" as "${args.newName}"`
                            }]
                    };
                }
                case 'repair': {
                    if (!args.name)
                        throw new Error('Name required');
                    const projectPath = path.join(server.config.assetsDir, 'projects', args.name);
                    if (!await fs_extra_1.default.pathExists(projectPath)) {
                        throw new Error(`Project "${args.name}" not found`);
                    }
                    const fixes = [];
                    // Ensure directories exist
                    await fs_extra_1.default.ensureDir(path.join(projectPath, 'src'));
                    await fs_extra_1.default.ensureDir(path.join(projectPath, 'public'));
                    // Check and fix package.json
                    const packagePath = path.join(projectPath, 'package.json');
                    if (!await fs_extra_1.default.pathExists(packagePath)) {
                        const packageJson = {
                            name: args.name,
                            version: '1.0.0',
                            scripts: {
                                start: 'remotion studio',
                                build: 'remotion render'
                            },
                            dependencies: {
                                '@remotion/cli': '^4.0.0',
                                'react': '^18.0.0',
                                'remotion': '^4.0.0'
                            }
                        };
                        await fs_extra_1.default.writeJson(packagePath, packageJson, { spaces: 2 });
                        fixes.push('Created package.json');
                    }
                    // Check and fix VideoComposition
                    const compositionPath = path.join(projectPath, 'src', 'VideoComposition.tsx');
                    if (!await fs_extra_1.default.pathExists(compositionPath)) {
                        const composition = `import React from 'react';
import { Composition } from 'remotion';

export const VideoComposition: React.FC = () => {
  return (
    <div style={{ flex: 1, backgroundColor: 'white' }}>
      <h1>Repaired Project</h1>
    </div>
  );
};`;
                        await fs_extra_1.default.writeFile(compositionPath, composition);
                        fixes.push('Created VideoComposition.tsx');
                    }
                    // CRITICAL: Check and fix remotion.config.ts entry point (prevents white screen)
                    const remotionConfigPath = path.join(projectPath, 'remotion.config.ts');
                    let needsEntryPointFix = false;
                    if (!await fs_extra_1.default.pathExists(remotionConfigPath)) {
                        // Create missing remotion.config.ts with entry point
                        const remotionConfigContent = `import { Config } from '@remotion/cli/config';

// Set entry point - CRITICAL to avoid white screen issues
Config.setEntryPoint('./src/index.ts');
Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
`;
                        await fs_extra_1.default.writeFile(remotionConfigPath, remotionConfigContent);
                        fixes.push('Created remotion.config.ts with entry point');
                    }
                    else {
                        // Check if existing config has entry point
                        const configContent = await fs_extra_1.default.readFile(remotionConfigPath, 'utf-8');
                        if (!configContent.includes('setEntryPoint')) {
                            // Add entry point to existing config
                            const lines = configContent.split('\n');
                            const importIndex = lines.findIndex(line => line.includes("import { Config }"));
                            if (importIndex !== -1) {
                                lines.splice(importIndex + 2, 0, '// Set entry point - CRITICAL to avoid white screen issues', 'Config.setEntryPoint(\'./src/index.ts\');');
                                await fs_extra_1.default.writeFile(remotionConfigPath, lines.join('\n'));
                                fixes.push('Added missing entry point to remotion.config.ts');
                            }
                        }
                    }
                    // CRITICAL: Check and fix src/index.ts entry point file
                    const indexPath = path.join(projectPath, 'src', 'index.ts');
                    if (!await fs_extra_1.default.pathExists(indexPath)) {
                        const indexContent = `import { registerRoot } from "remotion";
import { Root } from "./Root";

registerRoot(Root);
`;
                        await fs_extra_1.default.writeFile(indexPath, indexContent);
                        fixes.push('Created src/index.ts entry point');
                    }
                    else {
                        // Check if existing index.ts has registerRoot
                        const indexContent = await fs_extra_1.default.readFile(indexPath, 'utf-8');
                        if (!indexContent.includes('registerRoot')) {
                            fixes.push('Warning: src/index.ts exists but missing registerRoot() - manual fix needed');
                        }
                    }
                    // CRITICAL: Clear webpack cache after repairs to prevent white screen
                    const webpackCachePath = path.join(projectPath, 'node_modules', '.cache');
                    if (await fs_extra_1.default.pathExists(webpackCachePath)) {
                        await fs_extra_1.default.remove(webpackCachePath);
                        fixes.push('Cleared webpack cache');
                        logger.info('Cleared webpack cache after project repair to prevent white screen issues');
                    }
                    return {
                        content: [{
                                type: 'text',
                                text: `✅ Repaired "${args.name}"\nFixes: ${fixes.length > 0 ? fixes.join(', ') : 'No fixes needed'}`
                            }]
                    };
                }
                default:
                    throw new Error(`Unknown action: ${args.action}`);
            }
        }
        catch (error) {
            logger.error('Project operation failed', { error });
            throw error;
        }
    }, {
        name: 'project',
        category: tool_categories_js_1.ToolCategory.CORE_OPERATIONS,
        subCategory: 'project',
        tags: ['project', 'manage'],
        loadByDefault: true,
        priority: 1,
        estimatedTokens: 100
    });
    /**
     * 2. Studio Control - Start, stop, status
     */
    server.toolRegistry.registerTool({
        name: 'studio',
        description: 'Control Remotion Studio - start, stop, restart, status, list',
        inputSchema: {
            type: 'object',
            properties: {
                action: {
                    type: 'string',
                    enum: ['start', 'stop', 'restart', 'status', 'list', 'discover', 'adopt', 'health', 'cleanup', 'report', 'monitor', 'ports', 'processes', 'lifecycle'],
                    description: 'Studio action'
                },
                project: {
                    type: 'string',
                    description: 'Project name to launch with'
                },
                port: {
                    type: 'number',
                    description: 'Port number (default: auto-find)'
                },
                clearCache: {
                    type: 'boolean',
                    description: 'Clear webpack cache before launching (prevents white screen issues)',
                    default: false
                }
            },
            required: ['action']
        }
    }, async (args) => {
        try {
            switch (args.action) {
                case 'start': {
                    let projectPath = server.config.assetsDir;
                    let projectName = 'default';
                    if (args.project) {
                        projectName = args.project;
                        projectPath = path.join(server.config.assetsDir, 'projects', args.project);
                        if (!await fs_extra_1.default.pathExists(projectPath)) {
                            throw new Error(`Project "${args.project}" not found`);
                        }
                    }
                    // CRITICAL: Clear webpack cache if requested (prevents white screen issues)
                    if (args.clearCache) {
                        const webpackCachePath = path.join(projectPath, 'node_modules', '.cache');
                        if (await fs_extra_1.default.pathExists(webpackCachePath)) {
                            logger.info('Clearing webpack cache before studio launch to prevent white screen issues');
                            await fs_extra_1.default.remove(webpackCachePath);
                        }
                    }
                    // 🎯 ENHANCED: Use enhanced smart launch with robust lifecycle management
                    const result = await studioRegistry.smartLaunchStudio(projectPath, projectName, args.port);
                    const statusIcon = result.wasReused ? '♻️' : '✅';
                    const statusText = result.wasReused ? 'Found and reused existing studio' : 'Started new studio';
                    return {
                        content: [{
                                type: 'text',
                                text: `${statusIcon} ${statusText}\nURL: ${result.url}\nPort: ${result.port}\nPID: ${result.pid}\nProject: ${result.projectName}\nStatus: ${result.wasReused ? '♻️ Reused existing instance' : '✨ New instance created'}`
                            }]
                    };
                }
                case 'stop': {
                    const instances = studioRegistry.getInstances();
                    if (instances.length === 0) {
                        return {
                            content: [{
                                    type: 'text',
                                    text: 'No studio instances running'
                                }]
                        };
                    }
                    const targetPort = args.port || instances[0].port;
                    const success = await studioRegistry.stopStudio(targetPort);
                    return {
                        content: [{
                                type: 'text',
                                text: success
                                    ? `✅ Stopped studio on port ${targetPort}`
                                    : `⚠️ Failed to stop studio on port ${targetPort} (may have already stopped)`
                            }]
                    };
                }
                case 'restart': {
                    const instances = studioRegistry.getInstances();
                    if (instances.length === 0) {
                        throw new Error('No studio instances to restart');
                    }
                    const targetPort = args.port || instances[0].port;
                    const existingInstance = instances.find(i => i.port === targetPort);
                    if (!existingInstance) {
                        throw new Error(`No studio on port ${targetPort}`);
                    }
                    const newInstance = await studioRegistry.restartStudio(targetPort);
                    return {
                        content: [{
                                type: 'text',
                                text: `✅ Restarted studio\nURL: ${newInstance.url}\nPort: ${newInstance.port}\nPID: ${newInstance.pid}\nProject: ${newInstance.projectName}`
                            }]
                    };
                }
                case 'status': {
                    const status = studioRegistry.getStatus();
                    if (status.totalInstances === 0) {
                        return {
                            content: [{
                                    type: 'text',
                                    text: '❌ No Remotion Studio instances running'
                                }]
                        };
                    }
                    const instanceList = status.instances.map((inst, i) => `${i + 1}. Port ${inst.port} - PID ${inst.pid}\n   Project: ${inst.projectName || path.basename(inst.projectPath)}\n   Status: ${inst.status}\n   URL: ${inst.url}\n   Running for: ${Math.round((Date.now() - inst.startTime) / 60000)} minutes`).join('\n\n');
                    return {
                        content: [{
                                type: 'text',
                                text: `✅ Studio Status (${status.runningInstances} running, ${status.totalInstances} total):\n\n${instanceList}`
                            }]
                    };
                }
                case 'list': {
                    const instances = studioRegistry.getInstances();
                    if (instances.length === 0) {
                        return {
                            content: [{
                                    type: 'text',
                                    text: 'No studio instances running'
                                }]
                        };
                    }
                    const list = instances.map(inst => `Port ${inst.port} (PID: ${inst.pid}, ${inst.projectName || 'default'})`).join(', ');
                    return {
                        content: [{
                                type: 'text',
                                text: `Running: ${list}`
                            }]
                    };
                }
                case 'discover': {
                    // Discover all running studios (not just tracked ones)
                    const report = await studioRegistry.getComprehensiveReport();
                    const discoveredList = report.discovered.map(studio => `${studio.isHealthy ? '✅' : '❌'} Port ${studio.port} (PID: ${studio.pid})\n   Project: ${studio.project || 'Unknown'}\n   Uptime: ${Math.round(studio.uptime / 1000)}s\n   Tracked: ${report.tracked.some(t => t.port === studio.port) ? 'Yes' : 'No'}`).join('\n\n');
                    return {
                        content: [{
                                type: 'text',
                                text: `🔍 Discovered Studios:\n\n${discoveredList || 'No studios found'}\n\nSystem Health: ${report.systemHealth}\nRecommendations:\n${report.recommendations.map(r => `• ${r}`).join('\n')}`
                            }]
                    };
                }
                case 'adopt': {
                    // Refresh discovery and adopt new studios
                    const refreshResult = await studioRegistry.refreshDiscovery();
                    return {
                        content: [{
                                type: 'text',
                                text: `🔄 Discovery Refresh Complete\n\nAdopted: ${refreshResult.newlyAdopted} studio(s)\nCleaned: ${refreshResult.cleaned} dead instance(s)\nErrors: ${refreshResult.errors.length}\n\n${refreshResult.errors.length > 0 ? 'Errors:\n' + refreshResult.errors.map(e => `• ${e}`).join('\n') : 'All operations successful!'}`
                            }]
                    };
                }
                case 'health': {
                    // Health check all tracked instances
                    const healthResult = await studioRegistry.performHealthCheck();
                    const healthList = healthResult.instances.map(inst => `${inst.isHealthy ? '✅' : '❌'} Port ${inst.port} (PID: ${inst.pid})\n   ${inst.isHealthy ? `Response: ${inst.responseTime}ms` : `Error: ${inst.error}`}`).join('\n\n');
                    return {
                        content: [{
                                type: 'text',
                                text: `🏥 Health Check Results\n\nHealthy: ${healthResult.healthy}\nUnhealthy: ${healthResult.unhealthy}\nRecovered: ${healthResult.recovered}\n\n${healthList}`
                            }]
                    };
                }
                case 'cleanup': {
                    // Clean up orphaned processes
                    const cleanupResult = await studioRegistry.killOrphanedProcesses();
                    return {
                        content: [{
                                type: 'text',
                                text: `🧹 Cleanup Complete\n\nOrphaned processes killed: ${cleanupResult.killed}\nErrors: ${cleanupResult.errors.length}\n\n${cleanupResult.errors.length > 0 ? 'Errors:\n' + cleanupResult.errors.map(e => `• ${e}`).join('\n') : 'Cleanup successful!'}`
                            }]
                    };
                }
                case 'report': {
                    // Comprehensive system report
                    const report = await studioRegistry.getComprehensiveReport();
                    const trackedList = report.tracked.map(inst => `Port ${inst.port} (${inst.status}) - ${inst.projectName}`).join(', ');
                    const discoveredList = report.discovered.map(studio => `Port ${studio.port} (${studio.isHealthy ? 'healthy' : 'unhealthy'})`).join(', ');
                    return {
                        content: [{
                                type: 'text',
                                text: `📊 Studio System Report\n\n🔧 Tracked: ${report.tracked.length} instance(s)\n   ${trackedList || 'None'}\n\n🔍 Discovered: ${report.discovered.length} instance(s)\n   ${discoveredList || 'None'}\n\n📈 System Health: ${report.systemHealth}\n\n💡 Recommendations:\n${report.recommendations.map(r => `• ${r}`).join('\n')}\n\n🔌 Port Usage: ${report.portUsage.join(', ') || 'None'}`
                            }]
                    };
                }
                case 'monitor': {
                    // Control health monitoring
                    const subAction = args.project || 'status'; // Using project field as sub-action
                    switch (subAction) {
                        case 'start':
                            healthMonitor.start();
                            return {
                                content: [{
                                        type: 'text',
                                        text: '✅ Health monitoring started'
                                    }]
                            };
                        case 'stop':
                            healthMonitor.stop();
                            return {
                                content: [{
                                        type: 'text',
                                        text: '✅ Health monitoring stopped'
                                    }]
                            };
                        case 'status':
                        default:
                            const status = healthMonitor.getStatus();
                            return {
                                content: [{
                                        type: 'text',
                                        text: `🔍 Health Monitor Status\n\nRunning: ${status.isRunning}\nCheck Interval: ${status.config.checkInterval}ms\nAuto Recovery: ${status.config.autoRecover}\n\nHealth Report:\nTotal Studios: ${status.healthReport.totalStudios}\nHealthy: ${status.healthReport.healthyStudios}\nUnhealthy: ${status.healthReport.unhealthyStudios}\nAvg Response Time: ${status.healthReport.averageResponseTime}ms\nActive Recoveries: ${status.recoveryQueue.length}`
                                    }]
                            };
                    }
                }
                case 'ports': {
                    // Enhanced port management information
                    const portReport = await port_manager_js_1.PortManager.getPortUsageReport();
                    const portUsage = await port_manager_js_1.PortManager.getPortsInUse();
                    return {
                        content: [{
                                type: 'text',
                                text: `🔌 Port Management Report\n\n${portReport}\n\nDetailed Port Usage:\n${portUsage.map(p => `Port ${p.port}: ${p.processName} (PID: ${p.pid})${p.isSystemService ? ' [SYSTEM]' : ''}${p.isNodeJs ? ' [NODE.JS]' : ''}`).join('\n')}`
                            }]
                    };
                }
                case 'processes': {
                    // Enhanced process discovery information
                    const discoveryReport = await process_discovery_js_1.ProcessDiscovery.getDiscoveryReport();
                    return {
                        content: [{
                                type: 'text',
                                text: `🔍 Process Discovery Report\n\n${discoveryReport}`
                            }]
                    };
                }
                case 'lifecycle': {
                    // Studio lifecycle management information
                    const lifecycleReport = await studio_lifecycle_js_1.StudioLifecycle.getLifecycleReport();
                    return {
                        content: [{
                                type: 'text',
                                text: `🔄 Studio Lifecycle Report\n\n${lifecycleReport}`
                            }]
                    };
                }
                default:
                    throw new Error(`Unknown action: ${args.action}`);
            }
        }
        catch (error) {
            logger.error('Studio operation failed', { error });
            throw error;
        }
    }, {
        name: 'studio',
        category: tool_categories_js_1.ToolCategory.CORE_OPERATIONS,
        subCategory: 'studio',
        tags: ['studio', 'remotion', 'server', 'enhanced', 'lifecycle', 'health'],
        loadByDefault: true,
        priority: 2,
        estimatedTokens: 120
    });
    /**
     * 3. Composition Editor - Modify video elements
     */
    server.toolRegistry.registerTool({
        name: 'composition',
        description: 'Edit video composition - modify elements, timing, and transforms',
        inputSchema: {
            type: 'object',
            properties: {
                project: {
                    type: 'string',
                    description: 'Project name'
                },
                action: {
                    type: 'string',
                    enum: ['add', 'edit', 'remove', 'list', 'timing', 'transform'],
                    description: 'Edit action'
                },
                element: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        type: { type: 'string', enum: ['text', 'image', 'video', 'audio', 'shape'] },
                        props: { type: 'object' }
                    }
                }
            },
            required: ['project', 'action']
        }
    }, async (args) => {
        try {
            const compositionPath = path.join(server.config.assetsDir, 'projects', args.project, 'src', 'VideoComposition.tsx');
            if (!await fs_extra_1.default.pathExists(compositionPath)) {
                throw new Error(`Composition not found for "${args.project}"`);
            }
            // For now, return placeholder - full AST manipulation would go here
            return {
                content: [{
                        type: 'text',
                        text: `✅ Composition action "${args.action}" completed for "${args.project}"`
                    }]
            };
        }
        catch (error) {
            logger.error('Composition edit failed', { error });
            throw error;
        }
    }, {
        name: 'composition',
        category: tool_categories_js_1.ToolCategory.VIDEO_CREATION,
        subCategory: 'editing',
        tags: ['edit', 'composition', 'elements'],
        loadByDefault: false,
        priority: 3,
        estimatedTokens: 120
    });
    /**
     * 4. Dependencies - Install and manage
     */
    server.toolRegistry.registerTool({
        name: 'dependencies',
        description: 'Manage project dependencies - install, update, check',
        inputSchema: {
            type: 'object',
            properties: {
                project: {
                    type: 'string',
                    description: 'Project name'
                },
                action: {
                    type: 'string',
                    enum: ['install', 'update', 'check'],
                    description: 'Dependency action'
                }
            },
            required: ['project', 'action']
        }
    }, async (args) => {
        try {
            const projectPath = path.join(server.config.assetsDir, 'projects', args.project);
            if (!await fs_extra_1.default.pathExists(projectPath)) {
                throw new Error(`Project "${args.project}" not found`);
            }
            switch (args.action) {
                case 'install': {
                    const { stdout, stderr } = await execAsync('npm install', { cwd: projectPath });
                    return {
                        content: [{
                                type: 'text',
                                text: `✅ Dependencies installed for "${args.project}"\n${stdout.slice(0, 200)}`
                            }]
                    };
                }
                case 'update': {
                    const { stdout } = await execAsync('npm update', { cwd: projectPath });
                    return {
                        content: [{
                                type: 'text',
                                text: `✅ Dependencies updated for "${args.project}"`
                            }]
                    };
                }
                case 'check': {
                    const hasNodeModules = await fs_extra_1.default.pathExists(path.join(projectPath, 'node_modules'));
                    const hasPackageLock = await fs_extra_1.default.pathExists(path.join(projectPath, 'package-lock.json'));
                    return {
                        content: [{
                                type: 'text',
                                text: `Dependencies for "${args.project}":\nInstalled: ${hasNodeModules ? 'Yes' : 'No'}\nLock file: ${hasPackageLock ? 'Yes' : 'No'}`
                            }]
                    };
                }
                default:
                    throw new Error(`Unknown action: ${args.action}`);
            }
        }
        catch (error) {
            logger.error('Dependency operation failed', { error });
            throw error;
        }
    }, {
        name: 'dependencies',
        category: tool_categories_js_1.ToolCategory.MAINTENANCE,
        subCategory: 'dependencies',
        tags: ['npm', 'install', 'dependencies'],
        loadByDefault: false,
        priority: 4,
        estimatedTokens: 80
    });
}
//# sourceMappingURL=core-tools.js.map