---
url: "https://www.remotion.dev/docs/captions/parse-srt"
title: "parseSrt() | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/captions/parse-srt#__docusaurus_skipToContent_fallback)

On this page

Parses the contents of a SubRip file ( `.srt`) and returns an array of [`Caption`](https://www.remotion.dev/docs/captions) items.

```

Example usage
tsx

import {parseSrt} from '@remotion/captions';

const input = `
1
00:00:00,000 --> 00:00:02,500
Welcome to the Example Subtitle File!

2
00:00:03,000 --> 00:00:06,000
This is a demonstration of SRT subtitles.

3
00:00:07,000 --> 00:00:10,500
You can use SRT files to add subtitles to your videos.
`.trim();

const {captions} = parseSrt({input});

/* captions = [\
  {\
    confidence: 1,\
    endMs: 2500,\
    startMs: 0,\
    text: 'Welcome to the Example Subtitle File!',\
    timestampMs: 1250,\
  },\
  {\
    confidence: 1,\
    endMs: 6000,\
    startMs: 3000,\
    text: 'This is a demonstration of SRT subtitles.',\
    timestampMs: 4500,\
  },\
  {\
    confidence: 1,\
    endMs: 10500,\
    startMs: 7000,\
    text: 'You can use SRT files to add subtitles to your videos.',\
    timestampMs: 8750,\
  },\
]
*/
```

## API [​](https://www.remotion.dev/docs/captions/parse-srt\#api "Direct link to API")

### `input` [​](https://www.remotion.dev/docs/captions/parse-srt\#input "Direct link to input")

The contents of a `.srt` file as a `string`.

## Return value [​](https://www.remotion.dev/docs/captions/parse-srt\#return-value "Direct link to Return value")

An object with the following properties:

### `captions` [​](https://www.remotion.dev/docs/captions/parse-srt\#captions "Direct link to captions")

An array of [`Caption`](https://www.remotion.dev/docs/captions/caption) items.

## See also [​](https://www.remotion.dev/docs/captions/parse-srt\#see-also "Direct link to See also")

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/captions/src/parse-srt.ts)
- [`@remotion/captions`](https://www.remotion.dev/docs/captions)

- [API](https://www.remotion.dev/docs/captions/parse-srt#api)
  - [`input`](https://www.remotion.dev/docs/captions/parse-srt#input)
- [Return value](https://www.remotion.dev/docs/captions/parse-srt#return-value)
  - [`captions`](https://www.remotion.dev/docs/captions/parse-srt#captions)
- [See also](https://www.remotion.dev/docs/captions/parse-srt#see-also)

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