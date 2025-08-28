// Test animation that would have broken before the fix
import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

// Helper to ensure interpolation ranges are valid (prevents Remotion errors)
function validateRange(range: number[]): number[] {
  if (range.length <= 1) return range;
  const valid = [...range];
  for (let i = 1; i < valid.length; i++) {
    if (valid[i] <= valid[i-1]) {
      valid[i] = valid[i-1] + 1;
    }
  }
  return valid;
}

// Safe interpolate wrapper
function safeInterpolate(
  frame: number, 
  inputRange: number[], 
  outputRange: number[], 
  options?: { extrapolateLeft?: 'clamp' | 'extend'; extrapolateRight?: 'clamp' | 'extend' }
): number {
  const validInput = validateRange(inputRange);
  return interpolate(frame, validInput, outputRange, options);
}

export const TestAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  
  // TEST 1: Previously broken pattern [60, 90, 70, 90] 
  // This would have caused "inputRange must be strictly monotonically increasing" error
  const problematicRange = [60, 90, 70, 90];
  const opacity1 = safeInterpolate(
    frame, 
    problematicRange,  // Will be fixed to [60, 90, 91, 92]
    [0, 1, 0.5, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  
  // TEST 2: Valid range should work unchanged
  const validRange = [0, 30, 60, 90];
  const scale = safeInterpolate(
    frame,
    validRange,  // Remains [0, 30, 60, 90]
    [0.5, 1, 1.5, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  
  // TEST 3: Duplicate values [30, 30, 60]
  const duplicateRange = [30, 30, 60];
  const rotation = safeInterpolate(
    frame,
    duplicateRange,  // Will be fixed to [30, 31, 60]
    [0, 180, 360],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  
  // TEST 4: Complex multi-stage animation
  const complexRange = [0, 20, 40, 35, 80, 100];  // Has non-monotonic issue at index 3
  const x = safeInterpolate(
    frame,
    complexRange,  // Will be fixed to [0, 20, 40, 41, 80, 100]
    [0, 100, 200, 150, 300, 400],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  
  return (
    <AbsoluteFill style={{ backgroundColor: '#1a1a2e' }}>
      {/* Box 1: Tests opacity with previously broken range */}
      <div
        style={{
          position: 'absolute',
          top: 50,
          left: 50,
          width: 100,
          height: 100,
          backgroundColor: '#ff6b6b',
          opacity: opacity1,
          borderRadius: 10,
        }}
      />
      
      {/* Box 2: Tests scale with valid range */}
      <div
        style={{
          position: 'absolute',
          top: 50,
          left: 200,
          width: 100,
          height: 100,
          backgroundColor: '#4ecdc4',
          transform: `scale(${scale})`,
          borderRadius: 10,
        }}
      />
      
      {/* Box 3: Tests rotation with duplicate values */}
      <div
        style={{
          position: 'absolute',
          top: 200,
          left: 50,
          width: 100,
          height: 100,
          backgroundColor: '#f7b731',
          transform: `rotate(${rotation}deg)`,
          borderRadius: 10,
        }}
      />
      
      {/* Box 4: Tests position with complex range */}
      <div
        style={{
          position: 'absolute',
          top: 200,
          left: x,
          width: 100,
          height: 100,
          backgroundColor: '#5f27cd',
          borderRadius: 10,
        }}
      />
      
      {/* Debug info */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          color: 'white',
          fontSize: 14,
          fontFamily: 'monospace',
        }}
      >
        <div>Frame: {frame}</div>
        <div>Problematic range fixed: {JSON.stringify(validateRange(problematicRange))}</div>
        <div>Valid range unchanged: {JSON.stringify(validateRange(validRange))}</div>
        <div>Duplicate range fixed: {JSON.stringify(validateRange(duplicateRange))}</div>
        <div>Complex range fixed: {JSON.stringify(validateRange(complexRange))}</div>
      </div>
    </AbsoluteFill>
  );
};