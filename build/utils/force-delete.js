"use strict";
/**
 * Force Delete System - Safely removes animation projects even when locked by processes
 * Handles Remotion Studio instances, file locks, and cleanup without corruption
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.forceDeleteProject = forceDeleteProject;
exports.isProjectLocked = isProjectLocked;
exports.safeDeleteProject = safeDeleteProject;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
/**
 * Force delete an animation project, handling all locks and processes
 */
async function forceDeleteProject(options) {
    const { projectPath, projectName, killProcesses = true, removeNodeModules = true, timeout = 30000 } = options;
    const result = {
        success: false,
        processesKilled: [],
        filesRemoved: [],
        errors: [],
        warnings: []
    };
    try {
        // Step 1: Find and kill related processes
        if (killProcesses) {
            const killedProcesses = await killRelatedProcesses(projectName, projectPath);
            result.processesKilled = killedProcesses;
        }
        // Step 2: Wait for processes to fully terminate
        await new Promise(resolve => setTimeout(resolve, 2000));
        // Step 3: Handle file locks with retry
        const deleteSuccess = await deleteWithRetry(projectPath, removeNodeModules, timeout);
        if (deleteSuccess.success) {
            result.filesRemoved = deleteSuccess.files;
            result.success = true;
        }
        else {
            result.errors = deleteSuccess.errors;
        }
    }
    catch (error) {
        result.errors.push(`Force delete failed: ${error instanceof Error ? error.message : String(error)}`);
    }
    return result;
}
/**
 * Find and kill processes related to a project
 */
async function killRelatedProcesses(projectName, projectPath) {
    const killedProcesses = [];
    try {
        // Find Node.js processes running from this project directory
        const { stdout } = await execAsync('wmic process where "name=\'node.exe\'" get commandline,processid /format:csv');
        const lines = stdout.split('\n').filter(line => line.trim());
        for (const line of lines) {
            const parts = line.split(',');
            if (parts.length >= 3) {
                const commandLine = parts[1];
                const pid = parts[2];
                // Check if this process is related to our project
                if (commandLine && (commandLine.includes(projectPath) ||
                    commandLine.includes(projectName) ||
                    commandLine.includes('remotion studio') ||
                    commandLine.includes('remotion render'))) {
                    try {
                        await execAsync(`taskkill /F /PID ${pid}`);
                        killedProcesses.push(`${pid} (${commandLine.substring(0, 50)}...)`);
                    }
                    catch (killError) {
                        // Process might already be gone
                    }
                }
            }
        }
        // Also kill any remotion studio processes
        try {
            await execAsync('taskkill /F /IM "remotion.exe" 2>nul');
        }
        catch {
            // Ignore if no remotion processes
        }
    }
    catch (error) {
        // Fallback for non-Windows or if wmic fails
        try {
            // Kill any node processes containing our project name
            await execAsync(`pkill -f "${projectName}"`);
            killedProcesses.push(`All processes containing: ${projectName}`);
        }
        catch {
            // Ignore if pkill not available
        }
    }
    return killedProcesses;
}
/**
 * Delete with retry mechanism for locked files
 */
