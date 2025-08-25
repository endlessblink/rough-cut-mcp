import { getLogger } from '../utils/logger.js';
import { safeSpawn, isRemotionAvailable, commandExists, getInstallInstructions } from '../utils/safe-spawn.js';
import path from 'path';
import fs from 'fs-extra';
import open from 'open';
let studioProcess = null;
let studioPort = 7400;
let lastCreatedProjectPath = null;
// Port validation for 7400-7600 range (expanded for more concurrent studios)
function validatePort(port) {
    if (port < 7400 || port > 7600) {
        throw new Error(`Port ${port} is outside the allowed range (7400-7600)`);
    }
}
// Project tracking functions
export function setLastCreatedProject(projectPath) {
    lastCreatedProjectPath = projectPath;
}
export function createStudioTools(config) {
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
        {
            name: 'kill-studio-on-port',
            description: 'Kill any Remotion Studio running on a specific port',
            inputSchema: {
                type: 'object',
                properties: {
                    port: {
                        type: 'number',
                        description: 'Port number to kill studio on',
                        minimum: 7400,
                        maximum: 7600,
                    },
                },
                required: ['port'],
            },
        },
        {
            name: 'get-active-studios',
            description: 'Get list of all currently running Remotion Studio instances with their ports and project paths',
            inputSchema: {
                type: 'object',
                properties: {},
            },
        },
        {
            name: 'kill-all-studios',
            description: 'Kill all running Remotion Studio instances',
            inputSchema: {
                type: 'object',
                properties: {
                    force: {
                        type: 'boolean',
                        description: 'Force kill without graceful shutdown',
                        default: false,
                    },
                },
            },
        },
        {
            name: 'find-available-port',
            description: 'Find an available port in the Remotion Studio range (7400-7600)',
            inputSchema: {
                type: 'object',
                properties: {
                    startPort: {
                        type: 'number',
                        description: 'Starting port to search from',
                        minimum: 7400,
                        maximum: 7600,
                        default: 7400,
                    },
                },
            },
        },
        {
            name: 'check-version-conflicts',
            description: 'Check for Remotion version conflicts between project and global installations (diagnostic only)',
            inputSchema: {
                type: 'object',
                properties: {
                    projectPath: {
                        type: 'string',
                        description: 'Path to project to check (optional, uses current working directory if not provided)',
                    },
                },
            },
        },
        {
            name: 'restart-studio-on-port',
            description: 'Manual tool to restart Remotion Studio on a specific port after a crash',
            inputSchema: {
                type: 'object',
                properties: {
                    port: {
                        type: 'number',
                        description: 'Port to restart studio on',
                        minimum: 7400,
                        maximum: 7600,
                    },
                    projectPath: {
                        type: 'string',
                        description: 'Path to project to launch',
                    },
                    clearCache: {
                        type: 'boolean',
                        description: 'Clear cache before restarting',
                        default: true,
                    },
                },
                required: ['port', 'projectPath'],
            },
        },
        {
            name: 'clear-project-cache',
            description: 'Enhanced cache clearing with granular control over what to clear',
            inputSchema: {
                type: 'object',
                properties: {
                    projectPath: {
                        type: 'string',
                        description: 'Path to project to clear cache for',
                    },
                    clearTypes: {
                        type: 'array',
                        description: 'Types of cache to clear',
                        items: {
                            type: 'string',
                            enum: ['remotion', 'webpack', 'node_modules', 'build', 'all'],
                        },
                        default: ['remotion', 'webpack'],
                    },
                    force: {
                        type: 'boolean',
                        description: 'Force clear even if studio is running',
                        default: false,
                    },
                },
                required: ['projectPath'],
            },
        },
        {
            name: 'diagnose-studio-health',
            description: 'Comprehensive health check for project and studio setup (diagnostic only)',
            inputSchema: {
                type: 'object',
                properties: {
                    projectPath: {
                        type: 'string',
                        description: 'Path to project to diagnose',
                    },
                    port: {
                        type: 'number',
                        description: 'Port to check studio health on (optional)',
                        minimum: 7400,
                        maximum: 7600,
                    },
                },
                required: ['projectPath'],
            },
        },
    ];
}
export function createStudioHandlers(config) {
    const logger = getLogger().service('StudioHandlers');
    const handlers = {
        'launch-remotion-studio': async (args) => {
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
                let projectPath = args.projectPath || lastCreatedProjectPath || path.join(process.cwd(), 'assets', 'studio-project');
                // Ensure we have a valid Windows path
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
                    }
                    else {
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
                        studioProcess.stdout.on('data', (data) => {
                            logger.debug('Studio output:', data.toString());
                        });
                    }
                    if (studioProcess && studioProcess.stderr) {
                        studioProcess.stderr.on('data', (data) => {
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
                // Open browser if requested (with Windows-native support)
                if (args.openBrowser) {
                    try {
                        let browserOpened = false;
                        // Try Windows-native method first (most reliable for Claude Desktop)
                        if (process.platform === 'win32') {
                            try {
                                const { spawn } = await import('child_process');
                                spawn('cmd.exe', ['/c', 'start', studioUrl], {
                                    detached: true,
                                    stdio: 'ignore'
                                });
                                browserOpened = true;
                                logger.info('Browser opened using Windows cmd.exe start command');
                            }
                            catch (cmdError) {
                                logger.warn('Windows cmd.exe start failed, trying PowerShell', {
                                    error: cmdError instanceof Error ? cmdError.message : String(cmdError)
                                });
                                // Try PowerShell as backup
                                try {
                                    const { spawn } = await import('child_process');
                                    spawn('powershell.exe', ['-Command', `Start-Process "${studioUrl}"`], {
                                        detached: true,
                                        stdio: 'ignore'
                                    });
                                    browserOpened = true;
                                    logger.info('Browser opened using PowerShell Start-Process');
                                }
                                catch (psError) {
                                    logger.warn('PowerShell Start-Process also failed', {
                                        error: psError instanceof Error ? psError.message : String(psError)
                                    });
                                }
                            }
                        }
                        // Fallback to open package if Windows methods failed or not on Windows
                        if (!browserOpened) {
                            await open(studioUrl);
                            browserOpened = true;
                            logger.info('Browser opened using open package (fallback)');
                        }
                    }
                    catch (openError) {
                        logger.warn('All browser opening methods failed', {
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
            }
            catch (error) {
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
            }
            catch (error) {
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
        'open-video-in-studio': async (args) => {
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
            }
            catch (error) {
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
        'create-remotion-project': async (args) => {
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
            }
            catch (error) {
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
        'launch-studio-with-project': async (args) => {
            // Use project path directly - Windows only
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
                // Check for missing critical files and repair if needed
                const requiredFiles = [
                    { path: 'remotion.config.ts', critical: true },
                    { path: 'tsconfig.json', critical: true },
                    { path: 'package.json', critical: true }
                ];
                const missingFiles = [];
                for (const file of requiredFiles) {
                    const filePath = path.join(args.projectPath, file.path);
                    if (!await fs.pathExists(filePath)) {
                        missingFiles.push(file.path);
                        logger.warn(`Missing required file: ${file.path}`);
                    }
                }
                // Auto-repair project if critical files are missing
                if (missingFiles.length > 0) {
                    logger.info('Project missing critical files, attempting auto-repair', { missingFiles });
                    const { generateCompletePackageJson, generateRemotionConfig, generateTsConfig } = await import('../templates/simple-compositions.js');
                    // Add missing remotion.config.ts
                    if (missingFiles.includes('remotion.config.ts')) {
                        const configPath = path.join(args.projectPath, 'remotion.config.ts');
                        await fs.writeFile(configPath, generateRemotionConfig());
                        logger.info('Created missing remotion.config.ts');
                    }
                    // Add missing tsconfig.json
                    if (missingFiles.includes('tsconfig.json')) {
                        const tsconfigPath = path.join(args.projectPath, 'tsconfig.json');
                        await fs.writeFile(tsconfigPath, generateTsConfig());
                        logger.info('Created missing tsconfig.json');
                    }
                    // Update package.json if missing or incomplete
                    if (missingFiles.includes('package.json')) {
                        const packageJsonPath = path.join(args.projectPath, 'package.json');
                        await fs.writeFile(packageJsonPath, generateCompletePackageJson());
                        logger.info('Created missing package.json');
                    }
                }
                // Install dependencies if node_modules doesn't exist
                const nodeModulesPath = path.join(args.projectPath, 'node_modules');
                if (!await fs.pathExists(nodeModulesPath)) {
                    logger.info('Installing missing project dependencies');
                    const { safeNpmInstall } = await import('../utils/safe-spawn.js');
                    const installResult = await safeNpmInstall(args.projectPath);
                    if (!installResult.success) {
                        logger.warn('Failed to install dependencies', { error: installResult.error });
                        return {
                            success: false,
                            error: `Failed to install dependencies: ${installResult.error}`,
                            status: 'dependency-install-failed',
                            projectPath: args.projectPath,
                            suggestions: [
                                'Check internet connection',
                                'Verify npm is installed and working',
                                'Try running "npm install" manually in the project directory',
                                'Check for any npm registry issues'
                            ]
                        };
                    }
                    logger.info('Dependencies installed successfully');
                }
                // Also fix remotion.config.ts if it has cache disabled
                const configPath = path.join(args.projectPath, 'remotion.config.ts');
                if (await fs.pathExists(configPath)) {
                    let configContent = await fs.readFile(configPath, 'utf8');
                    if (configContent.includes('setCachingEnabled(false)')) {
                        configContent = configContent.replace('setCachingEnabled(false)', 'setCachingEnabled(true)');
                        configContent = configContent.replace('cache: false,', '');
                        await fs.writeFile(configPath, configContent);
                        logger.info('Fixed caching configuration in remotion.config.ts');
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
                        studioProcess.stdout.on('data', (data) => {
                            logger.debug('Studio output:', data.toString());
                        });
                    }
                    if (studioProcess && studioProcess.stderr) {
                        studioProcess.stderr.on('data', (data) => {
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
            }
            catch (error) {
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
        'open-in-browser': async (args) => {
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
            }
            catch (error) {
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
        'kill-studio-on-port': async (args) => {
            logger.info('Killing studio on port', { port: args.port });
            try {
                const { promisify } = await import('util');
                const execAsync = promisify(require('child_process').exec);
                // Windows command to find process on port
                const findCmd = `netstat -ano | findstr :${args.port}`;
                try {
                    const { stdout } = await execAsync(findCmd);
                    const lines = stdout.trim().split('\n');
                    const pids = new Set();
                    for (const line of lines) {
                        if (line.includes('LISTENING')) {
                            const parts = line.trim().split(/\s+/);
                            const pid = parts[parts.length - 1];
                            if (pid && pid !== '0') {
                                pids.add(pid);
                            }
                        }
                    }
                    if (pids.size === 0) {
                        return {
                            success: true,
                            message: `No process found listening on port ${args.port}`,
                            port: args.port,
                            killed: false,
                        };
                    }
                    // Kill all processes using this port
                    const killedPids = [];
                    for (const pid of pids) {
                        try {
                            await execAsync(`taskkill /PID ${pid} /F`);
                            killedPids.push(pid);
                            logger.info(`Killed process ${pid} on port ${args.port}`);
                        }
                        catch (error) {
                            logger.warn(`Failed to kill process ${pid}:`, error.message);
                        }
                    }
                    // Update global state if this was our tracked studio
                    if (studioPort === args.port && studioProcess) {
                        studioProcess = null;
                        logger.info('Cleared global studio process reference');
                    }
                    // Wait a moment for processes to terminate
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    return {
                        success: true,
                        message: `Killed ${killedPids.length} process(es) on port ${args.port}`,
                        port: args.port,
                        killed: true,
                        killedProcesses: killedPids,
                    };
                }
                catch (error) {
                    if (error.code === 1) {
                        // No processes found - this is success
                        return {
                            success: true,
                            message: `No process found listening on port ${args.port}`,
                            port: args.port,
                            killed: false,
                        };
                    }
                    throw error;
                }
            }
            catch (error) {
                logger.error('Error killing studio on port:', error);
                return {
                    success: false,
                    error: error.message,
                    port: args.port,
                };
            }
        },
        'get-active-studios': async () => {
            logger.info('Getting active Remotion Studios');
            try {
                const { promisify } = await import('util');
                const execAsync = promisify(require('child_process').exec);
                // Find all node processes that might be Remotion Studio
                const cmd = 'wmic process where "name=\'node.exe\'" get processid,commandline /format:csv';
                let studios = [];
                try {
                    const { stdout } = await execAsync(cmd);
                    const lines = stdout.trim().split('\n').slice(1); // Skip header
                    for (const line of lines) {
                        if (!line.trim())
                            continue;
                        const parts = line.split(',');
                        if (parts.length >= 2) {
                            const commandLine = parts[1] || '';
                            const processId = parts[2] || '';
                            // Look for Remotion Studio processes
                            if (commandLine.includes('remotion') && (commandLine.includes('studio') || commandLine.includes('preview'))) {
                                // Try to extract port from command line
                                const portMatch = commandLine.match(/--port[\s=](\d+)/);
                                const port = portMatch ? parseInt(portMatch[1]) : null;
                                // Try to extract project path from cwd or root options
                                const pathMatch = commandLine.match(/--root[\s=]"?([^"\s]+)"?/) ||
                                    commandLine.match(/--cwd[\s=]"?([^"\s]+)"?/);
                                const projectPath = pathMatch ? pathMatch[1] : null;
                                studios.push({
                                    pid: processId.trim(),
                                    port,
                                    projectPath,
                                    commandLine: commandLine.trim(),
                                    isTracked: studioProcess && studioProcess.pid?.toString() === processId.trim(),
                                });
                            }
                        }
                    }
                }
                catch (wmicError) {
                    logger.warn('WMIC failed, trying alternative method:', wmicError.message);
                    // Continue with netstat fallback below
                }
                // Also check netstat for listening ports in Remotion range
                const netstatCmd = 'netstat -ano | findstr LISTENING';
                const { stdout: netstatOutput } = await execAsync(netstatCmd);
                const netstatLines = netstatOutput.trim().split('\n');
                const listeningPorts = [];
                for (const line of netstatLines) {
                    const match = line.match(/:([7-8]\d{3})\s+\S+\s+LISTENING\s+(\d+)/);
                    if (match) {
                        const port = parseInt(match[1]);
                        const pid = match[2];
                        if (port >= 7400 && port <= 7600) {
                            listeningPorts.push({ port, pid });
                            // Add to studios list if not already found by WMIC
                            if (!studios.find(s => s.port === port)) {
                                studios.push({
                                    pid,
                                    port,
                                    projectPath: null,
                                    commandLine: 'Unknown (detected via netstat)',
                                    isTracked: studioProcess && studioProcess.pid?.toString() === pid,
                                });
                            }
                        }
                    }
                }
                return {
                    success: true,
                    studios,
                    listeningPorts: listeningPorts.map(p => p.port).sort(),
                    portProcesses: listeningPorts,
                    totalStudios: studios.length,
                    trackedStudio: {
                        running: studioProcess && !studioProcess.killed,
                        port: studioPort,
                        pid: studioProcess?.pid || null,
                    },
                    message: `Found ${studios.length} Remotion Studio process(es) and ${listeningPorts.length} listening port(s) in range 7400-7600`,
                };
            }
            catch (error) {
                logger.error('Error getting active studios:', error);
                return {
                    success: false,
                    error: error.message,
                    studios: [],
                    listeningPorts: [],
                };
            }
        },
        'kill-all-studios': async (args) => {
            logger.info('Killing all Remotion Studios', { force: args.force });
            try {
                // First get list of active studios
                const activeStudios = await handlers['get-active-studios']();
                if (!activeStudios.success) {
                    return {
                        success: false,
                        error: 'Failed to get list of active studios',
                    };
                }
                const killResults = [];
                // Kill each studio process
                for (const studio of activeStudios.studios || []) {
                    if (studio.pid) {
                        try {
                            const { promisify } = await import('util');
                            const execAsync = promisify(require('child_process').exec);
                            const cmd = args.force ? `taskkill /PID ${studio.pid} /F` : `taskkill /PID ${studio.pid}`;
                            await execAsync(cmd);
                            killResults.push({
                                pid: studio.pid,
                                port: studio.port,
                                success: true,
                                projectPath: studio.projectPath,
                            });
                            logger.info(`Killed Remotion Studio process ${studio.pid} on port ${studio.port}`);
                        }
                        catch (error) {
                            killResults.push({
                                pid: studio.pid,
                                port: studio.port,
                                success: false,
                                error: error.message,
                                projectPath: studio.projectPath,
                            });
                            logger.warn(`Failed to kill process ${studio.pid}:`, error.message);
                        }
                    }
                }
                // Clear global state
                if (studioProcess) {
                    studioProcess = null;
                    logger.info('Cleared global studio process reference');
                }
                // Wait for processes to terminate
                await new Promise(resolve => setTimeout(resolve, 2000));
                const successCount = killResults.filter(r => r.success).length;
                return {
                    success: true,
                    message: `Killed ${successCount}/${killResults.length} Remotion Studio instance(s)`,
                    killResults,
                    totalKilled: successCount,
                    totalAttempted: killResults.length,
                    clearedGlobalState: true,
                };
            }
            catch (error) {
                logger.error('Error killing all studios:', error);
                return {
                    success: false,
                    error: error.message,
                };
            }
        },
        'find-available-port': async (args) => {
            logger.info('Finding available port', { startPort: args.startPort || 7400 });
            try {
                const { promisify } = await import('util');
                const execAsync = promisify(require('child_process').exec);
                const net = await import('net');
                const startPort = args.startPort || 7400;
                const endPort = 7600;
                // Get currently used ports in range
                const netstatCmd = 'netstat -ano | findstr LISTENING';
                const { stdout } = await execAsync(netstatCmd);
                const lines = stdout.trim().split('\n');
                const usedPorts = new Set();
                for (const line of lines) {
                    const match = line.match(/:([7-8]\d{3})\s/);
                    if (match) {
                        const port = parseInt(match[1]);
                        if (port >= 7400 && port <= 7600) {
                            usedPorts.add(port);
                        }
                    }
                }
                // Find first available port
                for (let port = startPort; port <= endPort; port++) {
                    if (!usedPorts.has(port)) {
                        // Double-check by trying to bind to the port
                        try {
                            const server = net.createServer();
                            await new Promise((resolve, reject) => {
                                server.listen(port, '127.0.0.1', () => {
                                    server.close(() => resolve(undefined));
                                });
                                server.on('error', reject);
                            });
                            // Port is available
                            return {
                                success: true,
                                port,
                                message: `Found available port: ${port}`,
                                usedPorts: Array.from(usedPorts).sort(),
                                searchRange: { start: startPort, end: endPort },
                            };
                        }
                        catch (bindError) {
                            // Port actually in use, continue searching
                            usedPorts.add(port);
                            continue;
                        }
                    }
                }
                // No available port found
                return {
                    success: false,
                    error: `No available ports in range ${startPort}-${endPort}`,
                    usedPorts: Array.from(usedPorts).sort(),
                    searchRange: { start: startPort, end: endPort },
                    suggestions: [
                        'Kill some running Remotion Studio instances using kill-all-studios',
                        'Use get-active-studios to see which ports are in use',
                        'Try a different port range if needed',
                    ],
                };
            }
            catch (error) {
                logger.error('Error finding available port:', error);
                return {
                    success: false,
                    error: error.message,
                };
            }
        },
        'check-version-conflicts': async (args) => {
            logger.info('Checking for Remotion version conflicts');
            try {
                const projectPath = args.projectPath || process.cwd();
                const { promisify } = await import('util');
                const execAsync = promisify(require('child_process').exec);
                // Read local project package.json
                let localVersions = {};
                const packageJsonPath = path.join(projectPath, 'package.json');
                if (await fs.pathExists(packageJsonPath)) {
                    const packageJson = await fs.readJson(packageJsonPath);
                    localVersions = {
                        remotion: packageJson.dependencies?.remotion || packageJson.devDependencies?.remotion,
                        cli: packageJson.dependencies?.['@remotion/cli'] || packageJson.devDependencies?.['@remotion/cli'],
                        bundler: packageJson.dependencies?.['@remotion/bundler'] || packageJson.devDependencies?.['@remotion/bundler'],
                    };
                }
                // Check global versions
                let globalVersions = {};
                try {
                    const { stdout: remotionGlobal } = await execAsync('npm list -g @remotion/cli --depth=0 --json', { timeout: 5000 });
                    const globalData = JSON.parse(remotionGlobal);
                    globalVersions.cli = globalData.dependencies?.['@remotion/cli']?.version;
                }
                catch {
                    globalVersions.cli = null;
                }
                // Check if versions are consistent
                const conflicts = [];
                const warnings = [];
                if (localVersions.remotion && localVersions.cli) {
                    const remotionVer = localVersions.remotion.replace(/[^\d\.]/g, '');
                    const cliVer = localVersions.cli.replace(/[^\d\.]/g, '');
                    if (remotionVer !== cliVer) {
                        conflicts.push({
                            type: 'local-package-mismatch',
                            remotion: localVersions.remotion,
                            cli: localVersions.cli,
                            severity: 'high',
                        });
                        warnings.push(`Local remotion (${localVersions.remotion}) and @remotion/cli (${localVersions.cli}) versions don't match`);
                    }
                }
                if (globalVersions.cli && localVersions.cli) {
                    const globalVer = globalVersions.cli.replace(/[^\d\.]/g, '');
                    const localVer = localVersions.cli.replace(/[^\d\.]/g, '');
                    if (globalVer !== localVer) {
                        conflicts.push({
                            type: 'global-local-mismatch',
                            global: globalVersions.cli,
                            local: localVersions.cli,
                            severity: 'medium',
                        });
                        warnings.push(`Global @remotion/cli (${globalVersions.cli}) and local (${localVersions.cli}) versions don't match`);
                    }
                }
                const hasConflicts = conflicts.length > 0;
                return {
                    success: true,
                    hasConflicts,
                    conflicts,
                    localVersions,
                    globalVersions,
                    warnings,
                    projectPath,
                    recommendations: hasConflicts ? [
                        'Version mismatches can cause React context errors and Studio crashes',
                        'RECOMMENDED: Remove global Remotion to prevent conflicts: npm uninstall -g @remotion/cli',
                        'Always use npx remotion studio (uses project version)',
                        'Or update all packages to same version: npm install @remotion/cli@latest remotion@latest',
                        'Clear cache after fixes using clear-project-cache tool',
                    ] : [
                        'No version conflicts detected',
                        'All Remotion packages appear to be compatible',
                        globalVersions.cli ? 'TIP: Consider removing global installation to prevent future conflicts' : 'Good: No global installation detected',
                    ],
                    crashRisk: hasConflicts ? (conflicts.some(c => c.severity === 'high') ? 'high' : 'medium') : 'low',
                };
            }
            catch (error) {
                logger.error('Error checking version conflicts:', error);
                return {
                    success: false,
                    error: error.message,
                    message: 'Failed to check version conflicts',
                };
            }
        },
        'restart-studio-on-port': async (args) => {
            logger.info('Restarting studio on port', { port: args.port, projectPath: args.projectPath });
            try {
                // First kill anything on the port
                await handlers['kill-studio-on-port']({ port: args.port });
                // Wait for cleanup
                await new Promise(resolve => setTimeout(resolve, 2000));
                // Clear cache if requested
                if (args.clearCache) {
                    logger.info('Clearing cache before restart');
                    await handlers['clear-project-cache']({
                        projectPath: args.projectPath,
                        clearTypes: ['remotion', 'webpack'],
                        force: true,
                    });
                }
                // Launch studio with project
                const launchResult = await handlers['launch-studio-with-project']({
                    projectPath: args.projectPath,
                    port: args.port,
                    openBrowser: true,
                });
                if (launchResult.success) {
                    return {
                        success: true,
                        message: `Studio successfully restarted on port ${args.port}`,
                        url: launchResult.url,
                        port: args.port,
                        projectPath: args.projectPath,
                        cacheCleared: args.clearCache,
                        recovery: 'successful',
                    };
                }
                else {
                    return {
                        success: false,
                        error: `Failed to restart studio: ${launchResult.error}`,
                        port: args.port,
                        recovery: 'failed',
                        troubleshooting: [
                            'Check that the project path exists and is valid',
                            'Ensure no other processes are using the port',
                            'Try clearing cache manually and restarting',
                            'Check version conflicts using check-version-conflicts tool',
                        ],
                    };
                }
            }
            catch (error) {
                logger.error('Error restarting studio:', error);
                return {
                    success: false,
                    error: error.message,
                    recovery: 'error',
                };
            }
        },
        'clear-project-cache': async (args) => {
            logger.info('Clearing project cache', { projectPath: args.projectPath, clearTypes: args.clearTypes });
            try {
                const projectPath = args.projectPath;
                const clearTypes = args.clearTypes || ['remotion', 'webpack'];
                const cleared = [];
                const errors = [];
                // Check if studio is running and warn if not forced
                if (!args.force) {
                    const studioStatus = await handlers['get-studio-status']();
                    if (studioStatus.running) {
                        return {
                            success: false,
                            error: 'Studio is currently running. Use force: true to clear cache anyway, or stop studio first.',
                            warning: 'Clearing cache while studio is running may cause instability',
                        };
                    }
                }
                // Clear different types of cache
                for (const clearType of clearTypes) {
                    try {
                        switch (clearType) {
                            case 'remotion':
                            case 'all':
                                const remotionCachePath = path.join(projectPath, '.remotion');
                                if (await fs.pathExists(remotionCachePath)) {
                                    await fs.remove(remotionCachePath);
                                    cleared.push('.remotion cache');
                                }
                                if (clearType !== 'all')
                                    break;
                            case 'webpack':
                                const webpackCachePath = path.join(projectPath, 'node_modules', '.cache');
                                if (await fs.pathExists(webpackCachePath)) {
                                    await fs.remove(webpackCachePath);
                                    cleared.push('webpack cache');
                                }
                                if (clearType !== 'all')
                                    break;
                            case 'build':
                                const buildPaths = ['out', 'dist', 'build'];
                                for (const buildPath of buildPaths) {
                                    const fullBuildPath = path.join(projectPath, buildPath);
                                    if (await fs.pathExists(fullBuildPath)) {
                                        await fs.remove(fullBuildPath);
                                        cleared.push(`${buildPath} directory`);
                                    }
                                }
                                if (clearType !== 'all')
                                    break;
                            case 'node_modules':
                                const nodeModulesPath = path.join(projectPath, 'node_modules');
                                if (await fs.pathExists(nodeModulesPath)) {
                                    await fs.remove(nodeModulesPath);
                                    cleared.push('node_modules (requires reinstall)');
                                }
                                break;
                        }
                    }
                    catch (error) {
                        errors.push(`Failed to clear ${clearType}: ${error.message}`);
                    }
                }
                return {
                    success: errors.length === 0,
                    message: `Cache clearing completed. Cleared: ${cleared.join(', ')}`,
                    cleared,
                    errors,
                    projectPath,
                    recommendations: cleared.includes('node_modules') ? [
                        'Run npm install to reinstall dependencies',
                        'Consider restarting studio after cache clear',
                    ] : [
                        'Cache cleared successfully',
                        'Studio should now have fresh cache on next launch',
                    ],
                };
            }
            catch (error) {
                logger.error('Error clearing cache:', error);
                return {
                    success: false,
                    error: error.message,
                };
            }
        },
        'diagnose-studio-health': async (args) => {
            logger.info('Diagnosing studio health', { projectPath: args.projectPath, port: args.port });
            try {
                const projectPath = args.projectPath;
                const diagnosis = {
                    projectPath,
                    timestamp: new Date().toISOString(),
                    checks: [],
                    issues: [],
                    recommendations: [],
                    overallHealth: 'unknown',
                };
                // Check project structure
                const requiredFiles = ['package.json', 'src', 'remotion.config.ts'];
                for (const file of requiredFiles) {
                    const filePath = path.join(projectPath, file);
                    const exists = await fs.pathExists(filePath);
                    diagnosis.checks.push({
                        name: `${file} exists`,
                        status: exists ? 'pass' : 'fail',
                        path: filePath,
                    });
                    if (!exists) {
                        diagnosis.issues.push(`Missing required file: ${file}`);
                    }
                }
                // Check version conflicts
                const versionCheck = await handlers['check-version-conflicts']({ projectPath });
                diagnosis.checks.push({
                    name: 'Version consistency',
                    status: versionCheck.hasConflicts ? 'fail' : 'pass',
                    details: versionCheck,
                });
                if (versionCheck.hasConflicts) {
                    diagnosis.issues.push(...versionCheck.warnings);
                    diagnosis.recommendations.push(...versionCheck.recommendations);
                }
                // Check node_modules
                const nodeModulesPath = path.join(projectPath, 'node_modules');
                const hasNodeModules = await fs.pathExists(nodeModulesPath);
                diagnosis.checks.push({
                    name: 'Dependencies installed',
                    status: hasNodeModules ? 'pass' : 'fail',
                    path: nodeModulesPath,
                });
                if (!hasNodeModules) {
                    diagnosis.issues.push('Dependencies not installed');
                    diagnosis.recommendations.push('Run npm install in project directory');
                }
                // Check cache state
                const remotionCachePath = path.join(projectPath, '.remotion');
                const hasCache = await fs.pathExists(remotionCachePath);
                diagnosis.checks.push({
                    name: 'Remotion cache status',
                    status: 'info',
                    details: hasCache ? 'Cache exists' : 'No cache (fresh state)',
                });
                // Check port if provided
                if (args.port) {
                    const { promisify } = await import('util');
                    const execAsync = promisify(require('child_process').exec);
                    try {
                        const { stdout } = await execAsync(`netstat -ano | findstr :${args.port}`);
                        const isPortInUse = stdout.trim().length > 0;
                        diagnosis.checks.push({
                            name: `Port ${args.port} status`,
                            status: isPortInUse ? 'info' : 'available',
                            details: isPortInUse ? 'Port is in use' : 'Port is available',
                        });
                    }
                    catch {
                        diagnosis.checks.push({
                            name: `Port ${args.port} status`,
                            status: 'available',
                            details: 'Port appears to be available',
                        });
                    }
                }
                // Determine overall health
                const failedChecks = diagnosis.checks.filter((c) => c.status === 'fail').length;
                const totalChecks = diagnosis.checks.length;
                if (failedChecks === 0) {
                    diagnosis.overallHealth = 'excellent';
                }
                else if (failedChecks <= 2) {
                    diagnosis.overallHealth = 'good';
                }
                else if (failedChecks <= 4) {
                    diagnosis.overallHealth = 'fair';
                }
                else {
                    diagnosis.overallHealth = 'poor';
                }
                // Add general recommendations
                if (diagnosis.issues.length === 0) {
                    diagnosis.recommendations.unshift('Project appears healthy and ready for studio launch');
                }
                else {
                    diagnosis.recommendations.unshift('Fix the issues listed above before launching studio');
                }
                return {
                    success: true,
                    diagnosis,
                    summary: {
                        health: diagnosis.overallHealth,
                        totalChecks,
                        failedChecks,
                        issueCount: diagnosis.issues.length,
                    },
                    message: `Health check completed. Overall status: ${diagnosis.overallHealth}`,
                };
            }
            catch (error) {
                logger.error('Error diagnosing studio health:', error);
                return {
                    success: false,
                    error: error.message,
                };
            }
        },
    };
    // Return all handlers
    return handlers;
}
// Helper function to create basic Remotion project structure
async function createBasicRemotionProject(projectPath) {
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
//# sourceMappingURL=studio-tools.js.map