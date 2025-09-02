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
  removeDeadStudio,
  updateProjectDuration,
  getAudioConfig,
  setAudioConfig,
  isAudioEnabled,
  getBaseDirectory,
  StudioProcess,
  validateVideoCompositionFile,
  checkProjectIntegrity,
  autoRecoverProject,
  ensureProperExportSafe,
  createProjectBackup,
  listProjectBackups,
  restoreProjectBackup,
  cleanOldBackups
} from './utils.js';

// Import new resumption system (safe - isolated until used)
import { checkpointManager, jsxProcessor } from './checkpoint-processor.js';

export const tools: Tool[] = [
  {
    name: 'create_project',  
    description: 'MANDATORY for video creation: Create new Remotion projects with proper JSX structure. This is the ONLY tool that can create valid Remotion projects. Built-in tools CANNOT create the required project structure.',
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
    name: 'edit_project',
    description: 'MANDATORY for VideoComposition.tsx files: Use this tool for ALL Remotion project edits. Built-in Edit/Read tools CANNOT handle Remotion syntax and WILL corrupt projects. Required for surgical edits and targeted changes.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Remotion project name (required for .tsx file operations)' },
        jsx: { type: 'string', description: 'Complete JSX code for VideoComposition.tsx file (Remotion components only)' },
        instruction: { type: 'string', description: 'CRITICAL: User instruction for surgical/targeted edits vs full replacement (required for preserving animation structure)' },
        duration: { type: 'number', description: 'Video duration in seconds (optional)' },
        use_resumption: { type: 'boolean', description: 'Use resumption system with timeout protection (default: true, set false to disable)' },
        resume_from: { type: 'string', description: 'Resume from specific operation ID (optional)' }
      },
      required: ['name', 'jsx']
    }
  },
  {
    name: 'launch_studio',
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
    name: 'stop_studio',
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
    name: 'list_projects',
    description: 'MANDATORY for Remotion project discovery: List all video projects with metadata. File system tools CANNOT detect Remotion project structure and WILL miss critical project information. Use this for ALL project listing.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'delete_project',
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
    name: 'get_project_info',
    description: 'MANDATORY for Remotion projects: Get project structure and component information. Read File tool CANNOT parse Remotion project metadata and WILL hang on cross-platform paths. Use this tool for ALL VideoComposition.tsx analysis.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Project name' }
      },
      required: ['name']
    }
  },
  {
    name: 'get_studio_status',
    description: 'Get status of all running Remotion Studios',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'configure_audio',
    description: 'Configure optional AI audio generation (ElevenLabs SFX API)',
    inputSchema: {
      type: 'object',
      properties: {
        apiKey: { type: 'string', description: 'ElevenLabs API key (optional)' },
        enabled: { type: 'boolean', description: 'Enable/disable audio features' }
      },
      required: []
    }
  },
  {
    name: 'generate_audio',
    description: 'Generate AI sound effects or music for video (requires configuration)',
    inputSchema: {
      type: 'object',
      properties: {
        projectName: { type: 'string', description: 'Project name' },
        prompt: { type: 'string', description: 'Audio description (e.g., bouncing ball sound effect)' },
        type: { type: 'string', enum: ['sfx', 'music'], description: 'Audio type' },
        duration: { type: 'number', description: 'Duration in seconds (optional)' }
      },
      required: ['projectName', 'prompt', 'type']
    }
  },
  {
    name: 'debug_audio_config',
    description: 'Debug tool to check audio environment variables',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'list_project_backups',
    description: 'List all available backups for a project',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Project name' }
      },
      required: ['name']
    }
  },
  {
    name: 'restore_project_backup',
    description: 'Restore VideoComposition.tsx from a specific backup',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Project name' },
        backupFilename: { type: 'string', description: 'Backup filename to restore from' }
      },
      required: ['name', 'backupFilename']
    }
  },
  {
    name: 'clean_project_backups',
    description: 'Clean old backups, keeping only the most recent ones',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Project name' },
        keepCount: { type: 'number', description: 'Number of backups to keep (default: 5)' }
      },
      required: ['name']
    }
  },
  // ====== NEW RESUMPTION TOOLS (Safe - Additive Only) ======
  {
    name: 'list_interrupted_operations',
    description: 'List all operations that were interrupted and can be resumed',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'resume_operation',
    description: 'Resume an interrupted edit_project operation from its last checkpoint',
    inputSchema: {
      type: 'object',
      properties: {
        operationId: { type: 'string', description: 'ID of the operation to resume' }
      },
      required: ['operationId']
    }
  },
  {
    name: 'cancel_operation',
    description: 'Cancel an interrupted operation and clean up its checkpoint',
    inputSchema: {
      type: 'object',
      properties: {
        operationId: { type: 'string', description: 'ID of the operation to cancel' }
      },
      required: ['operationId']
    }
  },
  {
    name: 'cleanup_stale_operations',
    description: 'Clean up old interrupted operations (older than 24 hours)',
    inputSchema: {
      type: 'object',
      properties: {
        maxAgeHours: { type: 'number', description: 'Maximum age in hours (default: 24)' }
      },
      required: []
    }
  }
];

