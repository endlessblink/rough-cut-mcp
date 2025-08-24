---
url: "https://www.remotion.dev/docs/audio"
title: "<Audio> | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/audio#__docusaurus_skipToContent_fallback)

On this page

Using this component, you can add audio to your video. All audio formats which are supported by Chromium are supported by the component.

## API [​](https://www.remotion.dev/docs/audio\#api "Direct link to API")

### `src` [​](https://www.remotion.dev/docs/audio\#src "Direct link to src")

[Put an audio file into the `public/` folder](https://www.remotion.dev/docs/assets) and use [`staticFile()`](https://www.remotion.dev/docs/staticfile) to reference it.

```

tsx

import {AbsoluteFill, Audio, staticFile} from 'remotion';

export const MyVideo = () => {
  return (
    <AbsoluteFill>
      <Audio src={staticFile('audio.mp3')} />
    </AbsoluteFill>
  );
};
```

### `volume?` [​](https://www.remotion.dev/docs/audio\#volume "Direct link to volume")

The component also accepts a `volume` props which allows you to control the volume of the audio in it's entirety or frame by frame. Read the page on [using audio](https://www.remotion.dev/docs/using-audio) to learn more.

```

Setting a static volume
tsx

import {AbsoluteFill, Audio, staticFile} from 'remotion';

export const MyVideo = () => {
  return (
    <AbsoluteFill>
      <Audio volume={0.5} src={staticFile('background.mp3')} />
    </AbsoluteFill>
  );
};
```

```

Changing the volume over time
tsx

import {AbsoluteFill, Audio, interpolate, staticFile} from 'remotion';

export const MyVideo = () => {
  return (
    <AbsoluteFill>
      <Audio volume={(f) => interpolate(f, [0, 30], [0, 1], {extrapolateLeft: 'clamp'})} src={staticFile('voice.mp3')} />
    </AbsoluteFill>
  );
};
```

By default, volumes between 0 and 1 are supported, where in iOS Safari, the volume is always 1.

See [Volume Limitations](https://www.remotion.dev/docs/audio/volume#limitations) for more information.

### `loopVolumeCurveBehavior?` [v4.0.142](https://github.com/remotion-dev/remotion/releases/v4.0.142) [​](https://www.remotion.dev/docs/audio\#loopvolumecurvebehavior "Direct link to loopvolumecurvebehavior")

Controls the `frame` which is returned when using the [`volume`](https://www.remotion.dev/docs/audio#volume) callback function and adding the [`loop`](https://www.remotion.dev/docs/audio#loop) attribute.

Can be either `"repeat"` (default, start from 0 on each iteration) or `"extend"` (keep increasing frames).

### `trimBefore?` / `trimAfter?` [v4.0.319](https://github.com/remotion-dev/remotion/releases/v4.0.319) [​](https://www.remotion.dev/docs/audio\#trimbefore--trimafter "Direct link to trimbefore--trimafter")

`<Audio>` has two helper props you can use to trim audio:

- `trimBefore` will remove a portion of the audio at the beginning (left side)
- `trimAfter` will remove a portion of the audio at the end (right side)

In the following example, we assume that the [`fps`](https://www.remotion.dev/docs/composition#fps) of the composition is `30`.

By passing `trimBefore={60}`, the playback starts immediately, but with the first 2 seconds of the audio trimmed away.

By passing `trimAfter={120}`, any audio after the 4 second mark in the file will be trimmed away.

The audio will play the range from `00:02:00` to `00:04:00`, meaning the audio will play for 2 seconds.

```

tsx

import {AbsoluteFill, Audio, staticFile} from 'remotion';

export const MyVideo = () => {
  return (
    <AbsoluteFill>
      <Audio src={staticFile('audio.mp3')} trimBefore={60} trimAfter={120} />
    </AbsoluteFill>
  );
};
```

### ~~`startFrom?` / `endAt?`~~ [​](https://www.remotion.dev/docs/audio\#startfrom--endat "Direct link to startfrom--endat")

Deprecated

These props have been renamed to [`trimBefore`](https://www.remotion.dev/docs/audio#trimbefore--trimafter) and [`trimAfter`](https://www.remotion.dev/docs/audio#trimbefore--trimafter) in 4.0.319. They will continue to work but you cannot use them together with the new props.

### `playbackRate?` [v2.2.0](https://github.com/remotion-dev/remotion/releases/v2.2.0) [​](https://www.remotion.dev/docs/audio\#playbackrate "Direct link to playbackrate")

You can use the `playbackRate` prop to control the speed of the audio. `1` is the default and means regular speed, `0.5` slows down the audio so it's twice as long and `2` speeds up the audio so it's twice as fast.

While Remotion doesn't limit the range of possible playback speeds, in development mode the [`HTMLMediaElement.playbackRate`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/playbackRate) API is used which throws errors on extreme values. At the time of writing, Google Chrome throws an exception if the playback rate is below `0.0625` or above `16`.

```

tsx

import {AbsoluteFill, Audio, staticFile} from 'remotion';

export const MyVideo = () => {
  return (
    <AbsoluteFill>
      <Audio src={staticFile('audio.mp3')} playbackRate={2} />
    </AbsoluteFill>
  );
};
```

note

Playing a video in reverse is not supported.

### `muted?` [v2.0.0](https://github.com/remotion-dev/remotion/releases/v2.0.0) [​](https://www.remotion.dev/docs/audio\#muted "Direct link to muted")

The `muted` prop will be respected. It will lead to no audio being played while still keeping the audio tag mounted. It's value may change over time, for example to only mute a certain section of the audio.

```

tsx

import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';

export const MyVideo = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Audio src={staticFile('audio.mp3')} muted={frame < 30} />
    </AbsoluteFill>
  );
};
```

### `name?` [v4.0.71](https://github.com/remotion-dev/remotion/releases/v4.0.71) [​](https://www.remotion.dev/docs/audio\#name "Direct link to name")

_optional_

A name and that will be shown as the label of the sequence in the timeline of the Remotion Studio. This property is purely for helping you keep track of items in the timeline.

### `loop?` [v3.2.29](https://github.com/remotion-dev/remotion/releases/v3.2.29) [​](https://www.remotion.dev/docs/audio\#loop "Direct link to loop")

You can use the `loop` prop to loop audio.

```

tsx

import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';

export const MyVideo = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Audio loop src={staticFile('audio.mp3')} />
    </AbsoluteFill>
  );
};
```

### `toneFrequency?` [v4.0.47](https://github.com/remotion-dev/remotion/releases/v4.0.47) [​](https://www.remotion.dev/docs/audio\#tonefrequency "Direct link to tonefrequency")

Adjust the pitch of the audio - will only be applied during rendering.

Accepts a number between `0.01` and `2`, where `1` represents the original pitch. Values less than `1` will decrease the pitch, while values greater than `1` will increase it.

A `toneFrequency` of 0.5 would lower the pitch by half, and a `toneFrequency` of `1.5` would increase the pitch by 50%.

### `acceptableTimeShiftInSeconds?` [v3.2.42](https://github.com/remotion-dev/remotion/releases/v3.2.42) [​](https://www.remotion.dev/docs/audio\#acceptabletimeshiftinseconds "Direct link to acceptabletimeshiftinseconds")

In the [Remotion Studio](https://www.remotion.dev/docs/terminology/studio) or in the [Remotion Player](https://www.remotion.dev/docs/player), Remotion will seek the audio if it gets too much out of sync with Remotion's internal time - be it due to the audio loading or the page being too slow to keep up in real-time. By default, a seek is triggered if `0.45` seconds of time shift is encountered. Using this prop, you can customize the threshold.

### `pauseWhenBuffering?` [v4.0.111](https://github.com/remotion-dev/remotion/releases/v4.0.111) [​](https://www.remotion.dev/docs/audio\#pausewhenbuffering "Direct link to pausewhenbuffering")

If set to `true` and the audio is buffering, the Player will enter into the [native buffering state](https://www.remotion.dev/docs/player/buffer-state). The default is `false`, but will become `true` in Remotion 5.0.

### `showInTimeline?` [v4.0.122](https://github.com/remotion-dev/remotion/releases/v4.0.122) [​](https://www.remotion.dev/docs/audio\#showintimeline "Direct link to showintimeline")

If set to `false`, no layer will be shown in the timeline of the Remotion Studio. The default is `true`.

### `delayRenderTimeoutInMilliseconds?` [v4.0.140](https://github.com/remotion-dev/remotion/releases/v4.0.140) [​](https://www.remotion.dev/docs/audio\#delayrendertimeoutinmilliseconds "Direct link to delayrendertimeoutinmilliseconds")

Customize the [timeout](https://www.remotion.dev/docs/delay-render#modifying-the-timeout) of the [`delayRender()`](https://www.remotion.dev/docs/delay-render) call that this component makes.

### `delayRenderRetries?` [v4.0.140](https://github.com/remotion-dev/remotion/releases/v4.0.140) [​](https://www.remotion.dev/docs/audio\#delayrenderretries "Direct link to delayrenderretries")

Customize the [number of retries](https://www.remotion.dev/docs/delay-render#retrying) of the [`delayRender()`](https://www.remotion.dev/docs/delay-render) call that this component makes.

### `useWebAudioApi?` [v4.0.306](https://github.com/remotion-dev/remotion/releases/v4.0.306) [​](https://www.remotion.dev/docs/audio\#usewebaudioapi "Direct link to usewebaudioapi")

Enable the [Web Audio API](https://www.remotion.dev/docs/audio/volume#limitations) for the audio tag.

### `onError?` [v4.0.326](https://github.com/remotion-dev/remotion/releases/v4.0.326) [​](https://www.remotion.dev/docs/audio\#onerror "Direct link to onerror")

Handle an error playing the audio.

### ~~`allowAmplificationDuringRender?` [v3.3.17](https://github.com/remotion-dev/remotion/releases/v3.3.17)~~ [​](https://www.remotion.dev/docs/audio\#allowamplificationduringrender "Direct link to allowamplificationduringrender")

Deprecated since v4.0.279: This prop intended to opt into setting the volume to a value higher than one, even though it would only apply during render.

The option does not make sense anymore, because it is now possible to set the volume higher than `1`.

To prevent synthetic amplification, set a volume not higher than 1.

## See also [​](https://www.remotion.dev/docs/audio\#see-also "Direct link to See also")

- [Source code for this component](https://github.com/remotion-dev/remotion/blob/main/packages/core/src/audio/Audio.tsx)
- [Using audio](https://www.remotion.dev/docs/using-audio)
- [Audio visualization](https://www.remotion.dev/docs/audio/visualization)
- [`<Video />`](https://www.remotion.dev/docs/video)

CONTRIBUTORS

[![JonnyBurger](https://github.com/JonnyBurger.png)\\
\\
**JonnyBurger** \\
\\
Implementation](https://github.com/JonnyBurger) [![evoxf1](https://github.com/evoxf1.png)\\
\\
**evoxf1** \\
\\
`toneFrequency` prop](https://github.com/evoxf1)

- [API](https://www.remotion.dev/docs/audio#api)
  - [`src`](https://www.remotion.dev/docs/audio#src)
  - [`volume?`](https://www.remotion.dev/docs/audio#volume)
  - [`loopVolumeCurveBehavior?`](https://www.remotion.dev/docs/audio#loopvolumecurvebehavior)
  - [`trimBefore?` / `trimAfter?`](https://www.remotion.dev/docs/audio#trimbefore--trimafter)
  - [~~`startFrom?` / `endAt?`~~](https://www.remotion.dev/docs/audio#startfrom--endat)
  - [`playbackRate?`](https://www.remotion.dev/docs/audio#playbackrate)
  - [`muted?`](https://www.remotion.dev/docs/audio#muted)
  - [`name?`](https://www.remotion.dev/docs/audio#name)
  - [`loop?`](https://www.remotion.dev/docs/audio#loop)
  - [`toneFrequency?`](https://www.remotion.dev/docs/audio#tonefrequency)
  - [`acceptableTimeShiftInSeconds?`](https://www.remotion.dev/docs/audio#acceptabletimeshiftinseconds)
  - [`pauseWhenBuffering?`](https://www.remotion.dev/docs/audio#pausewhenbuffering)
  - [`showInTimeline?`](https://www.remotion.dev/docs/audio#showintimeline)
  - [`delayRenderTimeoutInMilliseconds?`](https://www.remotion.dev/docs/audio#delayrendertimeoutinmilliseconds)
  - [`delayRenderRetries?`](https://www.remotion.dev/docs/audio#delayrenderretries)
  - [`useWebAudioApi?`](https://www.remotion.dev/docs/audio#usewebaudioapi)
  - [`onError?`](https://www.remotion.dev/docs/audio#onerror)
  - [~~`allowAmplificationDuringRender?`~~](https://www.remotion.dev/docs/audio#allowamplificationduringrender)
- [See also](https://www.remotion.dev/docs/audio#see-also)

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