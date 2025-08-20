---
url: "https://www.remotion.dev/docs/animation-math"
title: "Animation math | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/animation-math#__docusaurus_skipToContent_fallback)

You can add, subtract and multiply animation values to create more complex animations.

Consider the following example:

```

Enter and exit
tsx

import { spring, useCurrentFrame, useVideoConfig } from "remotion";

const frame = useCurrentFrame();
const { fps, durationInFrames } = useVideoConfig();

const enter = spring({
  fps,
  frame,
  config: {
    damping: 200,
  },
});

const exit = spring({
  fps,
  config: {
    damping: 200,
  },
  durationInFrames: 20,
  delay: durationInFrames - 20,
  frame,
});

const scale = enter - exit;
```

- At the beginning of the animation, the value of `enter` is `0`, it goes to `1` over the course of the animation.
- Before the sequence ends, we create an `exit` animation that goes from `0` to `1`.
- Subtracting the `exit` animation from the `enter` animation gives us the overall state of the animation which we use to animate `scale`.

60

```

Full snippet
tsx

import React from "react";
import {
  AbsoluteFill,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const AnimationMath: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const enter = spring({
    fps,
    frame,
    config: {
      damping: 200,
    },
  });

  const exit = spring({
    fps,
    config: {
      damping: 200,
    },
    durationInFrames: 20,
    delay: durationInFrames - 20,
    frame,
  });

  const scale = enter - exit;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
      }}
    >
      <div
        style={{
          height: 100,
          width: 100,
          backgroundColor: "#4290f5",
          borderRadius: 20,
          transform: `scale(${scale})`,
          justifyContent: "center",
          alignItems: "center",
          display: "flex",
          fontSize: 50,
          color: "white",
        }}
      >
        {frame}
      </div>
    </AbsoluteFill>
  );
};
```

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