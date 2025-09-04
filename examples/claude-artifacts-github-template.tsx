// Claude Artifacts-Style GitHub Showcase Template
// Clean, readable, professional layout that ALWAYS works

import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing, Sequence } from 'remotion';

const ClaudeArtifactsGitHubShowcase: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '80px',
      fontFamily: 'Inter, SF Pro Display, system-ui, sans-serif'
    }}>
      
      {/* SEQUENCE 1: Title (0-90 frames) */}
      <Sequence from={0} durationInFrames={90}>
        <AbsoluteFill style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            opacity: interpolate(frame, [0, 30], [0, 1], { easing: Easing.out }),
            transform: `translateY(${interpolate(frame, [0, 30], [30, 0], { easing: Easing.out })}px)`,
            textAlign: 'center'
          }}>
            <h1 style={{
              fontSize: '48px', // SAFE SIZE - fits all content
              fontWeight: '700',
              color: '#ffffff',
              margin: '0 0 16px 0', // SAFE MARGIN
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              GitHub Showcase
            </h1>
            <p style={{
              fontSize: '20px', // SAFE SIZE
              color: 'rgba(255,255,255,0.8)',
              margin: 0
            }}>
              Professional Development Portfolio
            </p>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* SEQUENCE 2: Projects Grid (90-210 frames) */}
      <Sequence from={90} durationInFrames={120}>
        <AbsoluteFill style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '32px' // SAFE SPACING
        }}>
          
          <h2 style={{
            fontSize: '32px', // SAFE SIZE
            fontWeight: '600',
            color: '#ffffff',
            textAlign: 'center',
            margin: '0 0 32px 0',
            opacity: interpolate(frame - 90, [0, 30], [0, 1]),
            transform: `translateY(${interpolate(frame - 90, [0, 30], [20, 0])}px)`
          }}>
            Featured Projects
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 300px)', // FIXED WIDTH - no overflow
            gap: '24px', // SAFE SPACING
            maxWidth: '700px' // SAFE BOUNDS
          }}>
            {['MCP Tools', 'AI Integration', 'Video Generator', 'Code Automation'].map((project, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                padding: '24px', // SAFE PADDING
                border: '1px solid rgba(255,255,255,0.2)',
                opacity: interpolate(frame - 90, [i * 10, i * 10 + 30], [0, 1]),
                transform: `translateY(${interpolate(frame - 90, [i * 10, i * 10 + 30], [20, 0])}px)`
              }}>
                <h3 style={{
                  fontSize: '18px', // SAFE SIZE
                  fontWeight: '600', 
                  color: '#ffffff',
                  margin: '0 0 8px 0', // SAFE MARGIN
                  textAlign: 'center'
                }}>
                  {project}
                </h3>
                <div style={{
                  width: '100%',
                  height: '4px',
                  background: 'linear-gradient(90deg, #00ff88, #00aaff)',
                  borderRadius: '2px',
                  opacity: 0.7
                }} />
              </div>
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* SEQUENCE 3: Stats (210-330 frames) */}
      <Sequence from={210} durationInFrames={120}>
        <AbsoluteFill style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(15px)',
            borderRadius: '16px',
            padding: '48px', // GENEROUS SAFE PADDING
            border: '1px solid rgba(255,255,255,0.2)',
            textAlign: 'center',
            maxWidth: '500px', // SAFE BOUNDS
            opacity: interpolate(frame - 210, [0, 40], [0, 1]),
            transform: `scale(${interpolate(frame - 210, [0, 40], [0.8, 1], { easing: Easing.out })})`
          }}>
            <h2 style={{
              fontSize: '28px', // SAFE SIZE
              fontWeight: '700',
              color: '#ffffff',
              margin: '0 0 24px 0'
            }}>
              Development Stats
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '24px', // SAFE SPACING
              marginTop: '24px'
            }}>
              {[
                { label: 'Repositories', value: '12+' },
                { label: 'Languages', value: '8' },
                { label: 'Contributions', value: '500+' },
                { label: 'Stars Earned', value: '50+' }
              ].map((stat, i) => (
                <div key={i} style={{
                  opacity: interpolate(frame - 210, [20 + i * 5, 40 + i * 5], [0, 1])
                }}>
                  <div style={{
                    fontSize: '24px', // SAFE SIZE
                    fontWeight: '700',
                    color: '#00ff88'
                  }}>
                    {stat.value}
                  </div>
                  <div style={{
                    fontSize: '14px', // SAFE SIZE
                    color: 'rgba(255,255,255,0.7)',
                    marginTop: '4px'
                  }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* SEQUENCE 4: Call to Action (330+ frames) */}
      <Sequence from={330}>
        <AbsoluteFill style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            textAlign: 'center',
            opacity: interpolate(frame - 330, [0, 40], [0, 1]),
            transform: `translateY(${interpolate(frame - 330, [0, 40], [30, 0])}px)`
          }}>
            <h2 style={{
              fontSize: '36px', // SAFE SIZE for short text
              fontWeight: '700',
              color: '#ffffff',
              margin: '0 0 16px 0',
              textShadow: '0 2px 8px rgba(0,0,0,0.4)'
            }}>
              Let's Build Together
            </h2>
            <p style={{
              fontSize: '18px', // SAFE SIZE
              color: 'rgba(255,255,255,0.8)',
              margin: 0
            }}>
              github.com/endlessblink
            </p>
          </div>
        </AbsoluteFill>
      </Sequence>

    </AbsoluteFill>
  );
};

export default ClaudeArtifactsGitHubShowcase;