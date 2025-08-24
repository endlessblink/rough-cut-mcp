import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

export const VideoComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const progress = frame / durationInFrames;

  // Star field
  const stars = React.useMemo(() => 
    Array.from({ length: 200 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      twinkleOffset: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.5 + 0.5
    }))
  , []);

  // Rocket animation
  const rocketX = interpolate(frame, [0, durationInFrames], [-10, 110]);
  const rocketY = 50 + Math.sin(frame * 0.05) * 10;
  const rocketRotation = Math.sin(frame * 0.03) * 5;

  // Planet orbits
  const planet1Angle = (frame / fps) * 0.5;
  const planet2Angle = (frame / fps) * 0.3;
  const planet3Angle = (frame / fps) * 0.2;

  // Title fade in
  const titleOpacity = interpolate(
    frame,
    [durationInFrames - fps * 2, durationInFrames - fps],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0a1a' }}>
      {/* Nebula background */}
      <div
        style={{
          position: 'absolute',
          width: '200%',
          height: '200%',
          left: '-50%',
          top: '-50%',
          background: 'radial-gradient(ellipse at center, rgba(138, 43, 226, 0.1) 0%, transparent 50%)',
          transform: `rotate(${frame * 0.1}deg)`,
        }}
      />
      
      {/* Stars */}
      <svg width="100%" height="100%" style={{ position: 'absolute' }}>
        {stars.map((star, i) => {
          const twinkle = Math.sin(frame * 0.1 + star.twinkleOffset) * 0.5 + 0.5;
          return (
            <circle
              key={i}
              cx={`${star.x}%`}
              cy={`${star.y}%`}
              r={star.size * (0.5 + twinkle * 0.5)}
              fill="#ffffff"
              opacity={0.3 + twinkle * 0.7}
            />
          );
        })}
      </svg>

      {/* Planet 1 - Red */}
      <div
        style={{
          position: 'absolute',
          left: '70%',
          top: '30%',
          transform: `translate(-50%, -50%)`,
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, #ff6b6b, #8b0000)',
            boxShadow: '0 0 50px rgba(255, 107, 107, 0.5)',
            transform: `translate(${Math.cos(planet1Angle) * 150}px, ${Math.sin(planet1Angle) * 60}px)`,
          }}
        />
      </div>

      {/* Planet 2 - Blue */}
      <div
        style={{
          position: 'absolute',
          left: '25%',
          top: '60%',
          transform: `translate(-50%, -50%)`,
        }}
      >
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, #4dabf7, #1c7ed6)',
            boxShadow: '0 0 60px rgba(77, 171, 247, 0.5)',
            transform: `translate(${Math.cos(planet2Angle) * 120}px, ${Math.sin(planet2Angle) * 50}px)`,
          }}
        />
      </div>

      {/* Planet 3 - Green with ring */}
      <div
        style={{
          position: 'absolute',
          left: '80%',
          top: '70%',
          transform: `translate(-50%, -50%)`,
        }}
      >
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, #51cf66, #2f9e44)',
            boxShadow: '0 0 40px rgba(81, 207, 102, 0.5)',
            transform: `translate(${Math.cos(planet3Angle) * 100}px, ${Math.sin(planet3Angle) * 40}px)`,
          }}
        >
          {/* Ring */}
          <div
            style={{
              position: 'absolute',
              width: 100,
              height: 20,
              border: '3px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '50%',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%) rotateX(60deg)',
            }}
          />
        </div>
      </div>

      {/* Rocket */}
      <div
        style={{
          position: 'absolute',
          left: `${rocketX}%`,
          top: `${rocketY}%`,
          transform: `translate(-50%, -50%) rotate(${rocketRotation}deg)`,
        }}
      >
        {/* Rocket body */}
        <div
          style={{
            width: 40,
            height: 80,
            background: 'linear-gradient(to bottom, #e9ecef, #868e96)',
            borderRadius: '20px 20px 10px 10px',
            position: 'relative',
          }}
        >
          {/* Rocket window */}
          <div
            style={{
              position: 'absolute',
              width: 20,
              height: 20,
              background: 'radial-gradient(circle, #339af0, #1971c2)',
              borderRadius: '50%',
              left: '50%',
              top: '20%',
              transform: 'translateX(-50%)',
            }}
          />
          
          {/* Rocket flames */}
          <div
            style={{
              position: 'absolute',
              bottom: -30,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 30,
              height: 40,
              background: `radial-gradient(ellipse at center, #ffa94d, #fd7e14)`,
              borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
              opacity: 0.8 + Math.sin(frame * 0.5) * 0.2,
              filter: 'blur(2px)',
            }}
          />
        </div>
      </div>

      {/* Title */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: titleOpacity,
        }}
      >
        <h1
          style={{
            fontSize: 72,
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            textAlign: 'center',
            textShadow: '0 0 30px rgba(255, 255, 255, 0.5)',
            margin: 0,
          }}
        >
          Space Journey
        </h1>
      </div>
    </AbsoluteFill>
  );
};