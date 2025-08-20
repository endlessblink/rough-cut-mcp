---
url: "https://www.remotion.dev/docs/audio/speed"
title: "Controlling playback speed | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/audio/speed#__docusaurus_skipToContent_fallback)

You can use the [`playbackRate`](https://www.remotion.dev/docs/audio#playbackrate) prop to control the speed of the audio.

- `1` is the default.
- `0.5` slows down the audio so it's twice as long
- `2` speeds up the audio so it's twice as fast
- Google Chrome supports playback rates between `0.0625` and `16`.

```

MyComp.tsx
tsx

import {AbsoluteFill, Audio, staticFile} from 'remotion';

export const MyComposition = () => {
  return (
    <AbsoluteFill>
      <Audio src={staticFile('audio.mp3')} playbackRate={2} />
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