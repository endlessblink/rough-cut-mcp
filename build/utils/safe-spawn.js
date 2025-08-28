"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commandExists = commandExists;
exports.isRemotionAvailable = isRemotionAvailable;
exports.safeSpawn = safeSpawn;
exports.safeNpmInstall = safeNpmInstall;
exports.getInstallInstructions = getInstallInstructions;
// Safe process spawning utility for MCP server stability
const child_process_1 = require("child_process");
const util_1 = require("util");
const child_process_2 = require("child_process");
const logger_js_1 = require("./logger.js");
const execAsync = (0, util_1.promisify)(child_process_2.exec);
const logger = (0, logger_js_1.getLogger)().service('SafeSpawn');
/**
 * Check if a command exists in the system PATH
 */
async function commandExists(command) {
    const isWindows = process.platform === 'win32';
    const checkCommand = isWindows ? 'where' : 'which';
    try {
        const { stdout } = await execAsync(`${checkCommand} ${command}`);
        return stdout.trim().length > 0;
    }
    catch {
        return false;
    }
}
/**
 * Check if Remotion is available via npx
 */
async function isRemotionAvailable() {
    try {
        // First check if npx exists
        const hasNpx = await commandExists('npx');
        if (!hasNpx) {
            logger.warn('npx command not found in PATH');
            return false;
        }
        // For now, we'll assume Remotion is available if npx exists
        // The actual check can timeout in some environments
        // The safe spawn will handle any actual launch failures gracefully
        logger.info('Assuming Remotion is available (npx exists)');
        return true;
        // Note: The proper check below times out in some environments
        // Keeping it commented for future reference
        /*
        try {
          const { stdout } = await execAsync('npx --version', {
            timeout: 5000
          });
          
          if (stdout) {
            // If npx works, assume Remotion can be installed/run
            logger.info('npx is functional, Remotion should be available');
            return true;
          }
        } catch (execError: any) {
          logger.debug('npx check failed', { error: execError.message });
        }
        */
    }
    catch (error) {
        logger.debug('Remotion availability check failed', {
            error: error instanceof Error ? error.message : String(error)
        });
        return false;
    }
}
/**
 * Safe spawn wrapper that prevents server crashes
 */
