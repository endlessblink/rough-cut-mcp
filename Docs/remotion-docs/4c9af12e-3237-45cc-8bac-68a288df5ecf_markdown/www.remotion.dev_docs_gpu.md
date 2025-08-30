[Skip to main content](https://www.remotion.dev/docs/gpu#__docusaurus_skipToContent_fallback)

On this page

Some types of content in Remotion can benefit from a GPU being available on the machine that is used for rendering.

By default in many cases, the GPU is disabled in headless mode, which can lead to a significant slowdown in rendering time.

## Content accelerated by the GPU [​](https://www.remotion.dev/docs/gpu\#content-accelerated-by-the-gpu "Direct link to Content accelerated by the GPU")

- WebGL content (Three.JS, Skia, P5.js, Mapbox etc.)
- `box-shadow`
- `text-shadow`
- `background-image: linear-gradient()`
- `background-image: radial-gradient()`
- `filter: blur()`
- `filter: drop-shadow()`
- `transform`
- Many 2D Canvas operations

If a GPU is available, it should be enabled by default while in the Remotion Studio or Remotion Player.

However, in headless mode, Chromium disables the GPU, leading to a significant
slowdown in rendering time.

## Content not accelerated by the GPU [​](https://www.remotion.dev/docs/gpu\#content-not-accelerated-by-the-gpu "Direct link to Content not accelerated by the GPU")

Contrary to popular belief, the following content is not accelerated by the GPU:

- `<Video>`
- `<OffthreadVideo>`
- [Canvas pixel manipulation](https://www.remotion.dev/docs/video-manipulation)

Furthermore, the encoding of the video is not accelerated by the GPU at this point.

## Use the `--gl` flag to enable the GPU during rendering [​](https://www.remotion.dev/docs/gpu\#use-the---gl-flag-to-enable-the-gpu-during-rendering "Direct link to use-the---gl-flag-to-enable-the-gpu-during-rendering")

See [here](https://www.remotion.dev/docs/gl-options) for recommendations which OpenGL backend you should use during rendering.

## GPU for server-side rendering [​](https://www.remotion.dev/docs/gpu\#gpu-for-server-side-rendering "Direct link to GPU for server-side rendering")

[See here](https://www.remotion.dev/docs/miscellaneous/cloud-gpu) for an example on how to use the GPU during server-side rendering.

## Using the GPU on Lambda [​](https://www.remotion.dev/docs/gpu\#using-the-gpu-on-lambda "Direct link to Using the GPU on Lambda")

AWS Lambda instances have no GPU, so it is not possible to use it.

## What are your experiences? [​](https://www.remotion.dev/docs/gpu\#what-are-your-experiences "Direct link to What are your experiences?")

We'd love to learn and document more findings about the GPU. Let us know and we will amend this document!

## See also [​](https://www.remotion.dev/docs/gpu\#see-also "Direct link to See also")

- [OpenGL renderer backends](https://www.remotion.dev/docs/gl-options)
- [Hardware accelerated rendering](https://www.remotion.dev/docs/hardware-acceleration)

- [Content accelerated by the GPU](https://www.remotion.dev/docs/gpu#content-accelerated-by-the-gpu)
- [Content not accelerated by the GPU](https://www.remotion.dev/docs/gpu#content-not-accelerated-by-the-gpu)
- [Use the `--gl` flag to enable the GPU during rendering](https://www.remotion.dev/docs/gpu#use-the---gl-flag-to-enable-the-gpu-during-rendering)
- [GPU for server-side rendering](https://www.remotion.dev/docs/gpu#gpu-for-server-side-rendering)
- [Using the GPU on Lambda](https://www.remotion.dev/docs/gpu#using-the-gpu-on-lambda)
- [What are your experiences?](https://www.remotion.dev/docs/gpu#what-are-your-experiences)
- [See also](https://www.remotion.dev/docs/gpu#see-also)

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