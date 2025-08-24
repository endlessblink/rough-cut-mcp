import { Composition } from 'remotion';
import { MyComposition } from './Composition';

export const RemotionVideo = () => {
  return (
    <>
      <Composition
        id="MyComp"
        component={MyComposition}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: 'Rough Cut MCP',
          subtitle: 'Ready to create videos!'
        }}
      />
      <Composition
        id="TextVideo"
        component={MyComposition}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: 'Text Video',
          subtitle: 'Created by MCP Server'
        }}
      />
    </>
  );
};