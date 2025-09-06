import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing, Sequence } from 'remotion';

const SimpleGitHubShowcase: React.FC = () => {
  const frame = useCurrentFrame();
  
  return (
    <AbsoluteFill style={{
      background: 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, system-ui, sans-serif'
    }}>
      {/* Title Section (0-90 frames / 0-3 seconds) */}
      <Sequence from={0} durationInFrames={90}>
        <AbsoluteFill style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}>
          <div style={{
            opacity: interpolate(frame, [10, 40], [0, 1], { easing: Easing.out }),
            transform: `translateY(${interpolate(frame, [10, 40], [30, 0], { easing: Easing.out })}px)`
          }}>
            <h1 style={{
              fontSize: '96px', // Frame 289 standard
              fontWeight: '700',
              color: '#f0f6fc',
              margin: '0 0 16px 0',
              letterSpacing: '-1px'
            }}>
              endlessblink
            </h1>
            <p style={{
              fontSize: '18px',
              color: '#8b949e',
              margin: 0
            }}>
              AI & Developer Tools Innovator 🚀
            </p>
          </div>
        </AbsoluteFill>
      </Sequence>
      {/* Simple end - no complex structure */}
    </AbsoluteFill>
  );
};

export default SimpleGitHubShowcase;