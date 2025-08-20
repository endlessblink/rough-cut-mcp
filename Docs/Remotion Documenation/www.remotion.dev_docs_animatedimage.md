---
url: "https://www.remotion.dev/docs/animatedimage"
title: "<AnimatedImage> | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/animatedimage#__docusaurus_skipToContent_fallback)

On this page

Renders an animated GIF, PNG, AVIF or WebP image and syncs it with Remotion's timeline.

Relies on the [`ImageDecoder`](https://developer.mozilla.org/en-US/docs/Web/API/ImageDecoder) Web API, meaning it only works in Google Chrome and Firefox as of writing.

```

Loading a remote animated image
tsx

import {AnimatedImage} from 'remotion';

export const WebpAnimatedImage = () => {
  return <AnimatedImage src="https://mathiasbynens.be/demo/animated-webp-supported.webp" />;
};
```

```

Loading a local animated image
tsx

import {AnimatedImage, staticFile} from 'remotion';

export const GifAnimatedImage = () => {
  return <AnimatedImage src={staticFile('giphy.gif')} />;
};
```

## Props [​](https://www.remotion.dev/docs/animatedimage\#props "Direct link to Props")

### `src` [​](https://www.remotion.dev/docs/animatedimage\#src "Direct link to src")

The URL of the animated image. Can be a remote URL or a local file path.

note

Remote images need to support [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).

More info

- Remotion's origin is usually `http://localhost:3000`, but it may be different if rendering on Lambda or the port is busy.

- You can [disable CORS](https://www.remotion.dev/docs/chromium-flags#--disable-web-security) during renders.


### `width?` [​](https://www.remotion.dev/docs/animatedimage\#width "Direct link to width")

The display width.

### `height?` [​](https://www.remotion.dev/docs/animatedimage\#height "Direct link to height")

The display height.

### `fit?` [​](https://www.remotion.dev/docs/animatedimage\#fit "Direct link to fit")

Must be one of these values:

- `'fill'`: The image will completely fill the container, and will be stretched if necessary. ( _default_)
- `'contain'`: The image is scaled to fit the box, while aspect ratio is maintained.
- `'cover'`: The image completely fills the container and maintains it's aspect ratio. It will be cropped if necessary.

### `style?` [​](https://www.remotion.dev/docs/animatedimage\#style "Direct link to style")

Allows to pass in custom CSS styles. You may not pass `width` and `height`, instead use the props `width` and `height` to set the size of the image.

### `loopBehavior?` [​](https://www.remotion.dev/docs/animatedimage\#loopbehavior "Direct link to loopbehavior")

The looping behavior of the animated image. Can be one of these values:

- `'loop'`: The animated image will loop infinitely. ( _default_)
- `'pause-after-finish'`: The animated image will play once and then show the last frame.
- `'clear-after-finish'`: The animated image will play once and then clear the canvas.

### `ref?` [v3.3.88](https://github.com/remotion-dev/remotion/releases/v3.3.88) [​](https://www.remotion.dev/docs/animatedimage\#ref "Direct link to ref")

You can add a [React ref](https://react.dev/learn/manipulating-the-dom-with-refs) to `<AnimatedImage />`. If you use TypeScript, you need to type it with `HTMLCanvasElement`.

## Differences to `<Gif>` [​](https://www.remotion.dev/docs/animatedimage\#differences-to-gif "Direct link to differences-to-gif")

- `<AnimatedImage>` also supports AVIF, APNG and WebP images.
- `<AnimatedImage>` uses the [`ImageDecoder`](https://developer.mozilla.org/en-US/docs/Web/API/ImageDecoder) Web API, which has limited browser support.
- `<AnimatedImage>` does not support the `onLoad` prop.

## See also [​](https://www.remotion.dev/docs/animatedimage\#see-also "Direct link to See also")

- [Source code for this component](https://github.com/remotion-dev/remotion/blob/main/packages/core/src/animated-image/AnimatedImage.tsx)
- [`<Gif>`](https://www.remotion.dev/docs/gif)

- [Props](https://www.remotion.dev/docs/animatedimage#props)
  - [`src`](https://www.remotion.dev/docs/animatedimage#src)
  - [`width?`](https://www.remotion.dev/docs/animatedimage#width)
  - [`height?`](https://www.remotion.dev/docs/animatedimage#height)
  - [`fit?`](https://www.remotion.dev/docs/animatedimage#fit)
  - [`style?`](https://www.remotion.dev/docs/animatedimage#style)
  - [`loopBehavior?`](https://www.remotion.dev/docs/animatedimage#loopbehavior)
  - [`ref?`](https://www.remotion.dev/docs/animatedimage#ref)
- [Differences to `<Gif>`](https://www.remotion.dev/docs/animatedimage#differences-to-gif)
- [See also](https://www.remotion.dev/docs/animatedimage#see-also)

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