---
url: "https://www.remotion.dev/docs/cli/still"
title: "npx remotion still | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/cli/still#__docusaurus_skipToContent_fallback)

On this page

_Available from v2.3._

Render a still frame based on the entry point, the composition ID and save it to the output location.

```

bash

npx remotion still <serve-url|entry-point>? [<composition-id>] [<output-location>]
```

You may pass a [Serve URL](https://www.remotion.dev/docs/terminology/serve-url) or an [entry point](https://www.remotion.dev/docs/terminology/entry-point) as the first argument, otherwise the entry point will be [determined](https://www.remotion.dev/docs/terminology/entry-point#which-entry-point-is-being-used).

If `output-location` is not passed, the still will be rendered into the `out` folder.

If `composition-id` is also not passed, Remotion will let you select a composition.

## Flags [​](https://www.remotion.dev/docs/cli/still\#flags "Direct link to Flags")

### `--props` [​](https://www.remotion.dev/docs/cli/still\#--props "Direct link to --props")

[Input Props to pass to the selected composition of your video.](https://www.remotion.dev/docs/passing-props#passing-input-props-in-the-cli).

Must be a serialized JSON string ( `--props='{"hello": "world"}'`) or a path to a JSON file ( `./path/to/props.json`).

From the root component the props can be read using [`getInputProps()`](https://www.remotion.dev/docs/get-input-props).

You may transform input props using [`calculateMetadata()`](https://www.remotion.dev/docs/calculate-metadata).

note

Inline JSON string isn't supported on Windows shells because it removes the `"` character, use a file name instead.

### `--image-format` [​](https://www.remotion.dev/docs/cli/still\#--image-format "Direct link to --image-format")

`jpeg`, `png`, `webp` or `pdf`. The default is `png`.

### `--config` [​](https://www.remotion.dev/docs/cli/still\#--config "Direct link to --config")

Specify a location for the Remotion config file.

### `--env-file` [​](https://www.remotion.dev/docs/cli/still\#--env-file "Direct link to --env-file")

Specify a location for a dotenv file - Default `.env`. [Read about how environment variables work in Remotion.](https://www.remotion.dev/docs/env-variables)

### `--jpeg-quality` [v4.0.0](https://github.com/remotion-dev/remotion/releases/v4.0.0) [​](https://www.remotion.dev/docs/cli/still\#--jpeg-quality- "Direct link to --jpeg-quality-")

[Value between 0 and 100 for JPEG rendering quality](https://www.remotion.dev/docs/config#setjpegquality). Doesn't work when PNG frames are rendered.

### ~~`--quality`~~ [v1.4.0](https://github.com/remotion-dev/remotion/releases/v1.4.0) [​](https://www.remotion.dev/docs/cli/still\#--quality- "Direct link to --quality-")

Renamed to `--jpeg-quality` in v4.0.0

### `--output` [v4.0.0](https://github.com/remotion-dev/remotion/releases/v4.0.0) [​](https://www.remotion.dev/docs/cli/still\#--output- "Direct link to --output-")

Sets the output file path, as an alternative to the `output-location` positional argument.

### `--overwrite` [​](https://www.remotion.dev/docs/cli/still\#--overwrite "Direct link to --overwrite")

[Write to output even if file already exists.](https://www.remotion.dev/docs/config#setoverwriteoutput). This flag is enabled by default, use `--overwrite=false` to disable it.

### `--browser-executable` [​](https://www.remotion.dev/docs/cli/still\#--browser-executable "Direct link to --browser-executable")

[Path to a Chrome executable](https://www.remotion.dev/docs/config#setbrowserexecutable). If not specified and Remotion cannot find one, it will download one during rendering.

### `--scale` [​](https://www.remotion.dev/docs/cli/still\#--scale "Direct link to --scale")

[Scales the output frames by the factor you pass in.](https://www.remotion.dev/docs/scaling) For example, a 1280x720px frame will become a 1920x1080px frame with a scale factor of `1.5`. Vector elements like fonts and HTML markups will be rendered with extra details. `scale` must be greater than 0 and less than equal to 16. Default: `1`.

### `--frame` [​](https://www.remotion.dev/docs/cli/still\#--frame "Direct link to --frame")

Which frame should be rendered. Example `--frame=10`. Default `0`.

From v3.2.27, negative values are allowed, with `-1` being the last frame.

### `--bundle-cache` [​](https://www.remotion.dev/docs/cli/still\#--bundle-cache "Direct link to --bundle-cache")

[Enable or disable Webpack caching](https://www.remotion.dev/docs/config#setcachingenabled). This flag is enabled by default, use `--bundle-cache=false` to disable caching.

### `--log` [​](https://www.remotion.dev/docs/cli/still\#--log "Direct link to --log")

[Set the log level](https://www.remotion.dev/docs/config#setlevel). Increase or decrease the amount of output. Acceptable values: `error`, `warn`, `info` ( _default_), `verbose`

### `--port` [​](https://www.remotion.dev/docs/cli/still\#--port "Direct link to --port")

[Set a custom HTTP server port to serve the Webpack bundle](https://www.remotion.dev/docs/config#setport). If not defined, Remotion will try to find a free port.

### `--public-dir` [v3.2.13](https://github.com/remotion-dev/remotion/releases/v3.2.13) [​](https://www.remotion.dev/docs/cli/still\#--public-dir "Direct link to --public-dir")

The path of the URL where the bundle is going to be hosted. By default it is `/`, meaning that the bundle is going to be hosted at the root of the domain (e.g. `https://localhost:3000/`). If you are deploying to a subdirectory (e.g. `/sites/my-site/`), you should set this to the subdirectory.

### `--timeout` [​](https://www.remotion.dev/docs/cli/still\#--timeout "Direct link to --timeout")

Define how long a single frame may take to resolve all [`delayRender()`](https://www.remotion.dev/docs/delay-render) calls [before it times out](https://www.remotion.dev/docs/timeout) in milliseconds. Default: `30000`.

info

Not to be confused with the [`--timeout` flag when deploying a Lambda function](https://www.remotion.dev/docs/lambda/cli/functions/deploy#--timeout).

### `--ignore-certificate-errors` [v2.6.5](https://github.com/remotion-dev/remotion/releases/v2.6.5) [​](https://www.remotion.dev/docs/cli/still\#--ignore-certificate-errors "Direct link to --ignore-certificate-errors")

Results in invalid SSL certificates in Chrome, such as self-signed ones, being ignored.

### `--disable-web-security` [v2.6.5](https://github.com/remotion-dev/remotion/releases/v2.6.5) [​](https://www.remotion.dev/docs/cli/still\#--disable-web-security "Direct link to --disable-web-security")

This will most notably disable CORS in Chrome among other security features.

### ~~`--disable-headless`~~ [v2.6.5](https://github.com/remotion-dev/remotion/releases/v2.6.5) [​](https://www.remotion.dev/docs/cli/still\#--disable-headless "Direct link to --disable-headless")

Deprecated - will be removed in 5.0.0. With the migration to [Chrome Headless Shell](https://www.remotion.dev/docs/miscellaneous/chrome-headless-shell), this option is not functional anymore.

If disabled, the render will open an actual Chrome window where you can see the render happen. The default is headless mode.

### `--chrome-mode` [v4.0.248](https://github.com/remotion-dev/remotion/releases/v4.0.248) [​](https://www.remotion.dev/docs/cli/still\#--chrome-mode "Direct link to --chrome-mode")

One of `headless-shell, ` `chrome-for-testing`. Default `headless-shell`. [Use `chrome-for-testing` to take advantage of GPU drivers on Linux.](https://remotion.dev/docs/miscellaneous/chrome-headless-shell)

### `--gl` [​](https://www.remotion.dev/docs/cli/still\#--gl "Direct link to --gl")

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

### `--user-agent` [v3.3.83](https://github.com/remotion-dev/remotion/releases/v3.3.83) [​](https://www.remotion.dev/docs/cli/still\#--user-agent "Direct link to --user-agent")

Lets you set a custom user agent that the headless Chrome browser assumes.

### `--offthreadvideo-cache-size-in-bytes` [v4.0.23](https://github.com/remotion-dev/remotion/releases/v4.0.23) [​](https://www.remotion.dev/docs/cli/still\#--offthreadvideo-cache-size-in-bytes "Direct link to --offthreadvideo-cache-size-in-bytes")

From v4.0, Remotion has a cache for [`<OffthreadVideo>`](https://remotion.dev/docs/offthreadvideo) frames. The default is `null`, corresponding to half of the system memory available when the render starts.

This option allows to override the size of the cache. The higher it is, the faster the render will be, but the more memory will be used.

The used value will be printed when running in verbose mode.

Default: `null`

### `--offthreadvideo-video-threads` [v4.0.261](https://github.com/remotion-dev/remotion/releases/v4.0.261) [​](https://www.remotion.dev/docs/cli/still\#--offthreadvideo-video-threads "Direct link to --offthreadvideo-video-threads")

The number of threads that [`<OffthreadVideo>`](https://remotion.dev/docs/offthreadvideo) can start to extract frames. The default is2. Increase carefully, as too many threads may cause instability.

### `--enable-multiprocess-on-linux` [v4.0.42](https://github.com/remotion-dev/remotion/releases/v4.0.42) [​](https://www.remotion.dev/docs/cli/still\#--enable-multiprocess-on-linux "Direct link to --enable-multiprocess-on-linux")

Removes the `--single-process` flag that gets passed to Chromium on Linux by default. This will make the render faster because multiple processes can be used, but may cause issues with some Linux distributions or if window server libraries are missing.

Default: `false` until v4.0.136, then `true` from v4.0.137 on because newer Chrome versions don't allow rendering with the `--single-process` flag.

This flag will be removed in Remotion v5.0.

### `--binaries-directory` [v4.0.120](https://github.com/remotion-dev/remotion/releases/v4.0.120) [​](https://www.remotion.dev/docs/cli/still\#--binaries-directory "Direct link to --binaries-directory")

The directory where the platform-specific binaries and libraries that Remotion needs are located. Those include an `ffmpeg` and `ffprobe` binary, a Rust binary for various tasks, and various shared libraries. If the value is set to `null`, which is the default, then the path of a platform-specific package located at `node_modules/@remotion/compositor-*` is selected.

This option is useful in environments where Remotion is not officially supported to run like bundled serverless functions or Electron.

### ~~`--ffmpeg-executable`~~ [​](https://www.remotion.dev/docs/cli/still\#--ffmpeg-executable "Direct link to --ffmpeg-executable")

_removed in v4.0_

[Set a custom `ffmpeg` executable](https://www.remotion.dev/docs/config#setffmpegexecutable). If not defined, a `ffmpeg` executable will be searched in `PATH`.

### ~~`--ffprobe-executable`~~ [​](https://www.remotion.dev/docs/cli/still\#--ffprobe-executable "Direct link to --ffprobe-executable")

_removed in v4.0_

[Set a custom `ffprobe` executable](https://www.remotion.dev/docs/config#setffprobeexecutable). If not defined, a `ffprobe` executable will be searched in `PATH`.

- [Flags](https://www.remotion.dev/docs/cli/still#flags)
  - [`--props`](https://www.remotion.dev/docs/cli/still#--props)
  - [`--image-format`](https://www.remotion.dev/docs/cli/still#--image-format)
  - [`--config`](https://www.remotion.dev/docs/cli/still#--config)
  - [`--env-file`](https://www.remotion.dev/docs/cli/still#--env-file)
  - [`--jpeg-quality`](https://www.remotion.dev/docs/cli/still#--jpeg-quality-)
  - [~~`--quality`~~](https://www.remotion.dev/docs/cli/still#--quality-)
  - [`--output`](https://www.remotion.dev/docs/cli/still#--output-)
  - [`--overwrite`](https://www.remotion.dev/docs/cli/still#--overwrite)
  - [`--browser-executable`](https://www.remotion.dev/docs/cli/still#--browser-executable)
  - [`--scale`](https://www.remotion.dev/docs/cli/still#--scale)
  - [`--frame`](https://www.remotion.dev/docs/cli/still#--frame)
  - [`--bundle-cache`](https://www.remotion.dev/docs/cli/still#--bundle-cache)
  - [`--log`](https://www.remotion.dev/docs/cli/still#--log)
  - [`--port`](https://www.remotion.dev/docs/cli/still#--port)
  - [`--public-dir`](https://www.remotion.dev/docs/cli/still#--public-dir)
  - [`--timeout`](https://www.remotion.dev/docs/cli/still#--timeout)
  - [`--ignore-certificate-errors`](https://www.remotion.dev/docs/cli/still#--ignore-certificate-errors)
  - [`--disable-web-security`](https://www.remotion.dev/docs/cli/still#--disable-web-security)
  - [~~`--disable-headless`~~](https://www.remotion.dev/docs/cli/still#--disable-headless)
  - [`--chrome-mode`](https://www.remotion.dev/docs/cli/still#--chrome-mode)
  - [`--gl`](https://www.remotion.dev/docs/cli/still#--gl)
  - [`--user-agent`](https://www.remotion.dev/docs/cli/still#--user-agent)
  - [`--offthreadvideo-cache-size-in-bytes`](https://www.remotion.dev/docs/cli/still#--offthreadvideo-cache-size-in-bytes)
  - [`--offthreadvideo-video-threads`](https://www.remotion.dev/docs/cli/still#--offthreadvideo-video-threads)
  - [`--enable-multiprocess-on-linux`](https://www.remotion.dev/docs/cli/still#--enable-multiprocess-on-linux)
  - [`--binaries-directory`](https://www.remotion.dev/docs/cli/still#--binaries-directory)
  - [~~`--ffmpeg-executable`~~](https://www.remotion.dev/docs/cli/still#--ffmpeg-executable)
  - [~~`--ffprobe-executable`~~](https://www.remotion.dev/docs/cli/still#--ffprobe-executable)

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