---
url: "https://www.remotion.dev/docs/audio/volume"
title: "Controlling Volume | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/audio/volume#__docusaurus_skipToContent_fallback)

On this page

You can use the [`volume`](https://www.remotion.dev/docs/audio#volume) prop to control the volume.

The simplest way is to pass a number between `0` and `1`.

```

MyComp.tsx
tsx

import {Audio, staticFile, AbsoluteFill} from 'remotion';

export const MyComposition = () => {
  return (
    <AbsoluteFill>
      <div>Hello World!</div>
      <Audio src={staticFile('audio.mp3')} volume={0.5} />
    </AbsoluteFill>
  );
};
```

## Changing volume over time [​](https://www.remotion.dev/docs/audio/volume\#changing-volume-over-time "Direct link to Changing volume over time")

You can also change volume over time by passing in a function that takes a frame number and returns the volume.

```

tsx

import {AbsoluteFill, Audio, interpolate, staticFile, useVideoConfig} from 'remotion';

export const MyComposition = () => {
  const {fps} = useVideoConfig();

  return (
    <AbsoluteFill>
      <Audio src={staticFile('audio.mp3')} volume={(f) => interpolate(f, [0, 1 * fps], [0, 1], {extrapolateLeft: 'clamp'})} />
    </AbsoluteFill>
  );
};
```

In this example we are using the [`interpolate()`](https://www.remotion.dev/docs/interpolate) function to fade the audio in over 1 second.

Note that because values below 0 are not allowed, we need to set the [`extrapolateLeft: 'clamp'`](https://www.remotion.dev/docs/interpolate#extrapolateleft) option to ensure no negative values.

Inside the callback function, the value of `f` starts always `0` when the audio begins to play.

It is not the same as the value of [`useCurrentFrame()`](https://www.remotion.dev/docs/use-current-frame).

Prefer using a callback function if the volume is changing. This will enable Remotion to draw a volume curve in the [Studio](https://www.remotion.dev/docs/studio) and is more performant.

## Limitations [v4.0.306](https://github.com/remotion-dev/remotion/releases/v4.0.306) [​](https://www.remotion.dev/docs/audio/volume\#limitations "Direct link to limitations")

By default, you'll face 2 limitations by default regarding volume:

[1](https://www.remotion.dev/docs/audio/volume#1) It is not possible to set the volume to a value higher than 1.

[2](https://www.remotion.dev/docs/audio/volume#2) On iOS Safari, the volume will be set to 1.

You can work around these limitations by enabling the Web Audio API for your [`<Audio>`](https://www.remotion.dev/docs/audio#usewebaudioapi), [`<Video>`](https://www.remotion.dev/docs/video#usewebaudioapi) and [`<OffthreadVideo>`](https://www.remotion.dev/docs/offthreadvideo#usewebaudioapi) tags.

```

tsx

<Audio src="https://parser.media/audio.wav" volume={2} useWebAudioApi crossOrigin="anonymous" />;
```

However, this comes with two caveats:

[1](https://www.remotion.dev/docs/audio/volume#1) You must set the `crossOrigin` prop to `anonymous` and the audio must support CORS.

[2](https://www.remotion.dev/docs/audio/volume#2) On Safari, you cannot combine it with [`playbackRate`](https://www.remotion.dev/docs/audio#playbackrate). If you do, the volume will be ignored.

- [Changing volume over time](https://www.remotion.dev/docs/audio/volume#changing-volume-over-time)
- [Limitations](https://www.remotion.dev/docs/audio/volume#limitations)

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