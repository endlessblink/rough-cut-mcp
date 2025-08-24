---
url: "https://www.remotion.dev/docs/audio/visualization"
title: "Audio Visualization | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/audio/visualization#__docusaurus_skipToContent_fallback)

On this page

Remotion has APIs for visualizing audio, for example for creating audiograms or music visualizers.

The `@remotion/media-utils` package provides helper functions for reading and processing audio. Using the [`getAudioData()`](https://www.remotion.dev/docs/get-audio-data) API you can read audio, and using the [`useAudioData()`](https://www.remotion.dev/docs/use-audio-data) helper hook you can load this audio data directly into your component.

## Bar visualization [​](https://www.remotion.dev/docs/audio/visualization\#bar-visualization "Direct link to Bar visualization")

Using the [`visualizeAudio()`](https://www.remotion.dev/docs/visualize-audio) API, you can get an audio spectrum for the current frame.

Bar visualizations are ideal for visualizing music.

```

tsx

import {useAudioData, visualizeAudio} from '@remotion/media-utils';
import {Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

const music = staticFile('music.mp3');

export const MyComponent: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const audioData = useAudioData(music);

  if (!audioData) {
    return null;
  }

  const visualization = visualizeAudio({
    fps,
    frame,
    audioData,
    numberOfSamples: 16,
  }); // [0.22, 0.1, 0.01, 0.01, 0.01, 0.02, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

  // Render a bar chart for each frequency, the higher the amplitude,
  // the longer the bar
  return (
    <div>
      <Audio src={music} />
      {visualization.map((v) => {
        return <div style={{width: 1000 * v, height: 15, backgroundColor: 'blue'}} />;
      })}
    </div>
  );
};
```

## Waveform visualization [​](https://www.remotion.dev/docs/audio/visualization\#waveform-visualization "Direct link to Waveform visualization")

See an example for a waveform visualizations using [`visualizeAudioWaveform()`](https://www.remotion.dev/docs/media-utils/visualize-audio-waveform) here.

0:00 / 0:10

## Working with large files [​](https://www.remotion.dev/docs/audio/visualization\#working-with-large-files "Direct link to Working with large files")

[`useAudioData()`](https://www.remotion.dev/docs/use-audio-data) loads the entire audio file into memory.
This is fine for small files, but for large files, it can be slow and consume a lot of memory.

Use [`useWindowedAudioData()`](https://www.remotion.dev/docs/use-windowed-audio-data) to only load a portion of the audio around the current frame.
The tradeoff is that this API only works with `.wav` files.

## See also [​](https://www.remotion.dev/docs/audio/visualization\#see-also "Direct link to See also")

- [Using audio](https://www.remotion.dev/docs/using-audio)
- [`useAudioData()`](https://www.remotion.dev/docs/use-audio-data)
- [`useWindowedAudioData()`](https://www.remotion.dev/docs/use-windowed-audio-data)
- [`visualizeAudio()`](https://www.remotion.dev/docs/visualize-audio)
- [`visualizeAudioWaveform()`](https://www.remotion.dev/docs/media-utils/visualize-audio-waveform)

- [Bar visualization](https://www.remotion.dev/docs/audio/visualization#bar-visualization)
- [Waveform visualization](https://www.remotion.dev/docs/audio/visualization#waveform-visualization)
- [Working with large files](https://www.remotion.dev/docs/audio/visualization#working-with-large-files)
- [See also](https://www.remotion.dev/docs/audio/visualization#see-also)

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