import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing, Sequence } from 'remotion';

const GitHubProfileShowcase: React.FC = () => {
  const frame = useCurrentFrame();
  const time = frame * 0.033;

  // GitHub data for showcase
  const githubData = {
    profile: {
      username: "endlessblink",
      name: "EndlessBlink",
      bio: "AI & Developer Tools Innovator",
      followers: 42,
      following: 28,
      repositories: 14
    },
    repositories: [
      {
        name: "Like-I-Said Memory MCP",
        description: "Advanced memory and task management for LLMs with AI enhancement capabilities",
        language: "TypeScript",
        stars: 8,
        topics: ["ai", "mcp", "memory", "llm"]
      },
      {
        name: "Comfy-Guru",
        description: "ComfyUI log analysis and error detection tools for peaceful debugging",
        language: "Python", 
        stars: 4,
        topics: ["python", "comfyui", "debugging"]
      },
      {
        name: "Rough-Cut MCP",
        description: "Seamless AI-to-video workflow with Remotion integration",
        language: "TypeScript",
        stars: 2,
        topics: ["remotion", "video", "ai"]
      }
    ],
    stats: [
      { label: "Projects", value: "14+", color: "#21ba45", icon: "🚀" },
      { label: "Stars", value: "14", color: "#58a6ff", icon: "⭐" },
      { label: "Languages", value: "8+", color: "#ffd33d", icon: "💻" },
      { label: "AI Focus", value: "100%", color: "#f85149", icon: "🤖" }
    ]
  };

  // Scene management (10 seconds per scene = 300 frames at 30fps)
  const currentScene = Math.floor((frame / 300) % 4);

  // Floating code particles for tech atmosphere
  const FloatingCodeParticles = () => {
    const particles = Array.from({length: 12}, (_, i) => ({
      id: i,
      x: (i * 31.7 + 20) % 100,
      y: (i * 23.1 + 15) % 100, 
      size: 1.5 + (i % 3) * 0.5,
      color: ['#21ba45', '#58a6ff', '#ffd33d', '#f85149'][i % 4],
      symbol: ['{ }', '< >', '( )', '[ ]', '⚡', '🔧', '📱', '💡'][i % 8]
    }));

    return (
      <AbsoluteFill style={{ overflow: 'hidden', pointerEvents: 'none' }}>
        {particles.map(particle => {
          const driftX = particle.x + Math.sin(time * 0.01 + particle.id * 4) * 2;
          const driftY = particle.y + Math.cos(time * 0.008 + particle.id * 6) * 1.5;
          const opacity = 0.15 + Math.sin(time * 0.02 + particle.id * 2) * 0.1;
          
          return (
            <div
              key={particle.id}
              style={{
                position: 'absolute',
                left: `${driftX}%`,
                top: `${driftY}%`,
                fontSize: `${particle.size * 12}px`,
                color: particle.color,
                opacity: opacity,
                transform: 'translate(-50%, -50%)',
                fontWeight: '600',
                textShadow: `0 0 8px ${particle.color}40`
              }}
            >
              {particle.symbol}
            </div>
          );
        })}
      </AbsoluteFill>
    );
  };

  // Rich animated background
  const AnimatedBackground = () => (
    <AbsoluteFill style={{
      background: `
        linear-gradient(135deg, #0d1117 0%, #161b22 50%, #000000 100%),
        radial-gradient(circle at ${25 + Math.sin(time * 0.006) * 4}% ${30 + Math.cos(time * 0.008) * 3}%, rgba(33, 186, 69, 0.08) 0%, transparent 50%),
        radial-gradient(circle at ${75 + Math.sin(time * 0.007) * 5}% ${70 + Math.cos(time * 0.005) * 4}%, rgba(88, 166, 255, 0.08) 0%, transparent 50%),
        radial-gradient(circle at ${50 + Math.cos(time * 0.009) * 3}% ${50 + Math.sin(time * 0.01) * 3}%, rgba(255, 211, 61, 0.06) 0%, transparent 50%)
      `,
      opacity: 0.3 + Math.sin(time * 0.05) * 0.05
    }} />
  );

  // Repository cards with glassmorphism
  const RepositoryCard = ({ repo, index }: { repo: any, index: number }) => {
    const isActive = currentScene === 1;
    const cardFrame = frame - 300;
    
    return (
      <div style={{
        position: 'relative',
        transform: `translateY(${isActive ? 0 : 60}px)`,
        opacity: isActive ? interpolate(cardFrame, [index * 20, index * 20 + 40], [0, 1]) : 0
      }}>
        {/* Glassmorphism glow */}
        <div style={{
          position: 'absolute',
          top: '-8px', left: '-8px', right: '-8px', bottom: '-8px',
          background: 'linear-gradient(135deg, rgba(33, 186, 69, 0.2), rgba(88, 166, 255, 0.2))',
          borderRadius: '20px',
          filter: 'blur(15px)',
          opacity: 0.6
        }} />
        
        <div style={{
          position: 'relative',
          background: 'rgba(22, 27, 34, 0.85)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(48, 54, 61, 0.8)',
          borderRadius: '16px',
          padding: '24px',
          transform: `scale(${1 + Math.sin((time + index) * 0.4) * 0.02})`
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#f0f6fc',
              margin: 0
            }}>
              {repo.name}
            </h3>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#ffd33d'
            }}>
              ⭐ {repo.stars}
            </div>
          </div>
          
          <p style={{
            color: '#c9d1d9',
            fontSize: '14px',
            margin: '0 0 16px 0',
            lineHeight: '1.5'
          }}>
            {repo.description}
          </p>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: repo.language === 'TypeScript' ? '#3178c6' : '#3776ab'
              }} />
              <span style={{ fontSize: '12px', color: '#8b949e' }}>{repo.language}</span>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {repo.topics.slice(0, 2).map((topic: string) => (
                <span 
                  key={topic}
                  style={{
                    padding: '2px 8px',
                    fontSize: '11px',
                    backgroundColor: 'rgba(88, 166, 255, 0.2)',
                    color: '#79c0ff',
                    borderRadius: '12px'
                  }}
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Stats dashboard
  const StatsDashboard = () => {
    const isActive = currentScene === 2;
    const statsFrame = frame - 600;
    
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '32px',
        width: '100%',
        maxWidth: '600px',
        transform: `translateY(${isActive ? 0 : 40}px)`,
        opacity: isActive ? 1 : 0
      }}>
        {githubData.stats.map((stat, index) => (
          <div 
            key={stat.label}
            style={{
              position: 'relative',
              opacity: interpolate(statsFrame, [index * 15, index * 15 + 30], [0, 1])
            }}
          >
            <div style={{
              position: 'absolute',
              top: '-12px', left: '-12px', right: '-12px', bottom: '-12px',
              borderRadius: '20px',
              filter: 'blur(25px)',
              opacity: 0.4,
              backgroundColor: `${stat.color}40`
            }} />
            
            <div style={{
              position: 'relative',
              background: 'rgba(13, 17, 23, 0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(48, 54, 61, 0.6)',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center',
              transform: `scale(${1 + Math.sin((time + index * 8) * 0.025) * 0.03})`
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{stat.icon}</div>
              <div style={{
                fontSize: '36px',
                fontWeight: '900',
                marginBottom: '8px',
                color: stat.color,
                textShadow: `0 0 20px ${stat.color}60`
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#8b949e',
                fontWeight: '500'
              }}>
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <AbsoluteFill style={{
      background: 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
      overflow: 'hidden'
    }}>

      {/* Rich Animated Background */}
      <AnimatedBackground />
      
      {/* Floating Code Particles */}
      <FloatingCodeParticles />

      {/* Scene 0: Profile Introduction (0-300 frames / 0-10 seconds) */}
      <Sequence from={0} durationInFrames={300}>
        <AbsoluteFill style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '96px', // Frame 289 standard
            fontWeight: '900',
            background: 'linear-gradient(135deg, #21ba45, #58a6ff, #ffd33d)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            margin: '0 0 24px 0',
            letterSpacing: '-2px',
            opacity: interpolate(frame, [20, 60], [0, 1], { easing: Easing.out }),
            transform: `translateY(${interpolate(frame, [20, 60], [40, 0], { easing: Easing.out })}px)`,
            textShadow: '0 0 60px rgba(33, 186, 69, 0.3)'
          }}>
            {githubData.profile.username}
          </h1>
          <p style={{
            fontSize: '28px',
            color: '#c9d1d9',
            fontWeight: '600',
            margin: '0 0 40px 0',
            opacity: interpolate(frame, [60, 100], [0, 1])
          }}>
            {githubData.profile.bio}
          </p>
          <div style={{
            display: 'flex',
            gap: '40px',
            fontSize: '18px',
            color: '#8b949e',
            opacity: interpolate(frame, [100, 140], [0, 1])
          }}>
            <span>{githubData.profile.repositories} repos</span>
            <span>•</span>
            <span>{githubData.profile.followers} followers</span>
            <span>•</span>
            <span>{githubData.profile.following} following</span>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 1: Featured Repositories (300-600 frames / 10-20 seconds) */}
      <Sequence from={300} durationInFrames={300}>
        <AbsoluteFill style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px'
        }}>
          <h2 style={{
            fontSize: '48px',
            fontWeight: '700',
            marginBottom: '48px',
            color: '#58a6ff',
            opacity: interpolate(frame - 300, [0, 40], [0, 1])
          }}>
            🌟 Featured Projects
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 400px)',
            gap: '32px',
            maxWidth: '1300px'
          }}>
            {githubData.repositories.map((repo, index) => (
              <RepositoryCard key={repo.name} repo={repo} index={index} />
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 2: Impact Stats (600-900 frames / 20-30 seconds) */}
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
            marginBottom: '48px',
            color: '#21ba45',
            opacity: interpolate(frame - 600, [0, 40], [0, 1])
          }}>
            📊 Developer Impact
          </h2>
          <StatsDashboard />
        </AbsoluteFill>
      </Sequence>

      {/* Scene 3: Call to Collaborate (900+ frames / 30+ seconds) */}
      <Sequence from={900}>
        <AbsoluteFill style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '64px',
            fontWeight: '700',
            marginBottom: '24px',
            color: '#ffd33d',
            opacity: interpolate(frame - 900, [0, 40], [0, 1], { easing: Easing.out }),
            transform: `translateY(${interpolate(frame - 900, [0, 40], [30, 0], { easing: Easing.out })}px)`
          }}>
            Let's Build Together
          </h2>
          <p style={{
            fontSize: '24px',
            color: '#c9d1d9',
            margin: '0 0 40px 0',
            maxWidth: '700px',
            lineHeight: '1.6',
            opacity: interpolate(frame - 900, [40, 80], [0, 1])
          }}>
            Collaborating on AI-powered developer tools that make complex workflows simple
          </p>
          <div style={{
            fontSize: '20px',
            color: '#58a6ff',
            fontWeight: '600',
            opacity: interpolate(frame - 900, [80, 120], [0, 1])
          }}>
            github.com/endlessblink
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Frame counter for development */}
      <div style={{
        position: 'absolute',
        top: '24px',
        right: '24px',
        color: '#6e7681',
        fontSize: '14px',
        fontFamily: 'monospace'
      }}>
        Frame: {frame}
      </div>

    </AbsoluteFill>
  );
};

export default GitHubProfileShowcase;