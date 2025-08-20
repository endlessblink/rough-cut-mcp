---
url: "https://www.remotion.dev/docs/animation-utils/make-transform"
title: "makeTransform() | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/animation-utils/make-transform#__docusaurus_skipToContent_fallback)

On this page

_Part of the [`@remotion/animation-utils`](https://www.remotion.dev/docs/animation-utils) package._

Applies a sequence of transformation functions to generate a combined CSS `transform` property.

## API [​](https://www.remotion.dev/docs/animation-utils/make-transform\#api "Direct link to API")

Takes an array of strings (generated from the below transformation functions) and combines them into a single string.

## Usage [​](https://www.remotion.dev/docs/animation-utils/make-transform\#usage "Direct link to Usage")

```

tsx

import { makeTransform, rotate, translate } from "@remotion/animation-utils";

const transform = makeTransform([rotate(45), translate(50, 50)]);
// => "rotate(45deg) translate(50px, 50px)"

const markup = <div style={{ transform }} />;
```

```

tsx

import { rotate } from "@remotion/animation-utils";

const transform = rotate(45);
// => "rotate(45deg)"

const markup = <div style={{ transform }} />;
```

## Transformation Functions [​](https://www.remotion.dev/docs/animation-utils/make-transform\#transformation-functions "Direct link to Transformation Functions")

### matrix() [​](https://www.remotion.dev/docs/animation-utils/make-transform\#matrix "Direct link to matrix()")

```

tsx

import { matrix } from "@remotion/animation-utils";

const transform = matrix(1, 0, 0, 1, 50, 50);
// => "matrix(1, 0, 0, 1, 50, 50)"
```

### matrix3d() [​](https://www.remotion.dev/docs/animation-utils/make-transform\#matrix3d "Direct link to matrix3d()")

```

tsx

import { matrix3d } from "@remotion/animation-utils";

const transform = matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 50, 50, 0, 1);
// => "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 50, 50, 0, 1)"
```

### perspective() [​](https://www.remotion.dev/docs/animation-utils/make-transform\#perspective "Direct link to perspective()")

```

tsx

import { perspective } from "@remotion/animation-utils";

const transform = perspective(100);
// => "perspective(100px)"
```

### rotate() [​](https://www.remotion.dev/docs/animation-utils/make-transform\#rotate "Direct link to rotate()")

```

tsx

import { rotate } from "@remotion/animation-utils";

const transform = rotate(45);
// => "rotate(45deg)"
```

### rotate3d() [​](https://www.remotion.dev/docs/animation-utils/make-transform\#rotate3d "Direct link to rotate3d()")

```

tsx

import { rotate3d } from "@remotion/animation-utils";

const transform = rotate3d(1, 0, 0, 45);
// => "rotate3d(1, 0, 0, 45deg)"

const transform2 = rotate3d(1, 0, 0, "45deg");
// => "rotate3d(1, 0, 0, 45deg)"

const transform3 = rotate3d(1, 0, 0, 45, "deg");
// => "rotate3d(1, 0, 0, 45deg)"
```

### rotateX() [​](https://www.remotion.dev/docs/animation-utils/make-transform\#rotatex "Direct link to rotateX()")

```

tsx

import { rotateX } from "@remotion/animation-utils";

const transform = rotateX(45);
// => "rotateX(45deg)"

const transform2 = rotateX("45deg");
// => "rotateX(45deg)"

const transform3 = rotateX(1, "rad");
// => "rotateX(45rad)"
```

### rotateY() [​](https://www.remotion.dev/docs/animation-utils/make-transform\#rotatey "Direct link to rotateY()")

```

tsx

import { rotateY } from "@remotion/animation-utils";

const transform = rotateY(45);
// => "rotateY(45deg)"

const transform2 = rotateY("45deg");
// => "rotateY(45deg)"

const transform3 = rotateY(1, "rad");
// => "rotateY(1rad)"
```

### rotateZ() [​](https://www.remotion.dev/docs/animation-utils/make-transform\#rotatez "Direct link to rotateZ()")

```

tsx

import { rotateZ } from "@remotion/animation-utils";

const transform = rotateZ(45);
// => "rotateZ(45deg)"

const transform2 = rotateZ("45deg");
// => "rotateZ(45deg)"

const transform3 = rotateZ(1, "rad");
// => "rotateZ(1rad)"
```

### scale() [​](https://www.remotion.dev/docs/animation-utils/make-transform\#scale "Direct link to scale()")

```

tsx

import { scale } from "@remotion/animation-utils";

const transform = scale(2);
// => "scale(2, 2)"

const transform2 = scale(2, 3);
// => "scale(2, 3)"
```

### scale3d() [​](https://www.remotion.dev/docs/animation-utils/make-transform\#scale3d "Direct link to scale3d()")

```

tsx

import { scale3d } from "@remotion/animation-utils";

const transform = scale3d(2, 3, 4);
// => "scale3d(2, 3, 4)"
```

### scaleX() [​](https://www.remotion.dev/docs/animation-utils/make-transform\#scalex "Direct link to scaleX()")

```

tsx

import { scaleX } from "@remotion/animation-utils";

const transform = scaleX(2);
// => "scaleX(2)"
```

### scaleY() [​](https://www.remotion.dev/docs/animation-utils/make-transform\#scaley "Direct link to scaleY()")

```

tsx

import { scaleY } from "@remotion/animation-utils";

const transform = scaleY(2);
// => "scaleY(2)"
```

### scaleZ() [​](https://www.remotion.dev/docs/animation-utils/make-transform\#scalez "Direct link to scaleZ()")

```

tsx

import { scaleZ } from "@remotion/animation-utils";

const transform = scaleZ(2);
// => "scaleZ(2)"
```

### skew() [​](https://www.remotion.dev/docs/animation-utils/make-transform\#skew "Direct link to skew()")

```

tsx

import { skew } from "@remotion/animation-utils";

const transform = skew(45);
// => "skew(45deg)"
```

### skewX() [​](https://www.remotion.dev/docs/animation-utils/make-transform\#skewx "Direct link to skewX()")

```

tsx

import { skewX } from "@remotion/animation-utils";

const transform = skewX(45);
// => "skewX(45deg)"

const transform2 = skewX("45deg");
// => "skewX(45deg)"

const transform3 = skewX(1, "rad");
// => "skewX(1rad)"
```

### skewY() [​](https://www.remotion.dev/docs/animation-utils/make-transform\#skewy "Direct link to skewY()")

```

tsx

import { skewY } from "@remotion/animation-utils";

const transform = skewY(45);
// => "skewY(45deg)"

const transform2 = skewY("45deg");
// => "skewY(45deg)"

const transform3 = skewY(1, "rad");
// => "skewY(1rad)"
```

### translate() [​](https://www.remotion.dev/docs/animation-utils/make-transform\#translate "Direct link to translate()")

```

tsx

import { translate } from "@remotion/animation-utils";

const transform = translate(10);
// => "translate(10px)"

const transform2 = translate("12rem");
// => "translate(12rem)"

const transform3 = translate(10, 20);
// => "translate(10px, 20px)"

const transform4 = translate(10, "%");
// => "translate(10%)"

const transform5 = translate(0, "%", 10, "%");
// => "translate(0%, 10%)"

const transform6 = translate("10px", "30%");
// => "translate(10px, 20%)"
```

### translate3d() [​](https://www.remotion.dev/docs/animation-utils/make-transform\#translate3d "Direct link to translate3d()")

```

tsx

import { translate3d } from "@remotion/animation-utils";

const transform = translate3d(10, 20, 30);
// => "translate3d(10px, 20px, 30px)"

const transform2 = translate3d("10px", "20%", "30rem");
// => "translate3d(10px, 20%, 30rem)"

const transform3 = translate3d(10, "%", 20, "px", 30, "px");
// => "translate3d(10%, 20px, 30px)"
```

### translateX() [​](https://www.remotion.dev/docs/animation-utils/make-transform\#translatex "Direct link to translateX()")

```

tsx

import { translateX } from "@remotion/animation-utils";

const transform = translateX(10);
// => "translateX(10px)"

const transform2 = translateX("12rem");
// => "translateX(12rem)"

const transform3 = translateX(10, "%");
// => "translateX(10%)"
```

### translateY() [​](https://www.remotion.dev/docs/animation-utils/make-transform\#translatey "Direct link to translateY()")

```

tsx

import { translateY } from "@remotion/animation-utils";

const transform = translateY(10);
// => "translateY(10px)"

const transform2 = translateY("12rem");
// => "translateY(12rem)"

const transform3 = translateY(10, "px");
// => "translateY(10px)"
```

### translateZ() [​](https://www.remotion.dev/docs/animation-utils/make-transform\#translatez "Direct link to translateZ()")

```

tsx

import { translateZ } from "@remotion/animation-utils";

const transform = translateZ(10);
// => "translateZ(10px)"

const transform2 = translateZ("12rem");
// => "translateZ(12rem)"

const transform3 = translateZ(10, "px");
// => "translateZ(10px)"
```

## See also [​](https://www.remotion.dev/docs/animation-utils/make-transform\#see-also "Direct link to See also")

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/animation-utils/src/transformation-helpers/make-transform/index.ts)
- [`@remotion/animation-utils`](https://www.remotion.dev/docs/animation-utils)

- [API](https://www.remotion.dev/docs/animation-utils/make-transform#api)
- [Usage](https://www.remotion.dev/docs/animation-utils/make-transform#usage)
- [Transformation Functions](https://www.remotion.dev/docs/animation-utils/make-transform#transformation-functions)
  - [matrix()](https://www.remotion.dev/docs/animation-utils/make-transform#matrix)
  - [matrix3d()](https://www.remotion.dev/docs/animation-utils/make-transform#matrix3d)
  - [perspective()](https://www.remotion.dev/docs/animation-utils/make-transform#perspective)
  - [rotate()](https://www.remotion.dev/docs/animation-utils/make-transform#rotate)
  - [rotate3d()](https://www.remotion.dev/docs/animation-utils/make-transform#rotate3d)
  - [rotateX()](https://www.remotion.dev/docs/animation-utils/make-transform#rotatex)
  - [rotateY()](https://www.remotion.dev/docs/animation-utils/make-transform#rotatey)
  - [rotateZ()](https://www.remotion.dev/docs/animation-utils/make-transform#rotatez)
  - [scale()](https://www.remotion.dev/docs/animation-utils/make-transform#scale)
  - [scale3d()](https://www.remotion.dev/docs/animation-utils/make-transform#scale3d)
  - [scaleX()](https://www.remotion.dev/docs/animation-utils/make-transform#scalex)
  - [scaleY()](https://www.remotion.dev/docs/animation-utils/make-transform#scaley)
  - [scaleZ()](https://www.remotion.dev/docs/animation-utils/make-transform#scalez)
  - [skew()](https://www.remotion.dev/docs/animation-utils/make-transform#skew)
  - [skewX()](https://www.remotion.dev/docs/animation-utils/make-transform#skewx)
  - [skewY()](https://www.remotion.dev/docs/animation-utils/make-transform#skewy)
  - [translate()](https://www.remotion.dev/docs/animation-utils/make-transform#translate)
  - [translate3d()](https://www.remotion.dev/docs/animation-utils/make-transform#translate3d)
  - [translateX()](https://www.remotion.dev/docs/animation-utils/make-transform#translatex)
  - [translateY()](https://www.remotion.dev/docs/animation-utils/make-transform#translatey)
  - [translateZ()](https://www.remotion.dev/docs/animation-utils/make-transform#translatez)
- [See also](https://www.remotion.dev/docs/animation-utils/make-transform#see-also)

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