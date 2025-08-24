---
url: "https://www.remotion.dev/docs/animated-emoji/get-available-emoji"
title: "getAvailableEmoji() | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/animated-emoji/get-available-emoji#__docusaurus_skipToContent_fallback)

On this page

_available from v4.0.187_

Gets a list of available emoji that you can use with [`<AnimatedEmoji>`](https://www.remotion.dev/docs/animated-emoji/animated-emoji).

```

get-emoji.ts
tsx

import {getAvailableEmojis} from "@remotion/animated-emoji";

const emojiList = getAvailableEmojis();

console.log(emojiList);
```

## Return value [​](https://www.remotion.dev/docs/animated-emoji/get-available-emoji\#return-value "Direct link to Return value")

An array of objects with the following properties:

### `name` [​](https://www.remotion.dev/docs/animated-emoji/get-available-emoji\#name "Direct link to name")

The name of the emoji. You can pass the name to the [`emoji`](https://www.remotion.dev/docs/animated-emoji/animated-emoji#emoji) prop.

### `categories` [​](https://www.remotion.dev/docs/animated-emoji/get-available-emoji\#categories "Direct link to categories")

An array of categories that the emoji belongs to.

### `tags` [​](https://www.remotion.dev/docs/animated-emoji/get-available-emoji\#tags "Direct link to tags")

An array of tags that the emoji has.

### `durationInSeconds` [​](https://www.remotion.dev/docs/animated-emoji/get-available-emoji\#durationinseconds "Direct link to durationinseconds")

The duration of the emoji in seconds.

### `codepoint` [​](https://www.remotion.dev/docs/animated-emoji/get-available-emoji\#codepoint "Direct link to codepoint")

The Unicode codepoint of the emoji.

## See also [​](https://www.remotion.dev/docs/animated-emoji/get-available-emoji\#see-also "Direct link to See also")

- [`<AnimatedEmoji>`](https://www.remotion.dev/docs/animated-emoji/animated-emoji)

- [Return value](https://www.remotion.dev/docs/animated-emoji/get-available-emoji#return-value)
  - [`name`](https://www.remotion.dev/docs/animated-emoji/get-available-emoji#name)
  - [`categories`](https://www.remotion.dev/docs/animated-emoji/get-available-emoji#categories)
  - [`tags`](https://www.remotion.dev/docs/animated-emoji/get-available-emoji#tags)
  - [`durationInSeconds`](https://www.remotion.dev/docs/animated-emoji/get-available-emoji#durationinseconds)
  - [`codepoint`](https://www.remotion.dev/docs/animated-emoji/get-available-emoji#codepoint)
- [See also](https://www.remotion.dev/docs/animated-emoji/get-available-emoji#see-also)

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