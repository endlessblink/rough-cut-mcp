import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

export const TestComponent = () => {
  const frame = useCurrentFrame();
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      background: 'white',
      width: '100%',
      height: '100vh'
    , gap: '24px', boxShadow: '0 4px 8px rgba(0,0,0,0.15)'}}>
      <h1 style={{
        fontSize: '28px',
        fontFamily: '"Inter", system-ui, sans-serif',
        color: 'white',
        marginBottom: '20px'
      , textShadow: '0 2px 4px rgba(0,0,0,0.8)'}}>
        Sample Video Title
      </h1>
      
      <p style={{
        fontSize: '16px',
        color: 'white',
        textAlign: 'center',
        maxWidth: '600px'
      , textShadow: '0 2px 4px rgba(0,0,0,0.8)'}}>
        This is a sample paragraph with small text that might have accessibility issues.
      </p>
      
      <div style={{
        background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
        borderRadius: '4px',
        padding: '12px 24px'
      }}>
        <span style={{
          fontSize: '16px',
          color: 'white',
          fontWeight: 'bold'
        , textShadow: '0 2px 4px rgba(0,0,0,0.8)'}}>
          Call to Action
        </span>
      </div>
      
      <div style={{
        marginTop: interpolate(frame, [0, 30], [0, 100], {
        easing: Easing.out(Easing.cubic),
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp'
      })
      }}>
        Animation without easing
      </div>
    </div>
  );
};