import React from 'react';
import { Composition } from 'remotion';

console.log('Root.tsx loading...');

// Import with extensive debugging (Perplexity solution)
import VideoComposition from './VideoComposition';
console.log('VideoComposition imported in Root:', VideoComposition);
console.log('VideoComposition type:', typeof VideoComposition);
console.log('VideoComposition is function:', typeof VideoComposition === 'function');

export const RemotionRoot: React.FC = () => {
  console.log('RemotionRoot rendering, VideoComposition:', VideoComposition);
  
  return (
    <>
      <Composition
        id="VideoComposition"
        component={VideoComposition}
        durationInFrames={3}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
    </>
  );
};