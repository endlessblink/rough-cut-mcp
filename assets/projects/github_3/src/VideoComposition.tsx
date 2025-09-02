import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

const GitHubShowcase = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animation timings
  const introEnd = fps * 3;
  const profileEnd = fps * 8;
  const statsEnd = fps * 15;
  const reposEnd = fps * 22;
  const outroStart = fps * 25;

  // Smooth easing function
  const smoothEase = Easing.bezier(0.25, 0.46, 0.45, 0.94);

  return (
    <AbsoluteFill style={{ backgroundColor: '#0d1117' }}>
      {/* Animated background gradient */}
      <div
        style={{
          position: 'absolute',
          width: '200%',
          height: '200%',
          background: `
            radial-gradient(circle at 20% 30%, rgba(88, 166, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(255, 107, 237, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(46, 160, 67, 0.06) 0%, transparent 50%)
          `,
          transform: `rotate(${interpolate(frame, [0, fps * 30], [0, 360], { extrapolateRight: 'clamp' })}deg)`,
        }}
      />

      {/* Intro Animation */}
      <Sequence from={0} durationInFrames={introEnd}>
        <IntroSection frame={frame} fps={fps} />
      </Sequence>

      {/* Profile Section */}
      <Sequence from={introEnd - fps * 0.5} durationInFrames={profileEnd - introEnd + fps * 0.5}>
        <ProfileSection frame={frame - introEnd + fps * 0.5} fps={fps} />
      </Sequence>

      {/* Stats Section */}
      <Sequence from={profileEnd - fps * 0.5} durationInFrames={statsEnd - profileEnd + fps * 0.5}>
        <StatsSection frame={frame - profileEnd + fps * 0.5} fps={fps} />
      </Sequence>

      {/* Repositories Section */}
      <Sequence from={statsEnd - fps * 0.5} durationInFrames={reposEnd - statsEnd + fps * 0.5}>
        <ReposSection frame={frame - statsEnd + fps * 0.5} fps={fps} />
      </Sequence>

      {/* Outro */}
      <Sequence from={outroStart}>
        <OutroSection frame={frame - outroStart} fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};

const IntroSection = ({ frame, fps }) => {
  const opacity = interpolate(frame, [0, fps * 1], [0, 1], { 
    easing: Easing.bezier(0.25, 0.46, 0.45, 0.94) 
  });
  const scale = interpolate(frame, [0, fps * 1.5], [0.8, 1], { 
    easing: Easing.bezier(0.175, 0.885, 0.32, 1.275) 
  });
  const y = interpolate(frame, [0, fps * 1], [50, 0], { 
    easing: Easing.bezier(0.25, 0.46, 0.45, 0.94) 
  });

  return (
    <AbsoluteFill style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      opacity,
      transform: `translateY(${y}px) scale(${scale})`
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontSize: '72px',
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #58a6ff, #ff6bff)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          marginBottom: '20px',
          fontFamily: 'Inter, sans-serif',
        }}>
          GitHub
        </div>
        <div style={{
          fontSize: '24px',
          color: '#7d8590',
          fontFamily: 'Inter, sans-serif',
          fontWeight: '300',
        }}>
          Developer Showcase
        </div>
      </div>
    </AbsoluteFill>
  );
};

