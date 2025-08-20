---
url: "https://www.remotion.dev/docs/audio/order-of-operations"
title: "Order of Operations | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/audio/order-of-operations#__docusaurus_skipToContent_fallback)

Before Remotion v4.0.141, it was not defined in which order audio and video operations would be applied. Behavior in preview and render could deviate.

Since Remotion v4.0.141, the order of operations is guaranteed to be the following:

1. Trim audio (using [`trimBefore`](https://www.remotion.dev/docs/audio##trimbefore--trimafter)).
2. Offset audio (by putting it in a [`<Sequence>`](https://www.remotion.dev/docs/sequence)).
3. Stretch audio (by adding a [`playbackRate`](https://www.remotion.dev/docs/audio#playbackrate)).

Example for a 30 FPS composition which is 60 frames long:

1. An [`<Audio>`](https://www.remotion.dev/docs/audio) tag has a [`trimBefore`](https://www.remotion.dev/docs/audio#trimbefore--trimafter) value of 45. The first 1.5 seconds of the audio get trimmed off.
2. The [`<Audio>`](https://www.remotion.dev/docs/audio) tag is in a [`<Sequence>`](https://www.remotion.dev/docs/sequence) which starts at `30`. The audio only begins playing at the 1.0 second timeline mark at the 1.5 second audio position.
3. The [`<Audio>`](https://www.remotion.dev/docs/audio) has a [`playbackRate`](https://www.remotion.dev/docs/audio#playbackrate) of `2`. The audio gets sped up by 2x, but the starting position and start offset is not affected.
4. The composition is 60 frames long, so the audio must stop at the 3.5 second mark:

> (comp\_duration - offset) \* playback\_rate + start\_from
>
> (60 - 30) \* 2 + 45 => frame 105 or the 3.5 second mark

5. Result: The section of 1.5sec - 3.5sec gets cut out of the audio and is played in the Remotion timeline between frames 30 and 59 at 2x speed.

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