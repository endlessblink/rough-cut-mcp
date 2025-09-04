import React from "react";
import { AbsoluteFill, Sequence, interpolate, Easing, useCurrentFrame, useVideoConfig } from "remotion";

const True80sSynthwave: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Timeline - 18 seconds
  const introStart = 0;
  const introEnd = fps * 3;
  const titleStart = fps * 2;
  const titleEnd = fps * 6;
  const project1Start = fps * 6.5;
  const project1End = fps * 11;
  const project2Start = fps * 11.5;
  const project2End = fps * 16;
  const finalStart = fps * 16.5;

  // 80s easing
  const smoothOut = Easing.out(Easing.cubic);
  const smoothIn = Easing.in(Easing.cubic);

  // 80s Synthwave colors
  const colors = {
    neonPink: '#ff007f',
    neonCoral: '#ff6b6b',
    brightCyan: '#00ffff',
    hotPink: '#ff1493',
    darkSpace: '#0a0a0f',
    gridColor: '#ff007f',
    glowPink: '#ff69b4'
  };

  // Tron-style grid floor
  const createTronGrid = () => {
    const gridLines = [];
    const perspective = 0.8;
    const vanishingY = 400;
    
    // Horizontal lines (going into distance)
    for (let i = 0; i < 20; i++) {
      const progress = i / 20;
      const y = 500 + (progress * 580);
      const width = interpolate(progress, [0, 1], [1920, 200]);
      const x = (1920 - width) / 2;
      const opacity = interpolate(progress, [0, 0.7, 1], [1, 0.8, 0.2]);
      
      gridLines.push({
        type: 'horizontal',
        x, y, width,
        opacity: opacity * 0.6,
        glowIntensity: 1 - progress
      });
    }

    // Vertical lines (perspective lines)
    for (let i = 0; i < 15; i++) {
      const x = (i / 14) * 1920;
      const startY = 500;
      const endY = 1080;
      
      gridLines.push({
        type: 'vertical',
        x1: x,
        y1: startY,
        x2: 960 + (x - 960) * perspective,
        y2: endY,
        opacity: 0.4
      });
    }

    return gridLines;
  };

  // Retro starfield
  const createRetroStars = () => {
    const stars = [];
    for (let i = 0; i < 40; i++) {
      const x = (i * 47) % 1920;
      const y = (i * 31) % 400; // Only in upper area
      const twinkle = Math.sin(frame * 0.03 + i) * 0.3 + 0.7;
      const size = 1 + (i % 3);
      
      stars.push({ x, y, size, twinkle });
    }
    return stars;
  };

  // Glitch text component
  const GlitchText = ({ 
    children, 
    size = 48, 
    color = colors.neonPink,
    glitchIntensity = 1 
  }: {
    children: string;
    size?: number;
    color?: string;
    glitchIntensity?: number;
  }) => {
    const glitchOffset = Math.sin(frame * 0.3) * glitchIntensity * 3;
    const glitchOpacity = Math.sin(frame * 0.5) * 0.1 + 0.9;
    
    return (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        {/* Main text */}
        <div
          style={{
            fontSize: `${size}px`,
            fontFamily: 'Courier New, monospace',
            fontWeight: 'bold',
            color,
            textShadow: `
              0 0 5px ${color},
              0 0 10px ${color},
              0 0 20px ${color},
              0 0 40px ${color}
            `,
            letterSpacing: '2px',
            lineHeight: '1.2',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {children}
        </div>
        
        {/* Glitch layers */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: glitchOffset,
            fontSize: `${size}px`,
            fontFamily: 'Courier New, monospace',
            fontWeight: 'bold',
            color: '#ff0000',
            letterSpacing: '2px',
            lineHeight: '1.2',
            opacity: glitchOpacity * 0.7,
            zIndex: 1,
          }}
        >
          {children}
        </div>
        
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: -glitchOffset,
            fontSize: `${size}px`,
            fontFamily: 'Courier New, monospace',
            fontWeight: 'bold',
            color: '#00ffff',
            letterSpacing: '2px',
            lineHeight: '1.2',
            opacity: glitchOpacity * 0.5,
            zIndex: 0,
          }}
        >
          {children}
        </div>
      </div>
    );
  };

  // CRT scan lines
  const scanLineOffset = (frame * 2) % 1080;

  // Animation calculations
  const introOpacity = interpolate(frame, [introStart, introStart + 30], [0, 1], { easing: smoothOut });
  
  const titleOpacity = interpolate(frame, [titleStart, titleStart + 40], [0, 1], { easing: smoothOut });
  const titleScale = interpolate(frame, [titleStart, titleStart + 60], [0.8, 1], { easing: smoothOut });
  const titleExit = interpolate(frame, [titleEnd - 40, titleEnd], [1, 0], { easing: smoothIn });

  const project1Opacity = interpolate(frame, [project1Start, project1Start + 30], [0, 1], { easing: smoothOut });
  const project1Exit = interpolate(frame, [project1End - 30, project1End], [1, 0], { easing: smoothIn });

  const project2Opacity = interpolate(frame, [project2Start, project2Start + 30], [0, 1], { easing: smoothOut });
  const project2Exit = interpolate(frame, [project2End - 30, project2End], [1, 0], { easing: smoothIn });

  const finalOpacity = interpolate(frame, [finalStart, finalStart + 30], [0, 1], { easing: smoothOut });

  return (
    <AbsoluteFill>
      {/* Dark space background */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: `
            radial-gradient(ellipse at 50% 20%, 
              ${colors.darkSpace} 0%, 
              #000000 70%
            )
          `,
        }}
      />

      {/* Retro stars */}
      <div style={{ position: 'absolute', width: '100%', height: '100%' }}>
        {createRetroStars().map((star, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: star.x,
              top: star.y,
              width: star.size * 2,
              height: star.size * 2,
              background: colors.brightCyan,
              borderRadius: '50%',
              opacity: star.twinkle * 0.8,
              boxShadow: `0 0 ${star.size * 3}px ${colors.brightCyan}`,
            }}
          />
        ))}
      </div>

      {/* Tron grid floor */}
      <div style={{ position: 'absolute', width: '100%', height: '100%' }}>
        {createTronGrid().map((line, i) => (
          <div key={i}>
            {line.type === 'horizontal' ? (
              <div
                style={{
                  position: 'absolute',
                  left: line.x,
                  top: line.y,
                  width: line.width,
                  height: 2,
                  background: colors.gridColor,
                  opacity: line.opacity,
                  boxShadow: `0 0 ${line.glowIntensity * 10}px ${colors.gridColor}`,
                }}
              />
            ) : (
              <svg
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                }}
              >
                <line
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  stroke={colors.gridColor}
                  strokeWidth="2"
                  opacity={line.opacity}
                  filter={`drop-shadow(0 0 3px ${colors.gridColor})`}
                />
              </svg>
            )}
          </div>
        ))}
      </div>

      {/* CRT scan lines */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '4px',
          background: `linear-gradient(90deg, 
            transparent, 
            ${colors.brightCyan}88, 
            transparent
          )`,
          top: scanLineOffset,
          opacity: 0.6,
          boxShadow: `0 0 20px ${colors.brightCyan}`,
        }}
      />

      {/* Intro sequence */}
      <Sequence from={introStart} durationInFrames={titleStart - introStart + 40}>
        <AbsoluteFill
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: introOpacity * (frame < titleStart + 30 ? 1 : 0),
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <GlitchText size={32} color={colors.brightCyan}>
              ENDLESSBLINK STUDIOS PRESENTS
            </GlitchText>
            
            <div style={{ marginTop: 30 }}>
              <GlitchText size={20} color={colors.neonCoral}>
                A NEW AWARD WINNING REPOSITORY
              </GlitchText>
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Main title sequence */}
      <Sequence from={titleStart} durationInFrames={titleEnd - titleStart}>
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: titleOpacity * titleExit,
            transform: `scale(${titleScale})`,
          }}
        >
          {/* Responsive retro logo with layout intelligence */}
          <div style={{ position: 'relative', marginBottom: 40, maxWidth: '90%', textAlign: 'center' }}>
            {/* Background glow */}
            <div
              style={{
                position: 'absolute',
                inset: '-40px',
                background: `radial-gradient(ellipse, ${colors.neonPink}22, transparent)`,
                filter: 'blur(30px)',
              }}
            />
            
            <GlitchText size={72} color={colors.neonPink}>
              ENDLESSBLINK
            </GlitchText>
            
            {/* Retro underline */}
            <div
              style={{
                marginTop: 20,
                height: 4,
                background: `linear-gradient(90deg, 
                  transparent, 
                  ${colors.neonPink}, 
                  ${colors.hotPink},
                  ${colors.neonPink}, 
                  transparent
                )`,
                boxShadow: `0 0 20px ${colors.neonPink}`,
              }}
            />
          </div>

          {/* Reviews/ratings with responsive layout */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            width: '100%', 
            maxWidth: '1000px',
            padding: '0 40px'
          }}>
            {/* Left review */}
            <div style={{ textAlign: 'left' }}>
              <div style={{ marginBottom: 10 }}>
                <GlitchText size={16} color={colors.neonCoral} glitchIntensity={0.5}>
                  BEST MEMORY SYSTEM
                </GlitchText>
              </div>
              <div style={{ marginBottom: 10 }}>
                <GlitchText size={16} color={colors.neonCoral} glitchIntensity={0.5}>
                  IN THE AI ECOSYSTEM
                </GlitchText>
              </div>
              <div style={{ display: 'flex', gap: 5 }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} style={{ color: colors.neonPink, fontSize: 20 }}>★</div>
                ))}
              </div>
              <GlitchText size={14} color={colors.brightCyan} glitchIntensity={0.3}>
                - LLM FEDERATION -
              </GlitchText>
            </div>

            {/* Right review */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ marginBottom: 10 }}>
                <GlitchText size={16} color={colors.neonCoral} glitchIntensity={0.5}>
                  MCP-LEVEL TWISTS
                </GlitchText>
              </div>
              <div style={{ marginBottom: 10 }}>
                <GlitchText size={16} color={colors.neonCoral} glitchIntensity={0.5}>
                  AND TURNS HIGHLY RECOMMEND
                </GlitchText>
              </div>
              <div style={{ display: 'flex', gap: 5, justifyContent: 'flex-end' }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} style={{ color: colors.neonPink, fontSize: 20 }}>★</div>
                ))}
              </div>
              <GlitchText size={14} color={colors.brightCyan} glitchIntensity={0.3}>
                - AI DEVELOPERS -
              </GlitchText>
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Project 1 - 80s style */}
      <Sequence from={project1Start} durationInFrames={project1End - project1Start}>
        <AbsoluteFill
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: project1Opacity * project1Exit,
          }}
        >
          <div
            style={{
              width: '85%',
              maxWidth: '900px',
              padding: '32px 48px',
              border: `3px solid ${colors.neonPink}`,
              background: `linear-gradient(135deg, 
                rgba(255, 0, 127, 0.1), 
                rgba(0, 255, 255, 0.1)
              )`,
              boxShadow: `
                0 0 30px ${colors.neonPink}66,
                inset 0 0 30px rgba(255, 0, 127, 0.1)
              `,
              position: 'relative',
            }}
          >
            {/* Retro corner decorations */}
            <div style={{ position: 'absolute', top: 10, left: 10, color: colors.neonPink, fontSize: 20 }}>◢</div>
            <div style={{ position: 'absolute', top: 10, right: 10, color: colors.neonPink, fontSize: 20 }}>◣</div>
            <div style={{ position: 'absolute', bottom: 10, left: 10, color: colors.neonPink, fontSize: 20 }}>◥</div>
            <div style={{ position: 'absolute', bottom: 10, right: 10, color: colors.neonPink, fontSize: 20 }}>◤</div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: 20 }}>
                <GlitchText size={36} color={colors.neonPink}>
                  LIKE-I-SAID-V2
                </GlitchText>
              </div>

              <div style={{ marginBottom: 30 }}>
                <GlitchText size={16} color={colors.brightCyan} glitchIntensity={0.5}>
                  ADVANCED MCP MEMORY AND TASK MANAGEMENT
                </GlitchText>
                <div style={{ marginTop: 8 }}>
                  <GlitchText size={16} color={colors.brightCyan} glitchIntensity={0.5}>
                    FOR LARGE LANGUAGE MODELS
                  </GlitchText>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {[
                  'MEMORY LINKING',
                  'NATURAL INTERFACE',
                  'CROSS SESSION',
                  'REACT DASHBOARD'
                ].map((feature, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '10px 20px',
                      border: `2px solid ${colors.neonCoral}`,
                      background: `rgba(255, 107, 107, 0.2)`,
                      opacity: interpolate(
                        frame,
                        [project1Start + 60 + i * 10, project1Start + 80 + i * 10],
                        [0, 1]
                      ),
                    }}
                  >
                    <GlitchText size={14} color={colors.neonCoral} glitchIntensity={0.3}>
                      {feature}
                    </GlitchText>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Project 2 - 80s style */}
      <Sequence from={project2Start} durationInFrames={project2End - project2Start}>
        <AbsoluteFill
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: project2Opacity * project2Exit,
          }}
        >
          <div
            style={{
              width: '85%',
              maxWidth: '900px',
              padding: '32px 48px',
              border: `3px solid ${colors.brightCyan}`,
              background: `linear-gradient(135deg, 
                rgba(0, 255, 255, 0.1), 
                rgba(255, 0, 127, 0.1)
              )`,
              boxShadow: `
                0 0 30px ${colors.brightCyan}66,
                inset 0 0 30px rgba(0, 255, 255, 0.1)
              `,
              position: 'relative',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: 20 }}>
                <GlitchText size={36} color={colors.brightCyan}>
                  COMFY-GURU
                </GlitchText>
              </div>

              <div style={{ marginBottom: 30 }}>
                <GlitchText size={16} color={colors.neonPink} glitchIntensity={0.5}>
                  CLAUDE DESKTOP ↔ COMFYUI BRIDGE
                </GlitchText>
                <div style={{ marginTop: 8 }}>
                  <GlitchText size={16} color={colors.neonPink} glitchIntensity={0.5}>
                    ERROR DETECTION AND LOG ANALYSIS
                  </GlitchText>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 15 }}>
                {[
                  'ERROR DETECTION',
                  'LOG ANALYSIS',
                  'PYTHON BRIDGE',
                  'REAL-TIME SYNC'
                ].map((feature, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '8px 16px',
                      border: `2px solid ${colors.hotPink}`,
                      background: `rgba(255, 20, 147, 0.2)`,
                      opacity: interpolate(
                        frame,
                        [project2Start + 60 + i * 8, project2Start + 80 + i * 8],
                        [0, 1]
                      ),
                    }}
                  >
                    <GlitchText size={12} color={colors.hotPink} glitchIntensity={0.3}>
                      {feature}
                    </GlitchText>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Final 80s screen */}
      <Sequence from={finalStart} durationInFrames={durationInFrames - finalStart}>
        <AbsoluteFill
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: finalOpacity,
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: 40 }}>
              <GlitchText size={56} color={colors.neonPink}>
                ACCESS GRANTED
              </GlitchText>
            </div>

            <div style={{ marginBottom: 30 }}>
              <GlitchText size={24} color={colors.brightCyan} glitchIntensity={0.5}>
                GITHUB.COM/ENDLESSBLINK
              </GlitchText>
            </div>

            <div
              style={{
                padding: '15px 30px',
                border: `2px solid ${colors.neonPink}`,
                background: `rgba(255, 0, 127, 0.2)`,
                opacity: Math.sin(frame * 0.1) * 0.3 + 0.7,
              }}
            >
              <GlitchText size={16} color={colors.neonPink} glitchIntensity={0.5}>
                PRESS START TO EXPLORE
              </GlitchText>
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* 80s vignette overlay */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: `radial-gradient(ellipse at center, 
            transparent 40%, 
            rgba(0, 0, 0, 0.6) 100%
          )`,
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};

export default True80sSynthwave;