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

// Smart cross-platform base directory detection (research-based MCP pattern)
export function getBaseDirectory(): string {
  const serverDir = path.dirname(__dirname); // From build/ to project root
  
  // Priority order for finding projects (research-proven approach)
  const candidates = [
    // 1. User-specified directory via environment variable
    process.env.REMOTION_PROJECTS_DIR,
    
    // 2. Your existing Windows projects directory (backward compatibility)
    'D:\\MY PROJECTS\\AI\\LLM\\AI Code Gen\\my-builds\\Video + Motion\\rough-cut_2',
    
    // 3. MCP server project directory (where server is installed)
    serverDir,
    
    // 4. User home directory (cross-platform standard)
    path.join(os.homedir(), 'remotion-projects'),
    
    // 5. Current working directory (fallback)
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
  // Use smart detection to find projects (backward compatible + cross-platform)
  const baseDir = getBaseDirectory();
  return path.resolve(baseDir, 'assets', 'projects', name);
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
  
  // Validate and clean JSX content before processing
  const validateAndCleanJSX = (jsxContent: string): string => {
    // Basic JSX syntax validation and cleanup
    let cleaned = jsxContent.trim();
    
    // Fix common template literal issues that cause "Expected }" errors
    cleaned = cleaned.replace(/`([^`]*)`/g, '"$1"'); // Convert template literals to strings
    cleaned = cleaned.replace(/\$\{[^}]*\}/g, ''); // Remove template literal expressions
    
    // Fix unclosed objects/braces (common Claude generation issue)
    const openBraces = (cleaned.match(/\{/g) || []).length;
    const closeBraces = (cleaned.match(/\}/g) || []).length;
    
    if (openBraces > closeBraces) {
      // Add missing closing braces
      cleaned += '\n' + '}'.repeat(openBraces - closeBraces);
    }
    
    // Fix incomplete JSX expressions
    if (cleaned.includes('${') && !cleaned.includes('}')) {
      cleaned = cleaned.replace(/\$\{[^}]*$/, ''); // Remove incomplete expressions
    }
    
    return cleaned;
  };

  // Ensure Claude's JSX uses FUNCTION DECLARATION + default export (Perplexity research solution)
  const ensureProperExport = (jsxContent: string): string => {
    // Clean and validate JSX first
    const cleanedJSX = validateAndCleanJSX(jsxContent);
    // Add comprehensive debug logging
    const withLogging = (content: string): string => {
      const imports = content.split('\n').filter(line => line.startsWith('import')).join('\n');
      const rest = content.split('\n').filter(line => !line.startsWith('import')).join('\n');
      
      return imports + '\n\n' + 
        '// Debug logging for component resolution\n' +
        'console.log(\'VideoComposition module loading...\');\n\n' +
        rest + 
        '\n\nconsole.log(\'VideoComposition function defined:\', VideoComposition);\n';
    };
    
    if (cleanedJSX.includes('function VideoComposition()') && cleanedJSX.includes('export default VideoComposition')) {
      return withLogging(cleanedJSX); // Already correct pattern
    } else if (cleanedJSX.includes('export const VideoComposition')) {
      // Convert named arrow function to function declaration
      const converted = cleanedJSX
        .replace('export const VideoComposition = () => {', 'function VideoComposition() {')
        + '\n\nexport default VideoComposition;';
      return withLogging(converted);
    } else if (cleanedJSX.includes('const VideoComposition')) {
      // Convert const arrow function to function declaration
      const converted = cleanedJSX
        .replace('const VideoComposition = () => {', 'function VideoComposition() {')
        + '\n\nexport default VideoComposition;';
      return withLogging(converted);
    } else {
      // Create complete function declaration wrapper (safe string concatenation)
      const safeWrapper = [
        'import React from \'react\';',
        'import { AbsoluteFill } from \'remotion\';',
        '',
        'function VideoComposition() {',
        '  return (',
        '    <AbsoluteFill>',
        '      ' + cleanedJSX, // Safe concatenation with cleaned JSX
        '    </AbsoluteFill>',
        '  );',
        '}',
        '',
        'export default VideoComposition;'
      ].join('\n');
      
      return withLogging(safeWrapper);
    }
  };
  
  const videoCompositionContent = ensureProperExport(jsx);
  
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