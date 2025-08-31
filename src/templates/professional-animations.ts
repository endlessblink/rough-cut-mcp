// Professional Animation Templates - UNIVERSAL COMPATIBILITY
// Works on ANY system, ANY user, ANY installation

import { AnimationRequest, AnimationType } from '../services/animation-generator.js';
import { UniversalDesignUtils } from '../config/design-system.js';

export interface ProfessionalAnimationTemplate {
  name: string;
  description: string;
  keywords: string[];
  difficulty: 'basic' | 'intermediate' | 'advanced';
  generateCode: (request: AnimationRequest, animationType: AnimationType) => string;
}

// 🎨 UNIVERSAL SAFE HELPERS - Work on any system
const generateSafeInterpolation = () => `
// Universal safe interpolation - works on all systems
function safeInterpolate(frame: number, inputRange: number[], outputRange: number[], options?: any) {
  // Ensure input range is valid (no duplicates, ascending order)
  const validInput = inputRange.map((val, i) => {
    if (i === 0) return val;
    return val <= inputRange[i-1] ? inputRange[i-1] + 1 : val;
  });
  return interpolate(frame, validInput, outputRange, options);
}

// Universal smooth step function
function smoothStep(t: number): number {
  return t * t * (3 - 2 * t);
}

// Universal oscillation function
function oscillate(frame: number, frequency: number, amplitude: number): number {
  return Math.sin(frame * frequency * Math.PI / 180) * amplitude;
}
`;

const generateUniversalImports = () => `
import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  Easing
} from 'remotion';
`;

