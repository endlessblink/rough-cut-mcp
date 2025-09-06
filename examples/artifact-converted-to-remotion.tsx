import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing, Sequence } from 'remotion';

const EndlessBlinkGitHubShowcase: React.FC = () => {
  const frame = useCurrentFrame();
  
  // Convert time-based animations to frame-based (following Method 3 pattern)
  const time = frame * 0.033; // Approximates 50ms intervals from original
  
  // Convert scene management to frame-based (6 seconds per scene = 180 frames at 30fps)
  const currentScene = Math.floor((frame / 180) % 4);

  // GitHub data (from original Artifact)
  const githubData = {
    user: {
      login: "endlessblink",
      name: "EndlessBlink",
      bio: "AI & Developer Tools Innovator",
      public_repos: 14,
      followers: 0,
      following: 0
    },
    featured_repos: [
      {
        name: "Like-I-Said-memory-mcp-server",
        description: "Advanced MCP Memory and Task Management for LLMs with AI Enhancement and React Dashboard",
        language: "TypeScript",
        stargazers_count: 0,
        forks_count: 0,
        topics: ["ai", "mcp", "memory", "llm", "react"]
      },
      {
        name: "Comfy-Guru",
        description: "ComfyUI Log Analysis & Error Detection MCP - Squash those errors peacefully",
        language: "Python", 
        stargazers_count: 4,
        forks_count: 0,
        topics: ["python", "comfyui", "debugging", "mcp"]
      }
    ],
    contribution_graph: Array.from({length: 365}, (_, i) => 
      Math.floor(Math.random() * 5) // 0-4 contribution levels
    )
  };

  // Floating particles (converted from Tailwind to inline styles)
  const FloatingParticles = () => {
    // Deterministic particles for video consistency
    const particles = Array.from({length: 25}, (_, i) => ({
      id: i,
      x: (i * 13.7 + 10) % 100, // Deterministic spread
      y: (i * 17.3 + 15) % 100,
      size: 2 + (i % 3),
      color: ['#21ba45', '#58a6ff', '#f85149', '#ffd33d'][i % 4]
    }));

    return (
      <AbsoluteFill style={{ overflow: 'hidden', pointerEvents: 'none' }}>
        {particles.map(particle => {
          // Convert to frame-based animation
          const driftX = particle.x + Math.sin((time + particle.id * 10) * 0.02) * 3;
          const driftY = particle.y + Math.cos((time + particle.id * 15) * 0.018) * 2;
          const scale = 1 + Math.sin((time + particle.id * 5) * 0.03) * 0.2;
          
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
                opacity: 0.6,
                borderRadius: '50%',
                boxShadow: `0 0 ${particle.size * 3}px ${particle.color}40`,
                transform: `translate(-50%, -50%) scale(${scale})`
              }}
            />
          );
        })}
      </AbsoluteFill>
    );
  };

  // GitHub contribution graph (converted to inline styles)
  const ContributionGraph = () => {
    const weeks = 53;
    const days = 7;
    
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(53, 1fr)',
        gap: '4px',
        padding: '16px',
        background: 'rgba(17, 24, 39, 0.5)',
        backdropFilter: 'blur(4px)',
        borderRadius: '16px',
        border: '1px solid rgba(75, 85, 99, 0.5)',
        transform: `scale(${0.8 + Math.sin(time * 0.005) * 0.1})`,
        opacity: currentScene === 1 ? 1 : 0.3,
        transition: 'opacity 1s ease-in-out',
        maxWidth: '800px'
      }}>
        {Array.from({length: weeks * days}).map((_, index) => {
          const intensity = githubData.contribution_graph[index] || 0;
          const colors = ['#0d1117', '#0e4429', '#006d32', '#26a641', '#39d353'];
          const revealDelay = index * 0.5; // Frame-based reveal
          const isVisible = frame > revealDelay;
          
          return (
            <div
              key={index}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '2px',
                backgroundColor: colors[intensity],
                transform: `scale(${isVisible ? 1 : 0})`,
                boxShadow: intensity > 2 ? `0 0 4px ${colors[intensity]}80` : 'none',
                transition: 'all 0.2s ease-out'
              }}
            />
          );
        })}
      </div>
    );
  };

  // Repository cards (converted from Tailwind)
  const RepositoryCard = ({ repo, index }: { repo: any, index: number }) => {
    const isActive = currentScene === 2;
    const cardFrame = frame - 360; // Start at 12 seconds
    
    return (
      <div style={{
        position: 'relative',
        transform: `translateY(${isActive ? 0 : 100}px) scale(${isActive ? 1 : 0.8})`,
        opacity: isActive ? interpolate(cardFrame, [index * 20, index * 20 + 40], [0, 1]) : 0,
        transition: `all 1s ease-out`
      }}>
        {/* Glassmorphism background */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))',
          borderRadius: '16px',
          filter: 'blur(20px)'
        }} />
        
        <div style={{
          position: 'relative',
          background: 'rgba(17, 24, 39, 0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(75, 85, 99, 0.5)',
          borderRadius: '16px',
          padding: '24px',
          transform: `scale(${1 + Math.sin((time + index) * 0.3) * 0.02})`
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
              color: '#ffffff',
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              paddingRight: '16px'
            }}>
              {repo.name}
            </h3>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              color: '#9ca3af'
            }}>
              ⭐ {repo.stargazers_count}
            </div>
          </div>
          
          <p style={{
            color: '#d1d5db',
            fontSize: '14px',
            margin: '0 0 16px 0',
            lineHeight: '1.4',
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
              <span style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: repo.language === 'Python' ? '#3776ab' : '#3178c6'
              }} />
              <span style={{
                fontSize: '14px',
                color: '#9ca3af'
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
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    color: 'rgb(147, 197, 253)',
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

  // Stats dashboard (converted from Tailwind)
  const StatsDashboard = () => {
    const isActive = currentScene === 3;
    const statsFrame = frame - 540; // Start at 18 seconds
    
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
        maxWidth: '512px',
        transform: `translateY(${isActive ? 0 : 50}px)`,
        opacity: isActive ? 1 : 0,
        transition: 'all 1s ease-out'
      }}>
        {statItems.map((stat, index) => (
          <div 
            key={stat.label}
            style={{
              position: 'relative',
              opacity: interpolate(statsFrame, [index * 15, index * 15 + 30], [0, 1])
            }}
          >
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              borderRadius: '16px',
              filter: 'blur(20px)',
              opacity: 0.5,
              backgroundColor: `${stat.color}40`
            }} />
            
            <div style={{
              position: 'relative',
              background: 'rgba(17, 24, 39, 0.8)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(75, 85, 99, 0.5)',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center',
              transform: `scale(${1 + Math.sin((time + index * 10) * 0.02) * 0.05})`
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{stat.icon}</div>
              <div style={{
                fontSize: '28px',
                fontWeight: '700',
                marginBottom: '8px',
                color: stat.color,
                textShadow: `0 0 20px ${stat.color}60`
              }}>
                {stat.value}
              </div>
              <div style={{
                color: '#9ca3af',
                fontSize: '14px',
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
      background: 'linear-gradient(135deg, #111827 0%, #1f2937 50%, #000000 100%)',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
      overflow: 'hidden'
    }}>

      {/* Dynamic mesh background (converted to inline styles) */}
      <AbsoluteFill style={{
        opacity: 0.3,
        background: `
          radial-gradient(circle at 20% 20%, rgba(33, 186, 69, 0.13) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(88, 166, 255, 0.13) 0%, transparent 50%),
          radial-gradient(circle at 60% 40%, rgba(255, 211, 61, 0.13) 0%, transparent 50%),
          radial-gradient(circle at 40% 80%, rgba(248, 81, 73, 0.13) 0%, transparent 50%)
        `
      }} />

      {/* Floating particles */}
      <FloatingParticles />

      {/* Scene 0: Main Title (0-180 frames / 0-6 seconds) */}
      <Sequence from={0} durationInFrames={180}>
        <AbsoluteFill style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '32px'
        }}>
          <h1 style={{
            fontSize: '128px', // Even bigger for video impact
            fontWeight: '900',
            marginBottom: '24px',
            background: 'linear-gradient(135deg, #60a5fa, #a855f7, #34d399)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            textShadow: '0 0 40px rgba(88, 166, 255, 0.5)',
            opacity: interpolate(frame, [20, 60], [0, 1], { easing: Easing.out }),
            transform: `translateY(${interpolate(frame, [20, 60], [30, 0], { easing: Easing.out })}px) scale(${interpolate(frame, [20, 60], [0.98, 1], { easing: Easing.out })})`
          }}>
            endlessblink
          </h1>
          <p style={{
            fontSize: '32px',
            color: '#d1d5db',
            fontWeight: '600',
            marginBottom: '32px',
            maxWidth: '512px',
            lineHeight: '1.6',
            opacity: interpolate(frame, [60, 100], [0, 1])
          }}>
            🚀 AI & Developer Tools Innovator
          </p>
          <p style={{
            fontSize: '18px',
            color: '#9ca3af',
            maxWidth: '768px',
            lineHeight: '1.6',
            margin: 0,
            opacity: interpolate(frame, [100, 140], [0, 1])
          }}>
            Building the future with intelligent automation, MCP servers, and cutting-edge developer experiences
          </p>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 1: Contribution Graph (180-360 frames / 6-12 seconds) */}
      <Sequence from={180} durationInFrames={180}>
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
            marginBottom: '32px',
            color: '#34d399',
            opacity: interpolate(frame - 180, [0, 40], [0, 1])
          }}>
            🏆 Contribution Activity
          </h2>
          <ContributionGraph />
          <p style={{
            color: '#9ca3af',
            marginTop: '24px',
            fontSize: '18px',
            opacity: interpolate(frame - 180, [60, 100], [0, 1])
          }}>
            Consistent innovation • Daily commits • Continuous growth
          </p>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 2: Featured Repositories (360-540 frames / 12-18 seconds) */}
      <Sequence from={360} durationInFrames={180}>
        <AbsoluteFill style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '80px'
        }}>
          <h2 style={{
            fontSize: '48px',
            fontWeight: '700',
            marginBottom: '48px',
            color: '#60a5fa',
            opacity: interpolate(frame - 360, [0, 40], [0, 1])
          }}>
            💎 Featured Projects
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 400px)',
            gap: '32px',
            maxWidth: '900px'
          }}>
            {githubData.featured_repos.map((repo, index) => (
              <RepositoryCard key={repo.name} repo={repo} index={index} />
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 3: Stats Dashboard (540-720 frames / 18-24 seconds) */}
      <Sequence from={540} durationInFrames={180}>
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
            color: '#a855f7',
            opacity: interpolate(frame - 540, [0, 40], [0, 1])
          }}>
            📊 Impact Metrics
          </h2>
          <StatsDashboard />
          <p style={{
            color: '#9ca3af',
            marginTop: '32px',
            fontSize: '20px',
            fontWeight: '500',
            opacity: interpolate(frame - 540, [80, 120], [0, 1])
          }}>
            🌟 Pioneering AI-Powered Developer Experience
          </p>
        </AbsoluteFill>
      </Sequence>

    </AbsoluteFill>
  );
};

export default EndlessBlinkGitHubShowcase;