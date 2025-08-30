"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnimationGeneratorService = void 0;
// Intelligent animation generation service
const logger_js_1 = require("../utils/logger.js");
const intelligent_compositions_js_1 = require("../templates/intelligent-compositions.js");
class AnimationGeneratorService {
    logger = (0, logger_js_1.getLogger)().service('AnimationGenerator');
    intelligentGenerator = new intelligent_compositions_js_1.IntelligentCompositionGenerator();
    constructor() {
        this.logger.info('Animation generator service initialized');
    }
    /**
     * Generate custom animation code based on description
     */
    async generateAnimation(request) {
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
            let compositionCode = null;
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
            }
            else {
                // SAFEGUARD: ALWAYS use intelligent generation as fallback
                // This ensures NO animation request ever returns empty code
                this.logger.info('Using intelligent generation for unrecognized animation type', {
                    type: animationType.type,
                    description: request.animationDesc
                });
                try {
                    const intelligentResult = this.intelligentGenerator.generateComposition(request, animationType);
                    if (intelligentResult.success && intelligentResult.compositionCode) {
                        this.logger.info('Intelligent generation succeeded', { type: animationType.type });
                        return intelligentResult;
                    }
                    else {
                        throw new Error('Intelligent generation failed to produce code');
                    }
                }
                catch (intelligentError) {
                    // FINAL SAFEGUARD: If even intelligent generation fails, 
                    // return a working minimal animation instead of empty code
                    this.logger.error('Intelligent generation failed, using minimal fallback', {
                        error: intelligentError instanceof Error ? intelligentError.message : String(intelligentError)
                    });
                    const minimalAnimation = this.generateMinimalWorkingAnimation(request);
                    return {
                        compositionCode: minimalAnimation,
                        animationType: { type: 'unknown', confidence: 0.1, keywords: [] },
                        success: true,
                        fallbackToTemplate: true,
                    };
                }
            }
        }
        catch (error) {
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
    parseAnimationType(description) {
        const desc = description.toLowerCase();
        const words = desc.split(/\s+/);
        // Define animation patterns with keywords and confidence scoring
        const patterns = [
            {
                type: 'walk-cycle',
                keywords: ['walk', 'walking', 'man', 'person', 'character', 'step', 'stride', 'cycle'],
                requiredKeywords: ['walk'],
                confidence: 0.9,
            },
            {
                type: 'bounce',
                keywords: ['bounce', 'bouncing', 'ball', 'jump', 'jumping', 'hop'],
                requiredKeywords: ['bounce', 'ball'],
                confidence: 0.8,
            },
            {
                type: 'text-animation',
                keywords: ['text', 'title', 'word', 'letter', 'typewriter', 'typing'],
                requiredKeywords: ['text'],
                confidence: 0.7,
            },
            {
                type: 'rotation',
                keywords: ['rotate', 'rotating', 'spin', 'spinning', 'turn', 'turning'],
                requiredKeywords: ['rotate', 'spin'],
                confidence: 0.8,
            },
            {
                type: 'fade',
                keywords: ['fade', 'fading', 'appear', 'disappear', 'opacity'],
                requiredKeywords: ['fade'],
                confidence: 0.7,
            },
            {
                type: 'slide',
                keywords: ['slide', 'sliding', 'move', 'moving', 'glide'],
                requiredKeywords: ['slide'],
                confidence: 0.7,
            },
        ];
        // Score each pattern
        let bestMatch = { type: 'unknown', confidence: 0, keywords: [] };
        for (const pattern of patterns) {
            let score = 0;
            const foundKeywords = [];
            // Check for required keywords
            const hasRequired = pattern.requiredKeywords.some(keyword => {
                const found = desc.includes(keyword);
                if (found)
                    foundKeywords.push(keyword);
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
    extractElements(description) {
        const elements = [];
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
    generateWalkCycle(request, animationType) {
        const { dimensions, duration, fps } = request;
        const durationInFrames = Math.round(duration * fps);
        return `import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

// Helper to ensure interpolation ranges are valid (prevents Remotion errors)
function validateRange(range) {
  if (range.length <= 1) return range;
  const valid = [...range];
  for (let i = 1; i < valid.length; i++) {
    if (valid[i] <= valid[i-1]) {
      valid[i] = valid[i-1] + 1;
    }
  }
  return valid;
}

// Safe interpolate wrapper
function safeInterpolate(frame, inputRange, outputRange, options) {
  const validInput = validateRange(inputRange);
  return interpolate(frame, validInput, outputRange, options);
}

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
  const position = safeInterpolate(
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
    generateBounceAnimation(request, animationType) {
        const { dimensions, duration, fps } = request;
        return `import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

// Helper to ensure interpolation ranges are valid (prevents Remotion errors)
function validateRange(range) {
  if (range.length <= 1) return range;
  const valid = [...range];
  for (let i = 1; i < valid.length; i++) {
    if (valid[i] <= valid[i-1]) {
      valid[i] = valid[i-1] + 1;
    }
  }
  return valid;
}

// Safe interpolate wrapper
function safeInterpolate(frame, inputRange, outputRange, options) {
  const validInput = validateRange(inputRange);
  return interpolate(frame, validInput, outputRange, options);
}

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
  const x = safeInterpolate(frame, [0, totalFrames], [100, ${dimensions.width} - 100], { extrapolateRight: 'clamp' });
  
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
    generateTextAnimation(request, animationType) {
        const { dimensions } = request;
        return `import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

// Helper to ensure interpolation ranges are valid (prevents Remotion errors)
function validateRange(range) {
  if (range.length <= 1) return range;
  const valid = [...range];
  for (let i = 1; i < valid.length; i++) {
    if (valid[i] <= valid[i-1]) {
      valid[i] = valid[i-1] + 1;
    }
  }
  return valid;
}

// Safe interpolate wrapper
function safeInterpolate(frame, inputRange, outputRange, options) {
  const validInput = validateRange(inputRange);
  return interpolate(frame, validInput, outputRange, options);
}

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
  const scale = safeInterpolate(
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
    generateRotationAnimation(request, animationType) {
        return `import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

// Helper to ensure interpolation ranges are valid (prevents Remotion errors)
function validateRange(range) {
  if (range.length <= 1) return range;
  const valid = [...range];
  for (let i = 1; i < valid.length; i++) {
    if (valid[i] <= valid[i-1]) {
      valid[i] = valid[i-1] + 1;
    }
  }
  return valid;
}

// Safe interpolate wrapper
function safeInterpolate(frame, inputRange, outputRange, options) {
  const validInput = validateRange(inputRange);
  return interpolate(frame, validInput, outputRange, options);
}

export const VideoComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const rotation = safeInterpolate(
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
    generateFadeAnimation(request, animationType) {
        return `import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

// Helper to ensure interpolation ranges are valid (prevents Remotion errors)
function validateRange(range) {
  if (range.length <= 1) return range;
  const valid = [...range];
  for (let i = 1; i < valid.length; i++) {
    if (valid[i] <= valid[i-1]) {
      valid[i] = valid[i-1] + 1;
    }
  }
  return valid;
}

// Safe interpolate wrapper
function safeInterpolate(frame, inputRange, outputRange, options) {
  const validInput = validateRange(inputRange);
  return interpolate(frame, validInput, outputRange, options);
}

export const VideoComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const fadeIn = safeInterpolate(
    frame,
    [0, durationInFrames / 3],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const fadeOut = safeInterpolate(
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
    generateSlideAnimation(request, animationType) {
        const { dimensions } = request;
        return `import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

// Helper to ensure interpolation ranges are valid (prevents Remotion errors)
function validateRange(range) {
  if (range.length <= 1) return range;
  const valid = [...range];
  for (let i = 1; i < valid.length; i++) {
    if (valid[i] <= valid[i-1]) {
      valid[i] = valid[i-1] + 1;
    }
  }
  return valid;
}

// Safe interpolate wrapper
function safeInterpolate(frame, inputRange, outputRange, options) {
  const validInput = validateRange(inputRange);
  return interpolate(frame, validInput, outputRange, options);
}

export const VideoComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const slideX = safeInterpolate(
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
    /**
     * CRITICAL SAFEGUARD: Generate a minimal working animation that NEVER fails
     * This ensures no animation request ever results in empty code
     * DO NOT REMOVE OR DISABLE - This prevents the "undefined component" error
     */
    generateMinimalWorkingAnimation(request) {
        const { animationDesc, duration, fps } = request;
        this.logger.warn('Using minimal safeguard animation - intelligent generation failed', {
            description: animationDesc
        });
        return `import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

// Safe interpolate wrapper - ensures all values are numbers
function safeInterpolate(frame: number, inputRange: number[], outputRange: number[], options?: any): number {
  const safeOutput = outputRange.map(v => (typeof v === 'number' && !isNaN(v)) ? v : 0);
  return interpolate(frame, inputRange, safeOutput, options);
}

export const VideoComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  
  // Ensure dimensions are always valid numbers
  const videoWidth = width || 1920;
  const videoHeight = height || 1080;
  const totalFrames = durationInFrames || ${duration * fps};
  
  // Simple fade-in animation that always works
  const opacity = safeInterpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
  
  // Simple movement animation  
  const x = safeInterpolate(frame, [0, totalFrames], [10, 90], { extrapolateRight: 'clamp' });
  
  return (
    <AbsoluteFill style={{ 
      backgroundColor: '#87CEEB',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        position: 'absolute',
        left: \`\${x}%\`,
        top: '50%',
        transform: 'translate(-50%, -50%)',
        opacity,
        fontSize: 48,
        color: '#333',
        textAlign: 'center',
        padding: 20,
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 10
      }}>
        🎬 {animationDesc}
      </div>
    </AbsoluteFill>
  );
};`;
    }
}
exports.AnimationGeneratorService = AnimationGeneratorService;
//# sourceMappingURL=animation-generator.js.map