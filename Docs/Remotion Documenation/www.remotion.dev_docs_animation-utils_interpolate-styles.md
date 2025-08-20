---
url: "https://www.remotion.dev/docs/animation-utils/interpolate-styles"
title: "interpolateStyles() | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/animation-utils/interpolate-styles#__docusaurus_skipToContent_fallback)

On this page

_Part of the [`@remotion/animation-utils`](https://www.remotion.dev/docs/animation-utils) package._

This function provides a convenient way to interpolate styles based on a specified range of values, allowing for smooth animations between different styles.

## Example [​](https://www.remotion.dev/docs/animation-utils/interpolate-styles\#example "Direct link to Example")

```

tsx

import {
  interpolateStyles,
  makeTransform,
  translateY,
} from "@remotion/animation-utils";

const MyComponent: React.FC = () => {
  const animatedStyles = interpolateStyles(
    15,
    [0, 30, 60],
    [\
      { opacity: 0, transform: makeTransform([translateY(-50)]) },\
      { opacity: 1, transform: makeTransform([translateY(0)]) },\
      { opacity: 0, transform: makeTransform([translateY(50)]) },\
    ],
  );

  return <div style={animatedStyles} />;
};
```

## API [​](https://www.remotion.dev/docs/animation-utils/interpolate-styles\#api "Direct link to API")

A function that takes 3-4 arguments:

1. The input value.
2. The range of values that you expect the input to assume.
3. The range of output styles that you want the input to map to.
4. Options object, same as the options of [`interpolate()`](https://www.remotion.dev/docs/interpolate#options) ( _optional_)

## Return value [​](https://www.remotion.dev/docs/animation-utils/interpolate-styles\#return-value "Direct link to Return value")

- A style object representing the interpolated styles based on the current frame.

## Usage Notes [​](https://www.remotion.dev/docs/animation-utils/interpolate-styles\#usage-notes "Direct link to Usage Notes")

- Ensure that the `inputRange` and `outputStylesRange` arrays contain at least two values to facilitate interpolation between styles.

- The `outputStylesRange` array must have the same number of elements as `inputRange`. Each style in `outputStylesRange` corresponds to a specific value in the input range.


## See also [​](https://www.remotion.dev/docs/animation-utils/interpolate-styles\#see-also "Direct link to See also")

- [Source code for this hook](https://github.com/remotion-dev/remotion/blob/main/packages/animation-utils/src/transformation-helpers/interpolate-styles/index.tsx)
- [`@remotion/animation-utils`](https://www.remotion.dev/docs/animation-utils)

- [Example](https://www.remotion.dev/docs/animation-utils/interpolate-styles#example)
- [API](https://www.remotion.dev/docs/animation-utils/interpolate-styles#api)
- [Return value](https://www.remotion.dev/docs/animation-utils/interpolate-styles#return-value)
- [Usage Notes](https://www.remotion.dev/docs/animation-utils/interpolate-styles#usage-notes)
- [See also](https://www.remotion.dev/docs/animation-utils/interpolate-styles#see-also)

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