---
url: "https://www.remotion.dev/docs/audio/importing"
title: "Importing Audio | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/audio/importing#__docusaurus_skipToContent_fallback)

[Put an audio file into the `public/` folder](https://www.remotion.dev/docs/assets) and use [`staticFile()`](https://www.remotion.dev/docs/staticfile) to reference it.

Add an [`<Audio/>`](https://www.remotion.dev/docs/audio) tag to your component to add sound to it.

```

MyComp.tsx
tsx

import {AbsoluteFill, Audio, staticFile} from 'remotion';

export const MyComposition = () => {
  return (
    <AbsoluteFill>
      <Audio src={staticFile('audio.mp3')} />
    </AbsoluteFill>
  );
};
```

You can also add remote audio by passing a URL:

```

MyComp.tsx
tsx

import {AbsoluteFill, Audio} from 'remotion';

export const MyComposition = () => {
  return (
    <AbsoluteFill>
      <Audio src="https://example.com/audio.mp3" />
    </AbsoluteFill>
  );
};
```

By default, the audio will play from the start, at full volume and full length.

You can mix multiple tracks together by adding more audio tags.

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