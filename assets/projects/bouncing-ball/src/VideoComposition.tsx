import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Audio, staticFile, Sequence } from 'remotion';

// Debug logging for component resolution
console.log('VideoComposition module loading...');

function VideoComposition() {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  
  // Calculate ball position with bouncing physics
  const progress = frame / durationInFrames;
  const totalBounces = 8; // Number of bounces in 5 seconds
  const bounceProgress = (progress * totalBounces) % 1;
  
  // Horizontal movement (left to right, then right to left)
  const horizontalCycle = Math.floor(progress * totalBounces / 2) % 2;
  const horizontalProgress = (progress * totalBounces / 2) % 1;
  const x = horizontalCycle === 0 
    ? interpolate(horizontalProgress, [0, 1], [80, width - 80])
    : interpolate(horizontalProgress, [0, 1], [width - 80, 80]);
  
  // Vertical bouncing with realistic physics
  const bounceHeight = height * 0.6;
  const bounceIntensity = Math.pow(Math.sin(bounceProgress * Math.PI), 2);
  const y = interpolate(
    bounceIntensity,
    [0, 1],
    [height - 100, height - bounceHeight]
  );
  
  // Ball scale effect on bounce (squash and stretch)
  const impactMoment = bounceIntensity < 0.1;
  const scale = impactMoment ? 
    interpolate(bounceIntensity, [0, 0.1], [1.3, 1]) : 
    interpolate(bounceIntensity, [0.1, 1], [1, 1.1]);
  
  // Shadow properties
  const shadowScale = interpolate(bounceIntensity, [0, 1], [2, 0.8]);
  const shadowOpacity = interpolate(bounceIntensity, [0, 1], [0.6, 0.2]);
  
  // Calculate bounce moments for audio timing - trigger slightly before impact for realism
  const framesPerBounce = durationInFrames / totalBounces;
  const bounces = Array.from({ length: totalBounces }, (_, i) => ({
    startFrame: Math.round(i * framesPerBounce - 2), // Start 2 frames before impact
    id: i
  }));

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background elements */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        color: 'rgba(255,255,255,0.9)',
        fontSize: '28px',
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'bold',
        textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
      }}>
        Bouncing Ball Animation
      </div>
      
      {/* Ground line with concrete texture effect */}
      <div style={{
        position: 'absolute',
        bottom: '80px',
        left: '0',
        right: '0',
        height: '8px',
        background: 'linear-gradient(90deg, #8e8e93, #c7c7cc, #8e8e93)',
        borderRadius: '2px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.3)'
      }} />
      
      {/* Ball shadow */}
      <div style={{
        position: 'absolute',
        left: x - 30,
        bottom: '60px',
        width: '60px',
        height: '15px',
        background: 'radial-gradient(ellipse, rgba(0,0,0,0.4), transparent)',
        borderRadius: '50%',
        transform: `scaleX(${shadowScale})`,
        opacity: shadowOpacity,
        filter: 'blur(3px)'
      }} />
      
      {/* Bouncing ball with basketball texture */}
      <div style={{
        position: 'absolute',
        left: x - 30,
        top: y - 30,
        width: '60px',
        height: '60px',
        background: 'radial-gradient(circle at 35% 35%, #ff8c42, #ff6b1a, #d63031)',
        borderRadius: '50%',
        transform: `scale(${scale})`,
        boxShadow: '0 6px 20px rgba(0,0,0,0.4), inset -5px -5px 10px rgba(0,0,0,0.3)',
        border: '2px solid rgba(139, 69, 19, 0.6)',
        position: 'relative'
      }}>
        {/* Ball highlight */}
        <div style={{
          position: 'absolute',
          top: '8px',
          left: '12px',
          width: '16px',
          height: '16px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.8), transparent)',
          borderRadius: '50%',
          filter: 'blur(2px)'
        }} />
        
        {/* Basketball lines for texture */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '0',
          right: '0',
          height: '2px',
          background: 'rgba(139, 69, 19, 0.4)',
          transform: 'translateY(-50%)',
          borderRadius: '1px'
        }} />
        <div style={{
          position: 'absolute',
          top: '0',
          bottom: '0',
          left: '50%',
          width: '2px',
          background: 'rgba(139, 69, 19, 0.4)',
          transform: 'translateX(-50%)',
          borderRadius: '1px'
        }} />
      </div>
      
      {/* Bounce impact particles with dust effect */}
      {impactMoment && Array.from({ length: 8 }, (_, i) => (
        <div
          key={`particle-${i}`}
          style={{
            position: 'absolute',
            left: x + (Math.cos((i * 45) * Math.PI / 180) * 35),
            bottom: '85px',
            width: i % 2 === 0 ? '4px' : '6px',
            height: i % 2 === 0 ? '4px' : '6px',
            background: i % 2 === 0 ? '#ddd' : '#bbb',
            borderRadius: '50%',
            transform: `translateY(${Math.sin((i * 45) * Math.PI / 180) * -15}px)`,
            opacity: 0.7,
            filter: 'blur(1px)'
          }}
        />
      ))}
      
      {/* Realistic basketball bounce sound effects */}
      {bounces.map((bounce) => (
        <Sequence key={bounce.id} from={bounce.startFrame} durationInFrames={25}>
          <Audio 
            src={staticFile('audio/sfx-1756724084284.wav')} 
            volume={0.7}
            startFrom={0}
          />
        </Sequence>
      ))}
    </div>
  );
}

console.log('VideoComposition function defined:', VideoComposition);
export default VideoComposition;