export async function handleToolCall(name: string, arguments_: any): Promise<any> {
  try {
    switch (name) {
      case 'create_project':
        return await createProject(arguments_.name, arguments_.jsx);
      
      case 'edit_project':
        return await editProject(arguments_.name, arguments_.jsx, arguments_.instruction, arguments_.duration, arguments_.use_resumption, arguments_.resume_from);
      
      case 'launch_studio':
        return await launchStudio(arguments_.name, arguments_.port);
      
      case 'stop_studio':
        return await stopStudio(arguments_.port);
      
      case 'list_projects':
        return await listProjects();
      
      case 'delete_project':
        return await deleteProject(arguments_.name);
      
      case 'get_project_info':
        return await getProjectInfo(arguments_.name);
      
      case 'get_studio_status':
        return await getStudioStatus();
      
      case 'configure_audio':
        return await configureAudio(arguments_.apiKey, arguments_.enabled);
      
      case 'generate_audio':
        return await generateAudio(arguments_.projectName, arguments_.prompt, arguments_.type, arguments_.duration);
      
      case 'debug_audio_config':
        return await debugAudioConfig();
      
      case 'list_project_backups':
        return await listBackups(arguments_.name);
      
      case 'restore_project_backup':
        return await restoreBackup(arguments_.name, arguments_.backupFilename);
      
      case 'clean_project_backups':
        return await cleanBackups(arguments_.name, arguments_.keepCount);
      
      // ====== NEW RESUMPTION TOOL HANDLERS (Safe - Isolated) ======
      case 'list_interrupted_operations':
        return await listInterruptedOperations();
        
      case 'resume_operation':
        return await resumeOperation(arguments_.operationId);
        
      case 'cancel_operation':
        return await cancelOperation(arguments_.operationId);
        
      case 'cleanup_stale_operations':
        return await cleanupStaleOperations(arguments_.maxAgeHours);
      
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
        // Check if this is user's first project (welcome message)  
        const projectsDir = path.dirname(projectPath);
        const isFirstProject = !require('fs-extra').existsSync(projectsDir) || 
                             require('fs-extra').readdirSync(projectsDir).filter((item: string) => 
                               require('fs-extra').statSync(path.join(projectsDir, item)).isDirectory()
                             ).length <= 1;
        
        let welcomeMessage = '';
        if (isFirstProject) {
          welcomeMessage = `\n\n🎉 **Welcome to Remotion MCP!** This is your first project.\n📁 All your video projects are saved to: ${projectsDir}\n💡 Tip: Use launch_studio to preview your animations!`;
        }

        resolve({
          content: [{
            type: 'text',
            text: `Project "${name}" created successfully at ${projectPath}${welcomeMessage}\n\nNext step: Use launch-studio tool to start Remotion Studio.`
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

async function editProject(name: string, jsx: string, instruction?: string, duration?: number, useResumption?: boolean, resumeFrom?: string) {
  const projectPath = getProjectPath(name);
  
  // AUTOMATIC RECOVERY: Check if project exists and its integrity
  if (!(await fs.pathExists(projectPath))) {
    // Project doesn't exist - auto-create it instead
    console.error(`[AUTO-RECOVERY] Project "${name}" doesn't exist - creating it automatically`);
    await createRemotionProject(projectPath, jsx);
    
    if (duration && duration > 0) {
      await updateProjectDuration(projectPath, duration);
    }
    
    return {
      content: [{
        type: 'text',
        text: `Project "${name}" didn't exist - automatically created it with your JSX. Refresh browser to see changes.`
      }]
    };
  }
  
  // Check project integrity and auto-recover if needed
  const integrity = await checkProjectIntegrity(name);
  
  if (integrity.needsRecovery) {
    console.error(`[AUTO-RECOVERY] Project "${name}" needs recovery - fixing automatically`);
    const recovery = await autoRecoverProject(name, jsx, duration);
    
    if (recovery.success) {
      return {
        content: [{
          type: 'text',
          text: `Project "${name}" was incomplete - automatically recovered and updated. Actions: ${recovery.actions.join(', ')}. Refresh browser to see changes.`
        }]
      };
    } else {
      throw new Error(`Failed to recover project "${name}": ${recovery.message}`);
    }
  }
  
  // AUTOMATIC BACKUP: Protect user's working animation before editing
  const backupResult = await createProjectBackup(name);
  console.error(`[EDIT-PROJECT] Backup result:`, backupResult.message);
  
  const compositionPath = path.join(projectPath, 'src', 'VideoComposition.tsx');
  let jsx_processed: string;
  let processingMethod: string;

  // INSTRUCTION-AWARE PROCESSING: Detect if this should be a targeted edit
  const isTargetedEdit = instruction && (
    instruction.toLowerCase().includes('add') && 
    !instruction.toLowerCase().includes('replace') &&
    !instruction.toLowerCase().includes('recreate') &&
    (instruction.toLowerCase().includes('to all') || 
     instruction.toLowerCase().includes('to each') ||
     instruction.toLowerCase().includes('to existing'))
  );

  if (isTargetedEdit) {
    console.error(`[EDIT-PROJECT] TARGETED EDIT detected from instruction: "${instruction}"`);
    console.error(`[EDIT-PROJECT] Will preserve existing structure and make minimal changes`);
    
    // For targeted edits, read existing file first
    try {
      const existingJSX = await fs.readFile(compositionPath, 'utf8');
      console.error(`[EDIT-PROJECT] Existing file: ${existingJSX.length} chars, New JSX: ${jsx.length} chars`);
      
      // Simple heuristic: If new JSX is significantly different structure, warn but proceed carefully
      const existingHasSequences = existingJSX.includes('<Sequence');
      const newHasSequences = jsx.includes('<Sequence');
      const existingComponents = existingJSX.split('const ').length;
      const newComponents = jsx.split('const ').length;
      
      if (existingHasSequences && newHasSequences && Math.abs(existingComponents - newComponents) <= 2) {
        console.error(`[EDIT-PROJECT] TARGETED EDIT: Compatible structures detected - proceeding with targeted edit`);
        jsx_processed = jsx; // Use Claude's JSX but log as targeted
        processingMethod = `targeted edit (${instruction})`;
      } else {
        console.error(`[EDIT-PROJECT] TARGETED EDIT: Major structural differences detected - falling back to full replacement`);
        console.error(`[EDIT-PROJECT] Existing sequences: ${existingHasSequences}, New sequences: ${newHasSequences}`);
        console.error(`[EDIT-PROJECT] Existing components: ${existingComponents}, New components: ${newComponents}`);
        jsx_processed = jsx;
        processingMethod = `full replacement (structural changes required for: ${instruction})`;
      }
    } catch (error) {
      console.error(`[EDIT-PROJECT] Could not read existing file for targeted edit:`, error);
      jsx_processed = jsx;
      processingMethod = `full replacement (could not read existing file)`;
    }
  } else {
    console.error(`[EDIT-PROJECT] FULL REPLACEMENT mode${instruction ? ` for instruction: "${instruction}"` : ''}`);
    
    // HYBRID PROCESSING: Use resumption system by DEFAULT, with opt-out option
    if (useResumption === false) {
      console.error(`[EDIT-PROJECT] Using existing JSX processing system (explicitly disabled)`);
      jsx_processed = ensureProperExportSafe(jsx);
      processingMethod = 'existing system (explicitly disabled)';
    } else {
      console.error(`[EDIT-PROJECT] Using resumption system (default)${resumeFrom ? ` - resuming from ${resumeFrom}` : ''}`);
      
      try {
        // Generate or use existing operation ID
        const operationId = resumeFrom || `edit_${name}_${Date.now()}`;
        
        // Check for existing checkpoint if resuming
        const existingCheckpoint = resumeFrom ? checkpointManager.getCheckpoint(resumeFrom) : undefined;
        
        if (resumeFrom && !existingCheckpoint) {
          throw new Error(`No checkpoint found for operation: ${resumeFrom}`);
        }
        
        // Use resumption system with timeout protection
        jsx_processed = await jsxProcessor.processJSXWithResumption(jsx, name, operationId, existingCheckpoint);
        processingMethod = `resumption system${resumeFrom ? ' (resumed)' : ''}`;
        
      } catch (error) {
        console.error(`[EDIT-PROJECT] Resumption system failed:`, error);
        
        // Check if it's a resumable timeout error
        const isTimeoutError = error instanceof Error && error.message.includes('RESUMABLE_TIMEOUT');
        
        if (isTimeoutError) {
          // Timeout occurred - return with resumption instructions
          return {
            content: [{
              type: 'text',
              text: `⏳ **Operation Timed Out**\n\n${error.message}\n\n💡 Your progress has been saved. Use \`resume_operation\` to continue from where it stopped, or try again with regular processing.`
            }]
          };
        }
        
        // Other error - fallback to existing system
        console.error(`[EDIT-PROJECT] Falling back to existing JSX processing system`);
        jsx_processed = ensureProperExportSafe(jsx);
        processingMethod = 'existing system (fallback from resumption error)';
      }
    }
  }
  
  // Validate processed JSX before writing (regardless of processing method)
  const validation = validateVideoCompositionFile(jsx_processed);
  if (!validation.isValid) {
    console.error(`[EDIT-PROJECT] JSX validation issues detected:`, validation.issues);
    
    // If JSX is invalid and we have a backup, warn the user
    if (backupResult.success) {
      throw new Error(`JSX validation failed (processed with ${processingMethod}). Original file backed up as: ${backupResult.backupPath}. Issues: ${validation.issues.join(', ')}`);
    } else {
      throw new Error(`JSX validation failed and backup failed: ${validation.issues.join(', ')}`);
    }
  }
  
  await fs.writeFile(compositionPath, jsx_processed);
  console.error(`[EDIT-PROJECT] JSX processed successfully using: ${processingMethod}`);
  
  // Clean old backups (keep last 5)
  const cleanupResult = await cleanOldBackups(name, 5);
  console.error(`[EDIT-PROJECT] Backup cleanup:`, cleanupResult.message);
  
  let message = `Project "${name}" updated successfully using ${processingMethod}.`;
  
  // Update duration if provided
  if (duration && duration > 0) {
    try {
      await updateProjectDuration(projectPath, duration);
      message += ` Duration set to ${duration} seconds (${duration * 30} frames).`;
    } catch (error) {
      console.error(`[EDIT-PROJECT] Duration update failed:`, error);
      message += ` Duration update failed: ${error instanceof Error ? error.message : 'unknown error'}.`;
    }
  }
  
  return {
    content: [{
      type: 'text',
      text: message + ' Refresh browser to see changes.'
    }]
  };
}

async function launchStudio(name: string, port?: number) {
  const projectPath = getProjectPath(name);
  
  if (!(await fs.pathExists(projectPath))) {
    throw new Error(`Project "${name}" does not exist`);
  }
  
  const studioPort = port || await findAvailablePort();
  
  // IMPROVED: Check for healthy running studios, clean up zombies
  const existingStudios = getRunningStudios();
  const existingStudio = existingStudios.find(s => s.port === studioPort || s.projectName === name);
  
  if (existingStudio) {
    // Check if process is actually still running
    try {
      process.kill(existingStudio.pid, 0); // Signal 0 tests if process exists
      throw new Error(`Studio already running for "${name}" on port ${existingStudio.port} (PID: ${existingStudio.pid})`);
    } catch (killError) {
      // Process is dead - clean up zombie tracking
      console.error(`[LAUNCH-STUDIO] Cleaning up zombie studio process (PID: ${existingStudio.pid})`);
      // Remove from tracking (we'll implement this helper)
      removeDeadStudio(existingStudio.port);
    }
  }
  
  // Validate project has Remotion dependencies
  const packageJsonPath = path.join(projectPath, 'package.json');
  if (!(await fs.pathExists(packageJsonPath))) {
    throw new Error(`Project "${name}" missing package.json - run create-project first`);
  }
  
  console.error(`[LAUNCH-STUDIO] Starting Remotion Studio for "${name}"`);
  console.error(`[LAUNCH-STUDIO] Project: ${projectPath}`);
  console.error(`[LAUNCH-STUDIO] Port: ${studioPort}`);
  
  return new Promise((resolve, reject) => {
    const env = { ...process.env, PORT: studioPort.toString() };
    let settled = false;
    let studioTrackingAdded = false;
    
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
    
    if (!studioProcess.pid) {
      reject(new Error('Failed to spawn Remotion Studio process'));
      return;
    }
    
    // Helper to clean up on failure
    const cleanup = (err: Error) => {
      if (!settled) {
        settled = true;
        console.error(`[LAUNCH-STUDIO] Cleanup due to error:`, err.message);
        
        // Kill process if still running
        try {
          studioProcess.kill('SIGTERM');
          setTimeout(() => {
            try {
              studioProcess.kill('SIGKILL'); // Force kill after 5 seconds
            } catch {}
          }, 5000);
        } catch {}
        
        // Remove from tracking if we added it
        if (studioTrackingAdded) {
          removeDeadStudio(studioPort);
        }
        
        reject(err);
      }
    };
    
    // IMPROVED: Only treat early exits as errors, not normal shutdown
    let startupPhase = true;
    setTimeout(() => { startupPhase = false; }, 10000); // 10 second startup phase
    
    studioProcess.on('exit', (code, signal) => {
      console.error(`[LAUNCH-STUDIO] Process exited: code=${code}, signal=${signal}`);
      console.error(`[LAUNCH-STUDIO] Startup phase: ${startupPhase}`);
      
      if (startupPhase && !settled) {
        // Only treat as error if during startup phase
        console.error(`[LAUNCH-STUDIO] STDOUT: ${stdoutBuffer}`);
        console.error(`[LAUNCH-STUDIO] STDERR: ${stderrBuffer}`);
        cleanup(new Error(`Studio failed to start (code=${code}, signal=${signal})\nSTDOUT: ${stdoutBuffer}\nSTDERR: ${stderrBuffer}`));
      } else if (studioTrackingAdded) {
        // Normal shutdown after startup - just clean up tracking
        console.error(`[LAUNCH-STUDIO] Studio shut down normally, cleaning up tracking`);
        removeDeadStudio(studioPort);
      }
    });
    
    // Collect output for debugging
    studioProcess.stdout!.on('data', (chunk: Buffer) => {
      const output = chunk.toString();
      stdoutBuffer += output;
      console.error(`[LAUNCH-STUDIO] STDOUT:`, output.trim());
      
      // Look for success indicators
      if (output.includes('Local:') || output.includes('ready') || output.includes('started')) {
        console.error(`[LAUNCH-STUDIO] Detected success indicator in output`);
      }
    });
    
    studioProcess.stderr!.on('data', (chunk: Buffer) => {
      const output = chunk.toString();
      stderrBuffer += output;
      console.error(`[LAUNCH-STUDIO] STDERR:`, output.trim());
    });
    
    // IMPROVED: Smart port checking with retry logic
    const startTime = Date.now();
    const timeoutMs = 30000;
    let checkAttempts = 0;
    const maxAttempts = 60; // 30 seconds / 500ms
    
    const checkPort = () => {
      if (settled) return;
      
      checkAttempts++;
      console.error(`[LAUNCH-STUDIO] Port check attempt ${checkAttempts}/${maxAttempts}`);
      
      const socket = net.createConnection({ 
        host: '127.0.0.1', 
        port: studioPort,
        timeout: 2000 
      });
      
      socket.on('connect', () => {
        console.error(`[LAUNCH-STUDIO] ✅ Port ${studioPort} is now listening!`);
        socket.end();
        
        if (!settled) {
          settled = true;
          
          // NOW add to tracking (only after confirmed success)
          const studio: StudioProcess = {
            pid: studioProcess.pid!,
            port: studioPort,
            projectName: name,
            process: studioProcess
          };
          
          addRunningStudio(studio);
          studioTrackingAdded = true;
          
          resolve({
            content: [{
              type: 'text',
              text: `✅ Remotion Studio started for "${name}"\n\n🌐 **URL**: http://localhost:${studioPort}\n📁 **Project**: ${name}\n🔧 **PID**: ${studioProcess.pid}\n\nOpen the URL in your browser to see the animation.`
            }]
          });
        }
      });
      
      socket.on('error', () => {
        socket.destroy();
        
        // Check if we've exceeded time or attempts
        if (checkAttempts >= maxAttempts || Date.now() - startTime > timeoutMs) {
          cleanup(new Error(
            `Timeout: Studio did not start within ${timeoutMs}ms after ${checkAttempts} attempts.\n` +
            `This might indicate:\n` +
            `- Port ${studioPort} is blocked by firewall\n` +
            `- Remotion dependencies missing\n` +
            `- Project has compilation errors\n\n` +
            `STDOUT: ${stdoutBuffer}\nSTDERR: ${stderrBuffer}`
          ));
        } else {
          // Try again in 500ms
          setTimeout(checkPort, 500);
        }
      });
      
      socket.on('timeout', () => {
        socket.destroy();
        // Treat timeout same as error
        socket.emit('error');
      });
    };
    
    // Start checking port after 3 seconds (give process more time to start)
    setTimeout(checkPort, 3000);
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
  // Get projects directory using same logic as getProjectPath
  let projectsDir;
  
  if (process.env.REMOTION_PROJECTS_DIR) {
    // Use direct projects directory from environment variable
    projectsDir = process.env.REMOTION_PROJECTS_DIR;
  } else {
    // Use base directory + assets/projects structure
    const baseDir = getBaseDirectory();
    projectsDir = path.resolve(baseDir, 'assets', 'projects');
  }
  
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

// Optional Audio Tool Functions

async function configureAudio(apiKey?: string, enabled?: boolean) {
  try {
    const currentConfig = getAudioConfig();
    
    // Use API key from parameter OR existing .env file
    const effectiveApiKey = apiKey || currentConfig.elevenLabsApiKey;
    const effectiveEnabled = enabled ?? currentConfig.enabled;
    
    const newConfig = {
      enabled: effectiveEnabled,
      elevenLabsApiKey: effectiveApiKey
    };
    
    // Only update .env if values are actually changing
    if (apiKey || enabled !== undefined) {
      await setAudioConfig(newConfig);
    }
    
    return {
      content: [{
        type: 'text',
        text: `Audio features ${effectiveEnabled ? 'enabled' : 'disabled'}.${effectiveApiKey ? ' ElevenLabs API key configured.' : ' No API key configured - audio generation will not work.'}`
      }]
    };
  } catch (error) {
    throw new Error(`Audio configuration failed: ${error instanceof Error ? error.message : 'unknown error'}`);
  }
}

async function generateAudio(projectName: string, prompt: string, type: string, duration?: number) {
  // Check if audio is enabled
  const audioEnabled = isAudioEnabled();
  if (!audioEnabled) {
    return {
      content: [{
        type: 'text', 
        text: 'Audio features are disabled. Use configure-audio tool to enable and set API key.'
      }]
    };
  }
  
  const projectPath = getProjectPath(projectName);
  if (!(await fs.pathExists(projectPath))) {
    throw new Error(`Project "${projectName}" does not exist`);
  }
  
  try {
    const config = getAudioConfig();
    
    if (!config.elevenLabsApiKey) {
      return {
        content: [{
          type: 'text',
          text: 'ElevenLabs API key not configured. Use configure-audio tool to set API key.'
        }]
      };
    }
    
    // Create audio in public directory for proper Remotion serving
    const audioDir = path.join(projectPath, 'public', 'audio');
    await fs.ensureDir(audioDir);
    
    // Generate audio with real ElevenLabs SFX API
    const audioFileName = `${type}-${Date.now()}.wav`;
    const audioPath = path.join(audioDir, audioFileName);
    
    console.error(`[GENERATE-AUDIO] Calling ElevenLabs API for: ${prompt}`);
    
    // Real ElevenLabs API call
    const response = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
      method: 'POST',
      headers: {
        'xi-api-key': config.elevenLabsApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: prompt,
        duration_seconds: duration || 5
      })
    });
    
    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
    }
    
    console.error(`[GENERATE-AUDIO] API call successful, downloading audio...`);
    
    // Download and save audio file
    const audioBuffer = await response.arrayBuffer();
    await fs.writeFile(audioPath, Buffer.from(audioBuffer));
    
    // Validate file was created successfully
    const fileExists = await fs.pathExists(audioPath);
    const fileStats = await fs.stat(audioPath);
    
    if (!fileExists || fileStats.size === 0) {
      throw new Error('Audio file creation failed - file empty or not created');
    }
    
    console.error(`[GENERATE-AUDIO] Audio file created: ${audioPath} (${fileStats.size} bytes)`);
    
    return {
      content: [{
        type: 'text',
        text: `✅ Audio generated successfully for "${projectName}"!\n\n` +
              `📄 Details:\n` +
              `Prompt: ${prompt}\n` +
              `Type: ${type}\n` +
              `Duration: ${duration || 5} seconds\n` +
              `File size: ${Math.round(fileStats.size / 1024)}KB\n\n` +
              `🎵 Audio saved to: public/audio/${audioFileName}\n` +
              `📝 Use in VideoComposition:\n` +
              `import { staticFile } from 'remotion';\n` +
              `<Audio src={staticFile('audio/${audioFileName}')} />\n\n` +
              `🔄 Refresh Remotion Studio to see the audio in your timeline!`
      }]
    };
  } catch (error) {
    throw new Error(`Audio generation failed: ${error instanceof Error ? error.message : 'unknown error'}`);
  }
}

async function debugAudioConfig() {
  const config = getAudioConfig();
  
  return {
    content: [{
      type: 'text',
      text: `Audio Configuration Debug:\n` +
            `AUDIO_ENABLED: ${process.env.AUDIO_ENABLED}\n` +
            `ELEVENLABS_API_KEY: ${process.env.ELEVENLABS_API_KEY ? '[SET]' : '[NOT SET]'}\n` +
            `MUBERT_API_KEY: ${process.env.MUBERT_API_KEY ? '[SET]' : '[NOT SET]'}\n\n` +
            `Parsed Config:\n` +
            `enabled: ${config.enabled}\n` +
            `elevenLabsApiKey: ${config.elevenLabsApiKey ? '[SET]' : '[NOT SET]'}\n` +
            `mubertApiKey: ${config.mubertApiKey ? '[SET]' : '[NOT SET]'}`
    }]
  };
}

// ====== BACKUP MANAGEMENT TOOLS ======

async function listBackups(name: string) {
  const result = await listProjectBackups(name);
  
  if (!result.success) {
    throw new Error(result.message);
  }
  
  if (result.backups.length === 0) {
    return {
      content: [{
        type: 'text',
        text: `No backups found for project "${name}"`
      }]
    };
  }
  
  const backupList = result.backups.map((backup, index) => {
    const timestamp = backup.replace('VideoComposition-backup-', '').replace('.tsx', '');
    const dateStr = timestamp.replace(/-/g, ':').replace('T', ' ');
    return `${index + 1}. ${backup} (${dateStr})`;
  }).join('\n');
  
  return {
    content: [{
      type: 'text',
      text: `Found ${result.backups.length} backup(s) for "${name}":\n\n${backupList}`
    }]
  };
}

async function restoreBackup(name: string, backupFilename: string) {
  const result = await restoreProjectBackup(name, backupFilename);
  
  if (!result.success) {
    throw new Error(result.message);
  }
  
  return {
    content: [{
      type: 'text',
      text: result.message + ' Refresh browser to see restored animation.'
    }]
  };
}

async function cleanBackups(name: string, keepCount?: number) {
  const result = await cleanOldBackups(name, keepCount || 5);
  
  if (!result.success) {
    throw new Error(result.message);
  }
  
  return {
    content: [{
      type: 'text',
      text: result.message
    }]
  };
}

// ====== NEW RESUMPTION TOOL IMPLEMENTATIONS (Safe - Isolated) ======

/**
 * List all operations that can be resumed
 * Safe: Read-only operation, no impact on existing functionality
 */
async function listInterruptedOperations() {
  try {
    const operations = checkpointManager.getDetailedOperations();
    
    if (operations.length === 0) {
      return {
        content: [{
          type: 'text',
          text: '✅ No interrupted operations found. All operations completed successfully.'
        }]
      };
    }

    const operationsList = operations.map(op => {
      const staleWarning = op.isStale ? ' ⚠️ (stale - may be outdated)' : '';
      return `• **${op.operationId}**\n  - Project: ${op.projectName}\n  - Stage: ${op.stage}\n  - Progress: ${op.progress}%\n  - Age: ${op.ageSeconds}s${staleWarning}`;
    }).join('\n\n');

    return {
      content: [{
        type: 'text',
        text: `📋 **Interrupted Operations (${operations.length})**\n\nThe following operations can be resumed:\n\n${operationsList}\n\n💡 Use \`resume_operation\` with the operation ID to continue from where it stopped.`
      }]
    };
    
  } catch (error) {
    console.error('[LIST-OPERATIONS] Error:', error);
    return {
      content: [{
        type: 'text',
        text: `❌ Failed to list operations: ${error instanceof Error ? error.message : 'Unknown error'}`
      }],
      isError: true
    };
  }
}

/**
 * Resume an interrupted operation
 * Safe: Uses existing checkpoint system, includes fallback protection
 */
async function resumeOperation(operationId: string) {
  try {
    console.error(`[RESUME-OPERATION] Starting resumption for: ${operationId}`);
    
    const checkpoint = checkpointManager.getCheckpoint(operationId);
    if (!checkpoint) {
      return {
        content: [{
          type: 'text',
          text: `❌ No checkpoint found for operation: ${operationId}\n\n💡 Use \`list_interrupted_operations\` to see available operations.`
        }],
        isError: true
      };
    }

    console.error(`[RESUME-OPERATION] Found checkpoint for ${checkpoint.projectName} at stage ${checkpoint.stage} (${checkpoint.progress}%)`);
    
    // Resume JSX processing from checkpoint
    const result = await jsxProcessor.processJSXWithResumption(
      checkpoint.data.originalJSX || '',
      checkpoint.projectName,
      operationId,
      checkpoint
    );

    // Write the completed JSX to the project
    const compositionPath = path.join(getProjectPath(checkpoint.projectName), 'src', 'VideoComposition.tsx');
    await fs.writeFile(compositionPath, result);

    console.error(`[RESUME-OPERATION] Successfully completed operation: ${operationId}`);
    
    return {
      content: [{
        type: 'text',
        text: `✅ **Operation Resumed Successfully!**\n\n**Project**: ${checkpoint.projectName}\n**Operation**: ${operationId}\n**Status**: Completed from ${checkpoint.stage} stage\n\n🎬 VideoComposition.tsx has been updated with the processed JSX.`
      }]
    };

  } catch (error) {
    console.error('[RESUME-OPERATION] Error:', error);
    
    // Check if it's a resumable timeout error
    const isTimeoutError = error instanceof Error && error.message.includes('RESUMABLE_TIMEOUT');
    
    if (isTimeoutError) {
      return {
        content: [{
          type: 'text',
          text: `⏳ **Operation Timed Out Again**\n\n${error.message}\n\n💡 You can try resuming again - progress has been saved.`
        }]
      };
    }
    
    return {
      content: [{
        type: 'text',
        text: `❌ **Resume Failed**: ${error instanceof Error ? error.message : 'Unknown error'}\n\n💡 The checkpoint is preserved. You can try resuming again or use \`cancel_operation\` to clean up.`
      }],
      isError: true
    };
  }
}

/**
 * Cancel an operation and clean up its checkpoint
 * Safe: Clean-up operation, no impact on existing functionality
 */
async function cancelOperation(operationId: string) {
  try {
    const checkpoint = checkpointManager.getCheckpoint(operationId);
    
    if (!checkpoint) {
      return {
        content: [{
          type: 'text',
          text: `ℹ️ No checkpoint found for operation: ${operationId}\n\nOperation may have already completed or been cancelled.`
        }]
      };
    }

    checkpointManager.removeCheckpoint(operationId);
    
    return {
      content: [{
        type: 'text',
        text: `🗑️ **Operation Cancelled**\n\n**Operation**: ${operationId}\n**Project**: ${checkpoint.projectName}\n**Stage**: ${checkpoint.stage} (${checkpoint.progress}%)\n\nCheckpoint has been cleaned up.`
      }]
    };

  } catch (error) {
    console.error('[CANCEL-OPERATION] Error:', error);
    return {
      content: [{
        type: 'text',
        text: `❌ Failed to cancel operation: ${error instanceof Error ? error.message : 'Unknown error'}`
      }],
      isError: true
    };
  }
}

/**
 * Clean up stale operations
 * Safe: Maintenance operation, no impact on existing functionality
 */
async function cleanupStaleOperations(maxAgeHours?: number) {
  try {
    const cleaned = checkpointManager.cleanStaleOperations(maxAgeHours || 24);
    
    if (cleaned === 0) {
      return {
        content: [{
          type: 'text',
          text: `✅ **No Cleanup Needed**\n\nAll checkpoints are recent (less than ${maxAgeHours || 24} hours old).`
        }]
      };
    }

    return {
      content: [{
        type: 'text',
        text: `🧹 **Cleanup Completed**\n\nRemoved ${cleaned} stale operation(s) older than ${maxAgeHours || 24} hours.`
      }]
    };

  } catch (error) {
    console.error('[CLEANUP-OPERATIONS] Error:', error);
    return {
      content: [{
        type: 'text',
        text: `❌ Failed to cleanup operations: ${error instanceof Error ? error.message : 'Unknown error'}`
      }],
      isError: true
    };
  }
}