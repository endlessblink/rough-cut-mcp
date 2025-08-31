import { Tool } from '@modelcontextprotocol/sdk/types.js';
import * as fs from 'fs-extra';
import * as path from 'path';
import { spawn, exec } from 'child_process';
import * as net from 'net';
import {
  getProjectPath,
  createRemotionProject,
  findAvailablePort,
  killProcessOnPort,
  addRunningStudio,
  getRunningStudios,
  clearStudioTracking,
  StudioProcess
} from './utils.js';

export const tools: Tool[] = [
  {
    name: 'create-project',
    description: 'Create a new Remotion project with Claude-generated JSX',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Project name' },
        jsx: { type: 'string', description: 'JSX code from Claude for VideoComposition.tsx' }
      },
      required: ['name', 'jsx']
    }
  },
  {
    name: 'edit-project',
    description: 'Replace VideoComposition.tsx with new JSX',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Project name' },
        jsx: { type: 'string', description: 'New JSX code for VideoComposition.tsx' }
      },
      required: ['name', 'jsx']
    }
  },
  {
    name: 'launch-studio',
    description: 'Start Remotion Studio for a project',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Project name' },
        port: { type: 'number', description: 'Port number (optional, auto-detects 6600-6620)' }
      },
      required: ['name']
    }
  },
  {
    name: 'stop-studio',
    description: 'Stop Remotion Studio running on specified port',
    inputSchema: {
      type: 'object',
      properties: {
        port: { type: 'number', description: 'Port number' }
      },
      required: ['port']
    }
  },
  {
    name: 'list-projects',
    description: 'List all Remotion projects',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'delete-project',
    description: 'Delete a Remotion project completely',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Project name' }
      },
      required: ['name']
    }
  },
  {
    name: 'get-project-info',
    description: 'Get detailed information about a project',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Project name' }
      },
      required: ['name']
    }
  },
  {
    name: 'get-studio-status',
    description: 'Get status of all running Remotion Studios',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  }
];

