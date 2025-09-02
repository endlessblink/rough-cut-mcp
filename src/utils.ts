import { spawn, ChildProcess, exec } from 'child_process';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

export interface StudioProcess {
  pid: number;
  port: number;
  projectName: string;
  process: ChildProcess;
}

const runningStudios: Map<number, StudioProcess> = new Map();

export async function findAvailablePort(startPort: number = 6600, endPort: number = 6620): Promise<number> {
  return new Promise((resolve) => {
    const checkPort = (port: number) => {
      if (port > endPort) {
        resolve(startPort); // Fallback to start port
        return;
      }
      
      const server = require('net').createServer();
      server.listen(port, () => {
        server.once('close', () => resolve(port));
        server.close();
      });
      server.on('error', () => checkPort(port + 1));
    };
    checkPort(startPort);
  });
}

export async function isPortInUse(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = require('net').createServer();
    server.listen(port, () => {
      server.close();
      resolve(false);
    });
    server.on('error', () => resolve(true));
  });
}

export function killProcessOnPort(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const studio = runningStudios.get(port);
    if (studio && studio.process) {
      studio.process.kill('SIGTERM');
      runningStudios.delete(port);
      resolve(true);
    } else {
      // Use Windows-specific commands for process management
      if (process.platform === 'win32') {
        // Find PID using netstat
        exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
          if (error || !stdout.trim()) {
            resolve(false);
            return;
          }
          
          const lines = stdout.trim().split('\n');
          const pidMatch = lines[0]?.match(/\s+(\d+)$/);
          
          if (pidMatch) {
            const pid = pidMatch[1];
            // Kill process with taskkill
            exec(`taskkill /f /t /pid ${pid}`, (killError) => {
              resolve(!killError);
            });
          } else {
            resolve(false);
          }
        });
      } else {
        // Fallback for non-Windows (shouldn't be used due to WSL protection)
        exec(`lsof -ti :${port} | xargs kill -9`, (error) => {
          resolve(!error);
        });
      }
    }
  });
}

export function addRunningStudio(studio: StudioProcess): void {
  runningStudios.set(studio.port, studio);
}

export function getRunningStudios(): StudioProcess[] {
  return Array.from(runningStudios.values());
}

export function clearStudioTracking(): void {
  runningStudios.clear();
}

export function removeDeadStudio(port: number): void {
  if (runningStudios.has(port)) {
    runningStudios.delete(port);
    console.error(`[STUDIO-TRACKING] Removed dead studio on port ${port}`);
  }
}

export async function updateProjectDuration(projectPath: string, durationSeconds: number): Promise<void> {
  const rootPath = path.join(projectPath, 'src', 'Root.tsx');
  
  if (!(await fs.pathExists(rootPath))) {
    throw new Error('Root.tsx not found in project');
  }
  
  let rootContent = await fs.readFile(rootPath, 'utf-8');
  const fps = 30; // Standard fps
  const frames = Math.round(durationSeconds * fps);
  
  // Safe string replacement for durationInFrames
  const updatedContent = rootContent.replace(
    /durationInFrames=\{\d+\}/g,
    `durationInFrames={${frames}}`
  );
  
  await fs.writeFile(rootPath, updatedContent);
}


// Optional Audio Configuration Management (Secure .env based)
interface AudioConfig {
  enabled: boolean;
  elevenLabsApiKey?: string;
  mubertApiKey?: string;
}

export function getAudioConfig(): AudioConfig {
  return {
    enabled: process.env.AUDIO_ENABLED === 'true',
    elevenLabsApiKey: process.env.ELEVENLABS_API_KEY,
    mubertApiKey: process.env.MUBERT_API_KEY
  };
}

