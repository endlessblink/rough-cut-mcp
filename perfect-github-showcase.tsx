import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing, Sequence } from 'remotion';

const GitHubShowcase: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ 
      background: 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, system-ui, sans-serif'
    }}>

      {/* Title Section (0-90 frames / 0-3 seconds) */}
      <Sequence from={0} durationInFrames={90}>
        <AbsoluteFill style={{
          display: 'flex',
          alignItems: 'center', 
          justifyContent: 'center',
          textAlign: 'center'
        }}>
          <div style={{
            opacity: interpolate(frame, [10, 40], [0, 1], { easing: Easing.out }),
            transform: `translateY(${interpolate(frame, [10, 40], [30, 0], { easing: Easing.out })}px)`
          }}>
            <h1 style={{
              fontSize: '48px', // Safe size for any username
              fontWeight: '700',
              color: '#f0f6fc',
              margin: '0 0 16px 0',
              letterSpacing: '-1px'
            }}>
              endlessblink
            </h1>
            <p style={{
              fontSize: '18px',
              color: '#8b949e', 
              margin: 0
            }}>
              AI & Developer Tools Innovator 🚀
            </p>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Projects Section (90-270 frames / 3-9 seconds) */}
      <Sequence from={90} durationInFrames={180}>
        <AbsoluteFill style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px'
        }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: '600', 
            color: '#58a6ff',
            margin: '0 0 48px 0',
            opacity: interpolate(frame - 90, [0, 20], [0, 1])
          }}>
            Featured Projects
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 380px)',
            gap: '32px',
            maxWidth: '800px'
          }}>
            {[
              { name: 'Like-I-Said MCP', desc: 'Memory & Task Management', lang: 'TypeScript' },
              { name: 'Comfy-Guru', desc: 'ComfyUI Debug Tools', lang: 'Python' },
              { name: 'Rough-Cut MCP', desc: 'Video Generation', lang: 'TypeScript' },
              { name: 'AI Tools', desc: 'Developer Automation', lang: 'JavaScript' }
            ].map((project, i) => (
              <div key={i} style={{
                background: 'rgba(48, 54, 61, 0.8)',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid #30363d',
                opacity: interpolate(frame - 90, [20 + i * 15, 40 + i * 15], [0, 1], { easing: Easing.out }),
                transform: `translateY(${interpolate(frame - 90, [20 + i * 15, 40 + i * 15], [20, 0], { easing: Easing.out })}px)`
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#f0f6fc', 
                  margin: '0 0 8px 0'
                }}>
                  {project.name}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#8b949e',
                  margin: '0 0 12px 0',
                  lineHeight: '1.4'
                }}>
                  {project.desc}
                </p>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: project.lang === 'TypeScript' ? '#3178c6' : 
                                   project.lang === 'Python' ? '#3776ab' : '#f1e05a'
                  }} />
                  <span style={{
                    fontSize: '12px',
                    color: '#8b949e'
                  }}>
                    {project.lang}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Stats Section (270-450 frames / 9-15 seconds) */}
      <Sequence from={270} durationInFrames={180}>
        <AbsoluteFill style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            textAlign: 'center',
            opacity: interpolate(frame - 270, [0, 30], [0, 1]),
            transform: `scale(${interpolate(frame - 270, [0, 30], [0.9, 1], { easing: Easing.out })})`
          }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '600',
              color: '#f0f6fc',
              margin: '0 0 32px 0'
            }}>
              Development Impact
            </h2>
            
            <div style={{
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 200px)',
              gap: '32px',
              justifyContent: 'center'
            }}>
              {[
                { label: 'Repositories', value: '14+', color: '#238636' },
                { label: 'Languages', value: '8+', color: '#58a6ff' },
                { label: 'Stars', value: '4', color: '#ffd33d' },
                { label: 'MCP Tools', value: '3', color: '#f85149' }
              ].map((stat, i) => (
                <div key={i} style={{
                  textAlign: 'center',
                  opacity: interpolate(frame - 270, [30 + i * 10, 50 + i * 10], [0, 1])
                }}>
                  <div style={{
                    fontSize: '32px',
                    fontWeight: '700',
                    color: stat.color,
                    margin: '0 0 4px 0'
                  }}>
                    {stat.value}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#8b949e'
                  }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Call to Action (450+ frames / 15+ seconds) */}
      <Sequence from={450}>
        <AbsoluteFill style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}>
          <div style={{
            opacity: interpolate(frame - 450, [0, 30], [0, 1]),
            transform: `translateY(${interpolate(frame - 450, [0, 30], [20, 0])}px)`
          }}>
            <h2 style={{
              fontSize: '36px',
              fontWeight: '600', 
              color: '#f0f6fc',
              margin: '0 0 16px 0'
            }}>
              Let's Collaborate
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#58a6ff',
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

export default GitHubShowcase;