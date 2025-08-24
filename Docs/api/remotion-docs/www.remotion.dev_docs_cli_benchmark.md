---
url: "https://www.remotion.dev/docs/cli/benchmark"
title: "npx remotion benchmark | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/cli/benchmark#__docusaurus_skipToContent_fallback)

On this page

_available from v3.2.28_

Measures render time by running a render multiple times, if desired with multiple compositions and concurrency values to compare against each other.

```

bash

npx remotion benchmark src/index.ts [composition-ids]
```

You can provide multiple composition IDs separated by comma, ex: `npx remotion benchmark src/index.ts --codec=h264 Main,Canvas,CSS`

If `composition-ids` is not passed, Remotion will let you select compositions from a list.

## Flags [​](https://www.remotion.dev/docs/cli/benchmark\#flags "Direct link to Flags")

### `--runs` [​](https://www.remotion.dev/docs/cli/benchmark\#--runs "Direct link to --runs")

_optional. Default is 3_

Specify how many times video must be rendered. Default value is 3.

### `--concurrencies` [​](https://www.remotion.dev/docs/cli/benchmark\#--concurrencies "Direct link to --concurrencies")

_optional_

You can specify which concurrency value should be used while rendering the video. Multiple concurrency values can be passed separated by comma. Learn more about [concurrency](https://www.remotion.dev/docs/terminology/concurrency)

### `--codec` [​](https://www.remotion.dev/docs/cli/benchmark\#--codec "Direct link to --codec")

_optional_

Inherited from [`npx remotion render`](https://www.remotion.dev/docs/cli/render#--codec)

### `--audio-codec` [v3.3.42](https://github.com/remotion-dev/remotion/releases/v3.3.42) [​](https://www.remotion.dev/docs/cli/benchmark\#--audio-codec "Direct link to --audio-codec")

_optional_

Set the format of the audio that is embedded in the video. Not all codec and audio codec combinations are supported and certain combinations require a certain file extension and container format. See the table in the docs to see possible combinations.

### `--crf` [​](https://www.remotion.dev/docs/cli/benchmark\#--crf "Direct link to --crf")

_optional_

Inherited from [`npx remotion render`](https://www.remotion.dev/docs/cli/render#--crf)

### `--frames` [​](https://www.remotion.dev/docs/cli/benchmark\#--frames "Direct link to --frames")

_optional_

Inherited from [`npx remotion render`](https://www.remotion.dev/docs/cli/render#--frames)

### `--image-format` [​](https://www.remotion.dev/docs/cli/benchmark\#--image-format "Direct link to --image-format")

_optional_

Inherited from [`npx remotion render`](https://www.remotion.dev/docs/cli/render#--image-format)

### `--pixel-format` [​](https://www.remotion.dev/docs/cli/benchmark\#--pixel-format "Direct link to --pixel-format")

_optional_

Inherited from [`npx remotion render`](https://www.remotion.dev/docs/cli/render#--pixel-format)

### `--props` [​](https://www.remotion.dev/docs/cli/benchmark\#--props "Direct link to --props")

_optional_

Inherited from [`npx remotion render`](https://www.remotion.dev/docs/cli/render#--props)

### `--prores-profile` [​](https://www.remotion.dev/docs/cli/benchmark\#--prores-profile "Direct link to --prores-profile")

_optional_

Inherited from [`npx remotion render`](https://www.remotion.dev/docs/cli/render#--prores-profile)

### `--jpeg-quality` [​](https://www.remotion.dev/docs/cli/benchmark\#--jpeg-quality "Direct link to --jpeg-quality")

_optional, available from v4.0.0_

Inherited from [`npx remotion render`](https://www.remotion.dev/docs/cli/render#--jpeg-quality)

### ~~`--quality`~~ [​](https://www.remotion.dev/docs/cli/benchmark\#--quality "Direct link to --quality")

_optional, removed in v4.0.0_

Renamed to `--jpeg-quality`.

### `--log` [​](https://www.remotion.dev/docs/cli/benchmark\#--log "Direct link to --log")

_optional_

Inherited from [`npx remotion render`](https://www.remotion.dev/docs/cli/render#--log)

### `--ignore-certificate-errors` [​](https://www.remotion.dev/docs/cli/benchmark\#--ignore-certificate-errors "Direct link to --ignore-certificate-errors")

_optional_

Inherited from [`npx remotion render`](https://www.remotion.dev/docs/cli/render#--ignore-certificate-errors)

### `--disable-web-security` [​](https://www.remotion.dev/docs/cli/benchmark\#--disable-web-security "Direct link to --disable-web-security")

_optional_

Inherited from [`npx remotion render`](https://www.remotion.dev/docs/cli/render#--disable-web-security)

### ~~`--disable-headless?`~~ [​](https://www.remotion.dev/docs/cli/benchmark\#--disable-headless "Direct link to --disable-headless")

_optional_

Deprecated - will be removed in 5.0.0. With the migration to [Chrome Headless Shell](https://www.remotion.dev/docs/miscellaneous/chrome-headless-shell), this option is not functional anymore.

If disabled, the render will open an actual Chrome window where you can see the render happen. The default is headless mode.

### `--enable-multiprocess-on-linux` [v4.0.42](https://github.com/remotion-dev/remotion/releases/v4.0.42) [​](https://www.remotion.dev/docs/cli/benchmark\#--enable-multiprocess-on-linux "Direct link to --enable-multiprocess-on-linux")

Removes the `--single-process` flag that gets passed to Chromium on Linux by default. This will make the render faster because multiple processes can be used, but may cause issues with some Linux distributions or if window server libraries are missing.

Default: `false` until v4.0.136, then `true` from v4.0.137 on because newer Chrome versions don't allow rendering with the `--single-process` flag.

This flag will be removed in Remotion v5.0.

### `--gl` [​](https://www.remotion.dev/docs/cli/benchmark\#--gl "Direct link to --gl")

_optional_

Inherited from [`npx remotion render`](https://www.remotion.dev/docs/cli/render#--gl)

### `--chrome-mode` [v4.0.248](https://github.com/remotion-dev/remotion/releases/v4.0.248) [​](https://www.remotion.dev/docs/cli/benchmark\#--chrome-mode "Direct link to --chrome-mode")

One of `headless-shell, ` `chrome-for-testing`. Default `headless-shell`. [Use `chrome-for-testing` to take advantage of GPU drivers on Linux.](https://remotion.dev/docs/miscellaneous/chrome-headless-shell)

### `--timeout` [​](https://www.remotion.dev/docs/cli/benchmark\#--timeout "Direct link to --timeout")

_optional_

Inherited from [`npx remotion render`](https://www.remotion.dev/docs/cli/render#--timeout)

### `--scale` [​](https://www.remotion.dev/docs/cli/benchmark\#--scale "Direct link to --scale")

_optional_

Inherited from [`npx remotion render`](https://www.remotion.dev/docs/cli/render#--scale)

### `--port` [​](https://www.remotion.dev/docs/cli/benchmark\#--port "Direct link to --port")

_optional_

Inherited from [`npx remotion render`](https://www.remotion.dev/docs/cli/render#--port)

### `--number-of-gif-loops` [​](https://www.remotion.dev/docs/cli/benchmark\#--number-of-gif-loops "Direct link to --number-of-gif-loops")

_optional_

Allows you to set the number of loops as follows:

- `null` (or omitting in the CLI) plays the GIF indefinitely.
- `0` disables looping
- `1` loops the GIF once (plays twice in total)
- `2` loops the GIF twice (plays three times in total) and so on.

### `--every-nth-frame` [​](https://www.remotion.dev/docs/cli/benchmark\#--every-nth-frame "Direct link to --every-nth-frame")

_optional_

Inherited from [`npx remotion render`](https://www.remotion.dev/docs/cli/render#--every-nth-frame)

### `--log` [​](https://www.remotion.dev/docs/cli/benchmark\#--log-1 "Direct link to --log-1")

_optional_

Inherited from [`npx remotion render`](https://www.remotion.dev/docs/cli/render#--log)

### `--muted` [​](https://www.remotion.dev/docs/cli/benchmark\#--muted "Direct link to --muted")

_optional_

Inherited from [`npx remotion render`](https://www.remotion.dev/docs/cli/render#--muted)

### `--enforce-audio-track` [​](https://www.remotion.dev/docs/cli/benchmark\#--enforce-audio-track "Direct link to --enforce-audio-track")

_optional_

Inherited from [`npx remotion render`](https://www.remotion.dev/docs/cli/render#--enforce-audio-track)

### `--disallow-parallel-encoding` [v4.0.315](https://github.com/remotion-dev/remotion/releases/v4.0.315) [​](https://www.remotion.dev/docs/cli/benchmark\#--disallow-parallel-encoding "Direct link to --disallow-parallel-encoding")

_optional_

Inherited from [`npx remotion render`](https://www.remotion.dev/docs/cli/render#--disallow-parallel-encoding)

### `--browser-executable` [​](https://www.remotion.dev/docs/cli/benchmark\#--browser-executable "Direct link to --browser-executable")

_optional_

Inherited from [`npx remotion render`](https://www.remotion.dev/docs/cli/render#--browser-executable)

### `--public-dir` [​](https://www.remotion.dev/docs/cli/benchmark\#--public-dir "Direct link to --public-dir")

_optional_

Inherited from [`npx remotion render`](https://www.remotion.dev/docs/cli/render#--public-dir)

### `--config` [​](https://www.remotion.dev/docs/cli/benchmark\#--config "Direct link to --config")

_optional_

Inherited from [`npx remotion render`](https://www.remotion.dev/docs/cli/render#--config)

### `--bundle-cache` [​](https://www.remotion.dev/docs/cli/benchmark\#--bundle-cache "Direct link to --bundle-cache")

_optional_

Inherited from [`npx remotion render`](https://www.remotion.dev/docs/cli/render#--bundle-cache)

### `--video-bitrate` [​](https://www.remotion.dev/docs/cli/benchmark\#--video-bitrate "Direct link to --video-bitrate")

_optional_

Inherited from [`npx remotion render`](https://www.remotion.dev/docs/cli/render#--video-bitrate)

### `--audio-bitrate` [​](https://www.remotion.dev/docs/cli/benchmark\#--audio-bitrate "Direct link to --audio-bitrate")

_optional_

Inherited from [`npx remotion render`](https://www.remotion.dev/docs/cli/render#--audio-bitrate)

### `--color-space` [v4.0.28](https://github.com/remotion-dev/remotion/releases/v4.0.28) [​](https://www.remotion.dev/docs/cli/benchmark\#--color-space "Direct link to --color-space")

Color space to use for the video. Acceptable values: `"default"`(default since 5.0), `"bt709"`(since v4.0.28), `"bt2020-ncl"`(since v4.0.88), `"bt2020-cl"`(since v4.0.88), .

For best color accuracy, it is recommended to also use `"png"` as the image format to have accurate color transformations throughout.

Only since v4.0.83, colorspace conversion is actually performed, previously it would only tag the metadata of the video.

### `--hardware-acceleration` [v4.0.228](https://github.com/remotion-dev/remotion/releases/v4.0.228) [​](https://www.remotion.dev/docs/cli/benchmark\#--hardware-acceleration "Direct link to --hardware-acceleration")

One of
"disable", "if-possible", or "required"
. Default "disable". Encode using a hardware-accelerated encoder if
available. If set to "required" and no hardware-accelerated encoder is
available, then the render will fail.


### `--offthreadvideo-cache-size-in-bytes` [v4.0.23](https://github.com/remotion-dev/remotion/releases/v4.0.23) [​](https://www.remotion.dev/docs/cli/benchmark\#--offthreadvideo-cache-size-in-bytes "Direct link to --offthreadvideo-cache-size-in-bytes")

From v4.0, Remotion has a cache for [`<OffthreadVideo>`](https://remotion.dev/docs/offthreadvideo) frames. The default is `null`, corresponding to half of the system memory available when the render starts.

This option allows to override the size of the cache. The higher it is, the faster the render will be, but the more memory will be used.

The used value will be printed when running in verbose mode.

Default: `null`

### `--binaries-directory` [v4.0.120](https://github.com/remotion-dev/remotion/releases/v4.0.120) [​](https://www.remotion.dev/docs/cli/benchmark\#--binaries-directory "Direct link to --binaries-directory")

The directory where the platform-specific binaries and libraries that Remotion needs are located. Those include an `ffmpeg` and `ffprobe` binary, a Rust binary for various tasks, and various shared libraries. If the value is set to `null`, which is the default, then the path of a platform-specific package located at `node_modules/@remotion/compositor-*` is selected.

This option is useful in environments where Remotion is not officially supported to run like bundled serverless functions or Electron.

### ~~`--ffmpeg-executable`~~ [​](https://www.remotion.dev/docs/cli/benchmark\#--ffmpeg-executable "Direct link to --ffmpeg-executable")

_optional, removed in v4.0_

Inherited from [`npx remotion render`](https://www.remotion.dev/docs/cli/render#--ffmpeg-executable)

### ~~`--ffprobe-executable`~~ [​](https://www.remotion.dev/docs/cli/benchmark\#--ffprobe-executable "Direct link to --ffprobe-executable")

_optional, removed in v4.0_

Inherited from [`npx remotion render`](https://www.remotion.dev/docs/cli/render#--ffprobe-executable-)

- [Flags](https://www.remotion.dev/docs/cli/benchmark#flags)
  - [`--runs`](https://www.remotion.dev/docs/cli/benchmark#--runs)
  - [`--concurrencies`](https://www.remotion.dev/docs/cli/benchmark#--concurrencies)
  - [`--codec`](https://www.remotion.dev/docs/cli/benchmark#--codec)
  - [`--audio-codec`](https://www.remotion.dev/docs/cli/benchmark#--audio-codec)
  - [`--crf`](https://www.remotion.dev/docs/cli/benchmark#--crf)
  - [`--frames`](https://www.remotion.dev/docs/cli/benchmark#--frames)
  - [`--image-format`](https://www.remotion.dev/docs/cli/benchmark#--image-format)
  - [`--pixel-format`](https://www.remotion.dev/docs/cli/benchmark#--pixel-format)
  - [`--props`](https://www.remotion.dev/docs/cli/benchmark#--props)
  - [`--prores-profile`](https://www.remotion.dev/docs/cli/benchmark#--prores-profile)
  - [`--jpeg-quality`](https://www.remotion.dev/docs/cli/benchmark#--jpeg-quality)
  - [~~`--quality`~~](https://www.remotion.dev/docs/cli/benchmark#--quality)
  - [`--log`](https://www.remotion.dev/docs/cli/benchmark#--log)
  - [`--ignore-certificate-errors`](https://www.remotion.dev/docs/cli/benchmark#--ignore-certificate-errors)
  - [`--disable-web-security`](https://www.remotion.dev/docs/cli/benchmark#--disable-web-security)
  - [~~`--disable-headless?`~~](https://www.remotion.dev/docs/cli/benchmark#--disable-headless)
  - [`--enable-multiprocess-on-linux`](https://www.remotion.dev/docs/cli/benchmark#--enable-multiprocess-on-linux)
  - [`--gl`](https://www.remotion.dev/docs/cli/benchmark#--gl)
  - [`--chrome-mode`](https://www.remotion.dev/docs/cli/benchmark#--chrome-mode)
  - [`--timeout`](https://www.remotion.dev/docs/cli/benchmark#--timeout)
  - [`--scale`](https://www.remotion.dev/docs/cli/benchmark#--scale)
  - [`--port`](https://www.remotion.dev/docs/cli/benchmark#--port)
  - [`--number-of-gif-loops`](https://www.remotion.dev/docs/cli/benchmark#--number-of-gif-loops)
  - [`--every-nth-frame`](https://www.remotion.dev/docs/cli/benchmark#--every-nth-frame)
  - [`--log`](https://www.remotion.dev/docs/cli/benchmark#--log-1)
  - [`--muted`](https://www.remotion.dev/docs/cli/benchmark#--muted)
  - [`--enforce-audio-track`](https://www.remotion.dev/docs/cli/benchmark#--enforce-audio-track)
  - [`--disallow-parallel-encoding`](https://www.remotion.dev/docs/cli/benchmark#--disallow-parallel-encoding)
  - [`--browser-executable`](https://www.remotion.dev/docs/cli/benchmark#--browser-executable)
  - [`--public-dir`](https://www.remotion.dev/docs/cli/benchmark#--public-dir)
  - [`--config`](https://www.remotion.dev/docs/cli/benchmark#--config)
  - [`--bundle-cache`](https://www.remotion.dev/docs/cli/benchmark#--bundle-cache)
  - [`--video-bitrate`](https://www.remotion.dev/docs/cli/benchmark#--video-bitrate)
  - [`--audio-bitrate`](https://www.remotion.dev/docs/cli/benchmark#--audio-bitrate)
  - [`--color-space`](https://www.remotion.dev/docs/cli/benchmark#--color-space)
  - [`--hardware-acceleration`](https://www.remotion.dev/docs/cli/benchmark#--hardware-acceleration)
  - [`--offthreadvideo-cache-size-in-bytes`](https://www.remotion.dev/docs/cli/benchmark#--offthreadvideo-cache-size-in-bytes)
  - [`--binaries-directory`](https://www.remotion.dev/docs/cli/benchmark#--binaries-directory)
  - [~~`--ffmpeg-executable`~~](https://www.remotion.dev/docs/cli/benchmark#--ffmpeg-executable)
  - [~~`--ffprobe-executable`~~](https://www.remotion.dev/docs/cli/benchmark#--ffprobe-executable)

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