export async function setAudioConfig(config: AudioConfig): Promise<void> {
  const envPath = path.resolve(__dirname, '..', '.env');
  
  try {
    // Read existing .env file or create new content
    let envContent = '';
    if (await fs.pathExists(envPath)) {
      envContent = await fs.readFile(envPath, 'utf-8');
    }
    
    // Update or add each environment variable
    const updateEnvVar = (content: string, key: string, value: string | boolean | undefined) => {
      if (value === undefined) return content;
      
      const line = `${key}=${value}`;
      const regex = new RegExp(`^${key}=.*$`, 'm');
      
      if (regex.test(content)) {
        return content.replace(regex, line);
      } else {
        return content + (content.endsWith('\n') ? '' : '\n') + line + '\n';
      }
    };
    
    envContent = updateEnvVar(envContent, 'AUDIO_ENABLED', config.enabled);
    envContent = updateEnvVar(envContent, 'ELEVENLABS_API_KEY', config.elevenLabsApiKey);
    envContent = updateEnvVar(envContent, 'MUBERT_API_KEY', config.mubertApiKey);
    
    await fs.writeFile(envPath, envContent);
    
    // Update current process.env for immediate effect
    process.env.AUDIO_ENABLED = config.enabled.toString();
    if (config.elevenLabsApiKey) process.env.ELEVENLABS_API_KEY = config.elevenLabsApiKey;
    if (config.mubertApiKey) process.env.MUBERT_API_KEY = config.mubertApiKey;
    
  } catch (error) {
    throw new Error(`Failed to save audio config: ${error instanceof Error ? error.message : 'unknown error'}`);
  }
}

export function isAudioEnabled(): boolean {
  return process.env.AUDIO_ENABLED === 'true';
}

// WSL path normalization for Windows/WSL2 environments
function normalizePath(inputPath: string): string {
  if (!inputPath) return inputPath;
  
  let normalized = path.normalize(inputPath);
  
  // Handle WSL-style paths on Windows
  if (process.platform === 'win32' && normalized.startsWith('/mnt/')) {
    const wslMatch = normalized.match(/^\/mnt\/([a-z])\/(.*)/); 
    if (wslMatch) {
      normalized = `${wslMatch[1].toUpperCase()}:\\${wslMatch[2].replace(/\//g, '\\')}`;
    }
  }
  
  return normalized;
}

// Smart cross-platform base directory detection (research-based MCP pattern)
export function getBaseDirectory(): string {
  // Fix: When running from project root, __dirname IS the server directory
  // When running from build/, go up one level
  const serverDir = __dirname.endsWith('build') ? path.dirname(__dirname) : __dirname;
  
  // Debug logging for path resolution
  console.error(`[PATH-DEBUG] __dirname: ${__dirname}`);
  console.error(`[PATH-DEBUG] serverDir: ${serverDir}`);
  console.error(`[PATH-DEBUG] REMOTION_PROJECTS_DIR: ${process.env.REMOTION_PROJECTS_DIR || '[NOT SET]'}`);
  
  // Priority order for finding projects (cross-platform approach)
  // Note: REMOTION_PROJECTS_DIR is handled separately in getProjectPath()
  const candidates = [
    // 1. MCP server project directory (where server is installed)
    serverDir,
    
    // 3. User home directory (cross-platform standard)
    path.join(os.homedir(), 'remotion-projects'),
    
    // 4. Current working directory (fallback)
    process.cwd()
  ];
  
  // Find first directory that has assets/projects or can be used
  for (const candidate of candidates) {
    if (candidate) {
      const assetsPath = path.join(candidate, 'assets', 'projects');
      
      // If assets/projects exists, use this directory
      if (fs.existsSync(assetsPath)) {
        console.error(`[BASE-DIR] Found existing projects at: ${candidate}`);
        return candidate;
      }
      
      // If directory exists and we can create assets in it, use it
      try {
        if (fs.existsSync(candidate)) {
          console.error(`[BASE-DIR] Using writable directory: ${candidate}`);
          return candidate;
        }
      } catch (error) {
        // Continue to next candidate
      }
    }
  }
  
  // Final fallback
  console.error(`[BASE-DIR] Using fallback: ${process.cwd()}`);
  return process.cwd();
}

