import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  spring,
} from 'remotion';

const GitHubShowcase = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Animation helpers
  const springConfig = {
    fps,
    damping: 200,
    stiffness: 100,
    mass: 0.5,
  };

  // Logo animation
  const logoScale = spring({
    frame: frame - 10,
    fps,
    config: springConfig,
  });

  const logoOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Title slide in
  const titleX = interpolate(
    frame,
    [30, 60],
    [-300, 0],
    {
      easing: Easing.out(Easing.cubic),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  // Stats counter animation
  const statsOpacity = interpolate(frame, [90, 120], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Repository cards slide up
  const repoY = interpolate(
    frame,
    [150, 200],
    [100, 0],
    {
      easing: Easing.out(Easing.back(1.5)),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  // Language chart animation
  const chartScale = spring({
    frame: frame - 250,
    fps,
    config: { ...springConfig, stiffness: 80 },
  });

  // Activity graph wave
  const waveOffset = frame * 0.1;

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #0f0f23 0%, #161b22 50%, #21262d 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* Animated background particles */}
      <div style={{ position: 'absolute', width: '100%', height: '100%' }}>
        {[...Array(20)].map((_, i) => {
          const particleOpacity = interpolate(
            (frame + i * 10) % 300,
            [0, 150, 300],
            [0.1, 0.3, 0.1]
          );
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: '2px',
                height: '2px',
                background: '#58a6ff',
                borderRadius: '50%',
                left: `${(i * 47) % 100}%`,
                top: `${(i * 23) % 100}%`,
                opacity: particleOpacity,
                boxShadow: '0 0 4px #58a6ff',
              }}
            />
          );
        })}
      </div>

      {/* GitHub Logo and Title */}
      <Sequence from={0} durationInFrames={durationInFrames}>
        <div
          style={{
            position: 'absolute',
            top: '10%',
            left: '50%',
            transform: `translateX(-50%) scale(${logoScale})`,
            opacity: logoOpacity,
            textAlign: 'center',
          }}
        >
          <svg width="80" height="80" viewBox="0 0 24 24" fill="#f0f6fc">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        </div>
      </Sequence>

      {/* Main Title */}
      <Sequence from={30} durationInFrames={durationInFrames - 30}>
        <div
          style={{
            position: 'absolute',
            top: '25%',
            left: '50%',
            transform: `translateX(calc(-50% + ${titleX}px))`,
            textAlign: 'center',
            color: '#f0f6fc',
          }}
        >
          <h1 style={{ 
            fontSize: '3.5rem', 
            margin: '0',
            fontWeight: '700',
            background: 'linear-gradient(45deg, #58a6ff, #bc8cff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 20px rgba(88, 166, 255, 0.3)',
          }}>
            Developer Showcase
          </h1>
          <p style={{ 
            fontSize: '1.2rem', 
            margin: '10px 0 0 0',
            color: '#8b949e',
            fontWeight: '400',
          }}>
            Building the future with code
          </p>
        </div>
      </Sequence>

      {/* Stats Section */}
      <Sequence from={90} durationInFrames={durationInFrames - 90}>
        <div
          style={{
            position: 'absolute',
            top: '45%',
            left: '50%',
            transform: 'translateX(-50%)',
            opacity: statsOpacity,
            display: 'flex',
            gap: '60px',
            textAlign: 'center',
          }}
        >
          {[
            { label: 'Repositories', value: '42', color: '#58a6ff' },
            { label: 'Followers', value: '128', color: '#7c3aed' },
            { label: 'Following', value: '89', color: '#f85149' },
          ].map((stat, index) => {
            const countUp = Math.floor(
              interpolate(
                frame,
                [120 + index * 10, 180 + index * 10],
                [0, parseInt(stat.value)],
                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
              )
            );

            return (
              <div key={stat.label} style={{ minWidth: '100px' }}>
                <div
                  style={{
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    color: stat.color,
                    textShadow: `0 0 15px ${stat.color}50`,
                  }}
                >
                  {countUp}
                </div>
                <div style={{ 
                  fontSize: '1rem', 
                  color: '#8b949e',
                  marginTop: '5px',
                }}>
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </Sequence>

      {/* Repository Cards */}
      <Sequence from={150} durationInFrames={durationInFrames - 150}>
        <div
          style={{
            position: 'absolute',
            bottom: '30%',
            left: '50%',
            transform: `translateX(-50%) translateY(${repoY}px)`,
            display: 'flex',
            gap: '20px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {[
            { name: 'awesome-project', language: 'JavaScript', stars: 24, color: '#f1e05a' },
            { name: 'ml-toolkit', language: 'Python', stars: 18, color: '#3572A5' },
            { name: 'react-components', language: 'TypeScript', stars: 31, color: '#2b7489' },
          ].map((repo, index) => {
            const cardDelay = index * 15;
            const cardOpacity = interpolate(
              frame,
              [180 + cardDelay, 210 + cardDelay],
              [0, 1],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            );

            return (
              <div
                key={repo.name}
                style={{
                  background: 'rgba(22, 27, 34, 0.8)',
                  border: '1px solid #30363d',
                  borderRadius: '8px',
                  padding: '16px',
                  minWidth: '200px',
                  opacity: cardOpacity,
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                }}
              >
                <h3 style={{ 
                  margin: '0 0 8px 0', 
                  color: '#58a6ff',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                }}>
                  {repo.name}
                </h3>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '15px',
                  fontSize: '0.85rem',
                  color: '#8b949e',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: repo.color,
                      }}
                    />
                    {repo.language}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    ⭐ {repo.stars}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Sequence>

      {/* Activity Wave */}
      <Sequence from={250} durationInFrames={durationInFrames - 250}>
        <div
          style={{
            position: 'absolute',
            bottom: '10%',
            left: '50%',
            transform: `translateX(-50%) scale(${chartScale})`,
            width: '80%',
            height: '80px',
            display: 'flex',
            alignItems: 'end',
            gap: '3px',
            justifyContent: 'center',
          }}
        >
          {[...Array(52)].map((_, i) => {
            const height = 20 + Math.sin((i + waveOffset) * 0.3) * 15 + Math.random() * 10;
            const opacity = 0.3 + Math.sin((i + waveOffset) * 0.2) * 0.4;
            
            return (
              <div
                key={i}
                style={{
                  width: '8px',
                  height: `${Math.max(5, height)}px`,
                  background: `rgba(88, 166, 255, ${opacity})`,
                  borderRadius: '2px',
                  boxShadow: '0 0 4px rgba(88, 166, 255, 0.3)',
                }}
              />
            );
          })}
        </div>
      </Sequence>

      {/* Closing tagline */}
      <Sequence from={400} durationInFrames={durationInFrames - 400}>
        <div
          style={{
            position: 'absolute',
            bottom: '5%',
            left: '50%',
            transform: 'translateX(-50%)',
            textAlign: 'center',
            opacity: interpolate(frame, [400, 430], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          <p style={{ 
            color: '#8b949e', 
            fontSize: '1rem',
            margin: 0,
            fontStyle: 'italic',
          }}>
            Crafting digital experiences, one commit at a time
          </p>
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};

export default GitHubShowcase;

// Compatibility exports for both import patterns
export { GitHubShowcase as VideoComposition };
export default GitHubShowcase;