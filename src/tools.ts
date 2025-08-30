// Simple Working Tools - No abstractions, just direct operations that work
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs-extra';
import * as path from 'path';
import { getWindowsProjectPath, killProcessOnPort, findProcessOnPort, getAssetsDir, getSystemStatus } from './utils.js';

const execAsync = promisify(exec);

export function getTools() {
  return [
    {
      name: 'launch-studio',
      description: 'Launch Remotion Studio for a project on specified port (actually works!)',
      inputSchema: {
        type: 'object',
        properties: {
          project: { type: 'string', description: 'Project name' },
          port: { type: 'number', description: 'Port number (3000-3010)' }
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
    }
  ];
}

export async function handleToolCall(name: string, args: any) {
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
    
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// TOOL IMPLEMENTATIONS - Simple and direct

async function launchStudio(projectName: string, port?: number): Promise<any> {
  try {
    const projectPath = getWindowsProjectPath(projectName);
    const targetPort = port || 3000;
    
    // Check if project exists
    if (!await fs.pathExists(projectPath)) {
      throw new Error(`Project '${projectName}' not found`);
    }
    
    // ALWAYS kill anything on the target port first (fixes same-port restart)
    const wasKilled = await killProcessOnPort(targetPort);
    if (wasKilled) {
      // Wait for port to be freed
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Launch studio with REAL error detection
    const command = `npx.cmd remotion studio --port ${targetPort}`;
    const result = await execAsync(command, {
      cwd: projectPath,
      timeout: 30000
    });
    
    // Check for actual errors in stderr
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
    const actualPid = await findProcessOnPort(targetPort);
    
    if (!actualPid) {
      throw new Error('Studio failed to start - no process found on port');
    }
    
    return {
      content: [{
        type: 'text',
        text: `✅ Studio launched successfully!\nProject: ${projectName}\nPort: ${targetPort}\nURL: http://localhost:${targetPort}\nReal PID: ${actualPid}`
      }]
    };
    
  } catch (error) {
    return {
      content: [{
        type: 'text', 
        text: `❌ Failed to launch studio: ${error instanceof Error ? error.message : String(error)}`
      }]
    };
  }
}

async function stopStudio(port: number): Promise<any> {
  try {
    const killed = await killProcessOnPort(port);
    
    return {
      content: [{
        type: 'text',
        text: killed ? `✅ Stopped studio on port ${port}` : `⚠️ No studio found on port ${port}`
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `❌ Error stopping studio: ${error instanceof Error ? error.message : String(error)}`
      }]
    };
  }
}

async function createVideo(name: string, jsx: string): Promise<any> {
  try {
    const projectPath = getWindowsProjectPath(name);
    
    // Create project directory
    await fs.ensureDir(projectPath);
    
    // Write VideoComposition.tsx
    await fs.writeFile(path.join(projectPath, 'VideoComposition.tsx'), jsx);
    
    // Create basic package.json
    const packageJson = {
      name: name,
      version: "1.0.0",
      dependencies: {
        "@remotion/cli": "4.0.340",
        "remotion": "4.0.340"
      }
    };
    await fs.writeFile(path.join(projectPath, 'package.json'), JSON.stringify(packageJson, null, 2));
    
    // Install dependencies automatically so project works immediately
    await execAsync('npm install', { 
      cwd: projectPath,
      timeout: 60000
    });
    
    // Create Root.tsx
    const rootContent = `import { Composition } from 'remotion';
import { VideoComposition } from './VideoComposition';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Main"
      component={VideoComposition}
      durationInFrames={240}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};`;
    await fs.writeFile(path.join(projectPath, 'Root.tsx'), rootContent);
    
    return {
      content: [{
        type: 'text',
        text: `✅ Created video project '${name}'\nPath: ${projectPath}\nFiles: VideoComposition.tsx, Root.tsx, package.json`
      }]
    };
    
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `❌ Failed to create video: ${error instanceof Error ? error.message : String(error)}`
      }]
    };
  }
}

async function editVideoJSX(projectName: string, jsx: string): Promise<any> {
  try {
    const projectPath = getWindowsProjectPath(projectName);
    const compositionFile = path.join(projectPath, 'VideoComposition.tsx');
    
    // Check if project exists
    if (!await fs.pathExists(compositionFile)) {
      throw new Error(`Project '${projectName}' not found`);
    }
    
    // Write new JSX (Claude's unlimited editing power!)
    await fs.writeFile(compositionFile, jsx);
    
    return {
      content: [{
        type: 'text',
        text: `✅ Updated ${projectName} with new JSX\nFile: VideoComposition.tsx\nStudio will hot-reload automatically if running`
      }]
    };
    
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `❌ Failed to edit video: ${error instanceof Error ? error.message : String(error)}`
      }]
    };
  }
}

async function listProjects(): Promise<any> {
  try {
    const assetsDir = getAssetsDir();
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
        const hasComposition = await fs.pathExists(path.join(projectPath, 'VideoComposition.tsx'));
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
    
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `❌ Error listing projects: ${error instanceof Error ? error.message : String(error)}`
      }]
    };
  }
}

async function getStatus(): Promise<any> {
  try {
    const studios = [];
    
    // Check common ports for studios
    for (const port of [3000, 3001, 3002, 3003]) {
      const pid = await findProcessOnPort(port);
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
    
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `❌ Error getting status: ${error instanceof Error ? error.message : String(error)}`
      }]
    };
  }
}

async function installDependencies(projectName: string): Promise<any> {
  try {
    const projectPath = getWindowsProjectPath(projectName);
    
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
    
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `❌ Failed to install dependencies: ${error instanceof Error ? error.message : String(error)}`
      }]
    };
  }
}

async function deleteProject(projectName: string): Promise<any> {
  try {
    const projectPath = getWindowsProjectPath(projectName);
    
    if (!await fs.pathExists(projectPath)) {
      throw new Error(`Project '${projectName}' not found`);
    }
    
    // Find and stop any studio running this project
    const { ports } = await getSystemStatus();
    for (const portInfo of ports) {
      // Stop all studios to be safe
      await killProcessOnPort(portInfo.port);
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
    
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `❌ Failed to delete project: ${error instanceof Error ? error.message : String(error)}`
      }]
    };
  }
}