export function getProjectPath(name: string): string {
  // Priority 1: REMOTION_PROJECTS_DIR (advanced users) - NO AUTO-CREATION
  if (process.env.REMOTION_PROJECTS_DIR) {
    const normalizedPath = normalizePath(process.env.REMOTION_PROJECTS_DIR);
    console.error(`[PATH-DEBUG] Using REMOTION_PROJECTS_DIR: ${normalizedPath}`);
    return path.resolve(normalizedPath, name);  // EARLY RETURN - no auto-creation
  }
  
  // Priority 2: User-friendly Documents directory (non-technical users only)
  const os = require('os');
  const homeDir = os.homedir();
  
  let userFriendlyDir: string;
  if (process.platform === 'win32') {
    userFriendlyDir = path.join(homeDir, 'Documents', 'Remotion Projects');
  } else if (process.platform === 'darwin') {
    userFriendlyDir = path.join(homeDir, 'Documents', 'Remotion Projects');
  } else {
    userFriendlyDir = path.join(homeDir, 'remotion-projects');
  }
  
  // Auto-create user-friendly directory ONLY for non-technical users
  try {
    if (!require('fs-extra').existsSync(userFriendlyDir)) {
      require('fs-extra').ensureDirSync(userFriendlyDir);
      console.error(`[AUTO-SETUP] Created user-friendly project directory: ${userFriendlyDir}`);
    }
    console.error(`[PATH-DEBUG] Using user-friendly directory: ${userFriendlyDir}`);
    return path.resolve(userFriendlyDir, name);
  } catch (error) {
    console.error(`[AUTO-SETUP] Could not create user-friendly directory:`, error);
  }
  
  // Priority 3: Technical fallback (assets/projects structure)
  const baseDir = getBaseDirectory();
  const fallbackDir = path.resolve(baseDir, 'assets', 'projects');
  console.error(`[PATH-DEBUG] Using technical fallback: ${fallbackDir}`);
  return path.resolve(fallbackDir, name);
}

// ====== SHARED JSX PROCESSING FUNCTIONS ======

/**
 * SAFE version of ensureProperExport that doesn't use validateAndCleanJSX
 * Used only for create_project and auto-recovery to prevent corruption
 */
export function ensureProperExportSafe(jsxContent: string): string {
  // Use JSX directly without corrupting regex processing
  const cleanedJSX = jsxContent.trim();
  
  console.error(`[ENSURE-PROPER-EXPORT-SAFE] Processing JSX safely (${cleanedJSX.length} chars)`);
  
  // CRITICAL: Improved detection of complete React modules
  const hasImports = cleanedJSX.includes('import');
  const hasFunction = cleanedJSX.includes('function VideoComposition') || cleanedJSX.includes('const VideoComposition') || cleanedJSX.includes('export const VideoComposition');
  const hasExport = cleanedJSX.includes('export default') || cleanedJSX.includes('export const VideoComposition') || cleanedJSX.includes('export {');
  const hasInterfaces = cleanedJSX.includes('interface ') || cleanedJSX.includes('type ');
  const hasComponents = cleanedJSX.includes('const ') && cleanedJSX.includes(': React.FC');
  
  // NEW: Detect if this is a complete React module (multiple components, interfaces, etc.)
  const isCompleteModule = hasImports && (hasInterfaces || hasComponents || cleanedJSX.split('const ').length > 2);
  
  if (isCompleteModule) {
    console.error('[ENSURE-PROPER-EXPORT-SAFE] Complete React module detected - minimal processing');
    
    // For complete modules, only ensure proper default export
    if (!hasExport) {
      // Find the main component name to export
      let componentToExport = 'VideoComposition';
      
      // Look for export const ComponentName pattern
      const exportConstMatch = cleanedJSX.match(/export const (\w+)/);
      if (exportConstMatch) {
        componentToExport = exportConstMatch[1];
      }
      
      // Look for const ComponentName: React.FC pattern
      const reactFcMatch = cleanedJSX.match(/const (\w+): React\.FC/);
      if (reactFcMatch) {
        componentToExport = reactFcMatch[1];
      }
      
      // Look for function ComponentName pattern
      const functionMatch = cleanedJSX.match(/function (\w+)/);
      if (functionMatch && functionMatch[1] !== 'VideoComposition') {
        componentToExport = functionMatch[1];
      }
      
      return cleanedJSX + `\n\nexport default ${componentToExport};`;
    }
    
    return cleanedJSX;
  }
  
  // Simple component handling - just ensure export default exists
  if (hasExport) {
    return cleanedJSX;
  }
  
  // Add export default if missing for simple components
  if (hasFunction) {
    return cleanedJSX + '\n\nexport default VideoComposition;';
  }
  
  // If no function detected, wrap in a basic component
  return `export default function VideoComposition() {
  return (${cleanedJSX});
}`;
}