// 🚀 PROFESSIONAL ANIMATION TEMPLATES
export const PROFESSIONAL_ANIMATION_TEMPLATES: ProfessionalAnimationTemplate[] = [
  
  // 1. SOPHISTICATED LOGO REVEAL
  {
    name: 'logo-reveal',
    description: 'Professional logo reveal with particles and light effects',
    keywords: ['logo', 'reveal', 'brand', 'company', 'professional', 'corporate'],
    difficulty: 'advanced',
    generateCode: (request, animationType) => {
      const palette = UniversalDesignUtils.getColorPalette('professional');
      const fontFamily = UniversalDesignUtils.getFontFamily('primary');
      
      return `${generateUniversalImports()}
${generateSafeInterpolation()}

export const VideoComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  // Professional timing phases
  const particlePhase = durationInFrames * 0.4;
  const logoPhase = durationInFrames * 0.6;
  const glowPhase = durationInFrames * 0.8;

  // Particle system
  const particles = Array.from({ length: 50 }, (_, i) => {
    const angle = (i / 50) * 360;
    const distance = safeInterpolate(frame, [0, particlePhase], [200, 0], {
      easing: Easing.out(Easing.quad)
    });
    
    const x = width / 2 + Math.cos(angle * Math.PI / 180) * distance;
    const y = height / 2 + Math.sin(angle * Math.PI / 180) * distance;
    const opacity = safeInterpolate(frame, [0, particlePhase, logoPhase], [0, 1, 0]);
    
    return (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: x - 2,
          top: y - 2,
          width: 4,
          height: 4,
          backgroundColor: '${palette[1]}',
          borderRadius: '50%',
          opacity,
          boxShadow: \`0 0 10px \${palette[1]}\`
        }}
      />
    );
  });

  // Logo entrance
  const logoScale = safeInterpolate(
    frame,
    [particlePhase, logoPhase],
    [0, 1],
    { easing: Easing.out(Easing.back(1.7)) }
  );

  const logoOpacity = safeInterpolate(
    frame,
    [particlePhase, logoPhase],
    [0, 1]
  );

  // Professional glow effect
  const glowIntensity = safeInterpolate(
    frame,
    [logoPhase, glowPhase],
    [0, 1],
    { easing: Easing.out(Easing.quad) }
  );

  return (
    <AbsoluteFill
      style={{
        background: \`linear-gradient(135deg, ${palette[0]} 0%, ${palette[3]} 100%)\`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {/* Particle field */}
      {particles}
      
      {/* Main logo */}
      <div
        style={{
          fontSize: 72,
          fontWeight: 700,
          fontFamily: '${fontFamily}',
          color: 'white',
          textAlign: 'center',
          transform: \`scale(\${logoScale})\`,
          opacity: logoOpacity,
          textShadow: \`
            0 0 20px rgba(255,255,255,\${glowIntensity}),
            0 0 40px ${palette[1]},
            0 0 80px ${palette[2]}
          \`,
          letterSpacing: '0.05em'
        }}
      >
        {/* Use animation description as logo text */}
        ${request.animationDesc.replace(/['"]/g, '').toUpperCase()}
      </div>
      
      {/* Professional subtitle */}
      <div
        style={{
          position: 'absolute',
          top: '60%',
          fontSize: 18,
          fontFamily: '${fontFamily}',
          color: 'rgba(255,255,255,0.8)',
          opacity: safeInterpolate(frame, [glowPhase, durationInFrames], [0, 1]),
          letterSpacing: '0.2em',
          textTransform: 'uppercase'
        }}
      >
        Professional Animation
      </div>
    </AbsoluteFill>
  );
};`;
    }
  },

  // 2. DATA VISUALIZATION ANIMATION
  {
    name: 'data-visualization',
    description: 'Professional animated charts and data displays',
    keywords: ['chart', 'data', 'graph', 'statistics', 'analytics', 'business'],
    difficulty: 'intermediate',
    generateCode: (request, animationType) => {
      const palette = UniversalDesignUtils.getColorPalette('modern');
      const fontFamily = UniversalDesignUtils.getFontFamily('primary');
      
      return `${generateUniversalImports()}
${generateSafeInterpolation()}

export const VideoComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  // Data points (universally works with any content)
  const dataPoints = [75, 45, 90, 60, 80, 55, 95];
  const maxValue = Math.max(...dataPoints);
  const chartWidth = width * 0.6;
  const chartHeight = height * 0.5;
  
  // Progressive data reveal
  const revealProgress = safeInterpolate(frame, [0, durationInFrames * 0.8], [0, 1]);
  const visibleBars = Math.floor(revealProgress * dataPoints.length);

  return (
    <AbsoluteFill
      style={{
        background: \`linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)\`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '${fontFamily}'
      }}
    >
      {/* Professional title */}
      <div
        style={{
          fontSize: 32,
          fontWeight: 600,
          color: '${palette[0]}',
          marginBottom: 40,
          opacity: safeInterpolate(frame, [0, 30], [0, 1])
        }}
      >
        Data Visualization
      </div>

      {/* Animated chart */}
      <svg width={chartWidth} height={chartHeight} style={{ overflow: 'visible' }}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
          <line
            key={i}
            x1={0}
            y1={chartHeight * ratio}
            x2={chartWidth}
            y2={chartHeight * ratio}
            stroke="rgba(0,0,0,0.1)"
            strokeWidth={1}
          />
        ))}

        {/* Animated bars */}
        {dataPoints.map((value, i) => {
          const barWidth = chartWidth / dataPoints.length * 0.7;
          const barSpacing = chartWidth / dataPoints.length;
          const barHeight = (value / maxValue) * chartHeight;
          const x = i * barSpacing + barSpacing * 0.15;
          
          const animatedHeight = i < visibleBars 
            ? safeInterpolate(
                frame,
                [i * 10, i * 10 + 30],
                [0, barHeight],
                { easing: Easing.out(Easing.back(1.5)) }
              )
            : 0;

          const color = \`\${palette[i % palette.length]}\`;

          return (
            <g key={i}>
              {/* Bar */}
              <rect
                x={x}
                y={chartHeight - animatedHeight}
                width={barWidth}
                height={animatedHeight}
                fill={color}
                rx={4}
              />
              
              {/* Value label */}
              {i < visibleBars && (
                <text
                  x={x + barWidth / 2}
                  y={chartHeight - animatedHeight - 10}
                  textAnchor="middle"
                  fontSize={14}
                  fill={color}
                  fontWeight={600}
                >
                  {value}%
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Professional footer */}
      <div
        style={{
          fontSize: 14,
          color: 'rgba(0,0,0,0.6)',
          marginTop: 30,
          opacity: safeInterpolate(frame, [durationInFrames * 0.7, durationInFrames], [0, 1])
        }}
      >
        Professional Data Analytics
      </div>
    </AbsoluteFill>
  );
};`;
    }
  },

  // 3. ELEGANT TEXT REVEAL
  {
    name: 'text-reveal',
    description: 'Sophisticated text animation with elegant typography',
    keywords: ['text', 'title', 'typography', 'elegant', 'reveal', 'words'],
    difficulty: 'basic',
    generateCode: (request, animationType) => {
      const palette = UniversalDesignUtils.getColorPalette('elegant');
      const fontFamily = UniversalDesignUtils.getFontFamily('primary');
      
      return `${generateUniversalImports()}
${generateSafeInterpolation()}

export const VideoComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  const text = "${request.animationDesc}";
  const words = text.split(' ');
  
  return (
    <AbsoluteFill
      style={{
        background: \`linear-gradient(135deg, ${palette[0]} 0%, ${palette[1]} 50%, ${palette[2]} 100%)\`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '${fontFamily}'
      }}
    >
      <div
        style={{
          textAlign: 'center',
          maxWidth: width * 0.8
        }}
      >
        {words.map((word, i) => {
          const wordDelay = i * 15;
          const wordOpacity = safeInterpolate(
            frame,
            [wordDelay, wordDelay + 30],
            [0, 1],
            { easing: Easing.out(Easing.quad) }
          );
          
          const wordY = safeInterpolate(
            frame,
            [wordDelay, wordDelay + 30],
            [30, 0],
            { easing: Easing.out(Easing.quad) }
          );

          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                fontSize: 56,
                fontWeight: 300,
                color: 'white',
                marginRight: 20,
                opacity: wordOpacity,
                transform: \`translateY(\${wordY}px)\`,
                textShadow: '0 10px 30px rgba(0,0,0,0.3)',
                letterSpacing: '0.02em'
              }}
            >
              {word}
            </span>
          );
        })}
      </div>

      {/* Elegant underline */}
      <div
        style={{
          position: 'absolute',
          bottom: '30%',
          left: '20%',
          right: '20%',
          height: 2,
          background: \`linear-gradient(90deg, transparent 0%, ${palette[3]} 50%, transparent 100%)\`,
          opacity: safeInterpolate(frame, [durationInFrames * 0.6, durationInFrames], [0, 1])
        }}
      />
    </AbsoluteFill>
  );
};`;
    }
  },

  // 4. MODERN PARTICLE SYSTEM
  {
    name: 'particle-system',
    description: 'Advanced particle effects and motion graphics',
    keywords: ['particles', 'effects', 'modern', 'dynamic', 'motion', 'abstract'],
    difficulty: 'advanced',
    generateCode: (request, animationType) => {
      const palette = UniversalDesignUtils.getColorPalette('creative');
      
      return `${generateUniversalImports()}
${generateSafeInterpolation()}

export const VideoComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  // Universal particle system - works on any hardware
  const particleCount = 80;
  const particles = Array.from({ length: particleCount }, (_, i) => {
    const t = (frame + i * 2) * 0.02;
    
    // Complex motion patterns
    const baseX = (i / particleCount) * width;
    const baseY = height / 2;
    
    const waveOffset = Math.sin(t + i * 0.5) * 100;
    const spiralOffset = Math.cos(t * 2 + i * 0.3) * 50;
    
    const x = baseX + waveOffset;
    const y = baseY + spiralOffset + Math.sin(t * 3 + i) * 30;
    
    // Lifecycle animation
    const lifecycle = (frame + i * 5) % 120;
    const opacity = lifecycle < 60 
      ? safeInterpolate(lifecycle, [0, 30], [0, 1])
      : safeInterpolate(lifecycle, [60, 90], [1, 0]);
    
    const size = safeInterpolate(lifecycle, [0, 30, 60, 90], [2, 8, 8, 2]);
    const color = \`\${palette[i % palette.length]}\`;

    return (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: x - size / 2,
          top: y - size / 2,
          width: size,
          height: size,
          borderRadius: '50%',
          background: \`radial-gradient(circle, \${color}, transparent)\`,
          opacity: opacity * 0.8,
          boxShadow: \`0 0 \${size * 2}px \${color}\`,
          pointerEvents: 'none'
        }}
      />
    );
  });

  // Background pulse effect
  const pulseScale = 1 + Math.sin(frame * 0.05) * 0.1;

  return (
    <AbsoluteFill
      style={{
        background: \`
          radial-gradient(circle at 30% 40%, ${palette[0]}22 0%, transparent 50%),
          radial-gradient(circle at 70% 60%, ${palette[1]}22 0%, transparent 50%),
          linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)
        \`,
        overflow: 'hidden'
      }}
    >
      {/* Animated background */}
      <div
        style={{
          position: 'absolute',
          width: '200%',
          height: '200%',
          left: '-50%',
          top: '-50%',
          background: \`conic-gradient(from 0deg, ${palette.map(c => c + '44').join(', ')})\`,
          transform: \`scale(\${pulseScale}) rotate(\${frame * 0.5}deg)\`,
          opacity: 0.1
        }}
      />

      {/* Particle system */}
      {particles}

      {/* Central focus element */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: 24,
          fontWeight: 600,
          color: 'white',
          textAlign: 'center',
          textShadow: '0 0 20px rgba(255,255,255,0.5)',
          opacity: safeInterpolate(frame, [30, 60], [0, 1])
        }}
      >
        ${request.animationDesc}
        <div
          style={{
            fontSize: 14,
            marginTop: 10,
            color: 'rgba(255,255,255,0.7)',
            fontWeight: 400
          }}
        >
          Dynamic Particle System
        </div>
      </div>
    </AbsoluteFill>
  );
};`;
    }
  }
];

