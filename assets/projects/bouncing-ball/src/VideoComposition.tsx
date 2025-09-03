import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

const AnimatedCodeBackground = ({ opacity = 0.15 }) => {
  const frame = useCurrentFrame();
  
  const codeSnippets = [
    'const physics = { gravity: 0.8, bounce: 0.7 };',
    'function updatePosition(ball) {',
    '  ball.y += ball.velocityY;',
    '  ball.velocityY += physics.gravity;',
    '  if (ball.y > ground) {',
    '    ball.y = ground;',
    '    ball.velocityY *= -physics.bounce;',
    '  }',
    '}',
    'setInterval(updatePosition, 16);',
    'canvas.drawCircle(ball.x, ball.y, radius);',
    'requestAnimationFrame(animate);',
    'console.log("Ball bouncing at", ball.y);',
    'const acceleration = gravity * deltaTime;',
    'physics.simulate(objects);',
  ];
  
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'hidden',
      opacity,
      pointerEvents: 'none',
      zIndex: 1,
    }}>
      {codeSnippets.map((code, index) => {
        const delay = index * 35;
        const lineOpacity = interpolate(
          (frame + delay) % 500,
          [0, 80, 420, 500],
          [0, 1, 1, 0],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );
        const translateX = interpolate(
          frame + delay,
          [0, 1000],
          [-500, 1500],
          { extrapolateLeft: 'clamp', extrapolateRight: 'extend' }
        );
        
        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: `${translateX}px`,
              top: `${50 + index * 40}px`,
              fontFamily: 'Monaco, "Courier New", monospace',
              fontSize: '14px',
              color: '#00ff88',
              opacity: lineOpacity,
              whiteSpace: 'nowrap',
              transform: `rotate(${Math.sin((frame + index * 20) / 30) * 2}deg)`,
            }}
          >
            {code}
          </div>
        );
      })}
    </div>
  );
};

const VideoComposition = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  
  // Ball physics
  const ballRadius = 50;
  const gravity = 0.8;
  const bounce = 0.7;
  const ground = height - ballRadius - 50;
  
  // Calculate ball position with physics
  let ballY = 100;
  let velocityY = 0;
  
  for (let i = 0; i < frame; i++) {
    ballY += velocityY;
    velocityY += gravity;
    
    if (ballY > ground) {
      ballY = ground;
      velocityY *= -bounce;
    }
  }
  
  const ballX = width / 2;
  
  // Ball glow effect
  const glowIntensity = interpolate(
    velocityY,
    [-20, 0, 20],
    [0.3, 1, 0.3],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  
  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* ANIMATED CODE BACKGROUND */}
      <AnimatedCodeBackground opacity={0.2} />
      
      {/* Grid pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: "
          linear-gradient(rgba(0, 255, 136, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 255, 136, 0.1) 1px, transparent 1px)
        ",
        backgroundSize: '40px 40px',
        opacity: 0.3,
        zIndex: 2,
      }} />
      
      {/* Ground line */}
      <div style={{
        position: 'absolute',
        bottom: '50px',
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, transparent, #00ff88, transparent)',
        boxShadow: '0 0 20px #00ff88',
        zIndex: 10,
      }} />
      
      {/* Ball */}
      <div style={{
        position: 'absolute',
        left: ballX - ballRadius,
        top: ballY - ballRadius,
        width: ballRadius * 2,
        height: ballRadius * 2,
        borderRadius: '50%',
        background: "radial-gradient(circle at 30% 30%, #ffffff, #00ff88, #0088ff)",
        boxShadow: `
          0 0 ${30 * glowIntensity}px rgba(0, 255, 136, ${0.8 * glowIntensity}),
          0 0 ${60 * glowIntensity}px rgba(0, 136, 255, ${0.4 * glowIntensity}),
          inset -10px -10px 20px rgba(0, 0, 0, 0.3)
        `,
        transform: `scale(${0.9 + 0.1 * glowIntensity})`,
        zIndex: 15,
      }} />
      
      {/* Ball trail effect */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: ballX - ballRadius * 0.7,
            top: ballY - ballRadius * 0.7 + i * velocityY * 0.3,
            width: ballRadius * 1.4,
            height: ballRadius * 1.4,
            borderRadius: '50%',
            background: `radial-gradient(circle, transparent 40%, rgba(0, 255, 136, ${0.1 - i * 0.02}))`,
            opacity: Math.max(0, 1 - i * 0.3),
            zIndex: 5,
          }}
        />
      ))}
      
      {/* Title */}
      <div style={{
        position: 'absolute',
        top: '40px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#00ff88',
        textShadow: '0 0 20px #00ff88',
        fontFamily: 'Arial, sans-serif',
        zIndex: 20,
      }}>
        Physics Simulation
      </div>
    </div>
  );
};

export default VideoComposition;