export async function handleToolCall(name: string, arguments_: any): Promise<any> {
  try {
    switch (name) {
      case 'create-project':
        return await createProject(arguments_.name, arguments_.jsx);
      
      case 'edit-project':
        return await editProject(arguments_.name, arguments_.jsx);
      
      case 'launch-studio':
        return await launchStudio(arguments_.name, arguments_.port);
      
      case 'stop-studio':
        return await stopStudio(arguments_.port);
      
      case 'list-projects':
        return await listProjects();
      
      case 'delete-project':
        return await deleteProject(arguments_.name);
      
      case 'get-project-info':
        return await getProjectInfo(arguments_.name);
      
      case 'get-studio-status':
        return await getStudioStatus();
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    // Log detailed error to stderr for Claude Desktop logs
    console.error(`MCP Tool Error [${name}]:`, error);
    console.error(`Arguments:`, JSON.stringify(arguments_, null, 2));
    if (error instanceof Error) {
      console.error(`Stack:`, error.stack);
    }
    
    return {
      content: [{
        type: 'text',
        text: `ERROR: ${error instanceof Error ? error.message : 'Unknown error'}\n\nTool: ${name}\nDetails: ${error instanceof Error ? error.stack : JSON.stringify(error)}`
      }],
      isError: true
    };
  }
}

async function createProject(name: string, jsx: string) {
  const projectPath = getProjectPath(name);
  
  console.error(`[CREATE-PROJECT] Starting creation for "${name}" at: ${projectPath}`);
  
  if (await fs.pathExists(projectPath)) {
    throw new Error(`Project "${name}" already exists`);
  }
  
  // Create the Remotion project structure
  console.error(`[CREATE-PROJECT] Creating project structure...`);
  await createRemotionProject(projectPath, jsx);
  console.error(`[CREATE-PROJECT] Project structure created successfully`);
  
  // Use direct Windows npm
  const npmCommand = 'npm';
  
  // Run npm install with detailed logging
  console.error(`[CREATE-PROJECT] Starting npm install with command: ${npmCommand} in: ${projectPath}`);
  return new Promise((resolve, reject) => {
    const npmInstall = spawn(npmCommand, ['install'], {
      cwd: projectPath,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: process.env,
      shell: true
    });
    
    let stdout = '';
    let stderr = '';
    
    npmInstall.stdout?.on('data', (data) => {
      stdout += data.toString();
    });
    
    npmInstall.stderr?.on('data', (data) => {
      stderr += data.toString();
    });
    
    npmInstall.on('close', (code) => {
      console.error(`[CREATE-PROJECT] npm install completed with code: ${code}`);
      if (stdout) console.error(`[CREATE-PROJECT] npm stdout:`, stdout);
      if (stderr) console.error(`[CREATE-PROJECT] npm stderr:`, stderr);
      
      if (code === 0) {
        resolve({
          content: [{
            type: 'text',
            text: `Project "${name}" created successfully at ${projectPath}\n\nNext step: Use launch-studio tool to start Remotion Studio.`
          }]
        });
      } else {
        reject(new Error(`npm install failed with code ${code}\nSTDOUT: ${stdout}\nSTDERR: ${stderr}`));
      }
    });
    
    npmInstall.on('error', (error) => {
      console.error(`[CREATE-PROJECT] npm install spawn error:`, error);
      reject(new Error(`Failed to spawn npm install: ${error.message}`));
    });
  });
}

async function editProject(name: string, jsx: string) {
  const projectPath = getProjectPath(name);
  
  if (!(await fs.pathExists(projectPath))) {
    throw new Error(`Project "${name}" does not exist`);
  }
  
  const compositionPath = path.join(projectPath, 'src', 'VideoComposition.tsx');
  await fs.writeFile(compositionPath, jsx);
  
  return {
    content: [{
      type: 'text',
      text: `Project "${name}" updated successfully. Refresh browser to see changes.`
    }]
  };
}

async function launchStudio(name: string, port?: number) {
  const projectPath = getProjectPath(name);
  
  if (!(await fs.pathExists(projectPath))) {
    throw new Error(`Project "${name}" does not exist`);
  }
  
  const studioPort = port || await findAvailablePort();
  
  // Check if studio is already running on this port
  const existingStudios = getRunningStudios();
  if (existingStudios.find(s => s.port === studioPort)) {
    throw new Error(`Studio already running on port ${studioPort}`);
  }
  
  // Validate project has Remotion dependencies
  const packageJsonPath = path.join(projectPath, 'package.json');
  if (!(await fs.pathExists(packageJsonPath))) {
    throw new Error(`Project "${name}" missing package.json - run create-project first`);
  }
  
  console.error(`[LAUNCH-STUDIO] Starting Remotion Studio (Windows npx)`);
  console.error(`[LAUNCH-STUDIO] Project: ${projectPath}`);
  console.error(`[LAUNCH-STUDIO] Port: ${studioPort}`);
  
  return new Promise((resolve, reject) => {
    const env = { ...process.env, PORT: studioPort.toString() };
    
    // Spawn npx in shell on Windows for proper resolution
    const studioProcess = spawn(
      'npx',
      ['remotion', 'studio', '--port', studioPort.toString()],
      {
        cwd: projectPath,
        env,
        shell: true,
        stdio: ['ignore', 'pipe', 'pipe'],
      }
    );
    
    let stdoutBuffer = '';
    let stderrBuffer = '';
    let settled = false;
    
    // Helper to clean up and reject
    const cleanup = (err: Error) => {
      if (!settled) {
        settled = true;
        studioProcess.kill();
        reject(err);
      }
    };
    
    // Watch for unexpected exit
    studioProcess.on('exit', (code, signal) => {
      console.error(`[LAUNCH-STUDIO] Process exited: code=${code}, signal=${signal}`);
      console.error(`[LAUNCH-STUDIO] STDOUT: ${stdoutBuffer}`);
      console.error(`[LAUNCH-STUDIO] STDERR: ${stderrBuffer}`);
      cleanup(new Error(`Studio exited prematurely (code=${code}, signal=${signal})\nSTDOUT: ${stdoutBuffer}\nSTDERR: ${stderrBuffer}`));
    });
    
    // Accumulate stdout & stderr for debugging
    studioProcess.stdout!.on('data', (chunk: Buffer) => {
      stdoutBuffer += chunk.toString();
      console.error(`[LAUNCH-STUDIO] STDOUT:`, chunk.toString());
    });
    
    studioProcess.stderr!.on('data', (chunk: Buffer) => {
      stderrBuffer += chunk.toString();
      console.error(`[LAUNCH-STUDIO] STDERR:`, chunk.toString());
    });
    
    // Track the studio process
    const studio: StudioProcess = {
      pid: studioProcess.pid!,
      port: studioPort,
      projectName: name,
      process: studioProcess
    };
    
    addRunningStudio(studio);
    
    // Periodically check if port is actually listening (Perplexity solution)
    const startTime = Date.now();
    const timeoutMs = 30000;
    
    const checkPort = () => {
      if (settled) return;
      
      const socket = net.createConnection({ host: '127.0.0.1', port: studioPort }, () => {
        console.error(`[LAUNCH-STUDIO] Port ${studioPort} is now listening!`);
        if (!settled) {
          settled = true;
          resolve({
            content: [{
              type: 'text',
              text: `Remotion Studio started for "${name}" at http://localhost:${studioPort}\n\nOpen this URL in your browser to see the animation.`
            }]
          });
        }
        socket.end();
      });
      
      socket.on('error', () => {
        // Port not ready yet
        if (Date.now() - startTime > timeoutMs) {
          cleanup(new Error(
            `Timeout: Studio did not listen on port ${studioPort} within ${timeoutMs}ms.\n` +
            `STDOUT: ${stdoutBuffer}\nSTDERR: ${stderrBuffer}`
          ));
        } else {
          // Try again in 500ms
          setTimeout(checkPort, 500);
        }
      });
    };
    
    // Start checking port after 2 seconds (give process time to start)
    setTimeout(checkPort, 2000);
  });
}

async function stopStudio(port: number) {
  const success = await killProcessOnPort(port);
  
  return {
    content: [{
      type: 'text',
      text: success 
        ? `Studio on port ${port} stopped successfully`
        : `Failed to stop studio on port ${port} or no studio found`
    }]
  };
}

async function listProjects() {
  const projectsDir = path.resolve(process.cwd(), 'assets', 'projects');
  
  if (!(await fs.pathExists(projectsDir))) {
    return {
      content: [{
        type: 'text',
        text: 'No projects found'
      }]
    };
  }
  
  const entries = await fs.readdir(projectsDir);
  const projects = [];
  
  for (const entry of entries) {
    const projectPath = path.join(projectsDir, entry);
    const stats = await fs.stat(projectPath);
    
    if (stats.isDirectory()) {
      const packageJsonPath = path.join(projectPath, 'package.json');
      let packageJson = null;
      
      if (await fs.pathExists(packageJsonPath)) {
        try {
          packageJson = await fs.readJson(packageJsonPath);
        } catch (error) {
          // Ignore invalid package.json
        }
      }
      
      projects.push({
        name: entry,
        path: projectPath,
        hasPackageJson: !!packageJson,
        version: packageJson?.version || 'unknown',
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime
      });
    }
  }
  
  return {
    content: [{
      type: 'text',
      text: `Found ${projects.length} projects:\n${projects.map(p => `- ${p.name} (${p.version})`).join('\n')}`
    }]
  };
}

async function deleteProject(name: string) {
  const projectPath = getProjectPath(name);
  
  if (!(await fs.pathExists(projectPath))) {
    throw new Error(`Project "${name}" does not exist`);
  }
  
  // Stop any running studios for this project
  const runningStudios = getRunningStudios();
  const projectStudios = runningStudios.filter(s => s.projectName === name);
  
  for (const studio of projectStudios) {
    await killProcessOnPort(studio.port);
  }
  
  // Remove project directory
  await fs.remove(projectPath);
  
  return {
    content: [{
      type: 'text',
      text: `Project "${name}" deleted successfully. Stopped ${projectStudios.length} running studios.`
    }]
  };
}

async function getProjectInfo(name: string) {
  const projectPath = getProjectPath(name);
  
  if (!(await fs.pathExists(projectPath))) {
    throw new Error(`Project "${name}" does not exist`);
  }
  
  const packageJsonPath = path.join(projectPath, 'package.json');
  const compositionPath = path.join(projectPath, 'src', 'VideoComposition.tsx');
  const rootPath = path.join(projectPath, 'src', 'Root.tsx');
  
  let packageJson = null;
  let hasComposition = false;
  let hasRoot = false;
  
  try {
    if (await fs.pathExists(packageJsonPath)) {
      packageJson = await fs.readJson(packageJsonPath);
    }
    
    hasComposition = await fs.pathExists(compositionPath);
    hasRoot = await fs.pathExists(rootPath);
    
    const stats = await fs.stat(projectPath);
    const runningStudios = getRunningStudios();
    const projectStudios = runningStudios.filter(s => s.projectName === name);
    
    const studioInfo = projectStudios.length > 0 
      ? `\nRunning studios: ${projectStudios.map(s => `http://localhost:${s.port}`).join(', ')}`
      : '\nNo running studios';
    
    return {
      content: [{
        type: 'text',
        text: `Project "${name}":\nPath: ${projectPath}\nVersion: ${packageJson?.version || 'unknown'}\nHas composition: ${hasComposition}\nHas root: ${hasRoot}${studioInfo}`
      }]
    };
  } catch (error) {
    throw new Error(`Failed to get project info: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function getStudioStatus() {
  const runningStudios = getRunningStudios();
  
  if (runningStudios.length === 0) {
    return {
      content: [{
        type: 'text',
        text: 'No studios currently running'
      }]
    };
  }
  
  return {
    content: [{
      type: 'text',
      text: `Running studios (${runningStudios.length}):\n${runningStudios.map(s => `- ${s.projectName}: http://localhost:${s.port} (PID: ${s.pid})`).join('\n')}`
    }]
  };
}