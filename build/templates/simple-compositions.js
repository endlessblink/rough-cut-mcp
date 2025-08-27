// Simple composition generator for Claude-provided code
/**
 * Generate composition code from Claude-provided code or basic fallback
 */
export async function generateBasicComposition(request) {
    const { animationDesc, assets, style, duration, fps, dimensions, compositionCode } = request;
    // If Claude provided composition code, analyze and potentially transform it
    if (compositionCode && compositionCode.trim()) {
        try {
            // Import analysis functions dynamically to avoid circular dependencies
            const { analyzeCompositionStructure, transformToSeriesStructure } = await import('../utils/composition-templates.js');
            // Analyze the provided code structure
            const analysis = analyzeCompositionStructure(compositionCode);
            // Transform to Series structure if needed
            if (analysis.needsTransformation) {
                const transformedCode = transformToSeriesStructure(compositionCode, analysis);
                return transformedCode;
            }
            // Return original code if already properly structured
            return compositionCode;
        }
        catch (error) {
            // If analysis fails, fall back to original code
            return compositionCode;
        }
    }
    // Enhanced fallback with error guidance
    // logger.error('No compositionCode provided - falling back to error message');
    const durationInFrames = Math.round(duration * fps);
    return `import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, Series } from 'remotion';

export const VideoComposition: React.FC = () => {
  return (
    <Series>
      <Series.Sequence durationInFrames={${Math.round(duration * fps)}}>
        <ErrorScene animationDesc="${animationDesc}" duration={${duration}} fps={${fps}} dimensions={${JSON.stringify(dimensions)}} />
      </Series.Sequence>
    </Series>
  );
};

const ErrorScene: React.FC<{
  animationDesc: string;
  duration: number;
  fps: number;
  dimensions: { width: number; height: number };
}> = ({ animationDesc, duration, fps, dimensions }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1]);
  
  return (
    <AbsoluteFill style={{ backgroundColor: '#1a1a1a' }}>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        opacity,
        maxWidth: '80%',
        padding: '40px',
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        borderRadius: '10px',
        border: '2px solid #ff0000'
      }}>
        <h1 style={{ color: '#ff0000', fontSize: 60, marginBottom: 30 }}>
          ⚠️ Missing Animation Code
        </h1>
        <p style={{ color: '#ffaaaa', fontSize: 24, marginBottom: 20 }}>
          Request: "{animationDesc}"
        </p>
        <div style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.5)', 
          padding: '20px', 
          borderRadius: '5px',
          marginTop: '30px'
        }}>
          <p style={{ color: '#ffffff', fontSize: 18, marginBottom: 15 }}>
            Claude must generate complete Remotion React component code using Series structure.
          </p>
          <p style={{ color: '#aaaaaa', fontSize: 16 }}>
            Use &lt;Series&gt; and &lt;Series.Sequence&gt; for multiple scenes to create separate timeline clips!
          </p>
        </div>
        <p style={{ color: '#666', fontSize: 14, marginTop: 30 }}>
          Requested duration: {duration}s | FPS: {fps} | Dimensions: {dimensions.width}x{dimensions.height}
        </p>
      </div>
    </AbsoluteFill>
  );
};`;
}
/**
 * Generate index file for Remotion composition
 */
export function generateIndexFile(duration, fps, dimensions) {
    const durationInFrames = Math.round(duration * fps);
    return `import { Composition } from 'remotion';
import { VideoComposition } from './Composition';

export const RemotionVideo = () => {
  return (
    <Composition
      id="VideoComposition"
      component={VideoComposition}
      durationInFrames={${durationInFrames}}
      fps={${fps}}
      width={${dimensions.width}}
      height={${dimensions.height}}
    />
  );
};`;
}
/**
 * Generate complete package.json with all required dependencies and scripts
 */
export function generateCompletePackageJson() {
    return JSON.stringify({
        name: "remotion-video",
        version: "1.0.0",
        type: "module",
        scripts: {
            "start": "remotion studio",
            "build": "remotion render src/index.ts VideoComposition out.mp4",
            "preview": "remotion preview src/index.ts",
            "studio": "remotion studio"
        },
        dependencies: {
            "react": "18.0.0",
            "react-dom": "18.0.0",
            "remotion": "4.0.340",
            "@remotion/cli": "4.0.340"
        },
        devDependencies: {
            "@remotion/bundler": "4.0.340",
            "typescript": "5.0.4"
        }
    }, null, 2);
}
/**
 * Generate legacy package.json (deprecated - use generateCompletePackageJson)
 */
export function generatePackageJson() {
    return generateCompletePackageJson();
}
/**
 * Generate remotion.config.ts file
 */
export function generateRemotionConfig() {
    return `/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import {Config} from '@remotion/cli/config';

// Set video image format for better performance
Config.setVideoImageFormat('jpeg');

// Set concurrency for rendering
Config.setConcurrency(2);

// Use angle renderer for better compatibility
Config.setChromiumOpenGlRenderer('angle');

// Set output location
Config.setOutputLocation('out');
`;
}
/**
 * Generate tsconfig.json for TypeScript compilation
 */
export function generateTsConfig() {
    return JSON.stringify({
        compilerOptions: {
            target: "ES2018",
            module: "ESNext",
            jsx: "react-jsx",
            strict: true,
            esModuleInterop: true,
            skipLibCheck: true,
            forceConsistentCasingInFileNames: true,
            moduleResolution: "node",
            resolveJsonModule: true,
            isolatedModules: true,
            allowSyntheticDefaultImports: true,
            noEmit: true
        },
        include: ["src"],
        exclude: ["node_modules"]
    }, null, 2);
}
//# sourceMappingURL=simple-compositions.js.map