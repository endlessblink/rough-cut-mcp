---
url: "https://www.remotion.dev/docs/cli/render"
title: "npx remotion render | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/cli/render#__docusaurus_skipToContent_fallback)

On this page

Render a video or audio based on the entry point, the composition ID and save it to the output location.

```

bash

npx remotion render <entry-point|serve-url>? <composition-id> <output-location>
```

You may pass a [Serve URL](https://www.remotion.dev/docs/terminology/serve-url) or an [entry point](https://www.remotion.dev/docs/terminology/entry-point) as the first argument, otherwise the entry point will be [determined](https://www.remotion.dev/docs/terminology/entry-point#which-entry-point-is-being-used).

If `composition-id` is not passed, Remotion will ask you to select a composition.

If `output-location` is not passed, the media will be rendered into the `out` folder.

## Flags [​](https://www.remotion.dev/docs/cli/render\#flags "Direct link to Flags")

Besides choosing a video and output location with the command line arguments, the following flags are supported:

### `--props` [​](https://www.remotion.dev/docs/cli/render\#--props "Direct link to --props")

[Input Props to pass to the selected composition of your video.](https://www.remotion.dev/docs/passing-props#passing-input-props-in-the-cli).

Must be a serialized JSON string ( `--props='{"hello": "world"}'`) or a path to a JSON file ( `./path/to/props.json`).

From the root component the props can be read using [`getInputProps()`](https://www.remotion.dev/docs/get-input-props).

You may transform input props using [`calculateMetadata()`](https://www.remotion.dev/docs/calculate-metadata).

note

Inline JSON string isn't supported on Windows shells because it removes the `"` character, use a file name instead.

### `--height` [v3.2.40](https://github.com/remotion-dev/remotion/releases/v3.2.40) [​](https://www.remotion.dev/docs/cli/render\#--height "Direct link to --height")

[Overrides composition height.](https://www.remotion.dev/docs/config#overrideheight)

### `--width` [v3.2.40](https://github.com/remotion-dev/remotion/releases/v3.2.40) [​](https://www.remotion.dev/docs/cli/render\#--width "Direct link to --width")

[Overrides composition width.](https://www.remotion.dev/docs/config#overridewidth)

### `--concurrency` [​](https://www.remotion.dev/docs/cli/render\#--concurrency "Direct link to --concurrency")

[How many CPU threads to use.](https://www.remotion.dev/docs/config#setconcurrency) Minimum 1. The maximum is the amount of threads you have (In Node.JS `os.cpus().length`). You can also provide a percentage value (e.g. 50%).

### `--pixel-format` [​](https://www.remotion.dev/docs/cli/render\#--pixel-format "Direct link to --pixel-format")

[Set a custom pixel format. See here for available values.](https://www.remotion.dev/docs/config#setpixelformat)

### `--image-format` [v1.4.0](https://github.com/remotion-dev/remotion/releases/v1.4.0) [​](https://www.remotion.dev/docs/cli/render\#--image-format "Direct link to --image-format")

[`jpeg` or `png` \- JPEG is faster, but doesn't support transparency.](https://www.remotion.dev/docs/config#setvideoimageformat) The default image format is `jpeg` since v1.1.

### `--image-sequence-pattern` [v4.0.313](https://github.com/remotion-dev/remotion/releases/v4.0.313) [​](https://www.remotion.dev/docs/cli/render\#--image-sequence-pattern- "Direct link to --image-sequence-pattern-")

\[Pattern for naming image sequence files. Supports `[frame]` for the zero-padded frame number and `[ext]` for the file extension.\]

**Example:**

```

bash

npx remotion render ... --sequence --image-sequence-pattern='frame_[frame]_custom.[ext]'
# Produces: frame_0001_custom.jpeg, frame_0002_custom.jpeg, ...
```

### `--config` [v1.2.0](https://github.com/remotion-dev/remotion/releases/v1.2.0) [​](https://www.remotion.dev/docs/cli/render\#--config "Direct link to --config")

Specify a location for the Remotion config file.

### `--env-file` [v2.2.0](https://github.com/remotion-dev/remotion/releases/v2.2.0) [​](https://www.remotion.dev/docs/cli/render\#--env-file "Direct link to --env-file")

Specify a location for a dotenv file. Default `.env`.

### `--jpeg-quality` [v4.0.0](https://github.com/remotion-dev/remotion/releases/v4.0.0) [​](https://www.remotion.dev/docs/cli/render\#--jpeg-quality "Direct link to --jpeg-quality")

[Value between 0 and 100 for JPEG rendering quality](https://www.remotion.dev/docs/config#setjpegquality). Doesn't work when PNG frames are rendered.

### ~~`--quality`~~ [v1.4.0](https://github.com/remotion-dev/remotion/releases/v1.4.0) [​](https://www.remotion.dev/docs/cli/render\#--quality "Direct link to --quality")

Renamed to `--jpeg-quality` in v4.0.0

### `--output` [v4.0.0](https://github.com/remotion-dev/remotion/releases/v4.0.0) [​](https://www.remotion.dev/docs/cli/render\#--output- "Direct link to --output-")

Sets the output file path, as an alternative to the `output-location` positional argument.

### `--overwrite` [​](https://www.remotion.dev/docs/cli/render\#--overwrite "Direct link to --overwrite")

[Write to output even if file already exists.](https://www.remotion.dev/docs/config#setoverwriteoutput). This flag is enabled by default, use `--overwrite=false` to disable it.

### `--sequence` [v1.4.0](https://github.com/remotion-dev/remotion/releases/v1.4.0) [​](https://www.remotion.dev/docs/cli/render\#--sequence "Direct link to --sequence")

[Pass this flag if you want an image sequence as the output instead of a video.](https://www.remotion.dev/docs/config#setimagesequence)

### `--codec` [v1.4.0](https://github.com/remotion-dev/remotion/releases/v1.4.0) [​](https://www.remotion.dev/docs/cli/render\#--codec "Direct link to --codec")

[`h264` or `h265` or `png` or `vp8` or `vp9` or `mp3` or `aac` or `wav` or `prores` or `h264-mkv`](https://www.remotion.dev/docs/config#setcodec). If you don't supply `--codec`, it will use the H.264 encoder.

### `--audio-codec` [v3.3.42](https://github.com/remotion-dev/remotion/releases/v3.3.42) [​](https://www.remotion.dev/docs/cli/render\#--audio-codec "Direct link to --audio-codec")

Set the format of the audio that is embedded in the video. Not all codec and audio codec combinations are supported and certain combinations require a certain file extension and container format. See the table in the docs to see possible combinations.

### `--audio-bitrate` [v3.2.32](https://github.com/remotion-dev/remotion/releases/v3.2.32) [​](https://www.remotion.dev/docs/cli/render\#--audio-bitrate "Direct link to --audio-bitrate")

Specify the target bitrate for the generated video. The syntax for FFmpeg's `-b:a` parameter should be used. FFmpeg may encode the video in a way that will not result in the exact audio bitrate specified. Example values: `512K` for 512 kbps, `1M` for 1 Mbps. Default: `320k`

### `--video-bitrate` [v3.2.32](https://github.com/remotion-dev/remotion/releases/v3.2.32) [​](https://www.remotion.dev/docs/cli/render\#--video-bitrate "Direct link to --video-bitrate")

Specify the target bitrate for the generated video. The syntax for FFmpeg's `-b:v` parameter should be used. FFmpeg may encode the video in a way that will not result in the exact video bitrate specified. Example values: `512K` for 512 kbps, `1M` for 1 Mbps.

### `--buffer-size` [v4.0.78](https://github.com/remotion-dev/remotion/releases/v4.0.78) [​](https://www.remotion.dev/docs/cli/render\#--buffer-size "Direct link to --buffer-size")

The value for the `-bufsize` flag of FFmpeg. Should be used in conjunction with the encoding max rate flag.

### `--max-rate` [v4.0.78](https://github.com/remotion-dev/remotion/releases/v4.0.78) [​](https://www.remotion.dev/docs/cli/render\#--max-rate "Direct link to --max-rate")

The value for the `-maxrate` flag of FFmpeg. Should be used in conjunction with the encoding buffer size flag.

### `--prores-profile` [v2.1.6](https://github.com/remotion-dev/remotion/releases/v2.1.6) [​](https://www.remotion.dev/docs/cli/render\#--prores-profile "Direct link to --prores-profile")

[Set the ProRes profile](https://www.remotion.dev/docs/config#setproresprofile). This option is only valid if the [`codec`](https://www.remotion.dev/docs/cli/render#--codec) has been set to `prores`. Possible values: `4444-xq`, `4444`, `hq`, `standard`, `light`, `proxy`. See [here](https://video.stackexchange.com/a/14715) for explanation of possible values. Default: `hq`.

### `--x264-preset` [v4.2.2](https://github.com/remotion-dev/remotion/releases/v4.2.2) [​](https://www.remotion.dev/docs/cli/render\#--x264-preset "Direct link to --x264-preset")

Sets a x264 preset profile. Only applies to videos rendered with `h264` codec.

Possible values: `superfast`, `veryfast`, `faster`, `fast`, `medium`, `slow`, `slower`, `veryslow`, `placebo`.

Default: `medium`

### `--crf` [v1.4.0](https://github.com/remotion-dev/remotion/releases/v1.4.0) [​](https://www.remotion.dev/docs/cli/render\#--crf "Direct link to --crf")

[To set Constant Rate Factor (CRF) of the output](https://www.remotion.dev/docs/config#setcrf). Minimum 0. Use this rate control mode if you want to keep the best quality and care less about the file size. This option cannot be set if `--video-bitrate` is set.

### `--browser-executable` [v1.5.0](https://github.com/remotion-dev/remotion/releases/v1.5.0) [​](https://www.remotion.dev/docs/cli/render\#--browser-executable "Direct link to --browser-executable")

[Path to a Chrome executable](https://www.remotion.dev/docs/config#setbrowserexecutable). If not specified and Remotion cannot find one, it will download one during rendering.

### `--chrome-mode` [v4.0.248](https://github.com/remotion-dev/remotion/releases/v4.0.248) [​](https://www.remotion.dev/docs/cli/render\#--chrome-mode "Direct link to --chrome-mode")

One of `headless-shell, ` `chrome-for-testing`. Default `headless-shell`. [Use `chrome-for-testing` to take advantage of GPU drivers on Linux.](https://remotion.dev/docs/miscellaneous/chrome-headless-shell)

### `--scale` [​](https://www.remotion.dev/docs/cli/render\#--scale "Direct link to --scale")

[Scales the output frames by the factor you pass in.](https://www.remotion.dev/docs/scaling) For example, a 1280x720px frame will become a 1920x1080px frame with a scale factor of `1.5`. Vector elements like fonts and HTML markups will be rendered with extra details. `scale` must be greater than 0 and less than equal to 16. Default: `1`.

### `--frames` [v2.0.0](https://github.com/remotion-dev/remotion/releases/v2.0.0) [​](https://www.remotion.dev/docs/cli/render\#--frames "Direct link to --frames")

[Render a subset of a video](https://www.remotion.dev/docs/config#setframerange). Example: `--frames=0-9` to select the first 10 frames. To render a still, use the `still` command.

### `--every-nth-frame` [v3.1.0](https://github.com/remotion-dev/remotion/releases/v3.1.0) [​](https://www.remotion.dev/docs/cli/render\#--every-nth-frame "Direct link to --every-nth-frame")

[Render only every nth frame.](https://www.remotion.dev/docs/config#seteverynthframe) This option may only be set when rendering GIFs. This allows you to lower the FPS of the GIF.

For example only every second frame, every third frame and so on. Only works for rendering GIFs. [See here for more details.](https://www.remotion.dev/docs/render-as-gif#reducing-frame-rate)

### `--muted` [v3.2.1](https://github.com/remotion-dev/remotion/releases/v3.2.1) [​](https://www.remotion.dev/docs/cli/render\#--muted "Direct link to --muted")

[Disables audio output.](https://www.remotion.dev/docs/cli/render#--muted) This option may only be used when rendering a video.

### `--enforce-audio-track` [v3.2.1](https://github.com/remotion-dev/remotion/releases/v3.2.1) [​](https://www.remotion.dev/docs/cli/render\#--enforce-audio-track "Direct link to --enforce-audio-track")

[Render a silent audio track if there wouldn't be one otherwise.](https://www.remotion.dev/docs/cli/render#--enforce-audio-track).

### `--disallow-parallel-encoding` [v4.0.315](https://github.com/remotion-dev/remotion/releases/v4.0.315) [​](https://www.remotion.dev/docs/cli/render\#--disallow-parallel-encoding "Direct link to --disallow-parallel-encoding")

Disallows the renderer from doing rendering frames and encoding at the same time. This makes the rendering process more memory-efficient, but possibly slower.

### `--number-of-gif-loops` [v3.1.0](https://github.com/remotion-dev/remotion/releases/v3.1.0) [​](https://www.remotion.dev/docs/cli/render\#--number-of-gif-loops "Direct link to --number-of-gif-loops")

Allows you to set the number of loops as follows:

- `null` (or omitting in the CLI) plays the GIF indefinitely.
- `0` disables looping
- `1` loops the GIF once (plays twice in total)
- `2` loops the GIF twice (plays three times in total) and so on.

### `--color-space` [v4.0.28](https://github.com/remotion-dev/remotion/releases/v4.0.28) [​](https://www.remotion.dev/docs/cli/render\#--color-space "Direct link to --color-space")

Color space to use for the video. Acceptable values: `"default"`(default since 5.0), `"bt709"`(since v4.0.28), `"bt2020-ncl"`(since v4.0.88), `"bt2020-cl"`(since v4.0.88), .

For best color accuracy, it is recommended to also use `"png"` as the image format to have accurate color transformations throughout.

Only since v4.0.83, colorspace conversion is actually performed, previously it would only tag the metadata of the video.

### `--hardware-acceleration` [v4.0.228](https://github.com/remotion-dev/remotion/releases/v4.0.228) [​](https://www.remotion.dev/docs/cli/render\#--hardware-acceleration "Direct link to --hardware-acceleration")

One of
"disable", "if-possible", or "required"
. Default "disable". Encode using a hardware-accelerated encoder if
available. If set to "required" and no hardware-accelerated encoder is
available, then the render will fail.


### `--bundle-cache` [v2.0.0](https://github.com/remotion-dev/remotion/releases/v2.0.0) [​](https://www.remotion.dev/docs/cli/render\#--bundle-cache "Direct link to --bundle-cache")

[Enable or disable Webpack caching](https://www.remotion.dev/docs/config#setcachingenabled). This flag is enabled by default, use `--bundle-cache=false` to disable caching.

### `--log` [​](https://www.remotion.dev/docs/cli/render\#--log "Direct link to --log")

[Set the log level](https://www.remotion.dev/docs/config#setlevel). Increase or decrease the amount of output. Acceptable values: `error`, `warn`, `info` ( _default_), `verbose`

### `--port` [​](https://www.remotion.dev/docs/cli/render\#--port "Direct link to --port")

[Set a custom HTTP server port that will be used to host the Webpack bundle](https://www.remotion.dev/docs/config#setrendererport). If not defined, Remotion will try to find a free port.

### `--public-dir` [v3.2.13](https://github.com/remotion-dev/remotion/releases/v3.2.13) [​](https://www.remotion.dev/docs/cli/render\#--public-dir "Direct link to --public-dir")

The path of the URL where the bundle is going to be hosted. By default it is `/`, meaning that the bundle is going to be hosted at the root of the domain (e.g. `https://localhost:3000/`). If you are deploying to a subdirectory (e.g. `/sites/my-site/`), you should set this to the subdirectory.

### `--timeout` [​](https://www.remotion.dev/docs/cli/render\#--timeout "Direct link to --timeout")

Define how long a single frame may take to resolve all [`delayRender()`](https://www.remotion.dev/docs/delay-render) calls [before it times out](https://www.remotion.dev/docs/timeout) in milliseconds. Default: `30000`.

info

Not to be confused with the [`--timeout` flag when deploying a Lambda function](https://www.remotion.dev/docs/lambda/cli/functions/deploy#--timeout).

### `--ignore-certificate-errors` [v2.6.5](https://github.com/remotion-dev/remotion/releases/v2.6.5) [​](https://www.remotion.dev/docs/cli/render\#--ignore-certificate-errors "Direct link to --ignore-certificate-errors")

Results in invalid SSL certificates in Chrome, such as self-signed ones, being ignored.

### `--disable-web-security` [v2.6.5](https://github.com/remotion-dev/remotion/releases/v2.6.5) [​](https://www.remotion.dev/docs/cli/render\#--disable-web-security "Direct link to --disable-web-security")

This will most notably disable CORS in Chrome among other security features.

### ~~`--disable-headless`~~ [v2.6.5](https://github.com/remotion-dev/remotion/releases/v2.6.5) [​](https://www.remotion.dev/docs/cli/render\#--disable-headless "Direct link to --disable-headless")

Deprecated - will be removed in 5.0.0. With the migration to [Chrome Headless Shell](https://www.remotion.dev/docs/miscellaneous/chrome-headless-shell), this option is not functional anymore.

If disabled, the render will open an actual Chrome window where you can see the render happen. The default is headless mode.

### `--gl` [​](https://www.remotion.dev/docs/cli/render\#--gl "Direct link to --gl")

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

### `--user-agent` [v3.3.83](https://github.com/remotion-dev/remotion/releases/v3.3.83) [​](https://www.remotion.dev/docs/cli/render\#--user-agent "Direct link to --user-agent")

Lets you set a custom user agent that the headless Chrome browser assumes.

### `--offthreadvideo-cache-size-in-bytes` [v4.0.23](https://github.com/remotion-dev/remotion/releases/v4.0.23) [​](https://www.remotion.dev/docs/cli/render\#--offthreadvideo-cache-size-in-bytes "Direct link to --offthreadvideo-cache-size-in-bytes")

From v4.0, Remotion has a cache for [`<OffthreadVideo>`](https://remotion.dev/docs/offthreadvideo) frames. The default is `null`, corresponding to half of the system memory available when the render starts.

This option allows to override the size of the cache. The higher it is, the faster the render will be, but the more memory will be used.

The used value will be printed when running in verbose mode.

Default: `null`

### `--offthreadvideo-video-threads` [v4.0.261](https://github.com/remotion-dev/remotion/releases/v4.0.261) [​](https://www.remotion.dev/docs/cli/render\#--offthreadvideo-video-threads "Direct link to --offthreadvideo-video-threads")

The number of threads that [`<OffthreadVideo>`](https://remotion.dev/docs/offthreadvideo) can start to extract frames. The default is2. Increase carefully, as too many threads may cause instability.

### `--enable-multiprocess-on-linux` [v4.0.42](https://github.com/remotion-dev/remotion/releases/v4.0.42) [​](https://www.remotion.dev/docs/cli/render\#--enable-multiprocess-on-linux "Direct link to --enable-multiprocess-on-linux")

Removes the `--single-process` flag that gets passed to Chromium on Linux by default. This will make the render faster because multiple processes can be used, but may cause issues with some Linux distributions or if window server libraries are missing.

Default: `false` until v4.0.136, then `true` from v4.0.137 on because newer Chrome versions don't allow rendering with the `--single-process` flag.

This flag will be removed in Remotion v5.0.

### `--repro` [v4.0.88](https://github.com/remotion-dev/remotion/releases/v4.0.88) [​](https://www.remotion.dev/docs/cli/render\#--repro "Direct link to --repro")

Create a ZIP that you can submit to Remotion if asked for a reproduction.

### `--binaries-directory` [v4.0.120](https://github.com/remotion-dev/remotion/releases/v4.0.120) [​](https://www.remotion.dev/docs/cli/render\#--binaries-directory "Direct link to --binaries-directory")

The directory where the platform-specific binaries and libraries that Remotion needs are located. Those include an `ffmpeg` and `ffprobe` binary, a Rust binary for various tasks, and various shared libraries. If the value is set to `null`, which is the default, then the path of a platform-specific package located at `node_modules/@remotion/compositor-*` is selected.

This option is useful in environments where Remotion is not officially supported to run like bundled serverless functions or Electron.

### `--for-seamless-aac-concatenation` [v4.0.123](https://github.com/remotion-dev/remotion/releases/v4.0.123) [​](https://www.remotion.dev/docs/cli/render\#--for-seamless-aac-concatenation "Direct link to --for-seamless-aac-concatenation")

If enabled, the audio is trimmed to the nearest AAC frame, which is required for seamless concatenation of AAC files. This is a requirement if you later want to combine multiple video snippets seamlessly.

This option is used internally. There is currently no documentation yet for to concatenate the audio chunks.

### `--separate-audio-to` [v4.0.123](https://github.com/remotion-dev/remotion/releases/v4.0.123) [​](https://www.remotion.dev/docs/cli/render\#--separate-audio-to "Direct link to --separate-audio-to")

If set, the audio will not be included in the main output but rendered as a separate file at the location you pass. It is recommended to use an absolute path. If a relative path is passed, it is relative to the Remotion Root.

### `--metadata` [v4.0.216](https://github.com/remotion-dev/remotion/releases/v4.0.216) [​](https://www.remotion.dev/docs/cli/render\#--metadata "Direct link to --metadata")

Metadata to be embedded in the video. See [here](https://www.remotion.dev/docs/metadata) for which metadata is accepted.

The parameter must be in the format of `--metadata key=value` and can be passed multiple times.

### ~~`--ffmpeg-executable`~~ [​](https://www.remotion.dev/docs/cli/render\#--ffmpeg-executable "Direct link to --ffmpeg-executable")

_removed in v4.0_

[Set a custom `ffmpeg` executable](https://www.remotion.dev/docs/config#setffmpegexecutable). If not defined, a `ffmpeg` executable will be searched in `PATH`.

### ~~`--ffprobe-executable`~~ [v3.0.17](https://github.com/remotion-dev/remotion/releases/v3.0.17) [​](https://www.remotion.dev/docs/cli/render\#--ffprobe-executable- "Direct link to --ffprobe-executable-")

_removed in v4.0_

[Set a custom `ffprobe` executable](https://www.remotion.dev/docs/config#setffprobeexecutable). If not defined, a `ffprobe` executable will be searched in `PATH`.

- [Flags](https://www.remotion.dev/docs/cli/render#flags)
  - [`--props`](https://www.remotion.dev/docs/cli/render#--props)
  - [`--height`](https://www.remotion.dev/docs/cli/render#--height)
  - [`--width`](https://www.remotion.dev/docs/cli/render#--width)
  - [`--concurrency`](https://www.remotion.dev/docs/cli/render#--concurrency)
  - [`--pixel-format`](https://www.remotion.dev/docs/cli/render#--pixel-format)
  - [`--image-format`](https://www.remotion.dev/docs/cli/render#--image-format)
  - [`--image-sequence-pattern`](https://www.remotion.dev/docs/cli/render#--image-sequence-pattern-)
  - [`--config`](https://www.remotion.dev/docs/cli/render#--config)
  - [`--env-file`](https://www.remotion.dev/docs/cli/render#--env-file)
  - [`--jpeg-quality`](https://www.remotion.dev/docs/cli/render#--jpeg-quality)
  - [~~`--quality`~~](https://www.remotion.dev/docs/cli/render#--quality)
  - [`--output`](https://www.remotion.dev/docs/cli/render#--output-)
  - [`--overwrite`](https://www.remotion.dev/docs/cli/render#--overwrite)
  - [`--sequence`](https://www.remotion.dev/docs/cli/render#--sequence)
  - [`--codec`](https://www.remotion.dev/docs/cli/render#--codec)
  - [`--audio-codec`](https://www.remotion.dev/docs/cli/render#--audio-codec)
  - [`--audio-bitrate`](https://www.remotion.dev/docs/cli/render#--audio-bitrate)
  - [`--video-bitrate`](https://www.remotion.dev/docs/cli/render#--video-bitrate)
  - [`--buffer-size`](https://www.remotion.dev/docs/cli/render#--buffer-size)
  - [`--max-rate`](https://www.remotion.dev/docs/cli/render#--max-rate)
  - [`--prores-profile`](https://www.remotion.dev/docs/cli/render#--prores-profile)
  - [`--x264-preset`](https://www.remotion.dev/docs/cli/render#--x264-preset)
  - [`--crf`](https://www.remotion.dev/docs/cli/render#--crf)
  - [`--browser-executable`](https://www.remotion.dev/docs/cli/render#--browser-executable)
  - [`--chrome-mode`](https://www.remotion.dev/docs/cli/render#--chrome-mode)
  - [`--scale`](https://www.remotion.dev/docs/cli/render#--scale)
  - [`--frames`](https://www.remotion.dev/docs/cli/render#--frames)
  - [`--every-nth-frame`](https://www.remotion.dev/docs/cli/render#--every-nth-frame)
  - [`--muted`](https://www.remotion.dev/docs/cli/render#--muted)
  - [`--enforce-audio-track`](https://www.remotion.dev/docs/cli/render#--enforce-audio-track)
  - [`--disallow-parallel-encoding`](https://www.remotion.dev/docs/cli/render#--disallow-parallel-encoding)
  - [`--number-of-gif-loops`](https://www.remotion.dev/docs/cli/render#--number-of-gif-loops)
  - [`--color-space`](https://www.remotion.dev/docs/cli/render#--color-space)
  - [`--hardware-acceleration`](https://www.remotion.dev/docs/cli/render#--hardware-acceleration)
  - [`--bundle-cache`](https://www.remotion.dev/docs/cli/render#--bundle-cache)
  - [`--log`](https://www.remotion.dev/docs/cli/render#--log)
  - [`--port`](https://www.remotion.dev/docs/cli/render#--port)
  - [`--public-dir`](https://www.remotion.dev/docs/cli/render#--public-dir)
  - [`--timeout`](https://www.remotion.dev/docs/cli/render#--timeout)
  - [`--ignore-certificate-errors`](https://www.remotion.dev/docs/cli/render#--ignore-certificate-errors)
  - [`--disable-web-security`](https://www.remotion.dev/docs/cli/render#--disable-web-security)
  - [~~`--disable-headless`~~](https://www.remotion.dev/docs/cli/render#--disable-headless)
  - [`--gl`](https://www.remotion.dev/docs/cli/render#--gl)
  - [`--user-agent`](https://www.remotion.dev/docs/cli/render#--user-agent)
  - [`--offthreadvideo-cache-size-in-bytes`](https://www.remotion.dev/docs/cli/render#--offthreadvideo-cache-size-in-bytes)
  - [`--offthreadvideo-video-threads`](https://www.remotion.dev/docs/cli/render#--offthreadvideo-video-threads)
  - [`--enable-multiprocess-on-linux`](https://www.remotion.dev/docs/cli/render#--enable-multiprocess-on-linux)
  - [`--repro`](https://www.remotion.dev/docs/cli/render#--repro)
  - [`--binaries-directory`](https://www.remotion.dev/docs/cli/render#--binaries-directory)
  - [`--for-seamless-aac-concatenation`](https://www.remotion.dev/docs/cli/render#--for-seamless-aac-concatenation)
  - [`--separate-audio-to`](https://www.remotion.dev/docs/cli/render#--separate-audio-to)
  - [`--metadata`](https://www.remotion.dev/docs/cli/render#--metadata)
  - [~~`--ffmpeg-executable`~~](https://www.remotion.dev/docs/cli/render#--ffmpeg-executable)
  - [~~`--ffprobe-executable`~~](https://www.remotion.dev/docs/cli/render#--ffprobe-executable-)

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