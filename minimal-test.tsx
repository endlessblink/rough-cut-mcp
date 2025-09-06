import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

const MinimalTestAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  
  // Simple frame-based animation (proven pattern from manual-conversion-test)
  const time = frame * 0.033;
  const opacity = interpolate(frame, [0, 30], [0, 1]);
  const scale = 1 + Math.sin(time) * 0.1;
  
  return (
    <AbsoluteFill style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        fontSize: '96px',
        fontWeight: '700',
        color: '#ffffff',
        opacity: opacity,
        transform: `scale(${scale})`,
        textAlign: 'center'
      }}>
        SUCCESS!
      </div>
      
      <div style={{
        position: 'absolute',
        bottom: '50px',
        fontSize: '24px',
        color: '#ffffff',
        opacity: 0.8
      }}>
        Frame: {frame}
      </div>
    </AbsoluteFill>
  );
};

export default MinimalTestAnimation;