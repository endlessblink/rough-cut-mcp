---
url: "https://www.remotion.dev/docs/captions/create-tiktok-style-captions"
title: "createTikTokStyleCaptions() | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/captions/create-tiktok-style-captions#__docusaurus_skipToContent_fallback)

On this page

Using this function, you can segment tokens to create "pages" of captions, as commonly seen on TikTok videos.

You may specify how often pages switch.
A high value for `combineTokensWithinMilliseconds` will fit many words on 1 page, while a low value will lead to word-by-word animation.

This function is safe to use in the browser, Node.js and Bun.

note

This API expects the whitespace to be included in the `text` field **before each word. Spaces are used as delimiters, and omitting them will cause the entire text to merge into a single line or page, resulting in poorly formatted captions.**.

```

Create pages from captions
tsx

import {createTikTokStyleCaptions, Caption} from '@remotion/captions';

const captions: Caption[] = [\
  {\
    text: 'Using',\
    startMs: 40,\
    endMs: 300,\
    timestampMs: 200,\
    confidence: null,\
  },\
  {\
    text: " Remotion's",\
    startMs: 300,\
    endMs: 900,\
    timestampMs: 440,\
    confidence: null,\
  },\
  {\
    text: ' TikTok',\
    startMs: 900,\
    endMs: 1260,\
    timestampMs: 1080,\
    confidence: null,\
  },\
  {\
    text: ' template,',\
    startMs: 1260,\
    endMs: 1950,\
    timestampMs: 1600,\
    confidence: null,\
  },\
];

const {pages} = createTikTokStyleCaptions({
  captions,
  combineTokensWithinMilliseconds: 1200,
});

/* pages: [\
  {\
    text: "Using Remotion's",\
    startMs: 40,\
    durationMs: 860,\
    tokens: [\
      {\
        text: 'Using',\
        fromMs: 40,\
        toMs: 300,\
      },\
      {\
        text: " Remotion's",\
        fromMs: 300,\
        toMs: 900,\
      },\
    ],\
  },\
  {\
    text: 'TikTok template,',\
    startMs: 900,\
    durationMs: 1050,\
    tokens: [\
      {\
        text: 'TikTok',\
        fromMs: 900,\
        toMs: 1260,\
      },\
      {\
        text: ' template,',\
        fromMs: 1260,\
        toMs: 1950,\
      },\
    ],\
  }\
] */
```

## API [​](https://www.remotion.dev/docs/captions/create-tiktok-style-captions\#api "Direct link to API")

### `captions` [​](https://www.remotion.dev/docs/captions/create-tiktok-style-captions\#captions "Direct link to captions")

An array of [`Caption`](https://www.remotion.dev/docs/captions/caption) objects.

### `combineTokensWithinMilliseconds` [​](https://www.remotion.dev/docs/captions/create-tiktok-style-captions\#combinetokenswithinmilliseconds "Direct link to combinetokenswithinmilliseconds")

Words that are closer than this value will be combined into a single page.

## Return value [​](https://www.remotion.dev/docs/captions/create-tiktok-style-captions\#return-value "Direct link to Return value")

An object with the following properties:

### `pages` [​](https://www.remotion.dev/docs/captions/create-tiktok-style-captions\#pages "Direct link to pages")

An array of `TikTokPage` objects.

A page consists of:

- `text`: The text of the page.
- `startMs`: The start time of the page in milliseconds.
- `durationMs`: The duration of the page in milliseconds ( _from v4.0.261_).
- `tokens`: An array of objects, if you want to animate word-per-word:
  - `text`: The text of the token.
  - `fromMs`: The absolute start time of the token in milliseconds.
  - `toMs`: The absolute end time of the token in milliseconds.

## Whitespace sensitivity [​](https://www.remotion.dev/docs/captions/create-tiktok-style-captions\#whitespace-sensitivity "Direct link to Whitespace sensitivity")

The [`text`](https://www.remotion.dev/docs/captions/caption#text) field is whitespace sensitive. You should include spaces in it, ideally before each word.

While rendering, apply the [`white-space: pre`](https://developer.mozilla.org/en-US/docs/Web/CSS/white-space) CSS property to the container of the caption to ensure that the spaces are preserved.

## See also [​](https://www.remotion.dev/docs/captions/create-tiktok-style-captions\#see-also "Direct link to See also")

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/captions/src/create-tiktok-style-captions.ts)
- [`@remotion/captions`](https://www.remotion.dev/docs/captions)

- [API](https://www.remotion.dev/docs/captions/create-tiktok-style-captions#api)
  - [`captions`](https://www.remotion.dev/docs/captions/create-tiktok-style-captions#captions)
  - [`combineTokensWithinMilliseconds`](https://www.remotion.dev/docs/captions/create-tiktok-style-captions#combinetokenswithinmilliseconds)
- [Return value](https://www.remotion.dev/docs/captions/create-tiktok-style-captions#return-value)
  - [`pages`](https://www.remotion.dev/docs/captions/create-tiktok-style-captions#pages)
- [Whitespace sensitivity](https://www.remotion.dev/docs/captions/create-tiktok-style-captions#whitespace-sensitivity)
- [See also](https://www.remotion.dev/docs/captions/create-tiktok-style-captions#see-also)

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