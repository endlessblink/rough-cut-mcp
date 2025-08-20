// Intelligent animation generation service
import { getLogger } from '../utils/logger.js';

export interface AnimationRequest {
  animationDesc: string;
  duration: number;
  fps: number;
  dimensions: { width: number; height: number };
  style?: string;
}

export interface AnimationType {
  type: 'walk-cycle' | 'bounce' | 'text-animation' | 'rotation' | 'fade' | 'slide' | 'unknown';
  confidence: number;
  keywords: string[];
  elements?: string[];
}

export interface GenerationResult {
  compositionCode: string;
  animationType: AnimationType;
  success: boolean;
  fallbackToTemplate: boolean;
}

export class AnimationGeneratorService {
  private logger = getLogger().service('AnimationGenerator');

  constructor() {
    this.logger.info('Animation generator service initialized');
  }

  /**
   * Generate custom animation code based on description
   */
  async generateAnimation(request: AnimationRequest): Promise<GenerationResult> {
    try {
      this.logger.info('Generating animation', { 
        desc: request.animationDesc.substring(0, 100) + '...',
        duration: request.duration 
      });

      // Parse the animation description
      const animationType = this.parseAnimationType(request.animationDesc);
      
      this.logger.debug('Animation type detected', { 
        type: animationType.type, 
        confidence: animationType.confidence 
      });

      // Generate code based on animation type
      let compositionCode: string | null = null;

      switch (animationType.type) {
        case 'walk-cycle':
          compositionCode = this.generateWalkCycle(request, animationType);
          break;
        case 'bounce':
          compositionCode = this.generateBounceAnimation(request, animationType);
          break;
        case 'text-animation':
          compositionCode = this.generateTextAnimation(request, animationType);
          break;
        case 'rotation':
          compositionCode = this.generateRotationAnimation(request, animationType);
          break;
        case 'fade':
          compositionCode = this.generateFadeAnimation(request, animationType);
          break;
        case 'slide':
          compositionCode = this.generateSlideAnimation(request, animationType);
          break;
        default:
          this.logger.warn('Unknown animation type, will fallback to templates', { 
            type: animationType.type 
          });
          break;
      }

      if (compositionCode) {
        this.logger.info('Animation generated successfully', { type: animationType.type });
        return {
          compositionCode,
          animationType,
          success: true,
          fallbackToTemplate: false,
        };
      } else {
        this.logger.info('No specific generator found, will fallback to templates');
        return {
          compositionCode: '',
          animationType,
          success: false,
          fallbackToTemplate: true,
        };
      }

    } catch (error) {
      this.logger.error('Animation generation failed', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      
      return {
        compositionCode: '',
        animationType: { type: 'unknown', confidence: 0, keywords: [] },
        success: false,
        fallbackToTemplate: true,
      };
    }
  }

  /**
   * Parse animation description to determine type and elements
   */
  private parseAnimationType(description: string): AnimationType {
    const desc = description.toLowerCase();
    const words = desc.split(/\s+/);

    // Define animation patterns with keywords and confidence scoring
    const patterns = [
      {
        type: 'walk-cycle' as const,
        keywords: ['walk', 'walking', 'man', 'person', 'character', 'step', 'stride', 'cycle'],
        requiredKeywords: ['walk'],
        confidence: 0.9,
      },
      {
        type: 'bounce' as const,
        keywords: ['bounce', 'bouncing', 'ball', 'jump', 'jumping', 'hop'],
        requiredKeywords: ['bounce', 'ball'],
        confidence: 0.8,
      },
      {
        type: 'text-animation' as const,
        keywords: ['text', 'title', 'word', 'letter', 'typewriter', 'typing'],
        requiredKeywords: ['text'],
        confidence: 0.7,
      },
      {
        type: 'rotation' as const,
        keywords: ['rotate', 'rotating', 'spin', 'spinning', 'turn', 'turning'],
        requiredKeywords: ['rotate', 'spin'],
        confidence: 0.8,
      },
      {
        type: 'fade' as const,
        keywords: ['fade', 'fading', 'appear', 'disappear', 'opacity'],
        requiredKeywords: ['fade'],
        confidence: 0.7,
      },
      {
        type: 'slide' as const,
        keywords: ['slide', 'sliding', 'move', 'moving', 'glide'],
        requiredKeywords: ['slide'],
        confidence: 0.7,
      },
    ];

    // Score each pattern
    let bestMatch: AnimationType = { type: 'unknown', confidence: 0, keywords: [] };

    for (const pattern of patterns) {
      let score = 0;
      const foundKeywords: string[] = [];

      // Check for required keywords
      const hasRequired = pattern.requiredKeywords.some(keyword => {
        const found = desc.includes(keyword);
        if (found) foundKeywords.push(keyword);
        return found;
      });

      if (hasRequired) {
        score = pattern.confidence;

        // Boost score for additional keywords
        for (const keyword of pattern.keywords) {
          if (desc.includes(keyword) && !foundKeywords.includes(keyword)) {
            foundKeywords.push(keyword);
            score += 0.1;
          }
        }
      }

      if (score > bestMatch.confidence) {
        bestMatch = {
          type: pattern.type,
          confidence: Math.min(score, 1.0),
          keywords: foundKeywords,
        };
      }
    }

    // Extract elements (characters, objects, etc.)
    const elements = this.extractElements(description);
    if (elements.length > 0) {
      bestMatch.elements = elements;
    }

    return bestMatch;
  }

  /**
   * Extract elements from description (characters, objects, etc.)
   */
  private extractElements(description: string): string[] {
    const elements: string[] = [];
    const desc = description.toLowerCase();

    // Common elements
    const elementPatterns = [
      { pattern: /\b(man|person|character|figure|guy)\b/, element: 'character' },
      { pattern: /\b(ball|sphere|circle)\b/, element: 'ball' },
      { pattern: /\b(text|title|word|letter)\b/, element: 'text' },
      { pattern: /\b(box|square|rectangle)\b/, element: 'box' },
      { pattern: /\b(star|diamond|shape)\b/, element: 'shape' },
    ];

    for (const { pattern, element } of elementPatterns) {
      if (pattern.test(desc) && !elements.includes(element)) {
        elements.push(element);
      }
    }

    return elements;
  }

  /**
   * Generate walk cycle animation code
   */
  private generateWalkCycle(request: AnimationRequest, animationType: AnimationType): string {
    const { dimensions, duration, fps } = request;
    const durationInFrames = Math.round(duration * fps);

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

  // Walk cycle frames - ASCII art character in different walking poses
  const walkFrames = [
    // Frame 1: Left leg forward, right arm forward
    {
      head: "😊",
      leftArm: "\\\\",
      rightArm: "/", 
      body: "|",
      leftLeg: "/",
      rightLeg: "\\\\"
    },
    // Frame 2: Mid-stride, legs closer together
    {
      head: "😊",
      leftArm: "|",
      rightArm: "|",
      body: "|", 
      leftLeg: "|",
      rightLeg: "|"
    },
    // Frame 3: Right leg forward, left arm forward  
    {
      head: "😊",
      leftArm: "/",
      rightArm: "\\\\",
      body: "|",
      leftLeg: "\\\\",
      rightLeg: "/"
    },
    // Frame 4: Mid-stride, legs closer together
    {
      head: "😊",
      leftArm: "|",
      rightArm: "|",
      body: "|",
      leftLeg: "|", 
      rightLeg: "|"
    }
  ];

  // Calculate which frame to show (4 frames cycle)
  const walkSpeed = 8; // frames per walk cycle frame
  const currentWalkFrame = Math.floor(frame / walkSpeed) % walkFrames.length;
  const character = walkFrames[currentWalkFrame];

  // Character movement across screen
  const totalDistance = ${dimensions.width} - 200;
  const position = interpolate(
    frame,
    [0, durationInFrames],
    [100, totalDistance],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  // Subtle bounce effect - character moves up and down slightly while walking
  const bounceAmount = Math.sin((frame / walkSpeed) * Math.PI) * 3;
  const baseY = ${dimensions.height / 2};

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)',
      }}
    >
      {/* Ground line */}
      <div
        style={{
          position: 'absolute',
          bottom: ${dimensions.height / 3},
          left: 0,
          right: 0,
          height: 4,
          backgroundColor: 'rgba(139, 69, 19, 0.6)',
        }}
      />
      
