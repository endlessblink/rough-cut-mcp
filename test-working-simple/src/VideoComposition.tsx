import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

const SimpleWorkingTest: React.FC = () => {
  const frame = useCurrentFrame();
  
  // Simple frame-based animation (proven working pattern)
  const opacity = interpolate(frame, [0, 30], [0, 1]);
  const scale = 1 + Math.sin(frame * 0.1) * 0.1;
  
  return (
    <AbsoluteFill style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column'
    }}>
      <div style={{
        fontSize: '96px',
        fontWeight: '700',
        color: '#ffffff',
        opacity: opacity,
        transform: `scale(${scale})`,
        textAlign: 'center',
        marginBottom: '32px'
      }}>
        WORKING!
      </div>
      
      <div style={{
        fontSize: '24px',
        color: '#ffffff',
        opacity: 0.8,
        textAlign: 'center'
      }}>
        Frame: {frame}
      </div>
    </AbsoluteFill>
  );
};

export default SimpleWorkingTest;