import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing, Sequence } from 'remotion';

const ProfessionalGitHubShowcase: React.FC = () => {
  const frame = useCurrentFrame();
  const time = frame * 0.033;
  
  // Professional GitHub profile data
  const profileData = {
    username: "endlessblink",
    tagline: "Building AI-Powered Developer Tools",
    projects: [
      {
        name: "Like-I-Said MCP",
        description: "Memory & task management for AI assistants with persistent storage",
        tech: "TypeScript + React",
        impact: "High"
      },
      {
        name: "Comfy-Guru",
        description: "Intelligent ComfyUI debugging and log analysis platform",
        tech: "Python + AI",
        impact: "Medium"
      }
    ],
    achievements: [
      { metric: "14+", label: "Open Source Projects", color: "#21ba45" },
      { metric: "8+", label: "Programming Languages", color: "#58a6ff" },
      { metric: "100%", label: "AI Focus", color: "#f85149" },
      { metric: "24/7", label: "Innovation", color: "#ffd33d" }
    ]
  };

  // Rich animated tech background
  const TechBackground = () => (
    <AbsoluteFill style={{
      background: `
        linear-gradient(135deg, #0a0c10 0%, #1a1d23 50%, #000000 100%),
        radial-gradient(circle at ${20 + Math.sin(time * 0.005) * 3}% ${25 + Math.cos(time * 0.007) * 3}%, rgba(33, 186, 69, 0.1) 0%, transparent 60%),
        radial-gradient(circle at ${80 + Math.sin(time * 0.006) * 4}% ${75 + Math.cos(time * 0.004) * 3}%, rgba(88, 166, 255, 0.1) 0%, transparent 60%)
      `,
      opacity: 0.4
    }} />
  );

  // Code particles floating
  const CodeParticles = () => {
    const symbols = ['⚡', '🔧', '💻', '🚀', '{ }', '< >', '( )', '[ ]'];
    const particles = Array.from({length: 10}, (_, i) => ({
      id: i,
      x: (i * 37.3 + 15) % 100,
      y: (i * 27.7 + 20) % 100,
      symbol: symbols[i % 8],
      color: ['#21ba45', '#58a6ff', '#ffd33d'][i % 3]
    }));

    return (
      <AbsoluteFill style={{ overflow: 'hidden', pointerEvents: 'none' }}>
        {particles.map(particle => {
          const drift = Math.sin(time * 0.008 + particle.id * 3) * 1.5;
          const bob = Math.cos(time * 0.01 + particle.id * 2) * 1;
          
          return (
            <div
              key={particle.id}
              style={{
                position: 'absolute',
                left: `${particle.x + drift}%`,
                top: `${particle.y + bob}%`,
                fontSize: '18px',
                color: particle.color,
                opacity: 0.2 + Math.sin(time * 0.03 + particle.id) * 0.1,
                transform: 'translate(-50%, -50%)',
                textShadow: `0 0 10px ${particle.color}50`
              }}
            >
              {particle.symbol}
            </div>
          );
        })}
      </AbsoluteFill>
    );
  };

  return (
    <AbsoluteFill style={{
      background: '#000000',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
      overflow: 'hidden'
    }}>

      {/* Tech Background Layer */}
      <TechBackground />
      <CodeParticles />

      {/* Hero Section (0-300 frames / 0-10 seconds) */}
      <Sequence from={0} durationInFrames={300}>
        <AbsoluteFill style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '96px', // Frame 289 quality standard
            fontWeight: '900',
            background: 'linear-gradient(135deg, #21ba45 0%, #58a6ff 50%, #ffd33d 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            margin: '0 0 32px 0',
            letterSpacing: '-3px',
            opacity: interpolate(frame, [30, 80], [0, 1], { easing: Easing.out }),
            transform: `translateY(${interpolate(frame, [30, 80], [50, 0], { easing: Easing.out })}px)`,
            textShadow: '0 0 80px rgba(33, 186, 69, 0.4)'
          }}>
            {profileData.username}
          </h1>
          <p style={{
            fontSize: '32px',
            color: '#c9d1d9',
            fontWeight: '600',
            margin: '0 0 48px 0',
            opacity: interpolate(frame, [80, 140], [0, 1]),
            maxWidth: '900px',
            lineHeight: '1.4'
          }}>
            {profileData.tagline}
          </p>
          <div style={{
            padding: '16px 32px',
            background: 'rgba(88, 166, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(88, 166, 255, 0.3)',
            borderRadius: '50px',
            color: '#58a6ff',
            fontSize: '18px',
            fontWeight: '600',
            opacity: interpolate(frame, [140, 200], [0, 1])
          }}>
            ✨ Open Source Contributor
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Projects Showcase (300-600 frames / 10-20 seconds) */}
      <Sequence from={300} durationInFrames={300}>
        <AbsoluteFill style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px'
        }}>
          <h2 style={{
            fontSize: '48px',
            fontWeight: '700',
            color: '#21ba45',
            marginBottom: '64px',
            opacity: interpolate(frame - 300, [0, 40], [0, 1])
          }}>
            🚀 Featured Projects
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 500px)',
            gap: '40px',
            maxWidth: '1100px'
          }}>
            {profileData.projects.map((project, index) => {
              const projectFrame = frame - 300;
              return (
                <div 
                  key={project.name}
                  style={{
                    position: 'relative',
                    opacity: interpolate(projectFrame, [40 + index * 30, 80 + index * 30], [0, 1]),
                    transform: `translateY(${interpolate(projectFrame, [40 + index * 30, 80 + index * 30], [40, 0])}px)`
                  }}
                >
                  {/* Project glow effect */}
                  <div style={{
                    position: 'absolute',
                    top: '-10px', left: '-10px', right: '-10px', bottom: '-10px',
                    background: project.impact === 'High' ? 'rgba(33, 186, 69, 0.2)' : 'rgba(88, 166, 255, 0.2)',
                    borderRadius: '20px',
                    filter: 'blur(20px)',
                    opacity: 0.7
                  }} />
                  
                  <div style={{
                    position: 'relative',
                    background: 'rgba(13, 17, 23, 0.85)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(48, 54, 61, 0.8)',
                    borderRadius: '16px',
                    padding: '32px'
                  }}>
                    <h3 style={{
                      fontSize: '22px',
                      fontWeight: '700',
                      color: '#f0f6fc',
                      margin: '0 0 16px 0'
                    }}>
                      {project.name}
                    </h3>
                    <p style={{
                      fontSize: '16px',
                      color: '#c9d1d9',
                      margin: '0 0 20px 0',
                      lineHeight: '1.5'
                    }}>
                      {project.description}
                    </p>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <span style={{
                        color: '#8b949e',
                        fontSize: '14px'
                      }}>
                        {project.tech}
                      </span>
                      <div style={{
                        padding: '6px 12px',
                        backgroundColor: project.impact === 'High' ? 'rgba(33, 186, 69, 0.2)' : 'rgba(88, 166, 255, 0.2)',
                        color: project.impact === 'High' ? '#21ba45' : '#58a6ff',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {project.impact} Impact
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Achievement Stats (600-900 frames / 20-30 seconds) */}
      <Sequence from={600} durationInFrames={300}>
        <AbsoluteFill style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '48px',
            fontWeight: '700',
            color: '#ffd33d',
            marginBottom: '64px',
            opacity: interpolate(frame - 600, [0, 40], [0, 1])
          }}>
            📊 Developer Achievements
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 250px)',
            gap: '40px'
          }}>
            {profileData.achievements.map((achievement, index) => {
              const achFrame = frame - 600;
              return (
                <div 
                  key={achievement.label}
                  style={{
                    position: 'relative',
                    opacity: interpolate(achFrame, [50 + index * 20, 90 + index * 20], [0, 1])
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '-15px', left: '-15px', right: '-15px', bottom: '-15px',
                    borderRadius: '24px',
                    filter: 'blur(30px)',
                    opacity: 0.5,
                    backgroundColor: `${achievement.color}40`
                  }} />
                  
                  <div style={{
                    position: 'relative',
                    background: 'rgba(13, 17, 23, 0.9)',
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${achievement.color}30`,
                    borderRadius: '20px',
                    padding: '32px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '42px',
                      fontWeight: '900',
                      color: achievement.color,
                      marginBottom: '12px',
                      textShadow: `0 0 25px ${achievement.color}70`,
                      filter: `brightness(${1.1 + Math.sin((time + index * 5) * 0.02) * 0.1})`
                    }}>
                      {achievement.metric}
                    </div>
                    <div style={{
                      fontSize: '16px',
                      color: '#8b949e',
                      fontWeight: '500'
                    }}>
                      {achievement.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Final Call-to-Action (900+ frames / 30+ seconds) */}
      <Sequence from={900}>
        <AbsoluteFill style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}>
          <div style={{
            opacity: interpolate(frame - 900, [0, 50], [0, 1], { easing: Easing.out }),
            transform: `translateY(${interpolate(frame - 900, [0, 50], [30, 0], { easing: Easing.out })}px)`
          }}>
            <h2 style={{
              fontSize: '72px',
              fontWeight: '700',
              color: '#58a6ff',
              margin: '0 0 32px 0'
            }}>
              Ready to Collaborate?
            </h2>
            <p style={{
              fontSize: '24px',
              color: '#c9d1d9',
              margin: '0 0 48px 0',
              maxWidth: '800px',
              lineHeight: '1.6'
            }}>
              Let's build the future of AI-powered development tools together
            </p>
            <div style={{
              fontSize: '28px',
              color: '#21ba45',
              fontWeight: '600'
            }}>
              github.com/endlessblink
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>

    </AbsoluteFill>
  );
};

export default ProfessionalGitHubShowcase;