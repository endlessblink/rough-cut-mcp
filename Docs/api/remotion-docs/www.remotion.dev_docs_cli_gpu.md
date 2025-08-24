---
url: "https://www.remotion.dev/docs/cli/gpu"
title: "npx remotion gpu | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/cli/gpu#__docusaurus_skipToContent_fallback)

On this page

_Available from Remotion v4.0.52_

Prints out how the Chrome browser uses the GPUs.

```

bash

npx remotion gpu --gl=angle
```

The command takes the same arguments for `--gl` as `npx remotion render` and also picks up the [`Config.setChromiumOpenGlRenderer()`](https://www.remotion.dev/docs/config#setchromiumopenglrenderer) option.

Try out different values to find which one is the best for your system.

```

Example output
bash

Canvas: Hardware accelerated
Canvas out-of-process rasterization: Enabled
Direct Rendering Display Compositor: Disabled
Compositing: Hardware accelerated
Multiple Raster Threads: Enabled
OpenGL: Enabled
Rasterization: Hardware accelerated
Raw Draw: Disabled
Skia Graphite: Disabled
Video Decode: Hardware accelerated
Video Encode: Hardware accelerated
WebGL: Hardware accelerated
WebGL2: Hardware accelerated
WebGPU: Hardware accelerated
```

The output should not be used for automated parsing, as it may change inbetween any Remotion and Chrome versions.

## API [​](https://www.remotion.dev/docs/cli/gpu\#api "Direct link to API")

### `--log` [​](https://www.remotion.dev/docs/cli/gpu\#--log "Direct link to --log")

One of `trace`, `verbose`, `info`, `warn`, `error`.

Determines how much info is being logged to the console.

Default `info`.

### `--gl` [​](https://www.remotion.dev/docs/cli/gpu\#--gl "Direct link to --gl")

Changelog

- From Remotion v2.6.7 until v3.0.7, the default for Remotion Lambda was `swiftshader`, but from v3.0.8 the default is `swangle` (Swiftshader on Angle) since Chrome 101 added support for it.
- From Remotion v2.4.3 until v2.6.6, the default was `angle`, however it turns out to have a small memory leak that could crash long Remotion renders.

Select the OpenGL renderer backend for Chromium.

Accepted values:

- `"angle"`
- `"egl"`
- `"swiftshader"`
- `"swangle"`
- `"vulkan"` ( _from Remotion v4.0.41_)
- `"angle-egl"` ( _from Remotion v4.0.51_)

The default is `null`, letting Chrome decide, except on Lambda where the default is `"swangle"`

### `--chrome-mode` [v4.0.248](https://github.com/remotion-dev/remotion/releases/v4.0.248) [​](https://www.remotion.dev/docs/cli/gpu\#--chrome-mode "Direct link to --chrome-mode")

One of `headless-shell, ` `chrome-for-testing`. Default `headless-shell`. [Use `chrome-for-testing` to take advantage of GPU drivers on Linux.](https://remotion.dev/docs/miscellaneous/chrome-headless-shell)

## See also [​](https://www.remotion.dev/docs/cli/gpu\#see-also "Direct link to See also")

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/cli/src/gpu.ts)
- [Using the GPU](https://www.remotion.dev/docs/gpu)

- [API](https://www.remotion.dev/docs/cli/gpu#api)
  - [`--log`](https://www.remotion.dev/docs/cli/gpu#--log)
  - [`--gl`](https://www.remotion.dev/docs/cli/gpu#--gl)
  - [`--chrome-mode`](https://www.remotion.dev/docs/cli/gpu#--chrome-mode)
- [See also](https://www.remotion.dev/docs/cli/gpu#see-also)

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