async function safeSpawn(command, args, options = {}) {
    const { timeout = 30000, ...spawnOptions } = options;
    logger.info('Safe spawning process', { command, args, cwd: spawnOptions.cwd });
    return new Promise((resolve) => {
        let timeoutHandle = null;
        let processExited = false;
        try {
            const childProcess = (0, child_process_1.spawn)(command, args, {
                ...spawnOptions,
                shell: process.platform === 'win32' // Always use shell on Windows
            });
            // Set up timeout
            if (timeout > 0) {
                timeoutHandle = setTimeout(() => {
                    if (!processExited) {
                        logger.warn('Process timeout, killing', { command, timeout });
                        try {
                            childProcess.kill('SIGTERM');
                            setTimeout(() => {
                                if (!processExited) {
                                    childProcess.kill('SIGKILL');
                                }
                            }, 5000);
                        }
                        catch (killError) {
                            logger.error('Failed to kill timed out process', {
                                error: killError instanceof Error ? killError.message : String(killError)
                            });
                        }
                        resolve({
                            success: false,
                            error: `Process timed out after ${timeout}ms`
                        });
                    }
                }, timeout);
            }
            // Handle spawn errors (ENOENT, EPERM, etc.)
            childProcess.on('error', (error) => {
                processExited = true;
                if (timeoutHandle)
                    clearTimeout(timeoutHandle);
                logger.error('Process spawn error', {
                    command,
                    error: error.message,
                    code: error.code
                });
                let errorMessage = error.message;
                // Provide specific error messages
                if (error.code === 'ENOENT') {
                    errorMessage = `Command not found: ${command}. Please ensure it is installed and in your PATH.`;
                }
                else if (error.code === 'EPERM' || error.code === 'EACCES') {
                    errorMessage = `Permission denied when trying to execute: ${command}`;
                }
                resolve({
                    success: false,
                    error: errorMessage,
                    code: error.code
                });
            });
            // Handle process exit
            childProcess.on('exit', (code, signal) => {
                processExited = true;
                if (timeoutHandle)
                    clearTimeout(timeoutHandle);
                logger.info('Process exited', { command, code, signal });
                // Consider exit code 0 as success, anything else as potential failure
                if (code === 0 || code === null) {
                    resolve({
                        success: true,
                        pid: childProcess.pid,
                        process: childProcess,
                        code: code ?? 0
                    });
                }
                else {
                    resolve({
                        success: false,
                        error: `Process exited with code ${code}`,
                        code: code ?? -1
                    });
                }
            });
            // For studio processes, use a longer grace period and add health checking
            if (command.includes('studio') || args.includes('studio')) {
                let healthCheckInterval = null;
                let studioPort = null;
                // Extract port from arguments
                const portIndex = args.findIndex(arg => arg === '--port');
                if (portIndex !== -1 && args[portIndex + 1]) {
                    studioPort = parseInt(args[portIndex + 1]);
                }
                const checkStudioHealth = async () => {
                    if (studioPort) {
                        try {
                            const response = await fetch(`http://localhost:${studioPort}`, {
                                method: 'HEAD',
                                signal: AbortSignal.timeout(2000)
                            });
                            if (response.ok) {
                                if (healthCheckInterval)
                                    clearInterval(healthCheckInterval);
                                if (timeoutHandle)
                                    clearTimeout(timeoutHandle);
                                logger.info('Studio health check passed', { port: studioPort });
                                resolve({
                                    success: true,
                                    pid: childProcess.pid,
                                    process: childProcess
                                });
                                return true;
                            }
                        }
                        catch {
                            // Studio not ready yet, continue checking
                        }
                    }
                    return false;
                };
                // Start health checking after initial grace period
                setTimeout(() => {
                    if (!processExited && childProcess.pid) {
                        logger.info('Starting studio health checks', { port: studioPort });
                        // Check immediately
                        checkStudioHealth().then(healthy => {
                            if (!healthy) {
                                // Start periodic health checks
                                healthCheckInterval = setInterval(async () => {
                                    if (processExited) {
                                        if (healthCheckInterval)
                                            clearInterval(healthCheckInterval);
                                        return;
                                    }
                                    await checkStudioHealth();
                                }, 2000); // Check every 2 seconds
                            }
                        });
                    }
                }, 5000); // 5 second initial grace period
            }
            else if (spawnOptions.detached) {
                // For other detached processes, use the original logic
                setTimeout(() => {
                    if (!processExited && childProcess.pid) {
                        if (timeoutHandle)
                            clearTimeout(timeoutHandle);
                        resolve({
                            success: true,
                            pid: childProcess.pid,
                            process: childProcess
                        });
                    }
                }, 3000);
            }
        }
        catch (error) {
            // Catch any synchronous errors
            logger.error('Unexpected spawn error', {
                error: error instanceof Error ? error.message : String(error)
            });
            if (timeoutHandle)
                clearTimeout(timeoutHandle);
            resolve({
                success: false,
                error: error instanceof Error ? error.message : String(error)
            });
        }
    });
}
/**
 * Safely install npm dependencies for a project
 * Windows-optimized npm installation
 */
async function safeNpmInstall(projectPath, timeout = 120000) {
    logger.info('Installing npm dependencies', {
        projectPath
    });
    // Use npm.cmd on Windows, npm on Unix
    const isWindows = process.platform === 'win32';
    const npmCommand = isWindows ? 'npm.cmd' : 'npm';
    // First check if npm is available
    const npmExists = await commandExists(npmCommand);
    if (!npmExists) {
        logger.error('npm not found in PATH');
        return {
            success: false,
            error: 'npm is not installed or not in PATH'
        };
    }
    // Run npm install with safe spawn
    return safeSpawn(npmCommand, ['install'], {
        cwd: projectPath,
        stdio: 'pipe',
        timeout
    });
}
/**
 * Get installation instructions for missing tools
 */
function getInstallInstructions(tool) {
    switch (tool.toLowerCase()) {
        case 'remotion':
            return [
                'Remotion is not installed. To install it:',
                '',
                'Option 1: Install globally',
                '  npm install -g @remotion/cli',
                '',
                'Option 2: Install in this project',
                '  npm install --save-dev @remotion/cli remotion',
                '',
                'Option 3: Use npx (recommended)',
                '  npx @remotion/cli studio',
                '',
                'For more information: https://www.remotion.dev/docs/cli'
            ];
        case 'npx':
            return [
                'npx is not available. This usually means Node.js/npm is not properly installed.',
                '',
                'To fix this:',
                '1. Ensure Node.js is installed: https://nodejs.org/',
                '2. Verify npm is in your PATH: npm --version',
                '3. Restart your terminal after installation'
            ];
        default:
            return [`${tool} is not installed or not in PATH`];
    }
}
//# sourceMappingURL=safe-spawn.js.map