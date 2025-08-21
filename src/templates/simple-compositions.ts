// Simple composition generator for Claude-provided code

export interface VideoAssets {
  voiceTracks: Array<{
    audioPath: string;
    duration: number;
    metadata: any;
  }>;
  soundEffects: Array<{
    audioPath: string;
    duration: number;
    metadata: any;
  }>;
  images: Array<{
    imagePath: string;
    metadata: any;
  }>;
}

export interface CompositionRequest {
  animationDesc: string;
  assets: VideoAssets;
  style?: string;
  duration: number;
  fps: number;
  dimensions: {
    width: number;
    height: number;
  };
  compositionCode?: string; // Claude provides the complete animation code
}

/**
 * Generate composition code from Claude-provided code or basic fallback
 */
export async function generateBasicComposition(request: CompositionRequest): Promise<string> {
  const { animationDesc, assets, style, duration, fps, dimensions, compositionCode } = request;
  
  // If Claude provided composition code, use it directly
  if (compositionCode && compositionCode.trim()) {
    return compositionCode;
  }
  
  // Basic fallback - just shows a message asking for code
  const durationInFrames = Math.round(duration * fps);
  
  return `import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

export const VideoComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1]);
  
  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        opacity
      }}>
        <h1 style={{ color: 'white', fontSize: 60, marginBottom: 30 }}>
          No Animation Code Provided
        </h1>
        <p style={{ color: '#888', fontSize: 30 }}>
          Request: ${animationDesc}
        </p>
        <p style={{ color: '#666', fontSize: 20, marginTop: 40 }}>
          Please ask Claude to generate Remotion code for this animation
        </p>
      </div>
    </AbsoluteFill>
  );
};`;
}

/**
 * Generate index file for Remotion composition
 */
export function generateIndexFile(duration: number, fps: number, dimensions: { width: number; height: number }): string {
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
 * Generate package.json for the composition
 */
export function generatePackageJson(): string {
  return JSON.stringify({
    name: "remotion-video",
    version: "1.0.0",
    dependencies: {
      "react": "^18.0.0",
      "remotion": "^4.0.0"
    }
  }, null, 2);
}