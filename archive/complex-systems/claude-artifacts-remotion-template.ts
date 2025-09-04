// Claude Artifacts Design Principles Converted to Remotion Architecture
// Clean, readable layouts using Sequence components instead of useState chaos

export const CLAUDE_ARTIFACTS_REMOTION_TEMPLATE = `
import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing, Sequence } from 'remotion';

const ClaudeArtifactsGitHubShowcase: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{
      background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
      fontFamily: 'Inter, SF Pro Display, system-ui, sans-serif',
      overflow: 'hidden'
    }}>

      {/* SCENE 1: Professional Title (0-90 frames) - Like Claude Artifacts */}
      <Sequence from={0} durationInFrames={90}>
        <AbsoluteFill style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '80px'
        }}>
          <div style={{
            opacity: interpolate(frame, [0, 30], [0, 1], { easing: Easing.out }),
            transform: \`translateY(\${interpolate(frame, [0, 30], [40, 0], { easing: Easing.out })}px)\`,
            maxWidth: '800px' // CLAUDE ARTIFACTS SAFE WIDTH
          }}>
            <h1 style={{
              fontSize: '48px', // CLAUDE ARTIFACTS SAFE SIZE - always readable
              fontWeight: '800',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #10b981)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              margin: '0 0 24px 0', // CLAUDE ARTIFACTS SPACING
              lineHeight: '1.1',
              letterSpacing: '-1px'
            }}>
              endlessblink
            </h1>
            
            <p style={{
              fontSize: '20px', // CLAUDE ARTIFACTS READABLE SIZE
              color: '#94a3b8',
              margin: '0 0 16px 0',
              fontWeight: '600'
            }}>
              🚀 AI & Developer Tools Innovator
            </p>
            
            <p style={{
              fontSize: '16px', // CLAUDE ARTIFACTS SAFE SIZE
              color: '#64748b',
              margin: 0,
              lineHeight: '1.6',
              maxWidth: '600px' // CLAUDE ARTIFACTS CONTENT BOUNDS
            }}>
              Building the future with intelligent automation, MCP servers, and cutting-edge developer experiences
            </p>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* SCENE 2: Featured Projects (90-180 frames) - No overlapping chaos */}
      <Sequence from={90} durationInFrames={90}>
        <AbsoluteFill style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px'
        }}>
          <h2 style={{
            fontSize: '32px', // CLAUDE ARTIFACTS HIERARCHY
            fontWeight: '700',
            color: '#ffffff',
            margin: '0 0 48px 0', // CLAUDE ARTIFACTS SPACING
            textAlign: 'center',
            opacity: interpolate(frame - 90, [0, 20], [0, 1])
          }}>
            💎 Featured Projects
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 350px)', // CLAUDE ARTIFACTS FIXED WIDTH
            gap: '32px', // CLAUDE ARTIFACTS SAFE SPACING
            maxWidth: '800px' // CLAUDE ARTIFACTS CONTAINER BOUNDS
          }}>
            {['Like-I-Said MCP', 'Comfy-Guru Debug', 'AI Enhancement', 'Video Creation'].map((project, i) => (
              <div key={i} style={{
                background: 'rgba(255, 255, 255, 0.05)', // CLAUDE ARTIFACTS SUBTLE
                backdropFilter: 'blur(10px)',
                borderRadius: '16px', // CLAUDE ARTIFACTS ROUNDED
                padding: '24px', // CLAUDE ARTIFACTS PADDING
                border: '1px solid rgba(255, 255, 255, 0.1)',
                textAlign: 'center',
                opacity: interpolate(frame - 90, [10 + i * 5, 30 + i * 5], [0, 1], { easing: Easing.out }),
                transform: \`translateY(\${interpolate(frame - 90, [10 + i * 5, 30 + i * 5], [20, 0], { easing: Easing.out })}px)\`
              }}>
                <h3 style={{
                  fontSize: '18px', // CLAUDE ARTIFACTS READABLE
                  fontWeight: '600',
                  color: '#ffffff',
                  margin: '0 0 12px 0',
                  lineHeight: '1.3'
                }}>
                  {project}
                </h3>
                <div style={{
                  width: '100%',
                  height: '3px',
                  background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                  borderRadius: '2px',
                  opacity: 0.8
                }} />
              </div>
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* SCENE 3: Stats Dashboard (180-270 frames) - Clean like Claude Artifacts */}
      <Sequence from={180} durationInFrames={90}>
        <AbsoluteFill style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(15px)',
            borderRadius: '20px', // CLAUDE ARTIFACTS ROUNDED
            padding: '48px', // CLAUDE ARTIFACTS GENEROUS PADDING  
            border: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center',
            maxWidth: '600px', // CLAUDE ARTIFACTS SAFE BOUNDS
            opacity: interpolate(frame - 180, [0, 30], [0, 1]),
            transform: \`scale(\${interpolate(frame - 180, [0, 30], [0.9, 1], { easing: Easing.out })})\`
          }}>
            <h2 style={{
              fontSize: '28px', // CLAUDE ARTIFACTS READABLE HIERARCHY
              fontWeight: '700',
              color: '#ffffff',
              margin: '0 0 32px 0'
            }}>
              📊 Developer Impact
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '24px' // CLAUDE ARTIFACTS CONSISTENT SPACING
            }}>
              {[
                { label: 'Repositories', value: '14+', color: '#10b981' },
                { label: 'AI Tools Built', value: '8+', color: '#3b82f6' },
                { label: 'Stars Earned', value: '4⭐', color: '#fbbf24' },
                { label: 'Innovation Focus', value: '100%', color: '#8b5cf6' }
              ].map((stat, i) => (
                <div key={i} style={{
                  opacity: interpolate(frame - 180, [15 + i * 8, 35 + i * 8], [0, 1])
                }}>
                  <div style={{
                    fontSize: '24px', // CLAUDE ARTIFACTS READABLE STATS
                    fontWeight: '800',
                    color: stat.color,
                    marginBottom: '8px'
                  }}>
                    {stat.value}
                  </div>
                  <div style={{
                    fontSize: '14px', // CLAUDE ARTIFACTS LABEL SIZE
                    color: '#94a3b8',
                    fontWeight: '500'
                  }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* SCENE 4: Call to Action (270+ frames) - Claude Artifacts simple CTA */}
      <Sequence from={270}>
        <AbsoluteFill style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}>
          <div style={{
            opacity: interpolate(frame - 270, [0, 30], [0, 1]),
            transform: \`translateY(\${interpolate(frame - 270, [0, 30], [30, 0])}px)\`,
            maxWidth: '500px' // CLAUDE ARTIFACTS SAFE BOUNDS
          }}>
            <h2 style={{
              fontSize: '36px', // CLAUDE ARTIFACTS PERFECT FOR SHORT TEXT
              fontWeight: '700',
              color: '#ffffff',
              margin: '0 0 16px 0',
              lineHeight: '1.2'
            }}>
              Let's Build Together
            </h2>
            <p style={{
              fontSize: '18px', // CLAUDE ARTIFACTS READABLE
              color: '#94a3b8',
              margin: '0 0 8px 0'
            }}>
              github.com/endlessblink
            </p>
            <div style={{
              width: '60px',
              height: '3px',
              background: 'linear-gradient(90deg, #3b82f6, #10b981)',
              borderRadius: '2px',
              margin: '16px auto 0',
              opacity: 0.8
            }} />
          </div>
        </AbsoluteFill>
      </Sequence>

    </AbsoluteFill>
  );
};

export default ClaudeArtifactsGitHubShowcase;
`;

