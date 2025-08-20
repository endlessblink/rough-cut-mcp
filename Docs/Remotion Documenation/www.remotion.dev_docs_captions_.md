---
url: "https://www.remotion.dev/docs/captions/"
title: "@remotion/captions | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/captions/#__docusaurus_skipToContent_fallback)

On this page

_Available from v4.0.216_

The `@remotion/captions` package provides utilities for dealing with subtitles.

At the centre of this caption is the [`Caption`](https://www.remotion.dev/docs/captions/caption) type, which defines a standard shape for captions from different sources.

Captions generated from [`@remotion/install-whisper-cpp`](https://www.remotion.dev/docs/install-whisper-cpp) [can be converted](https://www.remotion.dev/docs/install-whisper-cpp/to-captions) into the `Caption` type.

- npm
- yarn
- pnpm
- bun

```

npm i --save-exact @remotion/captions@4.0.333Copy
```

This assumes you are currently using v4.0.333 of Remotion.

Also update `remotion` and all `` `@remotion/*` `` packages to the same version.

Remove all `^` character in front of the version numbers of it as it can lead to a version conflict.

## APIs [​](https://www.remotion.dev/docs/captions/\#apis "Direct link to APIs")

[**Caption** \\
\\
An object shape for captions](https://www.remotion.dev/docs/captions/caption) [**parseSrt()** \\
\\
Parse a .srt file into a `Caption` array](https://www.remotion.dev/docs/captions/parse-srt) [**serializeSrt()** \\
\\
Serialize a .srt file into a `Caption` array](https://www.remotion.dev/docs/captions/serialize-srt) [**createTikTokStyleCaptions()** \\
\\
Structure the captions for TikTok-style display](https://www.remotion.dev/docs/captions/create-tiktok-style-captions)

## License [​](https://www.remotion.dev/docs/captions/\#license "Direct link to License")

MIT

- [APIs](https://www.remotion.dev/docs/captions/#apis)
- [License](https://www.remotion.dev/docs/captions/#license)

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