const ProfileSection = ({ frame, fps }) => {
  const opacity = interpolate(frame, [0, fps * 1], [0, 1]);
  const x = interpolate(frame, [0, fps * 1], [-100, 0], { 
    easing: Easing.bezier(0.25, 0.46, 0.45, 0.94) 
  });

  return (
    <AbsoluteFill style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      opacity,
      transform: `translateX(${x}px)`
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '40px',
        backgroundColor: 'rgba(33, 38, 45, 0.8)',
        padding: '40px 60px',
        borderRadius: '20px',
        border: '1px solid rgba(240, 246, 252, 0.1)',
        backdropFilter: 'blur(10px)',
      }}>
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #58a6ff, #ff6bff)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '48px',
          color: 'white',
          fontWeight: 'bold',
          fontFamily: 'Inter, sans-serif',
        }}>
          DEV
        </div>
        <div>
          <h2 style={{
            fontSize: '36px',
            color: '#f0f6fc',
            margin: '0 0 10px 0',
            fontFamily: 'Inter, sans-serif',
            fontWeight: '600',
          }}>
            Developer Profile
          </h2>
          <p style={{
            fontSize: '18px',
            color: '#7d8590',
            margin: '0',
            fontFamily: 'Inter, sans-serif',
          }}>
            Building amazing projects on GitHub
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const StatsSection = ({ frame, fps }) => {
  const opacity = interpolate(frame, [0, fps * 1], [0, 1]);
  const y = interpolate(frame, [0, fps * 1.5], [100, 0], { 
    easing: Easing.bezier(0.25, 0.46, 0.45, 0.94) 
  });

  const stats = [
    { label: 'Repositories', value: '42', color: '#58a6ff', icon: '📚' },
    { label: 'Followers', value: '256', color: '#ff6bff', icon: '👥' },
    { label: 'Contributions', value: '1.2k+', color: '#2ea043', icon: '🔥' },
    { label: 'Stars Earned', value: '847', color: '#ffa657', icon: '⭐' },
  ];

  return (
    <AbsoluteFill style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      opacity,
      transform: `translateY(${y}px)`
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '30px',
        maxWidth: '800px',
      }}>
        {stats.map((stat, index) => {
          const delay = index * 0.2;
          const cardOpacity = interpolate(frame, [fps * delay, fps * (delay + 0.8)], [0, 1]);
          const cardScale = interpolate(frame, [fps * delay, fps * (delay + 0.8)], [0.9, 1], {
            easing: Easing.bezier(0.175, 0.885, 0.32, 1.275)
          });

          return (
            <div key={stat.label} style={{
              backgroundColor: 'rgba(33, 38, 45, 0.9)',
              padding: '30px',
              borderRadius: '16px',
              border: `1px solid ${stat.color}40`,
              textAlign: 'center',
              opacity: cardOpacity,
              transform: `scale(${cardScale})`,
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: stat.color,
              }} />
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>
                {stat.icon}
              </div>
              <div style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: stat.color,
                marginBottom: '8px',
                fontFamily: 'Inter, sans-serif',
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: '16px',
                color: '#7d8590',
                fontFamily: 'Inter, sans-serif',
              }}>
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const ReposSection = ({ frame, fps }) => {
  const opacity = interpolate(frame, [0, fps * 1], [0, 1]);
  const x = interpolate(frame, [0, fps * 1.5], [200, 0], { 
    easing: Easing.bezier(0.25, 0.46, 0.45, 0.94) 
  });

  const repos = [
    { name: 'awesome-project', language: 'JavaScript', stars: 124, color: '#f1e05a' },
    { name: 'ml-toolkit', language: 'Python', stars: 89, color: '#3572a5' },
    { name: 'react-components', language: 'TypeScript', stars: 67, color: '#2b7489' },
  ];

  return (
    <AbsoluteFill style={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      opacity,
      transform: `translateX(${x}px)`
    }}>
      <h2 style={{
        fontSize: '32px',
        color: '#f0f6fc',
        marginBottom: '30px',
        fontFamily: 'Inter, sans-serif',
        fontWeight: '600',
      }}>
        Featured Repositories
      </h2>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        width: '600px',
      }}>
        {repos.map((repo, index) => {
          const delay = index * 0.3;
          const cardOpacity = interpolate(frame, [fps * delay, fps * (delay + 1)], [0, 1]);
          const cardX = interpolate(frame, [fps * delay, fps * (delay + 1)], [50, 0], {
            easing: Easing.bezier(0.25, 0.46, 0.45, 0.94)
          });

          return (
            <div key={repo.name} style={{
              backgroundColor: 'rgba(33, 38, 45, 0.9)',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid rgba(240, 246, 252, 0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              opacity: cardOpacity,
              transform: `translateX(${cardX}px)`,
            }}>
              <div>
                <div style={{
                  fontSize: '18px',
                  color: '#58a6ff',
                  fontWeight: '600',
                  marginBottom: '8px',
                  fontFamily: 'Inter, sans-serif',
                }}>
                  📦 {repo.name}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  fontSize: '14px',
                  color: '#7d8590',
                  fontFamily: 'Inter, sans-serif',
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: repo.color,
                    }} />
                    {repo.language}
                  </span>
                  <span>⭐ {repo.stars}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const OutroSection = ({ frame, fps }) => {
  const opacity = interpolate(frame, [0, fps * 1], [0, 1]);
  const scale = interpolate(frame, [0, fps * 2], [0.9, 1.1], {
    easing: Easing.bezier(0.25, 0.46, 0.45, 0.94)
  });

  return (
    <AbsoluteFill style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      opacity,
      transform: `scale(${scale})`
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontSize: '48px',
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #58a6ff, #ff6bff, #2ea043)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          marginBottom: '20px',
          fontFamily: 'Inter, sans-serif',
        }}>
          Keep Building
        </div>
        <div style={{
          fontSize: '20px',
          color: '#7d8590',
          fontFamily: 'Inter, sans-serif',
          fontWeight: '300',
        }}>
          Your GitHub journey continues...
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default GitHubShowcase;

// Ensure proper named export for Remotion
// Compatibility exports for both import patterns
export { GitHubShowcase as VideoComposition };
export default GitHubShowcase;