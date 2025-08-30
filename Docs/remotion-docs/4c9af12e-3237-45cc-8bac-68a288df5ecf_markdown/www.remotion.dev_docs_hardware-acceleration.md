[Skip to main content](https://www.remotion.dev/docs/hardware-acceleration#__docusaurus_skipToContent_fallback)

On this page

Encoding is the process of converting a sequence of images into a video file.

Besides rendering frames, encoding is one of the two steps required to create a video.

From Remotion v4.0.228, Remotion supports hardware-accelerated encoding in some cases.

Since encoding is platform- and codec-specific, only a few scenarios are supported at the moment.

- Currently, only macOS is supported (Acceleration using VideoToolbox)
- ProRes is supported from v4.0.228, H.264 and H.265 are supported from v4.0.236

## Enable hardware accelerated encoding [​](https://www.remotion.dev/docs/hardware-acceleration\#enable-hardware-accelerated-encoding "Direct link to Enable hardware accelerated encoding")

By default, hardware acceleration is `"disabled"`.

You can set the `hardwareAcceleration` option to `"if-possible"` to enable hardware acceleration if it is available.

If you want the render to fail if hardware acceleration is not possible, set the option to `"required"`.

### In SSR APIs [​](https://www.remotion.dev/docs/hardware-acceleration\#in-ssr-apis "Direct link to In SSR APIs")

Use the [`hardwareAcceleration`](https://www.remotion.dev/docs/renderer/render-media#hardwareacceleration) option in the [`renderMedia()`](https://www.remotion.dev/docs/renderer/render-media) function.

```

tsx

await renderMedia({
  composition,
  serveUrl,
  codec: 'prores',
  outputLocation,
  inputProps,
  hardwareAcceleration: 'if-possible',
});
```

### In the CLI [​](https://www.remotion.dev/docs/hardware-acceleration\#in-the-cli "Direct link to In the CLI")

Use the [`--hardware-acceleration`](https://www.remotion.dev/docs/cli/render#--hardware-acceleration) option in the `npx remotion studio` command.

```

bash

npx remotion render MyComp --codec prores --hardware-acceleration if-possible
```

### In the Studio [​](https://www.remotion.dev/docs/hardware-acceleration\#in-the-studio "Direct link to In the Studio")

In the [Remotion Studio](https://www.remotion.dev/docs/studio), you can set the hardware acceleration option in the "Advanced" tab when rendering a video.

### With the config file [​](https://www.remotion.dev/docs/hardware-acceleration\#with-the-config-file "Direct link to With the config file")

You can set the [`setHardwareAcceleration()`](https://www.remotion.dev/docs/config#sethardwareacceleration) option in the [config file](https://www.remotion.dev/docs/config).

```

ts

import {Config} from '@remotion/cli/config';

Config.setHardwareAcceleration('if-possible');
```

### In Remotion Lambda and Cloud Run [​](https://www.remotion.dev/docs/hardware-acceleration\#in-remotion-lambda-and-cloud-run "Direct link to In Remotion Lambda and Cloud Run")

These options are not supported in Remotion Lambda and Cloud Run, because those cloud services do not support hardware acceleration.

## File size [​](https://www.remotion.dev/docs/hardware-acceleration\#file-size "Direct link to File size")

Note that the file size is significantly larger by default when using hardware acceleration, likely because less compression is applied.

We recommend that you use the `--video-bitrate` flag to control the file size.

We find that `--video-bitrate=8M` achieves a similar file size than software encoding when exporting a H.264 Full HD video.

## Tell if hardware acceleration is being used [​](https://www.remotion.dev/docs/hardware-acceleration\#tell-if-hardware-acceleration-is-being-used "Direct link to Tell if hardware acceleration is being used")

[Run the render with verbose logging.](https://www.remotion.dev/docs/troubleshooting/debug-failed-render)
If the render is using hardware acceleration, you will see a log message like this:

```

Encoder: prores_videotoolbox, hardware accelerated: true
```

Don't rely on the exact wording of the log message to determine if hardware acceleration is being used.

## See also [​](https://www.remotion.dev/docs/hardware-acceleration\#see-also "Direct link to See also")

- [Encoding guide](https://www.remotion.dev/docs/encoding)
- [Using the GPU](https://www.remotion.dev/docs/gpu)

- [Enable hardware accelerated encoding](https://www.remotion.dev/docs/hardware-acceleration#enable-hardware-accelerated-encoding)
  - [In SSR APIs](https://www.remotion.dev/docs/hardware-acceleration#in-ssr-apis)
  - [In the CLI](https://www.remotion.dev/docs/hardware-acceleration#in-the-cli)
  - [In the Studio](https://www.remotion.dev/docs/hardware-acceleration#in-the-studio)
  - [With the config file](https://www.remotion.dev/docs/hardware-acceleration#with-the-config-file)
  - [In Remotion Lambda and Cloud Run](https://www.remotion.dev/docs/hardware-acceleration#in-remotion-lambda-and-cloud-run)
- [File size](https://www.remotion.dev/docs/hardware-acceleration#file-size)
- [Tell if hardware acceleration is being used](https://www.remotion.dev/docs/hardware-acceleration#tell-if-hardware-acceleration-is-being-used)
- [See also](https://www.remotion.dev/docs/hardware-acceleration#see-also)

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