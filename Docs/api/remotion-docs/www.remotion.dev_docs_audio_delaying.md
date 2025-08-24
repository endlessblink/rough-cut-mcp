---
url: "https://www.remotion.dev/docs/audio/delaying"
title: "Delaying Audio | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/audio/delaying#__docusaurus_skipToContent_fallback)

Use a [`<Sequence>`](https://www.remotion.dev/docs/sequence) with a positive [`from`](https://www.remotion.dev/docs/sequence#from) value to delay the audio from playing.

In the following example, the audio will start playing after 100 frames.

```

tsx

import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';

export const MyComposition = () => {
  return (
    <AbsoluteFill>
      <Sequence from={100}>
        <Audio src={staticFile('audio.mp3')} />
      </Sequence>
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