/**
 * Find best matching professional template
 * UNIVERSAL COMPATIBILITY - Works with any project name or description
 */
export function findProfessionalTemplate(animationType: AnimationType): ProfessionalAnimationTemplate | null {
  let bestMatch: ProfessionalAnimationTemplate | null = null;
  let highestScore = 0;

  for (const template of PROFESSIONAL_ANIMATION_TEMPLATES) {
    let score = 0;
    
    // Check keywords in animation type
    for (const keyword of template.keywords) {
      if (animationType.keywords?.some(k => k.toLowerCase().includes(keyword.toLowerCase()))) {
        score += 2;
      }
    }
    
    // Check animation type name
    if (template.name.includes(animationType.type) || animationType.type.includes(template.name.replace('-', ''))) {
      score += 3;
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = template;
    }
  }

  return bestMatch;
}

/**
 * Generate professional animation with universal compatibility
 */
export function generateProfessionalAnimation(
  request: AnimationRequest, 
  animationType: AnimationType
): string {
  const template = findProfessionalTemplate(animationType);
  
  if (template) {
    return template.generateCode(request, animationType);
  }
  
  // Fallback to elegant text reveal (works for any content)
  const textTemplate = PROFESSIONAL_ANIMATION_TEMPLATES.find(t => t.name === 'text-reveal');
  return textTemplate?.generateCode(request, animationType) || '';
}

export default PROFESSIONAL_ANIMATION_TEMPLATES;