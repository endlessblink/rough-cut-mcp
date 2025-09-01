import { spawn, ChildProcess, exec } from 'child_process';
import * as fs from 'fs-extra';
import * as path from 'path';

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

export function getProjectPath(name: string): string {
  // Use current working directory for cross-platform compatibility
  // When installed globally, projects will be created where user runs commands
  return path.resolve(process.cwd(), 'assets', 'projects', name);
}

export async function createRemotionProject(projectPath: string, jsx: string): Promise<void> {
  await fs.ensureDir(projectPath);
  await fs.ensureDir(path.join(projectPath, 'src'));
  await fs.ensureDir(path.join(projectPath, 'public'));
  await fs.ensureDir(path.join(projectPath, 'public', 'audio'));
  
  // Ensure Claude's JSX has proper export pattern for Remotion 4.0.340
  const ensureProperExport = (jsxContent: string): string => {
    if (jsxContent.includes('export const VideoComposition')) {
      return jsxContent; // Already has proper named export
    } else if (jsxContent.includes('const VideoComposition')) {
      // Convert const to export const
      return jsxContent.replace('const VideoComposition', 'export const VideoComposition');
    } else {
      // Wrap the JSX in proper export
      return jsxContent + '\n\n// Ensure proper named export for Remotion\nexport { VideoComposition };';
    }
  };
  
  const videoCompositionContent = ensureProperExport(jsx);
  
  await fs.writeFile(
    path.join(projectPath, 'src', 'VideoComposition.tsx'),
    videoCompositionContent
  );
  
  // Create minimal Root.tsx that imports VideoComposition with Remotion 4.0 requirements
  const rootContent = `import React from 'react';
import { Composition } from 'remotion';
import { VideoComposition } from './VideoComposition';

// Debug logging for component import
console.log('VideoComposition imported:', VideoComposition);

export const RemotionRoot: React.FC = () => {
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
  
  // Create tsconfig.json for the project with Remotion-specific settings
  const tsconfigContent = {
    "compilerOptions": {
      "target": "ES2020",
      "lib": ["ES2020", "DOM", "DOM.Iterable"],
      "module": "ESNext",
      "moduleResolution": "node",
      "allowSyntheticDefaultImports": true,
      "esModuleInterop": true,
      "allowJs": true,
      "jsx": "react-jsx",
      "strict": true,
      "skipLibCheck": true,
      "forceConsistentCasingInFileNames": true,
      "resolveJsonModule": true,
      "isolatedModules": true,
      "noEmit": false,
      "outDir": "./dist",
      "baseUrl": ".",
      "sourceMap": true,
      "declaration": true
    },
    "include": ["src/**/*.ts", "src/**/*.tsx"],
    "exclude": ["node_modules", "dist"]
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