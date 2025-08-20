// Remotion Studio integration tools for MCP
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { MCPConfig } from '../types/index.js';
import { ChildProcess } from 'child_process';
import spawn from 'cross-spawn';
import { getLogger } from '../utils/logger.js';
import { safeSpawn, isRemotionAvailable, commandExists, getInstallInstructions } from '../utils/safe-spawn.js';
import path from 'path';
import fs from 'fs-extra';
import open from 'open';

let studioProcess: ChildProcess | null = null;
let studioPort = 7400;
let lastCreatedProjectPath: string | null = null;

// Port validation for 7400-7500 range
function validatePort(port: number): void {
  if (port < 7400 || port > 7500) {
    throw new Error(`Port ${port} is outside the allowed range (7400-7500)`);
  }
}

// Project tracking functions
export function setLastCreatedProject(projectPath: string): void {
  lastCreatedProjectPath = projectPath;
}

export function createStudioTools(config: MCPConfig): Tool[] {
  return [
    {
      name: 'launch-remotion-studio',
      description: 'Launch Remotion Studio dashboard for visual video editing',
      inputSchema: {
        type: 'object',
        properties: {
          port: {
            type: 'number',
            description: 'Port to run Remotion Studio on (7400-7500 range)',
            minimum: 7400,
            maximum: 7500,
            default: 7400,
          },
          openBrowser: {
            type: 'boolean',
            description: 'Automatically open browser',
            default: true,
          },
          projectPath: {
            type: 'string',
            description: 'Path to Remotion project (optional, uses current if not specified)',
          },
        },
      },
    },

    {
      name: 'stop-remotion-studio',
      description: 'Stop the running Remotion Studio instance',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },

    {
      name: 'open-video-in-studio',
      description: 'Open a video file in Remotion Studio for editing',
      inputSchema: {
        type: 'object',
        properties: {
          videoPath: {
            type: 'string',
            description: 'Path to the video file to open',
          },
          launchStudio: {
            type: 'boolean',
            description: 'Launch Studio if not already running',
            default: true,
          },
        },
        required: ['videoPath'],
      },
    },

    {
      name: 'create-remotion-project',
      description: 'Create a new Remotion project from template',
      inputSchema: {
        type: 'object',
        properties: {
          projectName: {
            type: 'string',
            description: 'Name for the new Remotion project',
            pattern: '^[a-zA-Z0-9-_]+$',
          },
          template: {
            type: 'string',
            description: 'Template to use',
            enum: ['hello-world', 'blank', 'three', 'still', 'tts'],
            default: 'hello-world',
          },
          openInStudio: {
            type: 'boolean',
            description: 'Open in Studio after creation',
            default: true,
          },
        },
        required: ['projectName'],
      },
    },

    {
      name: 'get-studio-status',
      description: 'Check if Remotion Studio is running and get its status',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },

    {
      name: 'launch-studio-with-project',
      description: 'Launch Remotion Studio with a specific project directory',
      inputSchema: {
        type: 'object',
        properties: {
          projectPath: {
            type: 'string',
            description: 'Path to the Remotion project directory',
          },
          port: {
            type: 'number',
            description: 'Port to run Remotion Studio on (7400-7500 range)',
            minimum: 7400,
            maximum: 7500,
            default: 7400,
          },
          openBrowser: {
            type: 'boolean',
            description: 'Automatically open browser',
            default: true,
          },
        },
        required: ['projectPath'],
      },
    },

    {
      name: 'open-in-browser',
      description: 'Open a video file in the default browser for viewing',
      inputSchema: {
        type: 'object',
        properties: {
          filePath: {
            type: 'string',
            description: 'Path to the file to open',
          },
        },
        required: ['filePath'],
      },
    },
  ];
}

