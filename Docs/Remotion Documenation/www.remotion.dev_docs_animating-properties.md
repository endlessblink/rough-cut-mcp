---
url: "https://www.remotion.dev/docs/animating-properties"
title: "Animating properties | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/animating-properties#__docusaurus_skipToContent_fallback)

On this page

Animation works by changing properties over time.

Let's create a simple fade in animation.

If we want to fade the text in over 60 frames, we need to gradually change the `opacity` over time so that it goes from 0 to 1.

```

FadeIn.tsx
tsx

export const FadeIn = () => {
  const frame = useCurrentFrame();

  const opacity = Math.min(1, frame / 60);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
        fontSize: 80,
      }}
    >
      <div style={{ opacity: opacity }}>Hello World!</div>
    </AbsoluteFill>
  );
};
```

## Using the interpolate helper function [​](https://www.remotion.dev/docs/animating-properties\#using-the-interpolate-helper-function "Direct link to Using the interpolate helper function")

Using the [`interpolate()`](https://www.remotion.dev/docs/interpolate) function can make animations more readable. The above animation can also be written as:

```

tsx

import { interpolate } from "remotion";

const opacity = interpolate(frame, [0, 60], [0, 1], {
  /*                        ^^^^^   ^^^^^    ^^^^
  Variable to interpolate ----|       |       |
  Input range ------------------------|       |
  Output range -------------------------------|  */
  extrapolateRight: "clamp",
});
```

In this example, we map the frames 0 to 60 to their opacity values `(0, 0.0166, 0.033, 0.05 ...`) and use the [`extrapolateRight`](https://www.remotion.dev/docs/interpolate#extrapolateright) setting to clamp the output so that it never becomes bigger than 1.

## Using spring animations [​](https://www.remotion.dev/docs/animating-properties\#using-spring-animations "Direct link to Using spring animations")

Spring animations are a natural animation primitive. By default, they animate from 0 to 1 over time. This time, let's animate the scale of the text.

```

tsx

import { spring, useCurrentFrame, useVideoConfig } from "remotion";

export const MyVideo = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    fps,
    frame,
  });

  return (
    <div
      style={{
        flex: 1,
        textAlign: "center",
        fontSize: "7em",
      }}
    >
      <div style={{ transform: `scale(${scale})` }}>Hello World!</div>
    </div>
  );
};
```

You should see the text jump in.

The default spring configuration leads to a little bit of overshoot, meaning the text will bounce a little bit. See the documentation page for [`spring()`](https://www.remotion.dev/docs/spring) to learn how to customize it.

## Always animate using `useCurrentFrame()` [​](https://www.remotion.dev/docs/animating-properties\#always-animate-using-usecurrentframe "Direct link to always-animate-using-usecurrentframe")

Watch out for flickering issues during rendering that arise if you write animations that are not driven by [`useCurrentFrame()`](https://www.remotion.dev/docs/use-current-frame) – for example CSS transitions.

[Read more about how Remotion's rendering works](https://www.remotion.dev/docs/flickering) \- understanding it will help you avoid issues down the road.

- [Using the interpolate helper function](https://www.remotion.dev/docs/animating-properties#using-the-interpolate-helper-function)
- [Using spring animations](https://www.remotion.dev/docs/animating-properties#using-spring-animations)
- [Always animate using `useCurrentFrame()`](https://www.remotion.dev/docs/animating-properties#always-animate-using-usecurrentframe)

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