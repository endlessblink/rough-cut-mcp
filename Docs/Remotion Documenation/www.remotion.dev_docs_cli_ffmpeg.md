---
url: "https://www.remotion.dev/docs/cli/ffmpeg"
title: "npx remotion ffmpeg | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/cli/ffmpeg#__docusaurus_skipToContent_fallback)

On this page

_available since v4.0_

In order to use `ffmpeg` without having to directly install it, Remotion provides it via `npx remotion ffmpeg`.

Note that in order to keep the binary size small, the FFmpeg binary only understand the codecs that Remotion itself supports: H.264, H.265, VP8, VP9 and ProRes. A binary from the 7.1 release line of FFmpeg is used.

Convert a video file to an audio file

```

bash

npx remotion ffmpeg -i input.mp4 output.mp3
```

To find out more about FFmpeg, visit their [docs](https://ffmpeg.org/documentation.html).

## See also [​](https://www.remotion.dev/docs/cli/ffmpeg\#see-also "Direct link to See also")

- [`npx remotion ffprobe`](https://www.remotion.dev/docs/cli/ffprobe)

- [See also](https://www.remotion.dev/docs/cli/ffmpeg#see-also)

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