// Template metadata for MCP integration
export const CLAUDE_ARTIFACTS_TEMPLATE_CONFIG = {
  name: 'claude-artifacts-github-showcase',
  description: 'Clean, professional GitHub showcase using Claude Artifacts design principles converted to Remotion',
  features: [
    'Sequential timing with Sequence components (no overlapping chaos)',
    'Claude Artifacts spacing and typography (48px titles, proper hierarchy)',
    'Safe bounds and readable text (800px containers, appropriate font sizes)',
    'Professional gradient backgrounds (subtle, not distracting)',
    'Clean component organization (4 clear scenes)',
    'Reliable frame-based animations (no useState/useEffect issues)'
  ],
  designPrinciples: {
    fontSizes: {
      title: 48,      // Claude Artifacts safe title size
      heading: 32,    // Claude Artifacts section headings
      body: 18,       // Claude Artifacts readable body text
      caption: 14     // Claude Artifacts small text
    },
    spacing: {
      containerWidth: 800,   // Claude Artifacts safe container
      padding: [24, 32, 48, 80], // Claude Artifacts spacing scale
      gaps: [16, 24, 32, 48]     // Claude Artifacts consistent gaps
    },
    timing: {
      sceneLength: 90,    // 3 seconds per scene (Claude Artifacts pacing)
      transitionTime: 30, // 1 second transitions (smooth)
      totalDuration: 360  // 12 seconds total (Claude Artifacts length)
    }
  }
};