export function createStudioHandlers(config: MCPConfig) {
  const logger = getLogger().service('StudioHandlers');

  const handlers: any = {
    'launch-remotion-studio': async (args: any) => {
      logger.info('Launching Remotion Studio', { port: args.port || 7400 });

      try {
        // Check if Studio is already running
        if (studioProcess && !studioProcess.killed) {
          return {
            success: true,
            message: 'Remotion Studio is already running',
            url: `http://localhost:${studioPort}`,
            status: 'already-running',
          };
        }

        // First check if Remotion is available
        logger.info('Checking Remotion availability');
        const remotionAvailable = await isRemotionAvailable();
        
        if (!remotionAvailable) {
          logger.warn('Remotion is not available');
          const instructions = getInstallInstructions('remotion');
          
          return {
            success: false,
            error: 'Remotion is not installed or not available',
            instructions,
            status: 'missing-dependency',
            nextSteps: [
              'Install Remotion using one of the methods above',
              'Then try launching the studio again'
            ]
          };
        }

        const port = args.port || 7400;
        validatePort(port);
        
        // Use the last created project if available, otherwise fallback to dedicated studio project
        const projectPath = args.projectPath || lastCreatedProjectPath || path.join(process.cwd(), 'assets', 'studio-project');

        // Check if project has Remotion setup
        const packageJsonPath = path.join(projectPath, 'package.json');
        const hasPackageJson = await fs.pathExists(packageJsonPath);

        if (!hasPackageJson) {
          // Try to create the studio project if it doesn't exist
          logger.info('Studio project not found, attempting to create it');
          
          // Check if we're using the default studio project path
          if (projectPath.includes('assets/studio-project')) {
            return {
              success: false,
              error: 'Studio project not set up',
              status: 'setup-required',
              instructions: [
                'The Remotion Studio project needs to be set up first.',
                'Run the following command to set up the studio:',
                '',
                '  npm run setup',
                '',
                'This will install all necessary dependencies for Remotion Studio.',
                'After setup, try launching the studio again.'
              ]
            };
          } else {
            // Custom project path - try to create basic structure
            logger.info('Creating basic Remotion project structure');
            await createBasicRemotionProject(projectPath);
          }
        }

        // Launch Remotion Studio using safe spawn
        const studioArgs = ['remotion', 'studio', '--port', port.toString(), '--no-open'];
        
        logger.info('Launching Remotion Studio with safe spawn', { 
          projectPath, 
          port,
          note: 'This may take 30-60 seconds on first launch' 
        });
        
        const spawnResult = await safeSpawn('npx', studioArgs, {
          cwd: projectPath,
          stdio: ['ignore', 'pipe', 'pipe'],
          detached: false,
          timeout: 90000 // 90 second timeout for studio to start (includes bundling + Chrome download)
        });

        if (!spawnResult.success) {
          logger.error('Failed to spawn Remotion Studio', { error: spawnResult.error });
          
          const isTimeout = spawnResult.error?.includes('timeout');
          
          return {
            success: false,
            error: spawnResult.error || 'Failed to launch Remotion Studio',
            status: isTimeout ? 'launch-timeout' : 'launch-failed',
            troubleshooting: isTimeout ? [
              'Studio launch timed out - this is common on first run',
              'Remotion may be downloading Chrome Headless Shell (~100MB)',
              'Or bundling code which can take 30-60 seconds',
              '',
              'Try these solutions:',
              '1. Wait a moment and try again (Chrome may have finished downloading)',
              '2. Pre-warm the studio: cd assets/studio-project && npm start',
              '3. Check if studio is actually running: http://localhost:' + port,
              '4. Increase timeout in future versions'
            ] : [
              'Ensure Remotion dependencies are installed in assets/studio-project',
              'Check that port ' + port + ' is not in use',
              'Verify project structure: ls -la assets/studio-project',
              'Try manual launch: cd assets/studio-project && npx remotion studio',
              'Check for error messages in the logs above'
            ]
          };
        }

        // Store the process reference if available
        if (spawnResult.process) {
          studioProcess = spawnResult.process;
          studioPort = port;

          // Handle process output
          if (studioProcess && studioProcess.stdout) {
            studioProcess.stdout.on('data', (data: Buffer) => {
              logger.debug('Studio output:', data.toString());
            });
          }

          if (studioProcess && studioProcess.stderr) {
            studioProcess.stderr.on('data', (data: Buffer) => {
              logger.warn('Studio error:', data.toString());
            });
          }

          if (studioProcess) {
            studioProcess.on('exit', (code) => {
              logger.info('Studio process exited', { code });
              studioProcess = null;
            });
          }
        }

        const studioUrl = `http://localhost:${port}`;

        // Open browser if requested (with error handling)
        if (args.openBrowser) {
          try {
            await open(studioUrl);
            logger.info('Browser opened for Studio');
          } catch (openError) {
            logger.warn('Failed to open browser', { 
              error: openError instanceof Error ? openError.message : String(openError) 
            });
            // Don't fail the whole operation if browser opening fails
          }
        }

        return {
          success: true,
          message: 'Remotion Studio launched successfully',
          url: studioUrl,
          port,
          pid: spawnResult.pid,
          status: 'running',
          instructions: [
            `Studio is running at ${studioUrl}`,
            'Use stop-remotion-studio to stop it',
            'Videos will be editable in the Studio interface',
          ],
        };

      } catch (error) {
        logger.error('Unexpected error in launch-remotion-studio', { 
          error: error instanceof Error ? error.message : String(error) 
        });
        
        // Return error response instead of throwing to prevent server crash
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          status: 'error',
          instructions: [
            'An unexpected error occurred while launching Remotion Studio',
            'Check the server logs for more details',
            'Try restarting the MCP server if the problem persists'
          ]
        };
      }
    },

    'stop-remotion-studio': async () => {
      logger.info('Stopping Remotion Studio');

      if (!studioProcess || studioProcess.killed) {
        return {
          success: true,
          message: 'Remotion Studio is not running',
          status: 'not-running',
        };
      }

      try {
        studioProcess.kill();
        studioProcess = null;

        return {
          success: true,
          message: 'Remotion Studio stopped successfully',
          status: 'stopped',
        };

      } catch (error) {
        logger.error('Failed to stop Remotion Studio', { 
          error: error instanceof Error ? error.message : String(error) 
        });
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to stop studio',
          status: 'error'
        };
      }
    },

    'open-video-in-studio': async (args: any) => {
      logger.info('Opening video in Remotion Studio', { videoPath: args.videoPath });

      try {
        // Check if file exists
        const fileExists = await fs.pathExists(args.videoPath);
        if (!fileExists) {
          return {
            success: false,
            error: `Video file not found: ${args.videoPath}`,
            status: 'file-not-found'
          };
        }

        // Launch Studio if needed
        if (args.launchStudio && (!studioProcess || studioProcess.killed)) {
          await handlers['launch-remotion-studio']({
            openBrowser: false,
          });
        }

        // Copy video to Studio project assets
        const projectPath = process.cwd();
        const assetsPath = path.join(projectPath, 'public');
        await fs.ensureDir(assetsPath);

        const videoFileName = path.basename(args.videoPath);
        const targetPath = path.join(assetsPath, videoFileName);
        await fs.copy(args.videoPath, targetPath);

        // Open Studio in browser with the video
        const studioUrl = `http://localhost:${studioPort}`;
        await open(studioUrl);

        return {
          success: true,
          message: 'Video opened in Remotion Studio',
          videoPath: targetPath,
          studioUrl,
          instructions: [
            `Video copied to: ${targetPath}`,
            'You can now edit it in Remotion Studio',
            'Use the Studio interface to add effects, transitions, etc.',
          ],
        };

      } catch (error) {
        logger.error('Failed to open video in Studio', { 
          error: error instanceof Error ? error.message : String(error) 
        });
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to open video in studio',
          status: 'error'
        };
      }
    },

    'create-remotion-project': async (args: any) => {
      logger.info('Creating Remotion project', { 
        projectName: args.projectName,
        template: args.template 
      });

      try {
        const projectPath = path.join(process.cwd(), args.projectName);
        
        // Check if project already exists
        if (await fs.pathExists(projectPath)) {
          return {
            success: false,
            error: `Project ${args.projectName} already exists`,
            status: 'project-exists',
            suggestions: [
              'Choose a different project name',
              'Delete the existing project first',
              'Use a different directory'
            ]
          };
        }

        // Check if create-video command is available
        const hasCreateVideo = await commandExists('npx');
        if (!hasCreateVideo) {
          return {
            success: false,
            error: 'npx is not available',
            instructions: getInstallInstructions('npx'),
            status: 'missing-dependency'
          };
        }

        // Create project using Remotion CLI with safe spawn
        const createResult = await safeSpawn('npx', [
          'create-video',
          '--template',
          args.template || 'hello-world',
          args.projectName,
        ], {
          stdio: 'pipe',
          timeout: 60000 // 60 second timeout for project creation
        });

        if (!createResult.success) {
          logger.error('Failed to create Remotion project', { error: createResult.error });
          return {
            success: false,
            error: createResult.error || 'Failed to create project',
            status: 'creation-failed',
            troubleshooting: [
              'Ensure you have npm/npx installed',
              'Check internet connection (templates are downloaded)',
              'Try running the command manually: npx create-video --template ' + (args.template || 'hello-world') + ' ' + args.projectName
            ]
          };
        }

        // Install dependencies
        logger.info('Installing project dependencies');
        const installResult = await safeSpawn('npm', ['install'], {
          cwd: projectPath,
          stdio: 'pipe',
          timeout: 120000 // 2 minute timeout for npm install
        });

        if (!installResult.success) {
          logger.warn('Failed to install dependencies', { error: installResult.error });
          // Don't fail the whole operation, just warn
          logger.info('Project created but dependencies not installed');
        }

        // Open in Studio if requested
        let studioUrl = null;
        if (args.openInStudio) {
          const studioResult = await handlers['launch-remotion-studio']({
            projectPath,
            openBrowser: true,
          });
          studioUrl = studioResult.url;
        }

        return {
          success: true,
          message: `Remotion project '${args.projectName}' created successfully`,
          projectPath,
          template: args.template || 'hello-world',
          studioUrl,
          nextSteps: [
            `cd ${args.projectName}`,
            'npm start (to launch Studio)',
            'npm run build (to render video)',
          ],
        };

      } catch (error) {
        logger.error('Failed to create Remotion project', { 
          error: error instanceof Error ? error.message : String(error) 
        });
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create project',
          status: 'error'
        };
      }
    },

    'get-studio-status': async () => {
      logger.info('Getting Remotion Studio status');

      const isRunning = studioProcess && !studioProcess.killed;

      return {
        success: true,
        running: isRunning,
        port: isRunning ? studioPort : null,
        url: isRunning ? `http://localhost:${studioPort}` : null,
        pid: isRunning ? studioProcess?.pid : null,
        status: isRunning ? 'running' : 'stopped',
      };
    },

    'launch-studio-with-project': async (args: any) => {
      logger.info('Launching Remotion Studio with project', { 
        projectPath: args.projectPath,
        port: args.port || 7400 
      });

      try {
        // Check if Studio is already running
        if (studioProcess && !studioProcess.killed) {
          logger.info('Stopping existing Studio instance');
          studioProcess.kill();
          studioProcess = null;
          // Wait a moment for cleanup
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // Verify project path exists
        if (!await fs.pathExists(args.projectPath)) {
          return {
            success: false,
            error: `Project path does not exist: ${args.projectPath}`,
            status: 'path-not-found',
            suggestions: [
              'Check the project path is correct',
              'Create the project first using create-remotion-project',
              'Ensure the path is accessible'
            ]
          };
        }

        // Check if it has a package.json
        const packageJsonPath = path.join(args.projectPath, 'package.json');
        if (!await fs.pathExists(packageJsonPath)) {
          return {
            success: false,
            error: `No package.json found in project: ${args.projectPath}`,
            status: 'not-a-project',
            suggestions: [
              'This doesn\'t appear to be a Node.js/Remotion project',
              'Create a new project using create-remotion-project',
              'Ensure you\'re pointing to the correct directory'
            ]
          };
        }

        // Install dependencies if node_modules doesn't exist
        const nodeModulesPath = path.join(args.projectPath, 'node_modules');
        if (!await fs.pathExists(nodeModulesPath)) {
          logger.info('Installing project dependencies');
          const installResult = await safeSpawn('npm', ['install'], {
            cwd: args.projectPath,
            stdio: 'pipe',
            timeout: 120000 // 2 minute timeout
          });

          if (!installResult.success) {
            logger.warn('Failed to install dependencies', { error: installResult.error });
            // Continue anyway - maybe dependencies are already there
          }
        }

        const port = args.port || 7400;
        validatePort(port);

        // Check if Remotion is available before launching
        const remotionAvailable = await isRemotionAvailable();
        if (!remotionAvailable) {
          return {
            success: false,
            error: 'Remotion is not installed',
            instructions: getInstallInstructions('remotion'),
            status: 'missing-dependency'
          };
        }

        // Launch Remotion Studio with safe spawn
        const studioResult = await safeSpawn('npx', ['remotion', 'studio', '--port', port.toString(), '--no-open'], {
          cwd: args.projectPath,
          stdio: ['ignore', 'pipe', 'pipe'],
          detached: false,
          timeout: 30000
        });

        if (!studioResult.success) {
          return {
            success: false,
            error: studioResult.error || 'Failed to launch Remotion Studio',
            status: 'launch-failed',
            projectPath: args.projectPath
          };
        }

        studioPort = port;

        // Handle process output if available
        if (studioResult.process) {
          studioProcess = studioResult.process;
          
          if (studioProcess && studioProcess.stdout) {
            studioProcess.stdout.on('data', (data: Buffer) => {
              logger.debug('Studio output:', data.toString());
            });
          }

          if (studioProcess && studioProcess.stderr) {
            studioProcess.stderr.on('data', (data: Buffer) => {
              logger.warn('Studio error:', data.toString());
            });
          }

          if (studioProcess) {
            studioProcess.on('exit', (code) => {
              logger.info('Studio process exited', { code });
              studioProcess = null;
            });
          }
        }

        const studioUrl = `http://localhost:${port}`;

        // Open browser if requested
        if (args.openBrowser) {
          await open(studioUrl);
        }

        return {
          success: true,
          message: 'Remotion Studio launched with project',
          url: studioUrl,
          port,
          projectPath: args.projectPath,
          pid: studioProcess?.pid,
          instructions: [
            `Studio is running at ${studioUrl}`,
            `Project loaded from: ${args.projectPath}`,
            'You can now view and edit the animation in Studio',
            'Use stop-remotion-studio to stop it',
          ],
        };

      } catch (error) {
        logger.error('Failed to launch Studio with project', { 
          error: error instanceof Error ? error.message : String(error) 
        });
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to launch studio',
          status: 'error'
        };
      }
    },

    'open-in-browser': async (args: any) => {
      logger.info('Opening file in browser', { filePath: args.filePath });

      try {
        const fileExists = await fs.pathExists(args.filePath);
        if (!fileExists) {
          throw new Error(`File not found: ${args.filePath}`);
        }

        await open(args.filePath);

        return {
          success: true,
          message: 'File opened in default browser',
          filePath: args.filePath,
        };

      } catch (error) {
        logger.error('Failed to open file in browser', { 
          error: error instanceof Error ? error.message : String(error) 
        });
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to open file',
          status: 'error'
        };
      }
    },
  };

  // Return all handlers
  return handlers;
}

