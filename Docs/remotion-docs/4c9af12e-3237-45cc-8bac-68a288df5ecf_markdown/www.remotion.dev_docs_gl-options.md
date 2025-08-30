[Skip to main content](https://www.remotion.dev/docs/gl-options#__docusaurus_skipToContent_fallback)

On this page

When rendering a video in Remotion, different [GL](https://en.wikipedia.org/wiki/OpenGL) renderer backends can be selected.

The following renderer backends are supported in Remotion:

- `null` \- default, lets Chrome decide
- `angle`
- `egl`
- `swiftshader`
- `vulkan` (from Remotion v4.0.41)
- `angle-egl` (from Remotion v4.0.52)
- `swangle` \- default on Lambda

## Recommended renderers [​](https://www.remotion.dev/docs/gl-options\#recommended-renderers "Direct link to Recommended renderers")

[1](https://www.remotion.dev/docs/gl-options#1)

If you use WebGL/Three.js:

- On a desktop, `angle` is recommended
- On a [cloud instance with a GPU](https://www.remotion.dev/docs/miscellaneous/cloud-gpu), `angle-egl` is recommended
- On Lambda, use `swangle` (default on Lambda)
- On a machine with no GPU, `swangle` is recommended. Rendering might be slow.

[2](https://www.remotion.dev/docs/gl-options#2)

If you don't use WebGL/Three.js, the default renderer ( `null` on local, `swangle` on Lambda) are the best choice.

## Using the GPU [​](https://www.remotion.dev/docs/gl-options\#using-the-gpu "Direct link to Using the GPU")

In cases where a GPU could be beneficial for rendering, it can often make sense to use the `angle` renderer ( `angle-egl` on Linux). An in-depth explanation when and how to use it is given in [this article](https://www.remotion.dev/docs/gpu).

⚠️ Memory leaks are a known problem with `angle`. We recommend to split up long renders into multiple parts when rendering large videos, since sometimes renders can fail due to memory leaks.

Currently, GitHub Actions will fail when using `angle`, since Actions runners don't have a GPU.

## Selecting the renderer backend [​](https://www.remotion.dev/docs/gl-options\#selecting-the-renderer-backend "Direct link to Selecting the renderer backend")

The renderer backend can be set in different ways:

### Via Node.JS APIs [​](https://www.remotion.dev/docs/gl-options\#via-nodejs-apis "Direct link to Via Node.JS APIs")

In [`getCompositions()`](https://www.remotion.dev/docs/renderer/get-compositions#chromiumoptions), [`renderStill()`](https://www.remotion.dev/docs/renderer/render-still#gl), [`renderMedia()`](https://www.remotion.dev/docs/renderer/render-media#gl), [`renderFrames()`](https://www.remotion.dev/docs/renderer/render-frames#gl), [`getCompositionsOnLambda()`](https://www.remotion.dev/docs/lambda/getcompositionsonlambda#gl), [`renderStillOnLambda()`](https://www.remotion.dev/docs/lambda/renderstillonlambda#gl) and [`renderMediaOnLambda()`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#gl), you can pass [`chromiumOptions.gl`](https://www.remotion.dev/docs/renderer/render-still#gl).

### Via Config file [​](https://www.remotion.dev/docs/gl-options\#via-config-file "Direct link to Via Config file")

```

tsx

Config.setChromiumOpenGlRenderer("angle");
```

note

The config file only applies to CLI commands.

note

Prior to `v3.3.39`, the option was called `Config.Puppeteer.setChromiumOpenGlRenderer()`.

### Via CLI flag [​](https://www.remotion.dev/docs/gl-options\#via-cli-flag "Direct link to Via CLI flag")

Pass [`--gl=[angle,swangle,...]`](https://www.remotion.dev/docs/cli) in one of the following commands: [`remotion render`](https://www.remotion.dev/docs/cli/render), [`remotion compositions`](https://www.remotion.dev/docs/cli/compositions), [`remotion still`](https://www.remotion.dev/docs/cli/still), [`remotion lambda render`](https://www.remotion.dev/docs/lambda/cli/render), [`remotion lambda still`](https://www.remotion.dev/docs/lambda/cli/still), [`remotion lambda compositions`](https://www.remotion.dev/docs/lambda/cli/compositions).

## See also [​](https://www.remotion.dev/docs/gl-options\#see-also "Direct link to See also")

- [Using the GPU](https://www.remotion.dev/docs/gpu)

- [Recommended renderers](https://www.remotion.dev/docs/gl-options#recommended-renderers)
- [Using the GPU](https://www.remotion.dev/docs/gl-options#using-the-gpu)
- [Selecting the renderer backend](https://www.remotion.dev/docs/gl-options#selecting-the-renderer-backend)
  - [Via Node.JS APIs](https://www.remotion.dev/docs/gl-options#via-nodejs-apis)
  - [Via Config file](https://www.remotion.dev/docs/gl-options#via-config-file)
  - [Via CLI flag](https://www.remotion.dev/docs/gl-options#via-cli-flag)
- [See also](https://www.remotion.dev/docs/gl-options#see-also)

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