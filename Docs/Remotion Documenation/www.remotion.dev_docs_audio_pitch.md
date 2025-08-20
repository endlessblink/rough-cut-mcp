---
url: "https://www.remotion.dev/docs/audio/pitch"
title: "Controlling Pitch | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/audio/pitch#__docusaurus_skipToContent_fallback)

warning

Pitch correction is currently only applied during rendering.

You can use the [`toneFrequency`](https://www.remotion.dev/docs/audio#tonefrequency) prop to control the pitch of the audio during rendering.

Values between `0.01` and `2` are accepted, where `1` represents the original pitch. Values less than `1` will decrease the pitch, while values greater than `1` will increase it.

A [`toneFrequency`](https://www.remotion.dev/docs/audio#tonefrequency) of 0.5 would lower the pitch by half, and a [`toneFrequency`](https://www.remotion.dev/docs/audio#tonefrequency) of `1.5` would increase the pitch by 50%.

```

MyComp.tsx
tsx

import {Audio, staticFile, AbsoluteFill} from 'remotion';

export const MyComposition = () => {
  return (
    <AbsoluteFill>
      <div>Hello World!</div>
      <Audio src={staticFile('audio.mp3')} toneFrequency={0.8} />
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