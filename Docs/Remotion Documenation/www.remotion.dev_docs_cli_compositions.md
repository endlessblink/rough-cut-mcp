---
url: "https://www.remotion.dev/docs/cli/compositions"
title: "npx remotion compositions | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/cli/compositions#__docusaurus_skipToContent_fallback)

On this page

_Available from v2.6.12._

Print list of composition IDs based on a path of an entry point.

```

bash

npx remotion compositions <serve-url|entry-file>?
```

You may pass a [Serve URL](https://www.remotion.dev/docs/terminology/serve-url) or an [entry point](https://www.remotion.dev/docs/terminology/entry-point) as the first argument, otherwise the entry point will be [determined](https://www.remotion.dev/docs/terminology/entry-point#which-entry-point-is-being-used).

## Flags [​](https://www.remotion.dev/docs/cli/compositions\#flags "Direct link to Flags")

### `--props` [​](https://www.remotion.dev/docs/cli/compositions\#--props "Direct link to --props")

[Input Props to pass to the selected composition of your video.](https://www.remotion.dev/docs/passing-props#passing-input-props-in-the-cli).

Must be a serialized JSON string ( `--props='{"hello": "world"}'`) or a path to a JSON file ( `./path/to/props.json`).

From the root component the props can be read using [`getInputProps()`](https://www.remotion.dev/docs/get-input-props).

You may transform input props using [`calculateMetadata()`](https://www.remotion.dev/docs/calculate-metadata).

note

Inline JSON string isn't supported on Windows shells because it removes the `"` character, use a file name instead.

### `--config` [​](https://www.remotion.dev/docs/cli/compositions\#--config "Direct link to --config")

Specify a location for the Remotion config file.

### `--env-file` [v2.2.0](https://github.com/remotion-dev/remotion/releases/v2.2.0) [​](https://www.remotion.dev/docs/cli/compositions\#--env-file "Direct link to --env-file")

Specify a location for a dotenv file - Default `.env`. [Read about how environment variables work in Remotion.](https://www.remotion.dev/docs/env-variables)

### `--bundle-cache` [​](https://www.remotion.dev/docs/cli/compositions\#--bundle-cache "Direct link to --bundle-cache")

[Enable or disable Webpack caching](https://www.remotion.dev/docs/config#setcachingenabled). This flag is enabled by default, use `--bundle-cache=false` to disable caching.

### `--log` [​](https://www.remotion.dev/docs/cli/compositions\#--log "Direct link to --log")

[Set the log level](https://www.remotion.dev/docs/config#setlevel). Increase or decrease the amount of output. Acceptable values: `error`, `warn`, `info` ( _default_), `verbose`

info

If you don't feel like passing command line flags every time, consider creating a `remotion.config.ts` [config file](https://www.remotion.dev/docs/config).

### `--port` [​](https://www.remotion.dev/docs/cli/compositions\#--port "Direct link to --port")

[Set a custom HTTP server port to host the Webpack bundle](https://www.remotion.dev/docs/config#setport). If not defined, Remotion will try to find a free port.

### `--public-dir` [v3.2.13](https://github.com/remotion-dev/remotion/releases/v3.2.13) [​](https://www.remotion.dev/docs/cli/compositions\#--public-dir "Direct link to --public-dir")

The path of the URL where the bundle is going to be hosted. By default it is `/`, meaning that the bundle is going to be hosted at the root of the domain (e.g. `https://localhost:3000/`). If you are deploying to a subdirectory (e.g. `/sites/my-site/`), you should set this to the subdirectory.

### `--timeout` [​](https://www.remotion.dev/docs/cli/compositions\#--timeout "Direct link to --timeout")

Define how long it may take to resolve all [`delayRender()`](https://www.remotion.dev/docs/delay-render) calls before the composition fetching times out in milliseconds. Default: `30000`.

info

Not to be confused with the [`--timeout` flag when deploying a Lambda function](https://www.remotion.dev/docs/lambda/cli/functions/deploy#--timeout).

### `--ignore-certificate-errors` [​](https://www.remotion.dev/docs/cli/compositions\#--ignore-certificate-errors "Direct link to --ignore-certificate-errors")

Results in invalid SSL certificates in Chrome, such as self-signed ones, being ignored.

### `--disable-web-security` [​](https://www.remotion.dev/docs/cli/compositions\#--disable-web-security "Direct link to --disable-web-security")

_available since v2.6.5_

This will most notably disable CORS in Chrome among other security features.

### ~~`--disable-headless?`~~ [​](https://www.remotion.dev/docs/cli/compositions\#--disable-headless "Direct link to --disable-headless")

Deprecated - will be removed in 5.0.0. With the migration to [Chrome Headless Shell](https://www.remotion.dev/docs/miscellaneous/chrome-headless-shell), this option is not functional anymore.

If disabled, the render will open an actual Chrome window where you can see the render happen. The default is headless mode.

### `--enable-multiprocess-on-linux` [v4.0.42](https://github.com/remotion-dev/remotion/releases/v4.0.42) [​](https://www.remotion.dev/docs/cli/compositions\#--enable-multiprocess-on-linux "Direct link to --enable-multiprocess-on-linux")

Removes the `--single-process` flag that gets passed to Chromium on Linux by default. This will make the render faster because multiple processes can be used, but may cause issues with some Linux distributions or if window server libraries are missing.

Default: `false` until v4.0.136, then `true` from v4.0.137 on because newer Chrome versions don't allow rendering with the `--single-process` flag.

This flag will be removed in Remotion v5.0.

### `--user-agent` [v3.3.83](https://github.com/remotion-dev/remotion/releases/v3.3.83) [​](https://www.remotion.dev/docs/cli/compositions\#--user-agent "Direct link to --user-agent")

Lets you set a custom user agent that the headless Chrome browser assumes.

### `--offthreadvideo-cache-size-in-bytes` [v4.0.23](https://github.com/remotion-dev/remotion/releases/v4.0.23) [​](https://www.remotion.dev/docs/cli/compositions\#--offthreadvideo-cache-size-in-bytes "Direct link to --offthreadvideo-cache-size-in-bytes")

From v4.0, Remotion has a cache for [`<OffthreadVideo>`](https://remotion.dev/docs/offthreadvideo) frames. The default is `null`, corresponding to half of the system memory available when the render starts.

This option allows to override the size of the cache. The higher it is, the faster the render will be, but the more memory will be used.

The used value will be printed when running in verbose mode.

Default: `null`

### `--offthreadvideo-video-threads` [v4.0.261](https://github.com/remotion-dev/remotion/releases/v4.0.261) [​](https://www.remotion.dev/docs/cli/compositions\#--offthreadvideo-video-threads "Direct link to --offthreadvideo-video-threads")

The number of threads that [`<OffthreadVideo>`](https://remotion.dev/docs/offthreadvideo) can start to extract frames. The default is2. Increase carefully, as too many threads may cause instability.

### `--binaries-directory` [v4.0.120](https://github.com/remotion-dev/remotion/releases/v4.0.120) [​](https://www.remotion.dev/docs/cli/compositions\#--binaries-directory "Direct link to --binaries-directory")

The directory where the platform-specific binaries and libraries that Remotion needs are located. Those include an `ffmpeg` and `ffprobe` binary, a Rust binary for various tasks, and various shared libraries. If the value is set to `null`, which is the default, then the path of a platform-specific package located at `node_modules/@remotion/compositor-*` is selected.

This option is useful in environments where Remotion is not officially supported to run like bundled serverless functions or Electron.

### `--chrome-mode` [v4.0.248](https://github.com/remotion-dev/remotion/releases/v4.0.248) [​](https://www.remotion.dev/docs/cli/compositions\#--chrome-mode "Direct link to --chrome-mode")

One of `headless-shell, ` `chrome-for-testing`. Default `headless-shell`. [Use `chrome-for-testing` to take advantage of GPU drivers on Linux.](https://remotion.dev/docs/miscellaneous/chrome-headless-shell)

### `--quiet`, `--q` [​](https://www.remotion.dev/docs/cli/compositions\#--quiet---q "Direct link to --quiet---q")

Only prints the composition IDs, separated by a space.

### ~~`--ffmpeg-executable`~~ [​](https://www.remotion.dev/docs/cli/compositions\#--ffmpeg-executable "Direct link to --ffmpeg-executable")

_removed in v4.0_

[Set a custom `ffmpeg` executable](https://www.remotion.dev/docs/config#setffmpegexecutable). If not defined, a `ffmpeg` executable will be searched in `PATH`.

### ~~`--ffprobe-executable`~~ [​](https://www.remotion.dev/docs/cli/compositions\#--ffprobe-executable "Direct link to --ffprobe-executable")

_removed in v4.0_

[Set a custom `ffprobe` executable](https://www.remotion.dev/docs/config#setffprobeexecutable). If not defined, a `ffprobe` executable will be searched in `PATH`.

## See also [​](https://www.remotion.dev/docs/cli/compositions\#see-also "Direct link to See also")

- [`getCompositions()`](https://www.remotion.dev/docs/renderer/get-compositions)
- [`getCompositionsOnLambda()`](https://www.remotion.dev/docs/lambda/getcompositionsonlambda)
- [`npx remotion lambda compositions`](https://www.remotion.dev/docs/lambda/cli/compositions)

- [Flags](https://www.remotion.dev/docs/cli/compositions#flags)
  - [`--props`](https://www.remotion.dev/docs/cli/compositions#--props)
  - [`--config`](https://www.remotion.dev/docs/cli/compositions#--config)
  - [`--env-file`](https://www.remotion.dev/docs/cli/compositions#--env-file)
  - [`--bundle-cache`](https://www.remotion.dev/docs/cli/compositions#--bundle-cache)
  - [`--log`](https://www.remotion.dev/docs/cli/compositions#--log)
  - [`--port`](https://www.remotion.dev/docs/cli/compositions#--port)
  - [`--public-dir`](https://www.remotion.dev/docs/cli/compositions#--public-dir)
  - [`--timeout`](https://www.remotion.dev/docs/cli/compositions#--timeout)
  - [`--ignore-certificate-errors`](https://www.remotion.dev/docs/cli/compositions#--ignore-certificate-errors)
  - [`--disable-web-security`](https://www.remotion.dev/docs/cli/compositions#--disable-web-security)
  - [~~`--disable-headless?`~~](https://www.remotion.dev/docs/cli/compositions#--disable-headless)
  - [`--enable-multiprocess-on-linux`](https://www.remotion.dev/docs/cli/compositions#--enable-multiprocess-on-linux)
  - [`--user-agent`](https://www.remotion.dev/docs/cli/compositions#--user-agent)
  - [`--offthreadvideo-cache-size-in-bytes`](https://www.remotion.dev/docs/cli/compositions#--offthreadvideo-cache-size-in-bytes)
  - [`--offthreadvideo-video-threads`](https://www.remotion.dev/docs/cli/compositions#--offthreadvideo-video-threads)
  - [`--binaries-directory`](https://www.remotion.dev/docs/cli/compositions#--binaries-directory)
  - [`--chrome-mode`](https://www.remotion.dev/docs/cli/compositions#--chrome-mode)
  - [`--quiet`, `--q`](https://www.remotion.dev/docs/cli/compositions#--quiet---q)
  - [~~`--ffmpeg-executable`~~](https://www.remotion.dev/docs/cli/compositions#--ffmpeg-executable)
  - [~~`--ffprobe-executable`~~](https://www.remotion.dev/docs/cli/compositions#--ffprobe-executable)
- [See also](https://www.remotion.dev/docs/cli/compositions#see-also)

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