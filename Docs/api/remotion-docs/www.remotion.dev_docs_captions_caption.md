---
url: "https://www.remotion.dev/docs/captions/caption"
title: "Caption | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/captions/caption#__docusaurus_skipToContent_fallback)

On this page

This is a simple data structure for a caption.

```

tsx

import type {Caption} from '@remotion/captions';

(alias) type Caption = {
    text: string;
    startMs: number;
    endMs: number;
    timestampMs: number | null;
    confidence: number | null;
}
import Caption
```

By establishing a standard data structure, we allow many operations that involve captions to be interoperable:

- **Transcribing**: Using the [`@remotion/install-whisper-cpp`](https://www.remotion.dev/docs/install-whisper-cpp) or [`@remotion/openai-whisper`](https://www.remotion.dev/docs/openai-whisper) packages
- **Formatting**: For example, creating pages using [`createTikTokStyleCaptions()`](https://www.remotion.dev/docs/captions/create-tiktok-style-captions)
- **Parsing**: Using the [`parseSrt()`](https://www.remotion.dev/docs/captions/parse-srt) function
- **Serializing**: For example to a `.srt` file using [`serializeSrt()`](https://www.remotion.dev/docs/captions/serialize-srt)

## Fields [​](https://www.remotion.dev/docs/captions/caption\#fields "Direct link to Fields")

### `text` [​](https://www.remotion.dev/docs/captions/caption\#text "Direct link to text")

The text of the caption.

### `startMs` [​](https://www.remotion.dev/docs/captions/caption\#startms "Direct link to startms")

The start time of the caption in milliseconds.

### `endMs` [​](https://www.remotion.dev/docs/captions/caption\#endms "Direct link to endms")

The end time of the caption in milliseconds.

### `timestampMs` [​](https://www.remotion.dev/docs/captions/caption\#timestampms "Direct link to timestampms")

The timestamp of the caption as a singular timestamp in milliseconds.

When using [`@remotion/install-whisper-cpp`](https://www.remotion.dev/docs/install-whisper-cpp), this the `t_dtw` value.

Otherwise, it is not defined, but may be the average of the start and end timestamps.

### `confidence` [​](https://www.remotion.dev/docs/captions/caption\#confidence "Direct link to confidence")

A number between 0 and 1 that indicates how confident the transcription is.

## Whitespace sensitivity [​](https://www.remotion.dev/docs/captions/caption\#whitespace-sensitivity "Direct link to Whitespace sensitivity")

The [`text`](https://www.remotion.dev/docs/captions/caption#text) field is whitespace sensitive. You should include spaces in it, ideally before each word.

While rendering, apply the [`white-space: pre`](https://developer.mozilla.org/en-US/docs/Web/CSS/white-space) CSS property to the container of the caption to ensure that the spaces are preserved.

## See also [​](https://www.remotion.dev/docs/captions/caption\#see-also "Direct link to See also")

- [Source code for this type](https://github.com/remotion-dev/remotion/blob/main/packages/captions/src/caption.ts)
- [`@remotion/captions`](https://www.remotion.dev/docs/captions)

- [Fields](https://www.remotion.dev/docs/captions/caption#fields)
  - [`text`](https://www.remotion.dev/docs/captions/caption#text)
  - [`startMs`](https://www.remotion.dev/docs/captions/caption#startms)
  - [`endMs`](https://www.remotion.dev/docs/captions/caption#endms)
  - [`timestampMs`](https://www.remotion.dev/docs/captions/caption#timestampms)
  - [`confidence`](https://www.remotion.dev/docs/captions/caption#confidence)
- [Whitespace sensitivity](https://www.remotion.dev/docs/captions/caption#whitespace-sensitivity)
- [See also](https://www.remotion.dev/docs/captions/caption#see-also)

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