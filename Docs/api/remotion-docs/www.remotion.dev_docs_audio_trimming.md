---
url: "https://www.remotion.dev/docs/audio/trimming"
title: "Trimming Audio | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/audio/trimming#__docusaurus_skipToContent_fallback)

The [`<Audio />`](https://www.remotion.dev/docs/audio) tag supports the [`trimBefore`](https://www.remotion.dev/docs/audio#trimbefore--trimafter) and [`trimAfter`](https://www.remotion.dev/docs/audio#trimbefore--trimafter) props.

With it, you can trim off parts of the audio.

```

MyComp.tsx
tsx

import {AbsoluteFill, Audio, staticFile, useVideoConfig} from 'remotion';

export const MyComposition = () => {
  const {fps} = useVideoConfig();

  return (
    <AbsoluteFill>
      <Audio src={staticFile('audio.mp3')} trimBefore={2 * fps} trimAfter={4 * fps} />
    </AbsoluteFill>
  );
};
```

This will result the audio to play the range from `00:02:00` to `00:04:00`, meaning the audio will play for 2 seconds.

The audio will still play immediately at the beginning - to see how to shift the audio to appear later in the composition, see the [next article](https://www.remotion.dev/docs/audio/delaying).

Legacy props

You can also use the deprecated `startFrom` and `endAt` props, but the new `trimBefore` and `trimAfter` props are preferred.

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