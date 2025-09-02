import React from 'react';
import { Composition } from 'remotion';
import { GitHubShowcase } from './GitHubShowcase';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="GitHubShowcase"
        component={GitHubShowcase}
        durationInFrames={900} // 30 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          username: 'endlessblink',
          repositories: [
            {
              name: 'Like-I-Said-memory-mcp-server',
              description: 'Like-I-Said v2 - Advanced MCP Memory and Task Management for LLM\'s with AI Enhancement and React Dashboard',
              language: 'JavaScript',
              stars: 15,
              commits: 142,
              color: '#f1e05a'
            },
            {
              name: 'Comfy-Guru',
              description: 'Comfy-Guru is an mcp that connects Claude Desktop to your comfyui logs - to squash those errors (peacefully)',
              language: 'Python',
              stars: 4,
              commits: 68,
              color: '#3572A5'
            },
            {
              name: 'AI-Tools-Collection',
              description: 'A curated collection of AI development tools and utilities',
              language: 'TypeScript',
              stars: 8,
              commits: 94,
              color: '#2b7489'
            },
            {
              name: 'Neural-Network-Experiments',
              description: 'Experimental neural network implementations and research',
              language: 'Python',
              stars: 12,
              commits: 156,
              color: '#3572A5'
            }
          ]
        }}
      />
    </>
  );
};

