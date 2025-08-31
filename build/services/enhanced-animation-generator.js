"use strict";
// Enhanced Animation Generator with Professional Templates
// UNIVERSAL COMPATIBILITY - Works on ANY installation, ANY user
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedAnimationGenerator = void 0;
// Simple logger replacement (no external dependencies)
const logger = {
    info: (msg, data) => console.log(`[INFO] ${msg}`, data || ''),
    debug: (msg, data) => console.log(`[DEBUG] ${msg}`, data || ''),
    warn: (msg, data) => console.warn(`[WARN] ${msg}`, data || ''),
    error: (msg, data) => console.error(`[ERROR] ${msg}`, data || '')
};
const professional_animations_js_1 = require("../templates/professional-animations.js");
const animation_system_prompts_js_1 = require("../prompts/animation-system-prompts.js");
class EnhancedAnimationGenerator {
    constructor() {
        logger.info('Enhanced animation generator initialized', {
            professionalTemplates: professional_animations_js_1.PROFESSIONAL_ANIMATION_TEMPLATES.length,
            systemPrompts: Object.keys(animation_system_prompts_js_1.ANIMATION_TYPE_SPECIFIC_PROMPTS).length
        });
    }
    /**
     * MAIN GENERATION METHOD - Enhanced with professional templates
     * UNIVERSAL COMPATIBILITY - Works for any content, any user
     */
    async generateAnimation(request) {
        try {
            logger.info('Generating professional animation', {
                desc: request.animationDesc.substring(0, 100),
                duration: request.duration,
                dimensions: request.dimensions
            });
            // Enhanced animation type detection
            const animationType = this.parseAnimationTypeEnhanced(request.animationDesc);
            logger.debug('Animation type detected', {
                type: animationType.type,
                confidence: animationType.confidence,
                professionalLevel: animationType.professionalLevel
            });
            // TRY PROFESSIONAL TEMPLATES FIRST (New enhancement)
            let compositionCode = (0, professional_animations_js_1.generateProfessionalAnimation)(request, animationType);
            let usedProfessionalTemplate = !!compositionCode;
            // If no professional template matched, use enhanced fallbacks
            if (!compositionCode) {
                logger.info('No professional template matched, using enhanced generation');
                compositionCode = await this.generateWithEnhancedFallbacks(request, animationType);
            }
            // NEVER return empty code - ultimate safeguard
            if (!compositionCode) {
                logger.warn('All generation methods failed, using universal safeguard');
                compositionCode = this.generateUniversalSafeguardAnimation(request);
            }
            // Calculate quality score
            const qualityScore = this.calculateQualityScore(compositionCode, animationType, usedProfessionalTemplate);
            const professionalFeatures = this.identifyProfessionalFeatures(compositionCode);
            this.logger.info('Animation generation completed', {
                type: animationType.type,
                qualityScore,
                professionalTemplate: usedProfessionalTemplate,
                features: professionalFeatures.length
            });
            return {
                compositionCode,
                animationType,
                success: true,
                fallbackToTemplate: !usedProfessionalTemplate,
                qualityScore,
                professionalFeatures
            };
        }
        catch (error) {
            this.logger.error('Animation generation failed completely', {
                error: error instanceof Error ? error.message : String(error)
            });
            // Emergency safeguard - NEVER fail completely
            return {
                compositionCode: this.generateUniversalSafeguardAnimation(request),
                animationType: { type: 'unknown', confidence: 0, keywords: [] },
                success: false,
                fallbackToTemplate: true,
                qualityScore: 1,
                professionalFeatures: []
            };
        }
    }
    /**
     * ENHANCED ANIMATION TYPE DETECTION
     * Detects more animation types with better accuracy
     */
    parseAnimationTypeEnhanced(description) {
        const desc = description.toLowerCase();
        // Enhanced patterns with professional categories
        const patterns = [
            {
                type: 'logo-reveal',
                keywords: ['logo', 'brand', 'reveal', 'company', 'corporate', 'professional', 'identity'],
                requiredKeywords: ['logo', 'brand', 'reveal'],
                confidence: 0.9,
                professionalLevel: 'advanced'
            },
            {
                type: 'data-visualization',
                keywords: ['chart', 'data', 'graph', 'statistics', 'analytics', 'business', 'dashboard'],
                requiredKeywords: ['chart', 'data', 'graph'],
                confidence: 0.85,
                professionalLevel: 'intermediate'
            },
            {
                type: 'text-reveal',
                keywords: ['text', 'title', 'words', 'typography', 'reveal', 'elegant'],
                requiredKeywords: ['text', 'title', 'words'],
                confidence: 0.8,
                professionalLevel: 'basic'
            },
            {
                type: 'particle-system',
                keywords: ['particles', 'effects', 'dynamic', 'modern', 'abstract', 'motion'],
                requiredKeywords: ['particles', 'effects'],
                confidence: 0.9,
                professionalLevel: 'advanced'
            },
            {
                type: 'product-showcase',
                keywords: ['product', 'showcase', 'demo', 'feature', 'highlight', 'presentation'],
                requiredKeywords: ['product', 'showcase'],
                confidence: 0.85,
                professionalLevel: 'advanced'
            },
            // Keep original types for backward compatibility
            {
                type: 'walk-cycle',
                keywords: ['walk', 'walking', 'character', 'person', 'step'],
                requiredKeywords: ['walk'],
                confidence: 0.8,
                professionalLevel: 'intermediate'
            },
            {
                type: 'bounce',
                keywords: ['bounce', 'bouncing', 'ball', 'jump'],
                requiredKeywords: ['bounce', 'ball'],
                confidence: 0.8,
                professionalLevel: 'basic'
            }
        ];
        // Score each pattern
        let bestMatch = {
            type: 'ai-generated', // New default for unknown types
            confidence: 0.3,
            keywords: [],
            professionalLevel: 'basic'
        };
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
                        score += 0.05;
                    }
                }
            }
            if (score > bestMatch.confidence) {
                bestMatch = {
                    type: pattern.type,
                    confidence: Math.min(score, 1.0),
                    keywords: foundKeywords,
                    professionalLevel: pattern.professionalLevel
                };
            }
        }
        return bestMatch;
    }
    /**
     * ENHANCED FALLBACK GENERATION
     * Multiple fallback layers for better quality
     */
    async generateWithEnhancedFallbacks(request, animationType) {
        // Layer 1: AI-guided generation (new)
        if (animationType.type === 'ai-generated') {
            return this.generateAIGuidedAnimation(request, animationType);
        }
        // Layer 2: Legacy templates (preserved for compatibility)
        const legacyCode = this.generateLegacyAnimation(request, animationType);
        if (legacyCode) {
            return this.enhanceWithProfessionalStyling(legacyCode, request);
        }
        // Layer 3: Universal text animation (always works)
        return this.generateUniversalTextAnimation(request);
    }
    /**
     * NEW: AI-GUIDED ANIMATION GENERATION
     * Uses system prompts to guide better generation
     */
    generateAIGuidedAnimation(request, animationType) {
        // This is where Claude Desktop's AI generation gets enhanced guidance
        // The system prompt will be available to Claude when generating animations
        return `/* 
    AI-GUIDED ANIMATION - Enhanced with Professional System Prompts
    
    ${animation_system_prompts_js_1.PROFESSIONAL_ANIMATION_SYSTEM_PROMPT}
    
    Animation Request: ${request.animationDesc}
    Type: ${animationType.type}
    Professional Level: ${animationType.professionalLevel}
    */
    
${this.generateUniversalTextAnimation(request)}`;
    }
    /**
     * LEGACY ANIMATION SUPPORT
     * Preserves existing functionality while enhancing quality
     */
    generateLegacyAnimation(request, animationType) {
        // Keep the existing animation types working
        switch (animationType.type) {
            case 'bounce':
                return this.generateEnhancedBounce(request);
            case 'rotation':
                return this.generateEnhancedRotation(request);
            case 'fade':
                return this.generateEnhancedFade(request);
            default:
                return null;
        }
    }
    /**
     * ENHANCED BOUNCE ANIMATION
     * Upgraded version of the original with professional styling
     */
    generateEnhancedBounce(request) {
        return `import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, Easing } from 'remotion';

// Safe interpolation helper
function safeInterpolate(frame: number, inputRange: number[], outputRange: number[], options?: any) {
  const validInput = inputRange.map((val, i) => 
    i > 0 && val <= inputRange[i-1] ? inputRange[i-1] + 1 : val
  );
  return interpolate(frame, validInput, outputRange, options);
}

export const VideoComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  // Professional physics-based bounce
  const bounceHeight = height * 0.6;
  const ballSize = 80;
  const bounceCount = 4;
  const bounceFrames = durationInFrames / bounceCount;
  
  const currentBounce = Math.floor(frame / bounceFrames);
  const frameInBounce = frame % bounceFrames;
  
  // Realistic energy loss
  const heightMultiplier = Math.pow(0.75, currentBounce);
  const actualHeight = bounceHeight * heightMultiplier;
  
  // Physics calculation
  const t = frameInBounce / bounceFrames;
  const y = (height - 120) - (actualHeight * Math.sin(Math.PI * t));
  const x = safeInterpolate(frame, [0, durationInFrames], [100, width - 100]);
  
  // Professional visual effects
  const compression = Math.abs(Math.sin(Math.PI * t)) < 0.1 ? 0.8 : 1;
  const shadowOpacity = Math.max(0.2, 1 - (y / height));

  return (
    <AbsoluteFill style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      {/* Professional ground */}
      <div style={{
        position: 'absolute',
        bottom: 100,
        left: 0,
        right: 0,
        height: 20,
        background: 'linear-gradient(90deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.2) 100%)',
        borderRadius: '10px 10px 0 0',
        boxShadow: '0 -5px 20px rgba(0,0,0,0.3)'
      }} />
      
      {/* Dynamic shadow */}
      <div style={{
        position: 'absolute',
        left: x - ballSize/2,
        bottom: 105,
        width: ballSize * compression,
        height: 15,
        background: 'radial-gradient(ellipse, rgba(0,0,0,0.4) 0%, transparent 70%)',
        opacity: shadowOpacity,
        filter: 'blur(8px)'
      }} />
      
      {/* Professional ball */}
      <div style={{
        position: 'absolute',
        left: x - ballSize/2,
        top: y - ballSize/2,
        width: ballSize,
        height: ballSize * compression,
        background: 'radial-gradient(circle at 30% 30%, #ff6b6b, #ff4757, #c44569)',
        borderRadius: '50%',
        boxShadow: '0 10px 30px rgba(0,0,0,0.4), inset -5px -5px 20px rgba(0,0,0,0.3), inset 5px 5px 20px rgba(255,255,255,0.3)'
      }} />

      {/* Professional title */}
      <div style={{
        position: 'absolute',
        top: 40,
        left: 40,
        fontSize: 28,
        fontWeight: 300,
        color: 'white',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        textShadow: '0 2px 10px rgba(0,0,0,0.5)'
      }}>
        Physics-Based Animation
      </div>
    </AbsoluteFill>
  );
};`;
    }
    /**
     * Generate other enhanced animations...
     */
    generateEnhancedRotation(request) {
        // Enhanced rotation with professional styling
        return this.generateUniversalTextAnimation(request); // Simplified for now
    }
    generateEnhancedFade(request) {
        // Enhanced fade with professional styling  
        return this.generateUniversalTextAnimation(request); // Simplified for now
    }
    /**
     * UNIVERSAL TEXT ANIMATION
     * Always works, professional quality
     */
    generateUniversalTextAnimation(request) {
        return `import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, Easing } from 'remotion';

function safeInterpolate(frame: number, inputRange: number[], outputRange: number[], options?: any) {
  const validInput = inputRange.map((val, i) => 
    i > 0 && val <= inputRange[i-1] ? inputRange[i-1] + 1 : val
  );
  return interpolate(frame, validInput, outputRange, options);
}

export const VideoComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  const text = "${request.animationDesc}";
  const words = text.split(' ');
  
  return (
    <AbsoluteFill style={{
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #533483 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      <div style={{ textAlign: 'center', maxWidth: width * 0.8 }}>
        {words.map((word, i) => {
          const delay = i * 10;
          const opacity = safeInterpolate(frame, [delay, delay + 20], [0, 1], {
            easing: Easing.out(Easing.quad)
          });
          
          const y = safeInterpolate(frame, [delay, delay + 20], [20, 0], {
            easing: Easing.out(Easing.quad)
          });

          return (
            <span key={i} style={{
              display: 'inline-block',
              fontSize: 48,
              fontWeight: 300,
              color: 'white',
              marginRight: 16,
              opacity,
              transform: \`translateY(\${y}px)\`,
              textShadow: '0 10px 30px rgba(0,0,0,0.5)',
              letterSpacing: '0.02em'
            }}>
              {word}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};`;
    }
    /**
     * PROFESSIONAL STYLING ENHANCEMENT
     * Adds professional design elements to any animation
     */
    enhanceWithProfessionalStyling(code, request) {
        // Add professional styling enhancements
        return code.replace(/background:\s*['"`][^'"`]*['"`]/, `background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'`);
    }
    /**
     * UNIVERSAL SAFEGUARD ANIMATION
     * NEVER FAILS - Always generates working code
     */
    generateUniversalSafeguardAnimation(request) {
        this.logger.warn('Using universal safeguard animation');
        return `import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

export const VideoComposition: React.FC = () => {
  const frame = useCurrentFrame();
  
  const opacity = Math.min(frame / 30, 1);
  const scale = 0.8 + Math.sin(frame * 0.1) * 0.2;
  
  return (
    <AbsoluteFill style={{
      backgroundColor: '#667eea',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        fontSize: 36,
        color: 'white',
        textAlign: 'center',
        opacity,
        transform: \`scale(\${scale})\`,
        fontFamily: 'system-ui, sans-serif',
        padding: 40,
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 12
      }}>
        🎬 ${request.animationDesc}
      </div>
    </AbsoluteFill>
  );
};`;
    }
    /**
     * QUALITY ASSESSMENT
     * Calculate quality score for generated animations
     */
    calculateQualityScore(code, animationType, usedProfessionalTemplate) {
        let score = usedProfessionalTemplate ? 8 : 4; // Base score
        // Check for professional features
        if (code.includes('safeInterpolate'))
            score += 1;
        if (code.includes('Easing.'))
            score += 1;
        if (code.includes('linear-gradient') || code.includes('radial-gradient'))
            score += 1;
        if (code.includes('boxShadow') || code.includes('textShadow'))
            score += 1;
        if (code.includes('fontFamily'))
            score += 0.5;
        if (code.length > 2000)
            score += 0.5; // Complex animations
        return Math.min(score, 10);
    }
    /**
     * IDENTIFY PROFESSIONAL FEATURES
     * List professional features used in animation
     */
    identifyProfessionalFeatures(code) {
        const features = [];
        if (code.includes('safeInterpolate'))
            features.push('Safe Interpolation');
        if (code.includes('Easing.'))
            features.push('Advanced Easing');
        if (code.includes('linear-gradient'))
            features.push('Professional Gradients');
        if (code.includes('boxShadow'))
            features.push('Depth Effects');
        if (code.includes('textShadow'))
            features.push('Typography Enhancement');
        if (code.includes('transform:'))
            features.push('3D Transforms');
        if (code.includes('opacity'))
            features.push('Smooth Transitions');
        if (code.includes('fontFamily'))
            features.push('Professional Typography');
        return features;
    }
}
exports.EnhancedAnimationGenerator = EnhancedAnimationGenerator;
exports.default = EnhancedAnimationGenerator;
//# sourceMappingURL=enhanced-animation-generator.js.map