import { useCurrentFrame, useVideoConfig, interpolate, spring, Sequence } from 'remotion';

interface GitHubShowcaseProps {
  username: string;
  repository1: string;
  repository1Desc: string;
  repository2: string;
  repository2Desc: string;
}

export const GitHubShowcase: React.FC<GitHubShowcaseProps> = ({
  username,
  repository1,
  repository1Desc,
  repository2,
  repository2Desc,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Animation timings
  const backgroundFade = spring({
    frame,
    fps,
    config: { damping: 200 },
  });

  const titleOpacity = interpolate(frame, [20, 40], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const titleScale = spring({
    frame: frame - 20,
    fps,
    config: { tension: 100, friction: 10 },
  });

  const usernameY = interpolate(frame, [60, 90], [100, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const repo1X = interpolate(frame, [120, 150], [-400, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const repo2X = interpolate(frame, [140, 170], [400, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Particle animation
  const particleOpacity = interpolate(frame, [0, 30, 720, 750], [0, 0.6, 0.6, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const particles = Array.from({ length: 20 }, (_, i) => {
    const x = (i * 100 + Math.sin(frame * 0.02 + i) * 50) % width;
    const y = (i * 80 + Math.cos(frame * 0.03 + i) * 30) % height;
    return { x, y, size: 2 + Math.sin(frame * 0.05 + i) * 1 };
  });

  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
        overflow: 'hidden',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      {/* Animated particles */}
      {particles.map((particle, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: `hsl(${180 + i * 10}, 70%, 60%)`,
            borderRadius: '50%',
            opacity: particleOpacity,
            boxShadow: `0 0 ${particle.size * 2}px hsl(${180 + i * 10}, 70%, 60%)`,
          }}
        />
      ))}

      {/* Main content container */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          color: 'white',
        }}
      >
        {/* GitHub Logo */}
        <Sequence from={0} durationInFrames={30}>
          <div
            style={{
              fontSize: 120,
              opacity: backgroundFade,
              transform: `scale(${titleScale})`,
              marginBottom: 20,
              filter: 'drop-shadow(0 0 20px rgba(0, 255, 255, 0.5))',
            }}
          >
            ⚡
          </div>
        </Sequence>

        {/* GitHub Title */}
        <Sequence from={20}>
          <h1
            style={{
              fontSize: 72,
              fontWeight: 'bold',
              opacity: titleOpacity,
              transform: `scale(${titleScale})`,
              background: 'linear-gradient(45deg, #00ffff, #ff00ff, #ffff00)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              textShadow: '0 0 30px rgba(0, 255, 255, 0.5)',
              marginBottom: 10,
            }}
          >
            GitHub Profile
          </h1>
        </Sequence>

        {/* Username */}
        <Sequence from={60}>
          <div
            style={{
              transform: `translateY(${usernameY}px)`,
              fontSize: 48,
              fontWeight: '600',
              color: '#00ffff',
              textShadow: '0 0 20px rgba(0, 255, 255, 0.8)',
              marginBottom: 60,
              fontFamily: '"Fira Code", monospace',
            }}
          >
            @{username}
          </div>
        </Sequence>

        {/* Repository Cards */}
        <div
          style={{
            display: 'flex',
            gap: 60,
            width: '80%',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          {/* Repository 1 */}
          <Sequence from={120}>
            <div
              style={{
                transform: `translateX(${repo1X}px)`,
                background: 'rgba(255, 255, 255, 0.1)',
                border: '2px solid #00ffff',
                borderRadius: 16,
                padding: 30,
                maxWidth: 400,
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0, 255, 255, 0.3)',
              }}
            >
              <h3
                style={{
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: '#00ffff',
                  marginBottom: 15,
                  fontFamily: '"Fira Code", monospace',
                }}
              >
                {repository1}
              </h3>
              <p
                style={{
                  fontSize: 16,
                  color: 'rgba(255, 255, 255, 0.8)',
                  lineHeight: 1.5,
                }}
              >
                {repository1Desc}
              </p>
              <div
                style={{
                  marginTop: 15,
                  fontSize: 14,
                  color: '#ff00ff',
                  fontWeight: '500',
                }}
              >
                🧠 AI/ML • Python
              </div>
            </div>
          </Sequence>

          {/* Repository 2 */}
          <Sequence from={140}>
            <div
              style={{
                transform: `translateX(${repo2X}px)`,
                background: 'rgba(255, 255, 255, 0.1)',
                border: '2px solid #ff00ff',
                borderRadius: 16,
                padding: 30,
                maxWidth: 400,
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(255, 0, 255, 0.3)',
              }}
            >
              <h3
                style={{
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: '#ff00ff',
                  marginBottom: 15,
                  fontFamily: '"Fira Code", monospace',
                }}
              >
                {repository2}
              </h3>
              <p
                style={{
                  fontSize: 16,
                  color: 'rgba(255, 255, 255, 0.8)',
                  lineHeight: 1.5,
                }}
              >
                {repository2Desc}
              </p>
              <div
                style={{
                  marginTop: 15,
                  fontSize: 14,
                  color: '#00ffff',
                  fontWeight: '500',
                }}
              >
                🔧 MCP • Python • ⭐ 4
              </div>
            </div>
          </Sequence>
        </div>

        {/* Call to action */}
        <Sequence from={200}>
          <div
            style={{
              position: 'absolute',
              bottom: 100,
              fontSize: 24,
              color: 'rgba(255, 255, 255, 0.9)',
              opacity: interpolate(frame, [200, 230], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }),
            }}
          >
            🚀 Explore the Future of AI Development
          </div>
        </Sequence>
      </div>
    </div>
  );
};