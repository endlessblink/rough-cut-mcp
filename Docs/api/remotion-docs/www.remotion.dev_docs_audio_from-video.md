---
url: "https://www.remotion.dev/docs/audio/from-video"
title: "Use Audio from video | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/audio/from-video#__docusaurus_skipToContent_fallback)

Audio from [`<Video />`](https://www.remotion.dev/docs/video) and [`<OffthreadVideo />`](https://www.remotion.dev/docs/offthreadvideo) tags are also included in the output.

The same principles apply as for audio - you may [trim](https://www.remotion.dev/docs/audio/trimming), [delay](https://www.remotion.dev/docs/audio/delaying), [mute](https://www.remotion.dev/docs/audio/muting), [speed up](https://www.remotion.dev/docs/audio/speed) and [reduce the volume](https://www.remotion.dev/docs/audio/volume) of your videos.

```

MyComp.tsx
tsx

import {AbsoluteFill, OffthreadVideo, staticFile} from 'remotion';

export const MyComposition = () => {
  return (
    <AbsoluteFill>
      <OffthreadVideo src={staticFile('video.mp4')} playbackRate={2} volume={0.5} />
    </AbsoluteFill>
  );
};
```

Remotion

![Logo](https://raw.githubusercontent.com/remotion-dev/brand/refs/heads/main/logo.svg)

Remotion

You may ask your questions about the Remotion documentation and the bot answers it based on the documentation. Go through the sources for better answers appropriately.

## QUICK QUESTIONS

How to install it?

How to setup Remotion Lambda?

Why is my composition flickering?

Powered by[CrawlChat](https://crawlchat.app/?ref=powered-by-remotion)

Ask AI