export async function createRemotionProject(projectPath: string, jsx: string): Promise<void> {
  await fs.ensureDir(projectPath);
  await fs.ensureDir(path.join(projectPath, 'src'));
  await fs.ensureDir(path.join(projectPath, 'public'));
  await fs.ensureDir(path.join(projectPath, 'public', 'audio'));
  
  // Basic JSX validation before processing
  if (!jsx || jsx.trim().length === 0) {
    throw new Error('JSX content is empty or invalid');
  }
  
  if (jsx.includes('${') && jsx.split('${').length !== jsx.split('}').length) {
    console.warn('[JSX-VALIDATION] Warning: Potentially malformed template expressions detected, attempting to clean...');
  }
  
  const videoCompositionContent = ensureProperExportSafe(jsx);
  
  await fs.writeFile(
    path.join(projectPath, 'src', 'VideoComposition.tsx'),
    videoCompositionContent
  );
  
  // Create Root.tsx with DEFAULT import and comprehensive debug logging (Perplexity solution)
  const rootContent = `import React from 'react';
import { Composition } from 'remotion';

console.log('Root.tsx loading...');

// Import with extensive debugging
import VideoComposition from './VideoComposition';
console.log('VideoComposition imported in Root:', VideoComposition);
console.log('VideoComposition type:', typeof VideoComposition);
console.log('VideoComposition is function:', typeof VideoComposition === 'function');

export const RemotionRoot: React.FC = () => {
  console.log('RemotionRoot rendering, VideoComposition:', VideoComposition);
  
  return (
    <>
      <Composition
        id="VideoComposition"
        component={VideoComposition}
        durationInFrames={750}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
    </>
  );
};`;
  
  await fs.writeFile(
    path.join(projectPath, 'src', 'Root.tsx'),
    rootContent
  );
  
  // Create remotion.config.ts
  const configContent = `import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);`;
  
  await fs.writeFile(
    path.join(projectPath, 'remotion.config.ts'),
    configContent
  );
  
  // Create src/index.ts with registerRoot
  const indexContent = `import { registerRoot } from 'remotion';
import { RemotionRoot } from './Root';

registerRoot(RemotionRoot);`;
  
  await fs.writeFile(
    path.join(projectPath, 'src', 'index.ts'),
    indexContent
  );
  
  // Create tsconfig.json with React.lazy() compatibility settings (Perplexity research)
  const tsconfigContent = {
    "compilerOptions": {
      "target": "ES2020",
      "lib": ["ES2020", "DOM", "DOM.Iterable"],
      "module": "ESNext",
      "moduleResolution": "bundler",
      "jsx": "react-jsx",
      "strict": true,
      "skipLibCheck": true,
      "esModuleInterop": true,
      "allowSyntheticDefaultImports": true,
      "forceConsistentCasingInFileNames": true,
      "isolatedModules": true,
      "noEmit": true,
      "allowJs": true,
      "resolveJsonModule": true
    },
    "include": ["src/**/*"],
    "exclude": ["node_modules"]
  };
  
  await fs.writeFile(
    path.join(projectPath, 'tsconfig.json'),
    JSON.stringify(tsconfigContent, null, 2)
  );
  
  // Create package.json for the project with exact versions
  const packageJson = {
    name: path.basename(projectPath),
    version: "1.0.0",
    scripts: {
      "dev": "remotion studio src/index.ts",
      "start": "remotion studio src/index.ts",
      "build": "remotion render src/index.ts VideoComposition out/video.mp4",
      "upgrade": "remotion upgrade"
    },
    dependencies: {
      "@remotion/cli": "4.0.340",
      "@remotion/player": "4.0.340",
      "react": "18.2.0",
      "react-dom": "18.2.0",
      "remotion": "4.0.340"
    },
    devDependencies: {
      "@types/react": "^18.0.0",
      "typescript": "^5.0.0"
    }
  };
  
  await fs.writeFile(
    path.join(projectPath, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
}

// ====== AUTOMATIC INTERRUPTION RECOVERY SYSTEM ======

/**
 * Validate if a JSX file appears to be complete and valid
 * Used for automatic interruption recovery
 */
export function validateVideoCompositionFile(jsxContent: string): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  if (!jsxContent.trim()) {
    issues.push('File is empty');
    return { isValid: false, issues };
  }
  
  // Check for essential elements
  if (!jsxContent.includes('function') && !jsxContent.includes('const')) {
    issues.push('No function or component declaration found');
  }
  
  if (!jsxContent.includes('return')) {
    issues.push('No return statement found');
  }
  
  if (!jsxContent.includes('export default')) {
    issues.push('No default export found');
  }
  
  // Check for problematic patterns that should be filtered
  if (jsxContent.includes('<Composition')) {
    issues.push('Contains <Composition> tags that should be filtered');
  }
  
  // Check syntax balance for incomplete files
  const openBraces = (jsxContent.match(/\{/g) || []).length;
  const closeBraces = (jsxContent.match(/\}/g) || []).length;
  if (openBraces !== closeBraces) {
    issues.push('Mismatched braces - possible incomplete file');
  }
  
  const openParens = (jsxContent.match(/\(/g) || []).length;
  const closeParens = (jsxContent.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    issues.push('Mismatched parentheses - possible incomplete file');
  }
  
  return { isValid: issues.length === 0, issues };
}

/**
 * Check if a project appears to be partially created or corrupted
 * Returns detailed analysis for automatic recovery
 */
export async function checkProjectIntegrity(name: string): Promise<{
  exists: boolean;
  isComplete: boolean;
  issues: string[];
  canRecover: boolean;
  needsRecovery: boolean;
}> {
  const projectPath = getProjectPath(name);
  const issues: string[] = [];
  
  if (!(await fs.pathExists(projectPath))) {
    return { 
      exists: false, 
      isComplete: false, 
      issues: ['Project does not exist'], 
      canRecover: false,
      needsRecovery: false
    };
  }
  
  // Check essential files
  const requiredFiles = [
    'package.json',
    'remotion.config.ts',
    'src/Root.tsx',
    'src/VideoComposition.tsx'
  ];
  
  const missingFiles: string[] = [];
  for (const file of requiredFiles) {
    const filePath = path.join(projectPath, file);
    if (!(await fs.pathExists(filePath))) {
      missingFiles.push(file);
      issues.push(`Missing file: ${file}`);
    }
  }
  
  // Validate VideoComposition.tsx specifically
  const compositionPath = path.join(projectPath, 'src', 'VideoComposition.tsx');
  if (await fs.pathExists(compositionPath)) {
    try {
      const jsxContent = await fs.readFile(compositionPath, 'utf-8');
      const validation = validateVideoCompositionFile(jsxContent);
      if (!validation.isValid) {
        issues.push(...validation.issues.map(issue => `VideoComposition.tsx: ${issue}`));
      }
    } catch (error) {
      issues.push(`VideoComposition.tsx: Cannot read file - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  const isComplete = missingFiles.length === 0 && issues.length === 0;
  const canRecover = missingFiles.length <= 2; // Can recover if most files exist
  const needsRecovery = !isComplete && canRecover;
  
  return { exists: true, isComplete, issues, canRecover, needsRecovery };
}

/**
 * Automatically recover/complete a partially created project
 * Called automatically by editProject when needed
 */
export async function autoRecoverProject(name: string, jsx: string, duration?: number): Promise<{ success: boolean; actions: string[]; message: string }> {
  const actions: string[] = [];
  const projectPath = getProjectPath(name);
  
  try {
    console.error(`[AUTO-RECOVERY] Starting automatic recovery for project: ${name}`);
    
    // Ensure basic structure exists
    await fs.ensureDir(projectPath);
    await fs.ensureDir(path.join(projectPath, 'src'));
    await fs.ensureDir(path.join(projectPath, 'public'));
    await fs.ensureDir(path.join(projectPath, 'public', 'audio'));
    actions.push('Ensured directory structure');
    
    // Always update/fix VideoComposition.tsx with processed JSX (using safe method)
    const jsx_processed = ensureProperExportSafe(jsx);
    const compositionPath = path.join(projectPath, 'src', 'VideoComposition.tsx');
    await fs.writeFile(compositionPath, jsx_processed);
    actions.push('Updated VideoComposition.tsx with filtered JSX');
    
    // Create missing essential files using same logic as createRemotionProject
    
    // Check and create package.json
    const packagePath = path.join(projectPath, 'package.json');
    if (!(await fs.pathExists(packagePath))) {
      const packageJson = {
        "name": "remotion-project",
        "version": "1.0.0",
        "description": "A Remotion video project created by Claude",
        "scripts": {
          "start": "remotion studio",
          "build": "remotion render VideoComposition out/video.mp4",
          "upgrade": "remotion upgrade"
        },
        "dependencies": {
          "react": "^18.0.0",
          "react-dom": "^18.0.0",
          "remotion": "^4.0.0"
        },
        "devDependencies": {
          "@types/react": "^18.0.0",
          "typescript": "^5.0.0"
        }
      };
      await fs.writeFile(packagePath, JSON.stringify(packageJson, null, 2));
      actions.push('Created package.json');
    }
    
    // Check and create src/Root.tsx
    const rootPath = path.join(projectPath, 'src', 'Root.tsx');
    if (!(await fs.pathExists(rootPath))) {
      const rootContent = `import React from 'react';
import { Composition } from 'remotion';

console.log('Root.tsx loading...');

// Import with extensive debugging (Perplexity solution)
import VideoComposition from './VideoComposition';
console.log('VideoComposition imported in Root:', VideoComposition);
console.log('VideoComposition type:', typeof VideoComposition);
console.log('VideoComposition is function:', typeof VideoComposition === 'function');

export const RemotionRoot: React.FC = () => {
  console.log('RemotionRoot rendering, VideoComposition:', VideoComposition);
  
  return (
    <>
      <Composition
        id="VideoComposition"
        component={VideoComposition}
        durationInFrames={${duration || 1200}}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
    </>
  );
};`;
      await fs.writeFile(rootPath, rootContent);
      actions.push('Created Root.tsx');
    }
    
    // Check and create remotion.config.ts
    const configPath = path.join(projectPath, 'remotion.config.ts');
    if (!(await fs.pathExists(configPath))) {
      const configContent = `import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);`;
      await fs.writeFile(configPath, configContent);
      actions.push('Created remotion.config.ts');
    }
    
    // Check and create src/index.ts
    const indexPath = path.join(projectPath, 'src', 'index.ts');
    if (!(await fs.pathExists(indexPath))) {
      const indexContent = `import { registerRoot } from 'remotion';
import { RemotionRoot } from './Root';

registerRoot(RemotionRoot);`;
      await fs.writeFile(indexPath, indexContent);
      actions.push('Created src/index.ts');
    }
    
    console.error(`[AUTO-RECOVERY] Successfully recovered project ${name}: ${actions.join(', ')}`);
    return { 
      success: true, 
      actions, 
      message: `Auto-recovered project "${name}" successfully`
    };
    
  } catch (error) {
    console.error(`[AUTO-RECOVERY] Recovery failed for project ${name}:`, error);
    return { 
      success: false, 
      actions, 
      message: `Recovery failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// ====== AUTOMATIC BACKUP SYSTEM ======

/**
 * Create timestamped backup of VideoComposition.tsx before editing
 * Protects users from losing working animations
 */
export async function createProjectBackup(name: string): Promise<{ success: boolean; backupPath?: string; message: string }> {
  try {
    const projectPath = getProjectPath(name);
    const compositionPath = path.join(projectPath, 'src', 'VideoComposition.tsx');
    
    if (!(await fs.pathExists(compositionPath))) {
      return { success: false, message: 'VideoComposition.tsx does not exist - no backup needed' };
    }
    
    // Create backups directory
    const backupsDir = path.join(projectPath, 'backups');
    await fs.ensureDir(backupsDir);
    
    // Generate timestamped backup filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T');
    const dateStr = timestamp[0];
    const timeStr = timestamp[1].split('.')[0];
    const backupFilename = `VideoComposition-backup-${dateStr}-${timeStr}.tsx`;
    const backupPath = path.join(backupsDir, backupFilename);
    
    // Copy current file to backup
    await fs.copy(compositionPath, backupPath);
    
    console.error(`[BACKUP] Created backup: ${backupFilename}`);
    return { 
      success: true, 
      backupPath: backupFilename,
      message: `Backup created: ${backupFilename}` 
    };
    
  } catch (error) {
    console.error('[BACKUP] Failed to create backup:', error);
    return { 
      success: false, 
      message: `Backup failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

/**
 * List all available backups for a project
 */
export async function listProjectBackups(name: string): Promise<{ success: boolean; backups: string[]; message: string }> {
  try {
    const projectPath = getProjectPath(name);
    const backupsDir = path.join(projectPath, 'backups');
    
    if (!(await fs.pathExists(backupsDir))) {
      return { success: true, backups: [], message: 'No backups directory found' };
    }
    
    const files = await fs.readdir(backupsDir);
    const backups = files
      .filter(file => file.startsWith('VideoComposition-backup-') && file.endsWith('.tsx'))
      .sort()
      .reverse(); // Most recent first
    
    return { 
      success: true, 
      backups, 
      message: `Found ${backups.length} backup(s)` 
    };
    
  } catch (error) {
    console.error('[BACKUP] Failed to list backups:', error);
    return { 
      success: false, 
      backups: [], 
      message: `Failed to list backups: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

/**
 * Restore VideoComposition.tsx from a specific backup
 */
export async function restoreProjectBackup(name: string, backupFilename: string): Promise<{ success: boolean; message: string }> {
  try {
    const projectPath = getProjectPath(name);
    const backupsDir = path.join(projectPath, 'backups');
    const backupPath = path.join(backupsDir, backupFilename);
    const compositionPath = path.join(projectPath, 'src', 'VideoComposition.tsx');
    
    if (!(await fs.pathExists(backupPath))) {
      return { success: false, message: `Backup file not found: ${backupFilename}` };
    }
    
    // Create backup of current file before restoring
    const currentBackupResult = await createProjectBackup(name);
    let message = '';
    
    if (currentBackupResult.success) {
      message += `Current file backed up as: ${currentBackupResult.backupPath}. `;
    }
    
    // Restore from backup
    await fs.copy(backupPath, compositionPath);
    
    console.error(`[BACKUP] Restored from backup: ${backupFilename}`);
    message += `Restored from backup: ${backupFilename}`;
    
    return { success: true, message };
    
  } catch (error) {
    console.error('[BACKUP] Failed to restore backup:', error);
    return { 
      success: false, 
      message: `Restore failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

/**
 * Clean old backups, keeping only the most recent ones
 */
export async function cleanOldBackups(name: string, keepCount: number = 5): Promise<{ success: boolean; deleted: number; message: string }> {
  try {
    const projectPath = getProjectPath(name);
    const backupsDir = path.join(projectPath, 'backups');
    
    if (!(await fs.pathExists(backupsDir))) {
      return { success: true, deleted: 0, message: 'No backups directory found' };
    }
    
    const files = await fs.readdir(backupsDir);
    const backups = files
      .filter(file => file.startsWith('VideoComposition-backup-') && file.endsWith('.tsx'))
      .sort()
      .reverse(); // Most recent first
    
    if (backups.length <= keepCount) {
      return { success: true, deleted: 0, message: `Only ${backups.length} backup(s) found - no cleanup needed` };
    }
    
    const toDelete = backups.slice(keepCount);
    let deletedCount = 0;
    
    for (const backup of toDelete) {
      const backupPath = path.join(backupsDir, backup);
      await fs.remove(backupPath);
      deletedCount++;
    }
    
    console.error(`[BACKUP] Cleaned ${deletedCount} old backups, kept ${keepCount} most recent`);
    return { 
      success: true, 
      deleted: deletedCount, 
      message: `Deleted ${deletedCount} old backup(s), kept ${keepCount} most recent` 
    };
    
  } catch (error) {
    console.error('[BACKUP] Failed to clean backups:', error);
    return { 
      success: false, 
      deleted: 0, 
      message: `Cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}