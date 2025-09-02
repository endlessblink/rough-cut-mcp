import React, { useState } from 'react';
import {

// Debug logging for component resolution
console.log('VideoComposition module loading...');

  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from 'remotion';

interface VolumeControlsProps {
  volume: number;
  setVolume: (v: number) => void;
}

const VolumeControls: React.FC<VolumeControlsProps> = ({ volume, setVolume }) => (
  <div style={{
    position: 'absolute',
    top: '20px',
    right: '20px',
    zIndex: 1000,
    background: 'rgba(0,0,0,0.8)',
    padding: '15px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.2)'
  }}>
    <div style={{ color: '#ffffff', marginBottom: '10px', fontSize: '14px' }}>Volume Control</div>
    <input
      type="range"
      min="0"
      max="1"
      step="0.1"
      value={volume}
      onChange={(e) => setVolume(parseFloat(e.target.value))}
      style={{
        width: '150px',
        background: '#333',
        outline: 'none',
        borderRadius: '5px',
      }}
    />
    <div style={{ color: '#00ff88', fontSize: '12px', marginTop: '5px' }}>
      {Math.round(volume * 100)}%
    </div>
  </div>
);

export const VideoComposition: React.FC = () => {
  const [volume, setVolume] = useState(0.8);
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
      <VolumeControls volume={volume} setVolume={setVolume} />

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
                left: "%",
                top: "%",
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
            transform: "translateX(-50%) scale()",
            opacity: logoOpacity,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '80px', marginBottom: '20px' }}>🐙</div>
          <h1 style={{ 
            fontSize: '48px', 
            margin: '0',
            fontWeight: '700',
            color: '#58a6ff',
            textShadow: '0 0 20px rgba(88, 166, 255, 0.5)',
          }}>
            endlessblink
          </h1>
        </div>
      </Sequence>

      {/* Main Title */}
      <Sequence from={30} durationInFrames={durationInFrames - 30}>
        <div
          style={{
            position: 'absolute',
            top: '35%',
            left: '50%',
            transform: "translateX(calc(-50% + px))",
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
            top: '55%',
            left: '50%',
            transform: 'translateX(-50%)',
            opacity: statsOpacity,
            display: 'flex',
            gap: '60px',
            textAlign: 'center',
          }}
        >
          {[
            { label: 'Repositories', value: '9', color: '#58a6ff' },
            { label: 'Stars', value: '16+', color: '#f1e05a' },
            { label: 'Languages', value: '5+', color: '#f85149' },
          ].map((stat, index) => {
            const countUp = interpolate(
              frame,
              [120 + index * 10, 180 + index * 10],
              [0, 1],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            );

            return (
              <div key={stat.label} style={{ minWidth: '120px' }}>
                <div
                  style={{
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    color: stat.color,
                    textShadow: "0 0 15px 50",
                    opacity: countUp,
                    transform: "scale()",
                  }}
                >
                  {stat.value}
                </div>
                <div style={{ 
                  fontSize: '1rem', 
                  color: '#8b949e',
                  marginTop: '5px',
                  opacity: countUp,
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
            bottom: '25%',
            left: '50%',
            transform: "translateX(-50%) translateY(px)",
            display: 'flex',
            gap: '20px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {[
            { name: 'Like-I-Said-memory-mcp-server', language: 'TypeScript', stars: 12, color: '#2b7489' },
            { name: 'Comfy-Guru', language: 'Python', stars: 4, color: '#3572A5' },
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
                  minWidth: '300px',
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
            transform: "translateX(-50%) scale()",
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
                  height: "px",
                  background: "rgba(88, 166, 255, )",
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
            fontSize: '1.2rem',
            margin: 0,
            fontWeight: '500',
          }}>
            github.com/endlessblink
          </p>
          <p style={{ 
            color: '#58a6ff', 
            fontSize: '0.9rem',
            margin: '5px 0 0 0',
            fontStyle: 'italic',
          }}>
            Crafting digital experiences, one commit at a time
          </p>
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};

export default VideoComposition;

console.log('VideoComposition function defined:', VideoComposition);