// Helper function to create basic Remotion project structure
async function createBasicRemotionProject(projectPath: string) {
  const logger = getLogger().service('StudioSetup');
  
  // Create package.json
  const packageJson = {
    name: 'remotion-studio-project',
    version: '1.0.0',
    scripts: {
      start: 'remotion studio',
      build: 'remotion render',
    },
    dependencies: {
      '@remotion/cli': '^4.0.0',
      'remotion': '^4.0.0',
      'react': '^18.0.0',
      'react-dom': '^18.0.0',
    },
  };

  await fs.writeJson(path.join(projectPath, 'package.json'), packageJson, { spaces: 2 });

  // Create basic src structure
  const srcPath = path.join(projectPath, 'src');
  await fs.ensureDir(srcPath);

  // Create index.tsx
  const indexContent = `
import { registerRoot } from 'remotion';
import { RemotionVideo } from './Video';

registerRoot(RemotionVideo);
`;

  await fs.writeFile(path.join(srcPath, 'index.tsx'), indexContent);

  // Create Video.tsx
  const videoContent = `
import { Composition } from 'remotion';
import { MyComposition } from './Composition';

export const RemotionVideo = () => {
  return (
    <>
      <Composition
        id="MyComp"
        component={MyComposition}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
`;

  await fs.writeFile(path.join(srcPath, 'Video.tsx'), videoContent);

  // Create Composition.tsx
  const compositionContent = `
import { AbsoluteFill } from 'remotion';

export const MyComposition = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: 'white' }}>
      <h1>Welcome to Remotion Studio!</h1>
    </AbsoluteFill>
  );
};
`;

  await fs.writeFile(path.join(srcPath, 'Composition.tsx'), compositionContent);

  // Create public directory for assets
  await fs.ensureDir(path.join(projectPath, 'public'));

  logger.info('Basic Remotion project structure created');
}