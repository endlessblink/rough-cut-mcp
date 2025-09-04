// Simple MCP Tools - Just File Operations, No Intelligence
// Lets Claude generate excellent JSX, MCP handles technical implementation only

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import * as fs from 'fs-extra';
import * as path from 'path';
import { spawn } from 'child_process';
import { getProjectPath } from './utils.js';

export const tools: Tool[] = [
  {
    name: 'create_project',
    description: 'Create Remotion project with YOUR JSX. MCP handles file operations only - no template overrides.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Project name' },
        jsx: { type: 'string', description: 'Your JSX code - used exactly as provided' }
      },
      required: ['name', 'jsx']
    }
  },
  {
    name: 'edit_project', 
    description: 'Edit existing project VideoComposition.tsx with new JSX.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Project name' },
        jsx: { type: 'string', description: 'New JSX code - replaces existing' }
      },
      required: ['name', 'jsx']
    }
  },
  {
    name: 'launch_studio',
    description: 'Launch Remotion Studio for project.',
    inputSchema: {
      type: 'object', 
      properties: {
        name: { type: 'string', description: 'Project name' }
      },
      required: ['name']
    }
  },
  {
    name: 'read_project',
    description: 'Read current VideoComposition.tsx content.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Project name' }
      },
      required: ['name']
    }
  }
];

export async function handleToolCall(name: string, arguments_: any) {
  switch (name) {
    case 'create_project':
      return await createProject(arguments_.name, arguments_.jsx);
    
    case 'edit_project':
      return await editProject(arguments_.name, arguments_.jsx);
      
    case 'launch_studio':
      return await launchStudio(arguments_.name);
      
    case 'read_project':
      return await readProject(arguments_.name);
      
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// SIMPLE: Create project with Claude's JSX exactly as provided
async function createProject(name: string, jsx: string) {
  try {
    const projectPath = getProjectPath(name);
    
    console.error(`[CREATE-PROJECT] Creating ${name} with Claude's JSX (${jsx.length} chars)`);
    
    // Create directories
    await fs.ensureDir(projectPath);
    await fs.ensureDir(path.join(projectPath, 'src'));
    await fs.ensureDir(path.join(projectPath, 'public'));
    
    // Use Claude's JSX exactly as provided - no modifications
    await fs.writeFile(path.join(projectPath, 'src', 'VideoComposition.tsx'), jsx);
    
    // Create minimal Root.tsx
    const rootContent = `import React from 'react';
import { Composition } from 'remotion';
import VideoComposition from './VideoComposition';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="VideoComposition"
      component={VideoComposition}
      durationInFrames={900}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};`;
    
    await fs.writeFile(path.join(projectPath, 'src', 'Root.tsx'), rootContent);
    
    // Create index.ts
    const indexContent = `import { registerRoot } from 'remotion';
import { RemotionRoot } from './Root';

registerRoot(RemotionRoot);`;
    
    await fs.writeFile(path.join(projectPath, 'src', 'index.ts'), indexContent);
    
    // Create tsconfig.json (this was missing causing errors)
    const tsConfig = {
      "compilerOptions": {
        "target": "ES2020",
        "lib": ["ES2020", "DOM"],
        "module": "ESNext", 
        "moduleResolution": "bundler",
        "jsx": "react-jsx",
        "strict": true,
        "skipLibCheck": true,
        "esModuleInterop": true,
        "allowSyntheticDefaultImports": true,
        "forceConsistentCasingInFileNames": true,
        "isolatedModules": true,
        "noEmit": true
      },
      "include": ["src/**/*"],
      "exclude": ["node_modules"]
    };
    
    await fs.writeFile(path.join(projectPath, 'tsconfig.json'), JSON.stringify(tsConfig, null, 2));
    
    // Create package.json
    const packageJson = {
      "name": name,
      "version": "1.0.0", 
      "scripts": {
        "start": "remotion studio",
        "build": "remotion render src/index.ts VideoComposition out/video.mp4"
      },
      "dependencies": {
        "react": "^18.2.0",
        "react-dom": "^18.2.0", 
        "remotion": "^4.0.340"
      },
      "devDependencies": {
        "@types/react": "^18.0.0",
        "typescript": "^5.0.0"
      }
    };
    
    await fs.writeFile(path.join(projectPath, 'package.json'), JSON.stringify(packageJson, null, 2));
    
    // Create remotion.config.ts
    const configContent = `import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);`;
    
    await fs.writeFile(path.join(projectPath, 'remotion.config.ts'), configContent);
    
    console.error(`[CREATE-PROJECT] ✅ Project created successfully with Claude's original JSX`);
    
    return {
      content: [{
        type: 'text',
        text: `✅ Project "${name}" created with your JSX code.\n\nNext: Use launch_studio to start Remotion Studio.`
      }]
    };
    
  } catch (error) {
    console.error('[CREATE-PROJECT] Error:', error);
    return {
      content: [{
        type: 'text',
        text: `❌ Error creating project: ${error instanceof Error ? error.message : 'Unknown error'}`
      }],
      isError: true
    };
  }
}

// SIMPLE: Edit project with Claude's new JSX
async function editProject(name: string, jsx: string) {
  try {
    const projectPath = getProjectPath(name);
    const compositionPath = path.join(projectPath, 'src', 'VideoComposition.tsx');
    
    console.error(`[EDIT-PROJECT] Updating ${name} with Claude's new JSX (${jsx.length} chars)`);
    
    // Use Claude's JSX exactly as provided - no modifications
    await fs.writeFile(compositionPath, jsx);
    
    return {
      content: [{
        type: 'text',
        text: `✅ Project "${name}" updated with your new JSX code.`
      }]
    };
    
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `❌ Error editing project: ${error instanceof Error ? error.message : 'Unknown error'}`
      }],
      isError: true
    };
  }
}

// SIMPLE: Launch Remotion Studio
async function launchStudio(name: string) {
  try {
    const projectPath = getProjectPath(name);
    
    console.error(`[LAUNCH-STUDIO] Starting Remotion Studio for ${name}`);
    
    const studio = spawn('npm', ['start'], {
      cwd: projectPath,
      stdio: 'inherit',
      shell: true
    });
    
    return {
      content: [{
        type: 'text',
        text: `✅ Launching Remotion Studio for "${name}".\n\nStudio will be available at http://localhost:3000`
      }]
    };
    
  } catch (error) {
    return {
      content: [{
        type: 'text', 
        text: `❌ Error launching studio: ${error instanceof Error ? error.message : 'Unknown error'}`
      }],
      isError: true
    };
  }
}

// SIMPLE: Read current project JSX
async function readProject(name: string) {
  try {
    const projectPath = getProjectPath(name);
    const compositionPath = path.join(projectPath, 'src', 'VideoComposition.tsx');
    
    const jsx = await fs.readFile(compositionPath, 'utf-8');
    
    return {
      content: [{
        type: 'text',
        text: `Current VideoComposition.tsx for "${name}":\n\n\`\`\`tsx\n${jsx}\n\`\`\``
      }]
    };
    
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `❌ Error reading project: ${error instanceof Error ? error.message : 'Unknown error'}`
      }],
      isError: true
    };
  }
}