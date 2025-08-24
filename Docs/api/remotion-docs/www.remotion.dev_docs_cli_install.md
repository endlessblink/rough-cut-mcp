---
url: "https://www.remotion.dev/docs/cli/install"
title: "npx remotion install | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/cli/install#__docusaurus_skipToContent_fallback)

On this page

_removed in v4.0.0, available from v3.3_

_See ["No more FFmpeg installation"](https://www.remotion.dev/docs/4-0-migration#no-more-ffmpeg-install-ffmpegexecutable-option-removed)._

This page is for archival purpose.

Ensures that `ffmpeg` or `ffprobe` are installed by downloading them from the internet if they cannot be found.

```

bash

npx remotion install ffmpeg
```

```

bash

npx remotion install ffprobe
```

You might not need to call this function. Remotion will automatically download `ffmpeg` and `ffprobe` if a render is attempted, and no binary was found.

These commands are useful if you need `ffmpeg` and `ffprobe` to be ready before the first render is started.

## See also [​](https://www.remotion.dev/docs/cli/install\#see-also "Direct link to See also")

- [Node.JS equivalent: `ensureFfmpeg()`](https://www.remotion.dev/docs/renderer/ensure-ffmpeg)
- [Node.JS equivalent: `ensureFfprobe()`](https://www.remotion.dev/docs/renderer/ensure-ffprobe)
- [Installing FFmpeg](https://www.remotion.dev/docs/ffmpeg)

- [See also](https://www.remotion.dev/docs/cli/install#see-also)

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