      {/* Character shadow */}
      <div
        style={{
          position: 'absolute',
          left: position - 30,
          bottom: ${dimensions.height / 3 - 10},
          width: 60,
          height: 8,
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '50%',
          filter: 'blur(3px)',
        }}
      />
      
      {/* Walking character */}
      <div
        style={{
          position: 'absolute',
          left: position - 40,
          top: baseY + bounceAmount,
          fontSize: 48,
          fontFamily: 'monospace',
          lineHeight: 1,
          textAlign: 'center',
          color: '#2F4F4F',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
        }}
      >
        {/* Head */}
        <div>{character.head}</div>
        
        {/* Arms and body */}
        <div style={{ position: 'relative', height: '1em' }}>
          <span style={{ position: 'absolute', left: -20 }}>{character.leftArm}</span>
          <span>{character.body}</span>
          <span style={{ position: 'absolute', right: -20 }}>{character.rightArm}</span>
        </div>
        
        {/* Legs */}
        <div style={{ position: 'relative', height: '1em' }}>
          <span style={{ position: 'absolute', left: -10 }}>{character.leftLeg}</span>
          <span style={{ position: 'absolute', right: -10 }}>{character.rightLeg}</span>
        </div>
      </div>

      {/* Progress indicator */}
      <div
        style={{
          position: 'absolute',
          top: 30,
          left: 30,
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: 15,
          borderRadius: 8,
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div>Walking Animation</div>
        <div style={{ fontSize: 14, marginTop: 5 }}>
          Frame: {currentWalkFrame + 1}/4 | Position: {Math.round(position)}px
        </div>
      </div>
    </AbsoluteFill>
  );
};`;
  }

  /**
   * Generate bounce animation code
   */
  private generateBounceAnimation(request: AnimationRequest, animationType: AnimationType): string {
    const { dimensions, duration, fps } = request;

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

  /**
   * Generate text animation code
   */
  private generateTextAnimation(request: AnimationRequest, animationType: AnimationType): string {
    const { dimensions } = request;

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

  const text = "${request.animationDesc}";
  const words = text.split(' ');
  
  // Typewriter effect
  const charsPerFrame = 2;
  const totalChars = text.length;
  const visibleChars = Math.min(frame * charsPerFrame, totalChars);
  const visibleText = text.substring(0, visibleChars);
  
  // Scale animation
  const scale = interpolate(
    frame,
    [0, 30, durationInFrames - 30, durationInFrames],
    [0.5, 1, 1, 1.2],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#1a1a2e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          fontSize: 72,
          fontWeight: 'bold',
          color: '#ffffff',
          textAlign: 'center',
          transform: \`scale(\${scale})\`,
          textShadow: '0 0 20px rgba(255, 255, 255, 0.5)',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        {visibleText}
        {frame % 30 < 15 && visibleChars < totalChars && (
          <span style={{ opacity: 0.7 }}>|</span>
        )}
      </div>
    </AbsoluteFill>
  );
};`;
  }

  /**
   * Generate rotation animation code
   */
  private generateRotationAnimation(request: AnimationRequest, animationType: AnimationType): string {
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

  const rotation = interpolate(
    frame,
    [0, durationInFrames],
    [0, 720], // 2 full rotations
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#2c3e50',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: 200,
          height: 200,
          background: 'linear-gradient(45deg, #e74c3c, #f39c12)',
          borderRadius: 20,
          transform: \`rotate(\${rotation}deg)\`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 48,
          color: 'white',
          fontWeight: 'bold',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
        }}
      >
        ⭐
      </div>
    </AbsoluteFill>
  );
};`;
  }

  /**
   * Generate fade animation code
   */
  private generateFadeAnimation(request: AnimationRequest, animationType: AnimationType): string {
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

  const fadeIn = interpolate(
    frame,
    [0, durationInFrames / 3],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const fadeOut = interpolate(
    frame,
    [durationInFrames * 2/3, durationInFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const opacity = Math.min(fadeIn, fadeOut);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#34495e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          fontSize: 64,
          color: '#ecf0f1',
          fontWeight: 'bold',
          opacity,
          textAlign: 'center',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        ${request.animationDesc}
      </div>
    </AbsoluteFill>
  );
};`;
  }

  /**
   * Generate slide animation code
   */
  private generateSlideAnimation(request: AnimationRequest, animationType: AnimationType): string {
    const { dimensions } = request;

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

  const slideX = interpolate(
    frame,
    [0, durationInFrames],
    [-${dimensions.width}, ${dimensions.width}],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#16a085',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          fontSize: 56,
          color: 'white',
          fontWeight: 'bold',
          transform: \`translateX(\${slideX}px)\`,
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        ${request.animationDesc}
      </div>
    </AbsoluteFill>
  );
};`;
  }
}