---
url: "https://www.remotion.dev/docs/audio/muting"
title: "Muting Audio | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/audio/muting#__docusaurus_skipToContent_fallback)

You may pass in the [`muted`](https://www.remotion.dev/docs/audio#muted) prop to [`<Audio>`](https://www.remotion.dev/docs/audio), [`<OffthreadVideo>`](https://www.remotion.dev/docs/offthreadvideo) and [`<Video>`](https://www.remotion.dev/docs/video) and even change it over time.

When [`muted`](https://www.remotion.dev/docs/audio#muted) is true, audio will be omitted at that time. In the following example, we are muting the track between seconds 2 and 4.

```

tsx

import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

export const MyComposition = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  return (
    <AbsoluteFill>
      <Audio src={staticFile('audio.mp3')} muted={frame >= 2 * fps && frame <= 4 * fps} />
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