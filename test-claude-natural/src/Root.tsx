import React from 'react';
import { Composition } from 'remotion';
import VideoComposition from './VideoComposition';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="VideoComposition"
      component={VideoComposition}
      durationInFrames={720}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};