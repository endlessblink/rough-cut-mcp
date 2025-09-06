import { AbsoluteFill, useCurrentFrame, interpolate, Easing, Sequence } from "remotion";
import React from 'react';
const EnhancedOrbsTest = () => {
  const orbs = Array.from({
    length: 15
  }, (_, i) => ({
    id: i,
    x: 400 + Math.sin((i + useCurrentFrame()) * 0.02) * 200,
    y: 300 + Math.cos((i + useCurrentFrame()) * 0.03) * 150,
    size: 20 + Math.sin(useCurrentFrame() * 0.1) * 10,
    hue: (i * 30 + useCurrentFrame() * 2) % 360,
    animationDelay: 1 + Math.sin(i * 0.5) * 0.5,
    duration: 2 + Math.sin(i * 0.5) * 0.5,
    direction: i % 2 > 0 ? 1 : -1
  }));
  return <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 overflow-hidden relative">
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div style={{
        textAlign: "center"
      }}>
          <h1 className="text-6xl font-bold text-white mb-8">
            Enhanced Orbs Test
          </h1>
        </div>
      </div>

      {/* Critical test: JSX that references specific object properties */}
      {orbs.map(orb => <div key={orb.id} className="absolute rounded-full opacity-70" style={{
      left: `${orb.x}%`,
      top: `${orb.y}%`,
      width: `${orb.size}px`,
      height: `${orb.size}px`,
      background: `hsl(${orb.hue}, 70%, 60%)`,
      animationDelay: `${orb.animationDelay}s`,
      animationDuration: `${orb.duration}s`,
      animationDirection: orb.direction > 0 ? 'normal' : 'reverse'
    }} />)}
    </div>;
};
export default EnhancedOrbsTest;