async function deleteWithRetry(projectPath, removeNodeModules, timeout) {
    const files = [];
    const errors = [];
    const startTime = Date.now();
    // Strategy: Delete in order from least to most likely to be locked
    const deletionOrder = [
        'src/**/*.tsx',
        'src/**/*.ts',
        'public/**/*',
        'remotion.config.ts',
        'package.json'
    ];
    if (removeNodeModules) {
        deletionOrder.push('node_modules/**/*');
    }
    try {
        // First, try graceful deletion
        if (await fs.pathExists(projectPath)) {
            // Delete specific file types first
            for (const pattern of deletionOrder) {
                const fullPattern = path.join(projectPath, pattern);
                try {
                    // Use glob to find files matching pattern
                    const glob = require('glob');
                    const matchingFiles = glob.sync(fullPattern);
                    for (const file of matchingFiles) {
                        await deleteFileWithRetry(file, timeout);
                        files.push(path.relative(projectPath, file));
                    }
                }
                catch (patternError) {
                    // Continue with next pattern
                }
            }
            // Finally, remove the directory itself
            let retries = 0;
            const maxRetries = 10;
            while (retries < maxRetries && Date.now() - startTime < timeout) {
                try {
                    if (await fs.pathExists(projectPath)) {
                        await fs.remove(projectPath);
                        files.push('(entire project directory)');
                        break;
                    }
                }
                catch (deleteError) {
                    retries++;
                    if (retries === maxRetries) {
                        errors.push(`Could not delete project directory after ${maxRetries} attempts`);
                    }
                    else {
                        // Wait and retry
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
            }
        }
        return {
            success: errors.length === 0,
            files,
            errors
        };
    }
    catch (error) {
        errors.push(`Delete operation failed: ${error instanceof Error ? error.message : String(error)}`);
        return {
            success: false,
            files,
            errors
        };
    }
}
/**
 * Delete a single file with retry mechanism
 */
async function deleteFileWithRetry(filePath, timeout) {
    const startTime = Date.now();
    let lastError = null;
    while (Date.now() - startTime < timeout) {
        try {
            if (await fs.pathExists(filePath)) {
                // On Windows, try to unlock the file first
                if (process.platform === 'win32') {
                    try {
                        await execAsync(`attrib -R "${filePath}"`);
                    }
                    catch {
                        // Ignore if attrib fails
                    }
                }
                await fs.remove(filePath);
                return; // Success
            }
            else {
                return; // File doesn't exist (already deleted)
            }
        }
        catch (error) {
            lastError = error;
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
    throw lastError || new Error(`Timeout deleting file: ${filePath}`);
}
/**
 * Check if a project directory is locked by any processes
 */
async function isProjectLocked(projectPath) {
    const lockingProcesses = [];
    try {
        if (process.platform === 'win32') {
            // Windows: Use handle.exe if available, otherwise check for common locks
            try {
                const { stdout } = await execAsync(`handle "${projectPath}" 2>nul`);
                const lines = stdout.split('\n').filter(line => line.trim());
                for (const line of lines) {
                    if (line.includes('pid:')) {
                        lockingProcesses.push(line.trim());
                    }
                }
            }
            catch {
                // handle.exe not available, use alternative method
                try {
                    const { stdout } = await execAsync('wmic process get commandline,processid /format:csv');
                    const lines = stdout.split('\n').filter(line => line.includes(projectPath));
                    lockingProcesses.push(...lines);
                }
                catch {
                    // Could not determine lock status
                }
            }
        }
        else {
            // Unix: Use lsof
            try {
                const { stdout } = await execAsync(`lsof +D "${projectPath}" 2>/dev/null`);
                const lines = stdout.split('\n').filter(line => line.trim());
                lockingProcesses.push(...lines);
            }
            catch {
                // lsof failed or no locks
            }
        }
    }
    catch (error) {
        // Could not check locks
    }
    return {
        locked: lockingProcesses.length > 0,
        lockingProcesses
    };
}
/**
 * Safe project deletion that handles all edge cases
 */
async function safeDeleteProject(projectPath, projectName) {
    // First check if it's locked
    const lockStatus = await isProjectLocked(projectPath);
    if (lockStatus.locked) {
        // Use force delete if locked
        return await forceDeleteProject({
            projectPath,
            projectName,
            killProcesses: true,
            removeNodeModules: true,
            timeout: 60000 // 1 minute timeout
        });
    }
    else {
        // Simple deletion if not locked
        try {
            await fs.remove(projectPath);
            return {
                success: true,
                processesKilled: [],
                filesRemoved: ['(entire project directory)'],
                errors: [],
                warnings: []
            };
        }
        catch (error) {
            // Fallback to force delete
            return await forceDeleteProject({
                projectPath,
                projectName,
                killProcesses: true,
                removeNodeModules: true
            });
        }
    }
}
//# sourceMappingURL=force-delete.js.map