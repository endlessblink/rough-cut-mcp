"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRemotionProcess = createRemotionProcess;
exports.normalizePath = normalizePath;
exports.getBundlerOptions = getBundlerOptions;
exports.patchRemotionSpawn = patchRemotionSpawn;
// Platform-specific fixes for Windows spawn issues
const child_process_1 = require("child_process");
/**
 * Fix for Windows spawn EINVAL issues
 * Wraps child_process.spawn with proper shell configuration
 */
function createRemotionProcess(command, args = [], options = {}) {
    const isWindows = process.platform === 'win32';
    if (isWindows) {
        // Use shell: true for Windows
        return (0, child_process_1.spawn)(command, args, {
            ...options,
            shell: true,
            stdio: options.stdio || 'pipe'
        });
    }
    return (0, child_process_1.spawn)(command, args, options);
}
/**
 * Normalize paths for cross-platform compatibility
 */
function normalizePath(filePath) {
    if (process.platform === 'win32') {
        // Convert forward slashes to backslashes on Windows
        return filePath.replace(/\//g, '\\');
    }
    // Convert backslashes to forward slashes on Unix-like systems
    return filePath.replace(/\\/g, '/');
}
/**
 * Get platform-specific Remotion bundler options
 */
function getBundlerOptions() {
    const isWindows = process.platform === 'win32';
    if (isWindows) {
        return {
            // Add Windows-specific options
            webpackOverride: (config) => {
                return {
                    ...config,
                    // Ensure proper module resolution on Windows
                    resolve: {
                        ...config.resolve,
                        fallback: {
                            ...config.resolve?.fallback,
                            "child_process": false,
                            "fs": false,
                            "path": false
                        }
                    }
                };
            }
        };
    }
    return {};
}
/**
 * Patch Remotion's internal spawn calls
 */
function patchRemotionSpawn() {
    // Override global spawn
    global.spawn = function (command, args, options) {
        // logger.debug(`[PLATFORM-FIX] Intercepting spawn call: ${command}`);
        return createRemotionProcess(command, args || [], options || {});
    };
    // Note: Direct patching of childProcess.spawn skipped due to read-only property
    // createRemotionProcess should be used directly where needed
}
//# sourceMappingURL=platform-fix.js.map