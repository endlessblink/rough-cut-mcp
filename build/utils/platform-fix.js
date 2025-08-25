// Platform-specific fixes for Windows spawn issues
import { spawn } from 'child_process';
/**
 * Fix for Windows spawn EINVAL issues
 * Wraps child_process.spawn with proper shell configuration
 */
export function createRemotionProcess(command, args = [], options = {}) {
    const isWindows = process.platform === 'win32';
    if (isWindows) {
        // Use shell: true for Windows
        return spawn(command, args, {
            ...options,
            shell: true,
            stdio: options.stdio || 'pipe'
        });
    }
    return spawn(command, args, options);
}
/**
 * Normalize paths for cross-platform compatibility
 */
export function normalizePath(filePath) {
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
export function getBundlerOptions() {
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
export function patchRemotionSpawn() {
    // Override global spawn
    global.spawn = function (command, args, options) {
        // logger.debug(`[PLATFORM-FIX] Intercepting spawn call: ${command}`);
        return createRemotionProcess(command, args || [], options || {});
    };
    // Note: Direct patching of childProcess.spawn skipped due to read-only property
    // createRemotionProcess should be used directly where needed
}
//# sourceMappingURL=platform-fix.js.map