"use strict";
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
exports.getWindowsProjectPath = getWindowsProjectPath;
exports.getAssetsDir = getAssetsDir;
exports.findProcessOnPort = findProcessOnPort;
exports.killProcessOnPort = killProcessOnPort;
exports.validateRemotionAvailable = validateRemotionAvailable;
exports.getSystemStatus = getSystemStatus;
exports.findStudioPort = findStudioPort;
// Windows Utility Functions - Simple and Direct
const child_process_1 = require("child_process");
const util_1 = require("util");
const path = __importStar(require("path"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
/**
 * Get Windows project path for a project name
 */
function getWindowsProjectPath(projectName) {
    const assetsDir = getAssetsDir();
    return path.join(assetsDir, 'projects', projectName);
}
/**
 * Get assets directory using Windows paths
 */
function getAssetsDir() {
    // Use environment variable or default Windows path
    return process.env.REMOTION_ASSETS_DIR ||
        'D:\\MY PROJECTS\\AI\\LLM\\AI Code Gen\\my-builds\\Video + Motion\\RoughCut\\assets';
}
/**
 * Find what process is actually using a port
 * Uses modern Windows commands instead of deprecated WMIC
 */
async function findProcessOnPort(port) {
    try {
        // Use netstat to find port, then tasklist to get process name
        const netstatResult = await execAsync(`netstat -ano | findstr :${port} | findstr LISTENING`);
        if (!netstatResult.stdout.trim()) {
            return null; // No process on port
        }
        // Extract PID from netstat output: "TCP 0.0.0.0:3000 ... LISTENING 1234"
        const match = netstatResult.stdout.match(/\s+(\d+)\s*$/);
        if (!match) {
            return null;
        }
        const pid = parseInt(match[1], 10);
        // Verify it's actually a node/remotion process
        try {
            const processResult = await execAsync(`tasklist /fi "PID eq ${pid}" /fo csv`);
            if (processResult.stdout.includes('node.exe') || processResult.stdout.includes('remotion')) {
                return pid;
            }
        }
        catch {
            // If tasklist fails, still return the PID
            return pid;
        }
        return pid;
    }
    catch (error) {
        return null;
    }
}
/**
 * Kill process on specific port
 * Uses direct Windows commands that actually work
 */
async function killProcessOnPort(port) {
    try {
        const pid = await findProcessOnPort(port);
        if (!pid) {
            return false; // Nothing to kill
        }
        // Use Windows taskkill - force kill the process tree
        await execAsync(`taskkill /f /t /pid ${pid}`);
        // Wait a moment for cleanup
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Verify it's actually gone
        const stillExists = await findProcessOnPort(port);
        return !stillExists;
    }
    catch (error) {
        // If kill fails, that's usually fine (process already dead)
        return true;
    }
}
/**
 * Validate that Remotion is actually available
 */
async function validateRemotionAvailable() {
    try {
        const result = await execAsync('npx.cmd remotion --version', { timeout: 10000 });
        return result.stdout.includes('remotion') || result.stdout.includes('4.0');
    }
    catch {
        return false;
    }
}
/**
 * Get real system status - no lies, just facts
 */
async function getSystemStatus() {
    const ports = [];
    // Check 6600-6620 studio port range
    for (const port of [6600, 6601, 6602, 6603, 6604, 6605, 6606, 6607, 6608, 6609, 6610]) {
        const pid = await findProcessOnPort(port);
        if (pid) {
            ports.push({ port, pid });
        }
    }
    const remotionAvailable = await validateRemotionAvailable();
    return { ports, remotionAvailable };
}
/**
 * Find which port a studio is running on (if any)
 */
async function findStudioPort() {
    // Check 6600-6620 studio port range
    for (const port of [6600, 6601, 6602, 6603, 6604, 6605, 6606, 6607, 6608, 6609, 6610]) {
        const pid = await findProcessOnPort(port);
        if (pid) {
            return port; // Return first found port
        }
    }
    return null;
}
//# sourceMappingURL=utils.js.map