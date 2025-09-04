import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing, Sequence } from 'remotion';

const EndlessBlinkGitHubShowcase: React.FC = () => {
  const frame = useCurrentFrame();
  
  // Convert your time-based animations to frame-based
  const time = frame * 0.033; // Approximate your time increment

  // GitHub data (from your Artifacts version)
  const githubData = {
    user: {
      login: "endlessblink",
      name: "EndlessBlink", 
      bio: "AI & Developer Tools Innovator",
      public_repos: 14
    },
    featured_repos: [
      {
        name: "Like-I-Said-memory-mcp-server",
        description: "Advanced MCP Memory and Task Management for LLMs with AI Enhancement and React Dashboard",
        language: "TypeScript",
        stargazers_count: 0,
        topics: ["ai", "mcp", "memory", "llm", "react"]
      },
      {
        name: "Comfy-Guru", 
        description: "ComfyUI Log Analysis & Error Detection MCP - Squash those errors peacefully",
        language: "Python",
        stargazers_count: 4,
        topics: ["python", "comfyui", "debugging", "mcp"]
      }
    ],
    contribution_graph: Array.from({length: 365}, (_, i) => Math.floor(Math.random() * 5))
  };

  // Convert your scene management to frame-based (10 seconds per scene = 300 frames)
  const currentScene = Math.floor((frame / 300) % 4);

  // Rich Animated Background (from your Artifacts version)
  const AnimatedBackground = () => (
    <AbsoluteFill style={{
      background: `
        radial-gradient(circle at ${25 + Math.sin(time * 0.05) * 3}% ${25 + Math.cos(time * 0.07) * 3}%, rgba(33, 186, 69, 0.1) 0%, transparent 50%),
        radial-gradient(circle at ${75 + Math.sin(time * 0.06) * 4}% ${75 + Math.cos(time * 0.04) * 4}%, rgba(88, 166, 255, 0.1) 0%, transparent 50%),
        radial-gradient(circle at ${50 + Math.cos(time * 0.08) * 5}% ${50 + Math.sin(time * 0.09) * 3}%, rgba(255, 211, 61, 0.1) 0%, transparent 50%)
      `,
      opacity: 0.2 + Math.sin(time * 0.1) * 0.05
    }} />
  );

  // Floating Particles System (from your Artifacts version)
  const FloatingParticles = () => {
    const particles = [
      { id: 1, x: 20, y: 25, size: 2, color: '#21ba45' },
      { id: 2, x: 80, y: 20, size: 1.5, color: '#58a6ff' },
      { id: 3, x: 60, y: 70, size: 1.8, color: '#f85149' },
      { id: 4, x: 40, y: 45, size: 1.3, color: '#ffd33d' },
      { id: 5, x: 75, y: 60, size: 1.6, color: '#21ba45' },
      { id: 6, x: 25, y: 80, size: 1.4, color: '#58a6ff' }
    ];

    return (
      <AbsoluteFill style={{ overflow: 'hidden', pointerEvents: 'none' }}>
        {particles.map(particle => {
          // Convert your gentle drift to frame-based
          const driftX = particle.x + Math.sin(time * 0.2 + particle.id) * 0.5;
          const driftY = particle.y + Math.cos(time * 0.15 + particle.id * 0.7) * 0.3;
          const opacity = 0.15 + Math.sin(time * 0.3 + particle.id) * 0.08;
          
          return (
            <div
              key={particle.id}
              style={{
                position: 'absolute',
                left: `${driftX}%`,
                top: `${driftY}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                backgroundColor: particle.color,
                opacity: opacity,
                boxShadow: `0 0 ${particle.size * 4}px ${particle.color}30`,
                transform: 'translate(-50%, -50%)',
                filter: 'blur(1px)',
                borderRadius: '50%'
              }}
            />
          );
        })}
      </AbsoluteFill>
    );
  };

  // GitHub Contribution Graph (from your Artifacts version)
  const ContributionGraph = () => {
    const weeks = 53;
    const days = 7;
    
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(53, 1fr)',
        gap: '1px',
        padding: '24px',
        background: 'rgba(13, 17, 23, 0.5)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        border: '1px solid rgba(139, 148, 158, 0.2)',
        transform: `scale(${0.98 + Math.sin(time * 0.1) * 0.01})`,
        opacity: currentScene === 1 ? 1 : 0.3,
        maxWidth: '900px'
      }}>
        {Array.from({length: weeks * days}).map((_, index) => {
          const intensity = githubData.contribution_graph[index] || 0;
          const colors = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'];
          
          const revealDelay = index * 0.15; // Frame-based reveal
          const isVisible = frame > revealDelay;
          const gentlePulse = intensity > 0 ? 
            0.9 + Math.sin(time * 0.2 + index * 0.01) * 0.05 : 0.9;
          
          return (
            <div
              key={index}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '2px',
                backgroundColor: colors[intensity],
                transform: `scale(${isVisible ? gentlePulse : 0})`,
                opacity: isVisible ? (intensity > 0 ? 0.9 : 0.3) : 0,
                boxShadow: intensity > 2 ? `0 0 4px ${colors[intensity]}40` : 'none',
                transition: 'all 0.3s ease-out'
              }}
            />
          );
        })}
      </div>
    );
  };

  // Repository Cards with Glassmorphism (from your Artifacts version)
  const RepositoryCard = ({ repo, index }: { repo: any, index: number }) => {
    const isActive = currentScene === 2;
    const cardFrame = frame - 600; // Start at 20 seconds
    
    return (
      <div style={{
        position: 'relative',
        transform: `translateY(${isActive ? 0 : 100}px) scale(${isActive ? 1 : 0.8})`,
        opacity: isActive ? interpolate(cardFrame, [index * 20, index * 20 + 30], [0, 1]) : 0,
        transition: 'all 1s ease-out'
      }}>
        {/* Glassmorphism background blur */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))',
          borderRadius: '16px',
          filter: 'blur(20px)',
          transform: 'scale(1.1)'
        }} />
        
        <div style={{
          position: 'relative',
          background: 'rgba(13, 17, 23, 0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(139, 148, 158, 0.3)', 
          borderRadius: '16px',
          padding: '24px',
          transform: `scale(${1 + Math.sin((time + index) * 0.5) * 0.02})` // Gentle hover effect
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#f0f6fc',
              margin: 0,
              paddingRight: '16px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {repo.name}
            </h3>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              color: '#8b949e'
            }}>
              ⭐ {repo.stargazers_count}
            </div>
          </div>
          
          <p style={{
            color: '#c9d1d9',
            fontSize: '14px',
            margin: '0 0 16px 0',
            lineHeight: '1.5',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {repo.description}
          </p>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{
              display: 'flex', 
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '12px',
                height: '12px', 
                borderRadius: '50%',
                backgroundColor: repo.language === 'Python' ? '#3776ab' : '#3178c6'
              }} />
              <span style={{
                fontSize: '14px',
                color: '#8b949e'
              }}>
                {repo.language}
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '4px'
            }}>
              {repo.topics?.slice(0, 3).map((topic: string) => (
                <span 
                  key={topic}
                  style={{
                    padding: '4px 8px',
                    fontSize: '12px',
                    background: 'rgba(59, 130, 246, 0.2)',
                    color: '#79c0ff',
                    borderRadius: '16px'
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

  // Stats Dashboard with Rich Effects (from your Artifacts version)
  const StatsDashboard = () => {
    const isActive = currentScene === 3;
    const statsFrame = frame - 900; // Start at 30 seconds
    
    const statItems = [
      { label: "Repositories", value: "14+", color: "#21ba45", icon: "📁" },
      { label: "Stars Earned", value: "4⭐", color: "#58a6ff", icon: "⭐" },
      { label: "Languages", value: "8+", color: "#ffd33d", icon: "💻" },
      { label: "AI Focus", value: "100%", color: "#f85149", icon: "🤖" }
    ];

    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '24px',
        width: '100%',
        maxWidth: '600px',
        transform: `translateY(${isActive ? 0 : 50}px)`,
        opacity: isActive ? 1 : 0
      }}>
        {statItems.map((stat, index) => (
          <div 
            key={stat.label}
            style={{
              position: 'relative',
              opacity: interpolate(statsFrame, [index * 15, index * 15 + 30], [0, 1])
            }}
          >
            {/* Glowing background effect */}
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              borderRadius: '16px',
              filter: 'blur(20px)',
              opacity: 0.5,
              background: `${stat.color}40`
            }} />
            
            <div style={{
              position: 'relative',
              background: 'rgba(13, 17, 23, 0.8)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(139, 148, 158, 0.3)',
              borderRadius: '16px', 
              padding: '24px',
              textAlign: 'center',
              transform: `scale(${1 + Math.sin((time + index) * 0.3) * 0.03})` // Gentle pulse
            }}>
              <div style={{
                fontSize: '36px',
                marginBottom: '8px'
              }}>
                {stat.icon}
              </div>
              <div style={{
                fontSize: '32px',
                fontWeight: '700',
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
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #000000 100%)',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
      overflow: 'hidden'
    }}>

      {/* Rich Animated Background Layer */}
      <AnimatedBackground />
      
      {/* Floating Particles */}
      <FloatingParticles />

      {/* Scene 0: Main Title (0-300 frames / 0-10 seconds) */}
      <Sequence from={0} durationInFrames={300}>
        <AbsoluteFill style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          opacity: currentScene === 0 ? 1 : 0
        }}>
          <h1 style={{
            fontSize: '96px', // Rich like your Artifacts version
            fontWeight: '900',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #10b981)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            margin: '0 0 24px 0',
            letterSpacing: '-2px',
            filter: `brightness(${1 + Math.sin(time * 0.2) * 0.05})`,
            textShadow: '0 0 40px rgba(88, 166, 255, 0.3)'
          }}>
            endlessblink
          </h1>
          <p style={{
            fontSize: '24px',
            color: '#c9d1d9',
            fontWeight: '600',
            margin: '0 0 32px 0',
            maxWidth: '800px',
            lineHeight: '1.5'
          }}>
            🚀 AI & Developer Tools Innovator
          </p>
          <p style={{
            fontSize: '18px',
            color: '#8b949e',
            margin: 0,
            maxWidth: '900px',
            lineHeight: '1.6'
          }}>
            Building the future with intelligent automation, MCP servers, and cutting-edge developer experiences
          </p>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 1: Contribution Graph (300-600 frames / 10-20 seconds) */}
      <Sequence from={300} durationInFrames={300}>
        <AbsoluteFill style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          opacity: currentScene === 1 ? 1 : 0.3
        }}>
          <h2 style={{
            fontSize: '48px',
            fontWeight: '700',
            marginBottom: '32px',
            color: '#10b981'
          }}>
            🏆 Contribution Activity
          </h2>
          <ContributionGraph />
          <p style={{
            color: '#8b949e',
            marginTop: '24px',
            fontSize: '18px'
          }}>
            Consistent innovation • Daily commits • Continuous growth
          </p>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 2: Featured Repositories (600-900 frames / 20-30 seconds) */}
      <Sequence from={600} durationInFrames={300}>
        <AbsoluteFill style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          opacity: currentScene === 2 ? 1 : 0.3,
          padding: '80px'
        }}>
          <h2 style={{
            fontSize: '48px',
            fontWeight: '700',
            marginBottom: '48px',
            color: '#58a6ff'
          }}>
            💎 Featured Projects
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 450px)',
            gap: '32px',
            maxWidth: '1000px'
          }}>
            {githubData.featured_repos.map((repo, index) => (
              <RepositoryCard key={repo.name} repo={repo} index={index} />
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 3: Stats Dashboard (900+ frames / 30+ seconds) */}
      <Sequence from={900}>
        <AbsoluteFill style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          opacity: currentScene === 3 ? 1 : 0.3
        }}>
          <h2 style={{
            fontSize: '48px',
            fontWeight: '700',
            marginBottom: '48px',
            color: '#8b5cf6'
          }}>
            📊 Impact Metrics
          </h2>
          <StatsDashboard />
          <p style={{
            color: '#8b949e',
            marginTop: '32px',
            fontSize: '20px',
            fontWeight: '500'
          }}>
            🌟 Pioneering AI-Powered Developer Experience
          </p>
        </AbsoluteFill>
      </Sequence>

      {/* Scene Indicator Dots (like your Artifacts version) */}
      <AbsoluteFill style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingBottom: '32px'
      }}>
        <div style={{
          display: 'flex',
          gap: '12px'
        }}>
          {Array.from({length: 4}).map((_, index) => (
            <div
              key={index}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: currentScene === index ? '#58a6ff' : '#6e7681',
                transform: currentScene === index ? 'scale(1.25)' : 'scale(1)',
                boxShadow: currentScene === index ? '0 0 16px rgba(88, 166, 255, 0.5)' : 'none',
                transition: 'all 0.3s ease-out'
              }}
            />
          ))}
        </div>
      </AbsoluteFill>

      {/* GitHub Branding (like your Artifacts version) */}
      <div style={{
        position: 'absolute',
        top: '24px',
        right: '24px',
        color: '#8b949e',
        fontSize: '14px',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        📷 GitHub Showcase v2.1 - Frame: {frame}
      </div>

    </AbsoluteFill>
  );
};

export default EndlessBlinkGitHubShowcase;