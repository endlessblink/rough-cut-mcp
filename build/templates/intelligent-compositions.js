import { combinePrimitives } from './animation-primitives.js';
import { getLogger } from '../utils/logger.js';
export class IntelligentCompositionGenerator {
    logger = getLogger().service('IntelligentComposition');
    templates = [];
    constructor() {
        this.initializeTemplates();
        this.logger.info('Intelligent composition generator initialized', {
            templateCount: this.templates.length
        });
    }
    /**
     * Generate composition using intelligent primitive combination
     */
    generateComposition(request, animationType) {
        try {
            this.logger.info('Generating intelligent composition', {
                type: animationType.type,
                confidence: animationType.confidence
            });
            // Find best matching template
            const template = this.findBestTemplate(animationType);
            if (!template) {
                this.logger.warn('No suitable template found for animation type', {
                    type: animationType.type
                });
                return {
                    compositionCode: '',
                    animationType,
                    success: false,
                    fallbackToTemplate: true,
                };
            }
            // Generate composition using template and primitives
            const compositionCode = this.buildComposition(request, animationType, template);
            this.logger.info('Intelligent composition generated successfully', {
                template: template.name,
                primitiveCount: template.primitives.length
            });
            return {
                compositionCode,
                animationType,
                success: true,
                fallbackToTemplate: false,
            };
        }
        catch (error) {
            this.logger.error('Intelligent composition generation failed', {
                error: error instanceof Error ? error.message : String(error)
            });
            return {
                compositionCode: '',
                animationType,
                success: false,
                fallbackToTemplate: true,
            };
        }
    }
    /**
     * Initialize built-in composition templates
     */
    initializeTemplates() {
        this.templates = [
            {
                name: 'character-walk-cycle',
                description: 'Walking character with realistic movement',
                matchKeywords: ['walk', 'walking', 'character', 'man', 'person'],
                primitives: [
                    { name: 'walk-cycle', required: true },
                    { name: 'fade-transition', required: false, params: { fadeInDuration: 20, fadeOutDuration: 20 } }
                ],
                baseTemplate: this.getCharacterWalkTemplate(),
                customizations: (request, animationType) => ({
                    characterType: animationType.elements?.includes('emoji') ? 'emoji' : 'ascii',
                    walkSpeed: request.duration > 10 ? 6 : 8, // Slower for longer videos
                })
            },
            {
                name: 'bouncing-object',
                description: 'Physics-based bouncing animation',
                matchKeywords: ['bounce', 'ball', 'jump', 'hop'],
                primitives: [
                    { name: 'physics-bounce', required: true },
                    { name: 'scale-animation', required: false, params: { bounceEffect: true } }
                ],
                baseTemplate: this.getBouncingObjectTemplate(),
                customizations: (request, animationType) => ({
                    objectSize: animationType.elements?.includes('ball') ? 60 : 40,
                    bounceCount: Math.max(2, Math.floor(request.duration / 3)),
                })
            },
            {
                name: 'rotating-element',
                description: 'Smooth rotation with customizable speed',
                matchKeywords: ['rotate', 'spin', 'turn', 'spinning'],
                primitives: [
                    { name: 'smooth-rotation', required: true },
                    { name: 'scale-animation', required: false, params: { startScale: 0.8, endScale: 1.2 } }
                ],
                baseTemplate: this.getRotatingElementTemplate(),
                customizations: (request, animationType) => ({
                    rotations: Math.max(1, Math.floor(request.duration / 5)),
                    direction: animationType.keywords.includes('counter') ? 'counterclockwise' : 'clockwise',
                })
            },
            {
                name: 'text-typewriter',
                description: 'Typewriter text effect with customizable speed',
                matchKeywords: ['text', 'type', 'writing', 'title'],
                primitives: [
                    { name: 'typewriter-text', required: true },
                    { name: 'scale-animation', required: false, params: { startScale: 0.9, endScale: 1.1 } }
                ],
                baseTemplate: this.getTextTypewriterTemplate(),
                customizations: (request, animationType) => ({
                    charsPerFrame: request.duration > 10 ? 1 : 2,
                    text: request.animationDesc,
                })
            },
            {
                name: 'fade-transition',
                description: 'Smooth fade in/out animation',
                matchKeywords: ['fade', 'appear', 'disappear', 'transition'],
                primitives: [
                    { name: 'fade-transition', required: true },
                    { name: 'scale-animation', required: false }
                ],
                baseTemplate: this.getFadeTransitionTemplate(),
                customizations: (request, animationType) => ({
                    fadeInDuration: Math.min(60, request.duration * request.fps * 0.2),
                    fadeOutDuration: Math.min(60, request.duration * request.fps * 0.2),
                })
            },
            {
                name: 'sliding-element',
                description: 'Object sliding across screen',
                matchKeywords: ['slide', 'move', 'glide', 'sweep'],
                primitives: [
                    { name: 'path-following', required: true, params: { pathType: 'linear' } },
                    { name: 'fade-transition', required: false }
                ],
                baseTemplate: this.getSlidingElementTemplate(),
                customizations: (request, animationType) => {
                    const isVertical = animationType.keywords.some(k => ['up', 'down', 'vertical'].includes(k));
                    return {
                        pathType: isVertical ? 'vertical' : 'linear',
                        startPos: isVertical ? { x: 50, y: 100 } : { x: 0, y: 50 },
                        endPos: isVertical ? { x: 50, y: 0 } : { x: 100, y: 50 },
                    };
                }
            }
        ];
    }
    /**
     * Find best matching template for animation type
     */
    findBestTemplate(animationType) {
        let bestMatch = null;
        let bestScore = 0;
        for (const template of this.templates) {
            let score = 0;
            // Check for keyword matches
            for (const keyword of animationType.keywords) {
                if (template.matchKeywords.some(mk => mk.includes(keyword) || keyword.includes(mk))) {
                    score += 1;
                }
            }
            // Boost score based on animation type confidence
            if (score > 0) {
                score *= animationType.confidence;
            }
            if (score > bestScore) {
                bestScore = score;
                bestMatch = template;
            }
        }
        this.logger.debug('Template matching completed', {
            bestMatch: bestMatch?.name,
            score: bestScore
        });
        return bestMatch;
    }
    /**
     * Build composition using template and primitives
     */
    buildComposition(request, animationType, template) {
        // Get base parameters
        const baseParams = {
            dimensions: request.dimensions,
            duration: request.duration,
            fps: request.fps,
            durationInFrames: Math.round(request.duration * request.fps),
        };
        // Apply template customizations
        const customizations = template.customizations
            ? template.customizations(request, animationType)
            : {};
        // Combine primitive code
        const primitiveCode = combinePrimitives(template.primitives.map(p => ({ name: p.name, params: { ...p.params, ...customizations } })), baseParams);
        // Build final composition
        const finalCode = template.baseTemplate
            .replace('{{PRIMITIVE_CODE}}', primitiveCode)
            .replace('{{ANIMATION_DESC}}', request.animationDesc)
            .replace('{{DIMENSIONS_WIDTH}}', request.dimensions.width.toString())
            .replace('{{DIMENSIONS_HEIGHT}}', request.dimensions.height.toString())
            .replace('{{DURATION}}', request.duration.toString())
            .replace('{{FPS}}', request.fps.toString());
        return finalCode;
    }
    // Template definitions
    getCharacterWalkTemplate() {
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

  {{PRIMITIVE_CODE}}

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
          bottom: {{DIMENSIONS_HEIGHT}} / 3,
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
          bottom: {{DIMENSIONS_HEIGHT}} / 3 - 10,
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
          opacity: typeof opacity !== 'undefined' ? opacity : 1,
        }}
      >
        <div>{character.head}</div>
        <div style={{ position: 'relative', height: '1em' }}>
          <span style={{ position: 'absolute', left: -20 }}>{character.leftArm}</span>
          <span>{character.body}</span>
          <span style={{ position: 'absolute', right: -20 }}>{character.rightArm}</span>
        </div>
        <div style={{ position: 'relative', height: '1em' }}>
          <span style={{ position: 'absolute', left: -10 }}>{character.leftLeg}</span>
          <span style={{ position: 'absolute', right: -10 }}>{character.rightLeg}</span>
        </div>
      </div>

      {/* Animation info */}
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
        <div>{{ANIMATION_DESC}}</div>
        <div style={{ fontSize: 14, marginTop: 5 }}>
          Frame: {currentWalkFrame + 1}/4 | Position: {Math.round(position)}px
        </div>
      </div>
    </AbsoluteFill>
  );
};`;
    }
    getBouncingObjectTemplate() {
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

  {{PRIMITIVE_CODE}}

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
      
      {/* Object shadow */}
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
      
      {/* Bouncing object */}
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
          transform: typeof scale !== 'undefined' ? \`scale(\${scale})\` : 'none',
        }}
      />
    </AbsoluteFill>
  );
};`;
    }
    getRotatingElementTemplate() {
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

  {{PRIMITIVE_CODE}}

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
          transform: \`rotate(\${rotation}deg)\` + (typeof scale !== 'undefined' ? \` scale(\${scale})\` : ''),
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
    getTextTypewriterTemplate() {
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

  {{PRIMITIVE_CODE}}

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
          transform: typeof scale !== 'undefined' ? \`scale(\${scale})\` : 'none',
          textShadow: '0 0 20px rgba(255, 255, 255, 0.5)',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        {visibleText}
        {cursor && (
          <span style={{ opacity: 0.7 }}>{cursor}</span>
        )}
      </div>
    </AbsoluteFill>
  );
};`;
    }
    getFadeTransitionTemplate() {
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

  {{PRIMITIVE_CODE}}

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
          transform: typeof scale !== 'undefined' ? \`scale(\${scale})\` : 'none',
        }}
      >
        {{ANIMATION_DESC}}
      </div>
    </AbsoluteFill>
  );
};`;
    }
    getSlidingElementTemplate() {
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

  {{PRIMITIVE_CODE}}

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
          position: 'absolute',
          left: x,
          top: y,
          transform: 'translate(-50%, -50%)' + (typeof scale !== 'undefined' ? \` scale(\${scale})\` : ''),
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
          fontFamily: 'Arial, sans-serif',
          opacity: typeof opacity !== 'undefined' ? opacity : 1,
        }}
      >
        {{ANIMATION_DESC}}
      </div>
    </AbsoluteFill>
  );
};`;
    }
}
//# sourceMappingURL=intelligent-compositions.js.map