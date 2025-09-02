import React from 'react';
import { AbsoluteFill, Audio, staticFile } from 'remotion';

// Debug logging for component resolution
console.log('VideoComposition module loading...');

function VideoComposition() {
  console.log('VideoComposition function called');
  return (
    <AbsoluteFill style={{
      backgroundColor: '#1a1a1a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 60,
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Drum beat from start */}
      <Audio src={staticFile('audio/sfx-1756716571223.wav')} />
      
      {/* Whoosh effect starting at frame 90 (3 seconds) */}
      <Audio src={staticFile('audio/sfx-1756717109764.wav')} startFrom={90} />
      
      Audio Test Project 🎵🌪️
    </AbsoluteFill>
  );
}

console.log('VideoComposition function defined:', VideoComposition);
export default VideoComposition;