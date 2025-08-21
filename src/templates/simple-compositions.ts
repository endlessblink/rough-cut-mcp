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
  
  // Log for debugging
  console.error(`[DEBUG] generateBasicComposition called with:
    - animationDesc: ${animationDesc?.substring(0, 100)}...
    - compositionCode provided: ${compositionCode ? 'YES' : 'NO'}
    - compositionCode length: ${compositionCode?.length || 0}
    - style: ${style || 'none'}
    - duration: ${duration}s
    - assets: ${assets.images.length} images, ${assets.voiceTracks.length} voices, ${assets.soundEffects.length} sounds`);
  
  // If Claude provided composition code, use it directly
  if (compositionCode && compositionCode.trim()) {
    console.error('[DEBUG] Using Claude-provided composition code');
    return compositionCode;
  }
  
  // Enhanced fallback with error guidance
  console.error('[ERROR] No compositionCode provided - falling back to error message');
  const durationInFrames = Math.round(duration * fps);
  
  return `import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

export const VideoComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
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
          Request: "${animationDesc}"
        </p>
        <div style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.5)', 
          padding: '20px', 
          borderRadius: '5px',
          marginTop: '30px'
        }}>
          <p style={{ color: '#ffffff', fontSize: 18, marginBottom: 15 }}>
            Claude must generate complete Remotion React component code.
          </p>
          <p style={{ color: '#aaaaaa', fontSize: 16 }}>
            The compositionCode parameter is REQUIRED and should contain a complete
            React component with animations using Remotion hooks like useCurrentFrame,
            interpolate, and spring.
          </p>
        </div>
        <p style={{ color: '#666', fontSize: 14, marginTop: 30 }}>
          Requested duration: ${duration}s | FPS: ${fps} | Dimensions: ${dimensions.width}x${dimensions.height}
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