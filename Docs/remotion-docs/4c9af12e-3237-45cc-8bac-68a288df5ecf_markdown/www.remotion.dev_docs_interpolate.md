[Skip to main content](https://www.remotion.dev/docs/interpolate#__docusaurus_skipToContent_fallback)

On this page

[![](https://i.ytimg.com/vi/sff_CdWw_-c/hqdefault.jpg?sqp=-oaymwEcCPYBEIoBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLDPXdTFxf6qNNfkSr_91y0xVTXaXQ)\\
\\
Also available as a 6min video\\
\\
**How to interpolate()**](https://www.youtube.com/watch?v=sff_CdWw_-c)

Allows you to map a range of values to another using a concise syntax.

## Example: Fade-in effect [​](https://www.remotion.dev/docs/interpolate\#example-fade-in-effect "Direct link to Example: Fade-in effect")

In this example, we are fading in some content by calculating the opacity for a certain point of time.
At frame 0 (the start of the video), we want the opacity to be 0.
At frame 20, we want the opacity to be 1.

Using the following snippet, we can calculate the current opacity for any frame:

```

ts

import { interpolate, useCurrentFrame } from "remotion";

const frame = useCurrentFrame(); // 10
const opacity = interpolate(frame, [0, 20], [0, 1]); // 0.5
```

## Example: Fade in and out [​](https://www.remotion.dev/docs/interpolate\#example-fade-in-and-out "Direct link to Example: Fade in and out")

We keep our fade in effect but add a fade out effect at the end.
20 frames before the video ends, the opacity should still be 1.
At the end, the opacity should be 0.

We can interpolate over multiple points in one go and use [`useVideoConfig()`](https://www.remotion.dev/docs/use-video-config) to determine the duration of the composition.

```

ts

import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";

const frame = useCurrentFrame();
const { durationInFrames } = useVideoConfig();
const opacity = interpolate(
  frame,
  [0, 20, durationInFrames - 20, durationInFrames],
  // v--v---v----------------------v
  [0, 1, 1, 0],
);
```

## Example: interpolate a spring animation [​](https://www.remotion.dev/docs/interpolate\#example-interpolate-a-spring-animation "Direct link to Example: interpolate a spring animation")

We don't necessarily have to interpolate over time - we can use any value to drive an animation.
Let's assume we want to animate an object on the X axis from 0 to 200 pixels and use a spring animation for it.

Let's create a spring:

```

ts

import {useCurrentFrame, interpolate, spring, useVideoConfig} from 'remotion';

const frame = useCurrentFrame();
const {fps} = useVideoConfig();
const driver = spring({
  frame,
  fps
});
```

A [`spring()`](https://www.remotion.dev/docs/spring) animation with it's default settings will animate from 0 to 1.
Given that knowledge, we can interpolate the spring value to go from 0 to 200.

```

ts

const marginLeft = interpolate(driver, [0, 1], [0, 200]);
```

We can then apply it to an HTML element.

```

tsx

const Component: React.FC = () => <div style={{ marginLeft }}></div>;
```

## Example: Prevent the output from going outside the output range [​](https://www.remotion.dev/docs/interpolate\#example-prevent-the-output-from-going-outside-the-output-range "Direct link to Example: Prevent the output from going outside the output range")

Consider the following interpolation which is supposed to animate the scale over 20 frames:

```

tsx

const scale = interpolate(frame, [0, 20], [0, 1]);
```

This works, but after 20 frames, the value keeps growing. For example, at frame 40, the scale will be `2`.
To prevent this, this we can use the `extrapolateLeft` and `extrapolateRight` options and set them to `'clamp'` to prevent the result going outside the output range.

```

tsx

const scale = interpolate(frame, [0, 20], [0, 1], {
  extrapolateRight: "clamp",
});
```

## Reference [​](https://www.remotion.dev/docs/interpolate\#reference "Direct link to Reference")

### Params [​](https://www.remotion.dev/docs/interpolate\#params "Direct link to Params")

1. The input value.
2. The range of values that you expect the input to assume.
3. The range of output values that you want the input to map to.
4. Options object.

### Options [​](https://www.remotion.dev/docs/interpolate\#options "Direct link to Options")

#### extrapolateLeft [​](https://www.remotion.dev/docs/interpolate\#extrapolateleft "Direct link to extrapolateLeft")

_Default_: `extend`

What should happen if the input value is outside the left side of the input range:

- `extend`: Interpolate nonetheless, even if outside output range.
- `clamp`: Return the closest value inside the range instead
- `wrap`: Loops the value change.
- `identity`: Return the input value instead.

#### extrapolateRight [​](https://www.remotion.dev/docs/interpolate\#extrapolateright "Direct link to extrapolateRight")

_Default_: `extend`

Same as [extrapolateLeft](https://www.remotion.dev/docs/interpolate#extrapolateleft), except for values outside right the input range.

Example:

```

tsx

interpolate(1.5, [0, 1], [0, 2], { extrapolateRight: "extend" }); // 3
interpolate(1.5, [0, 1], [0, 2], { extrapolateRight: "clamp" }); // 2
interpolate(1.5, [0, 1], [0, 2], { extrapolateRight: "identity" }); // 1.5
interpolate(1.5, [0, 1], [0, 2], { extrapolateRight: "wrap" }); // 1
```

#### easing [​](https://www.remotion.dev/docs/interpolate\#easing "Direct link to easing")

_Default_: `(x) => x`

Function which allows you to customize the input, for example to apply a certain easing function.
By default, the input is left unmodified, resulting in a pure linear interpolation. [Read the documentation for the built-in easing functions](https://www.remotion.dev/docs/easing).

```

ts

import { interpolate, Easing } from "remotion";

interpolate(frame, [0, 100], [0, 1], {
  easing: Easing.bezier(0.8, 0.22, 0.96, 0.65),
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});

//this is Remotion2.0 feature
interpolate(frame, [0, 10, 40, 100], [0, 0.2, 0.6, 1], {
  easing: Easing.bezier(0.8, 0.22, 0.96, 0.65),
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});
```

## Types [​](https://www.remotion.dev/docs/interpolate\#types "Direct link to Types")

Since `v3.3.77`, types for the options are exported from Remotion.

```

tsx

import { ExtrapolateType, InterpolateOptions } from "remotion";

const extrapolate: ExtrapolateType = "clamp";
const option: InterpolateOptions = { extrapolateLeft: extrapolate };
```

## See also [​](https://www.remotion.dev/docs/interpolate\#see-also "Direct link to See also")

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/core/src/interpolate.ts)
- [Easing](https://www.remotion.dev/docs/easing)
- [spring()](https://www.remotion.dev/docs/spring)
- [interpolateColors()](https://www.remotion.dev/docs/interpolate-colors)

- [Example: Fade-in effect](https://www.remotion.dev/docs/interpolate#example-fade-in-effect)
- [Example: Fade in and out](https://www.remotion.dev/docs/interpolate#example-fade-in-and-out)
- [Example: interpolate a spring animation](https://www.remotion.dev/docs/interpolate#example-interpolate-a-spring-animation)
- [Example: Prevent the output from going outside the output range](https://www.remotion.dev/docs/interpolate#example-prevent-the-output-from-going-outside-the-output-range)
- [Reference](https://www.remotion.dev/docs/interpolate#reference)
  - [Params](https://www.remotion.dev/docs/interpolate#params)
  - [Options](https://www.remotion.dev/docs/interpolate#options)
- [Types](https://www.remotion.dev/docs/interpolate#types)
- [See also](https://www.remotion.dev/docs/interpolate#see-also)

Remotion

![Logo](https://raw.githubusercontent.com/remotion-dev/brand/refs/heads/main/logo.svg)

Remotion

You may ask your questions about the Remotion documentation and the bot answers it based on the documentation. Go through the sources for better answers appropriately.

QUICK QUESTIONS

How to install it?

How to setup Remotion Lambda?

Why is my composition flickering?

Powered by [CrawlChat](https://crawlchat.app/?ref=powered-by-remotion)

Ask AI