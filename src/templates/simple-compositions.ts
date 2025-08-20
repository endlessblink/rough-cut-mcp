// Simple composition templates without JSX for initial testing
import { AnimationGeneratorService } from '../services/animation-generator.js';
import { IntelligentCompositionGenerator } from './intelligent-compositions.js';

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
}

// Initialize intelligent generators
const animationGenerator = new AnimationGeneratorService();
const compositionGenerator = new IntelligentCompositionGenerator();

/**
 * Generate basic composition code as a string with intelligent generation
 */
export async function generateBasicComposition(request: CompositionRequest): Promise<string> {
  const { animationDesc, assets, style, duration, fps, dimensions } = request;
  
  // First try intelligent generation
  try {
    const animationRequest = {
      animationDesc,
      duration,
      fps,
      dimensions,
      style,
    };

    // Try the animation generator service first
    const generatorResult = await animationGenerator.generateAnimation(animationRequest);
    if (generatorResult.success) {
      return generatorResult.compositionCode;
    }

    // If generator fails, try the intelligent composition generator
    if (generatorResult.animationType) {
      const compositionResult = compositionGenerator.generateComposition(
        animationRequest,
        generatorResult.animationType
      );
      
      if (compositionResult.success) {
        return compositionResult.compositionCode;
      }
    }
  } catch (error) {
    console.warn('Intelligent generation failed, falling back to templates:', error);
  }

  // Fallback to original template-based approach
  const isBallAnimation = animationDesc.toLowerCase().includes('ball') || animationDesc.toLowerCase().includes('bounce');
  
  if (isBallAnimation) {
    return `import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

export const VideoComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Bouncing ball physics
  const ballSize = 60;
  const groundLevel = ${dimensions.height} - 100;
  const bounceCount = 4;
  
  // Calculate ball position with realistic physics
  const totalFrames = durationInFrames;
  const bounceFrames = totalFrames / bounceCount;
  
  const currentBounce = Math.floor(frame / bounceFrames);
  const frameInBounce = frame % bounceFrames;
  
  // Decreasing bounce height
  const bounceHeight = (groundLevel - 50) * Math.pow(0.7, currentBounce);
  
  // Physics calculation for Y position
  const t = frameInBounce / bounceFrames;
  const y = groundLevel - (bounceHeight * Math.sin(Math.PI * t));
  
  // Horizontal movement
  const x = interpolate(frame, [0, totalFrames], [100, ${dimensions.width} - 100]);
  
  // Ball compression effect when hitting ground
  const compressionFactor = Math.abs(Math.sin(Math.PI * t)) < 0.1 ? 0.8 : 1;

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      {/* Ground */}
      <div
        style={{
          position: 'absolute',
          bottom: 80,
          left: 0,
          right: 0,
          height: 20,
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          borderRadius: '10px 10px 0 0',
        }}
      />
      
      {/* Ball shadow */}
      <div
        style={{
          position: 'absolute',
          left: x - ballSize/2,
          bottom: 85,
          width: ballSize * compressionFactor,
          height: 10,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '50%',
          filter: 'blur(5px)',
        }}
      />
      
      {/* Bouncing ball */}
      <div
        style={{
          position: 'absolute',
          left: x - ballSize/2,
          top: y - ballSize/2,
          width: ballSize,
          height: ballSize * compressionFactor,
          background: 'radial-gradient(circle at 30% 30%, #ff6b6b, #ff4757)',
          borderRadius: '50%',
          boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
        }}
      />
    </AbsoluteFill>
  );
};`;
  }
  
  return `import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

export const VideoComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Basic fade in/out animation
  const fadeIn = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const fadeOut = interpolate(
    frame,
    [durationInFrames - 30, durationInFrames],
    [1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  const opacity = Math.min(fadeIn, fadeOut);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '${style?.includes('dark') ? '#1a1a1a' : '#ffffff'}',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      ${assets.images.map((image, index) => `
      <AbsoluteFill key={${index}}>
        <Img
          src="${image.imagePath}"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: opacity * 0.8,
          }}
        />
      </AbsoluteFill>`).join('')}

      <AbsoluteFill
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
        }}
      >
        <div
          style={{
            padding: 40,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            borderRadius: 20,
            maxWidth: '80%',
            textAlign: 'center',
            opacity,
          }}
        >
          <h1
            style={{
              fontSize: 48,
              color: 'white',
              margin: 0,
              fontFamily: 'Arial, sans-serif',
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            }}
          >
            ${animationDesc}
          </h1>
        </div>
      </AbsoluteFill>

      ${assets.voiceTracks.map((track, index) => `
      <Audio
        key="voice-${index}"
        src="${track.audioPath}"
        startFrom={0}
        volume={0.8}
      />`).join('')}

      ${assets.soundEffects.map((sfx, index) => `
      <Audio
        key="sfx-${index}"
        src="${sfx.audioPath}"
        startFrom={${index * 60}}
        volume={0.4}
      />`).join('')}
    </AbsoluteFill>
  );
};`;
}

/**
 * Generate index file for Remotion project
 */
export function generateIndexFile(
  duration: number,
  fps: number,
  dimensions: { width: number; height: number }
): string {
  return `import { Composition } from 'remotion';
import { VideoComposition } from './Composition';

export const RemotionVideo: React.FC = () => {
  return (
    <>
      <Composition
        id="VideoComposition"
        component={VideoComposition}
        durationInFrames={${fps * duration}}
        fps={${fps}}
        width={${dimensions.width}}
        height={${dimensions.height}}
      />
    </>
  );
};`;
}

/**
 * Generate package.json for composition
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