// Main GitHub Showcase Component
export const GitHubShowcase: React.FC<{
  username: string;
  repositories: Array<{
    name: string;
    description: string;
    language: string;
    stars: number;
    commits: number;
    color: string;
  }>;
}> = ({ username, repositories }) => {
  const {
    frame,
    useCurrentFrame,
    useVideoConfig,
    interpolate,
    spring,
    Easing,
    AbsoluteFill,
  } = require('remotion');

  const currentFrame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animation timing phases (in frames)
  const INTRO_START = 0;
  const INTRO_END = 120;
  const PROFILE_START = 60;
  const PROFILE_END = 240;
  const REPOS_START = 180;
  const REPOS_END = 480;
  const LANGUAGES_START = 420;
  const LANGUAGES_END = 600;
  const STATS_START = 540;
  const STATS_END = 720;
  const OUTRO_START = 660;
  const OUTRO_END = 900;

  // Title animation
  const titleOpacity = interpolate(
    currentFrame,
    [INTRO_START, INTRO_START + 30, INTRO_END - 30, INTRO_END],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const titleScale = spring({
    frame: currentFrame - INTRO_START,
    fps,
    config: { damping: 8, stiffness: 100 }
  });

  // Profile section animation
  const profileOpacity = interpolate(
    currentFrame,
    [PROFILE_START, PROFILE_START + 30, PROFILE_END - 30, PROFILE_END],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const profileTranslateY = interpolate(
    currentFrame,
    [PROFILE_START, PROFILE_START + 60],
    [50, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }
  );

  // Repository grid animation
  const reposOpacity = interpolate(
    currentFrame,
    [REPOS_START, REPOS_START + 30, REPOS_END - 30, REPOS_END],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Languages chart animation
  const languagesOpacity = interpolate(
    currentFrame,
    [LANGUAGES_START, LANGUAGES_START + 30, LANGUAGES_END - 30, LANGUAGES_END],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Stats animation
  const statsOpacity = interpolate(
    currentFrame,
    [STATS_START, STATS_START + 30, STATS_END - 30, STATS_END],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Background gradient
  const bgGradient = `linear-gradient(135deg, #0d1117 0%, #161b22 50%, #21262d 100%)`;

  // Calculate language distribution
  const languageStats = repositories.reduce((acc, repo) => {
    acc[repo.language] = (acc[repo.language] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalRepos = repositories.length;
  const totalStars = repositories.reduce((sum, repo) => sum + repo.stars, 0);
  const totalCommits = repositories.reduce((sum, repo) => sum + repo.commits, 0);

  return (
    <AbsoluteFill style={{ background: bgGradient, fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Animated background particles */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        zIndex: 0
      }}>
        {[...Array(20)].map((_, i) => {
          const particleDelay = i * 10;
          const particleOpacity = interpolate(
            currentFrame,
            [particleDelay, particleDelay + 100],
            [0, 0.1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          const particleY = interpolate(
            currentFrame,
            [0, 900],
            [Math.random() * 1080, Math.random() * 1080 - 200],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${Math.random() * 100}%`,
                top: particleY,
                width: '4px',
                height: '4px',
                background: '#58a6ff',
                borderRadius: '50%',
                opacity: particleOpacity,
                transform: `scale(${Math.random() * 2 + 0.5})`
              }}
            />
          );
        })}
      </div>

      {/* Title Screen */}
      {currentFrame >= INTRO_START && currentFrame <= INTRO_END && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) scale(${titleScale})`,
          opacity: titleOpacity,
          textAlign: 'center',
          zIndex: 10
        }}>
          <h1 style={{
            fontSize: '120px',
            fontWeight: '700',
            color: '#f0f6fc',
            margin: 0,
            textShadow: '0 0 30px rgba(88, 166, 255, 0.5)',
            background: 'linear-gradient(45deg, #58a6ff, #79c0ff, #a5f3fc)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {username}
          </h1>
          <div style={{
            fontSize: '32px',
            color: '#8b949e',
            marginTop: '20px',
            fontWeight: '400'
          }}>
            GitHub Profile Showcase
          </div>
        </div>
      )}

      {/* Profile Overview */}
      {currentFrame >= PROFILE_START && currentFrame <= PROFILE_END && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) translateY(${profileTranslateY}px)`,
          opacity: profileOpacity,
          textAlign: 'center',
          zIndex: 10
        }}>
          <div style={{
            background: 'rgba(33, 38, 45, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(240, 246, 252, 0.1)',
            borderRadius: '16px',
            padding: '60px',
            minWidth: '600px'
          }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'linear-gradient(45deg, #58a6ff, #79c0ff)',
              margin: '0 auto 30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
              fontWeight: '700',
              color: '#0d1117'
            }}>
              {username[0].toUpperCase()}
            </div>
            <h2 style={{
              fontSize: '48px',
              color: '#f0f6fc',
              margin: '0 0 20px 0',
              fontWeight: '600'
            }}>
              @{username}
            </h2>
            <p style={{
              fontSize: '24px',
              color: '#8b949e',
              margin: 0,
              lineHeight: 1.5
            }}>
              AI & Machine Learning Developer<br/>
              Building the future with code
            </p>
          </div>
        </div>
      )}

      {/* Repository Grid */}
      {currentFrame >= REPOS_START && currentFrame <= REPOS_END && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: reposOpacity,
          zIndex: 10
        }}>
          <h2 style={{
            fontSize: '48px',
            color: '#f0f6fc',
            textAlign: 'center',
            marginBottom: '40px',
            fontWeight: '600'
          }}>
            Featured Repositories
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '24px',
            width: '1200px'
          }}>
            {repositories.map((repo, index) => {
              const cardDelay = (currentFrame - REPOS_START) - (index * 15);
              const cardOpacity = interpolate(
                cardDelay,
                [0, 30],
                [0, 1],
                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
              );
              const cardTranslateY = interpolate(
                cardDelay,
                [0, 30],
                [30, 0],
                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }
              );

              return (
                <div
                  key={repo.name}
                  style={{
                    background: 'rgba(33, 38, 45, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(240, 246, 252, 0.1)',
                    borderRadius: '12px',
                    padding: '24px',
                    opacity: cardOpacity,
                    transform: `translateY(${cardTranslateY}px)`,
                    minHeight: '160px'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: repo.color,
                      marginRight: '12px'
                    }} />
                    <h3 style={{
                      fontSize: '20px',
                      color: '#58a6ff',
                      margin: 0,
                      fontWeight: '600'
                    }}>
                      {repo.name}
                    </h3>
                  </div>
                  <p style={{
                    fontSize: '14px',
                    color: '#8b949e',
                    margin: '0 0 16px 0',
                    lineHeight: 1.4
                  }}>
                    {repo.description}
                  </p>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    fontSize: '14px',
                    color: '#8b949e'
                  }}>
                    <span>★ {repo.stars}</span>
                    <span>• {repo.commits} commits</span>
                    <span>• {repo.language}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Languages Chart */}
      {currentFrame >= LANGUAGES_START && currentFrame <= LANGUAGES_END && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: languagesOpacity,
          textAlign: 'center',
          zIndex: 10
        }}>
          <h2 style={{
            fontSize: '48px',
            color: '#f0f6fc',
            marginBottom: '40px',
            fontWeight: '600'
          }}>
            Programming Languages
          </h2>
          <div style={{
            background: 'rgba(33, 38, 45, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(240, 246, 252, 0.1)',
            borderRadius: '16px',
            padding: '40px',
            minWidth: '600px'
          }}>
            {Object.entries(languageStats).map(([language, count], index) => {
              const percentage = (count / totalRepos) * 100;
              const barWidth = interpolate(
                currentFrame - LANGUAGES_START,
                [index * 20, index * 20 + 60],
                [0, percentage],
                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
              );
              
              const colors = {
                JavaScript: '#f1e05a',
                Python: '#3572A5',
                TypeScript: '#2b7489'
              };

              return (
                <div key={language} style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '24px'
                }}>
                  <div style={{
                    width: '120px',
                    textAlign: 'left',
                    fontSize: '18px',
                    color: '#f0f6fc',
                    fontWeight: '500'
                  }}>
                    {language}
                  </div>
                  <div style={{
                    flex: 1,
                    height: '8px',
                    background: 'rgba(240, 246, 252, 0.1)',
                    borderRadius: '4px',
                    margin: '0 20px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${barWidth}%`,
                      background: colors[language as keyof typeof colors] || '#58a6ff',
                      borderRadius: '4px',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                  <div style={{
                    width: '60px',
                    textAlign: 'right',
                    fontSize: '16px',
                    color: '#8b949e'
                  }}>
                    {Math.round(percentage)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Statistics */}
      {currentFrame >= STATS_START && currentFrame <= STATS_END && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: statsOpacity,
          textAlign: 'center',
          zIndex: 10
        }}>
          <h2 style={{
            fontSize: '48px',
            color: '#f0f6fc',
            marginBottom: '40px',
            fontWeight: '600'
          }}>
            GitHub Statistics
          </h2>
          <div style={{
            display: 'flex',
            gap: '40px',
            justifyContent: 'center'
          }}>
            {[
              { label: 'Repositories', value: totalRepos, color: '#58a6ff' },
              { label: 'Total Stars', value: totalStars, color: '#f1e05a' },
              { label: 'Total Commits', value: totalCommits, color: '#3fb950' }
            ].map((stat, index) => {
              const statDelay = (currentFrame - STATS_START) - (index * 20);
              const statScale = spring({
                frame: Math.max(0, statDelay),
                fps,
                config: { damping: 10, stiffness: 200 }
              });

              return (
                <div
                  key={stat.label}
                  style={{
                    background: 'rgba(33, 38, 45, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(240, 246, 252, 0.1)',
                    borderRadius: '16px',
                    padding: '40px',
                    minWidth: '200px',
                    transform: `scale(${statScale})`
                  }}
                >
                  <div style={{
                    fontSize: '48px',
                    fontWeight: '700',
                    color: stat.color,
                    marginBottom: '12px'
                  }}>
                    {stat.value}
                  </div>
                  <div style={{
                    fontSize: '18px',
                    color: '#8b949e',
                    fontWeight: '500'
                  }}>
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Outro */}
      {currentFrame >= OUTRO_START && currentFrame <= OUTRO_END && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: interpolate(
            currentFrame,
            [OUTRO_START, OUTRO_START + 30, OUTRO_END - 30, OUTRO_END],
            [0, 1, 1, 0],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          ),
          textAlign: 'center',
          zIndex: 10
        }}>
          <h2 style={{
            fontSize: '64px',
            color: '#f0f6fc',
            marginBottom: '20px',
            fontWeight: '600'
          }}>
            github.com/{username}
          </h2>
          <p style={{
            fontSize: '24px',
            color: '#8b949e',
            margin: 0
          }}>
            Follow the journey
          </p>
        </div>
      )}
    </AbsoluteFill>
  );
};

// Compatibility exports for both import patterns
export { RemotionRoot as VideoComposition };
export default RemotionRoot;