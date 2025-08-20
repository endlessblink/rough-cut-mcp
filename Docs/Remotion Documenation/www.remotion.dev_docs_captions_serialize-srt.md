---
url: "https://www.remotion.dev/docs/captions/serialize-srt"
title: "serializeSrt() | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/captions/serialize-srt#__docusaurus_skipToContent_fallback)

On this page

Converts a two-dimensional array of [`Caption`](https://www.remotion.dev/docs/captions/caption) items into a string in the SubRip format ( `.srt`).

```

Example usage
tsx

import {serializeSrt, Caption} from '@remotion/captions';

const captions: Caption[] = [\
  {\
    text: 'Welcome to the Example Subtitle File!',\
    startMs: 0,\
    endMs: 2500,\
    timestampMs: 1250,\
    confidence: 1,\
  },\
  {\
    text: 'This is a demonstration of SRT subtitles.',\
    startMs: 3000,\
    endMs: 6000,\
    timestampMs: 4500,\
    confidence: 1,\
  },\
  {\
    text: 'You can use SRT files to add subtitles to your videos.',\
    startMs: 7000,\
    endMs: 10500,\
    timestampMs: 8750,\
    confidence: 1,\
  },\
];

const lines = captions.map((caption) => [caption]);

const serialized = serializeSrt({lines});

/* serialized = `1
00:00:00,000 --> 00:00:02,500
Welcome to the Example Subtitle File!

2
00:00:03,000 --> 00:00:06,000
This is a demonstration of SRT subtitles.

3
00:00:07,000 --> 00:00:10,500
You can use SRT files to add subtitles to your videos.
`
*/
```

## API [​](https://www.remotion.dev/docs/captions/serialize-srt\#api "Direct link to API")

### `lines` [​](https://www.remotion.dev/docs/captions/serialize-srt\#lines "Direct link to lines")

An two-dimensional array of [`Caption`](https://www.remotion.dev/docs/captions/caption) items.

Each top-level item represents a line in the SubRip file.

The second-level items represent the words in that line.

Words get concatenated together during serialization. No spaces are added between the words.

The start timestamp is determined from the `startMs` value of the first word in the line.

The end timestamp is determined from the `endMs` value of the last word in the line.

Arrays with no items will be ignored.

## Return value [​](https://www.remotion.dev/docs/captions/serialize-srt\#return-value "Direct link to Return value")

A string in the SubRip format ( `.srt`).

## See also [​](https://www.remotion.dev/docs/captions/serialize-srt\#see-also "Direct link to See also")

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/captions/src/serialize-srt.ts)
- [`@remotion/captions`](https://www.remotion.dev/docs/captions)

- [API](https://www.remotion.dev/docs/captions/serialize-srt#api)
  - [`lines`](https://www.remotion.dev/docs/captions/serialize-srt#lines)
- [Return value](https://www.remotion.dev/docs/captions/serialize-srt#return-value)
- [See also](https://www.remotion.dev/docs/captions/serialize-srt#see-also)

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