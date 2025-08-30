[Skip to main content](https://www.remotion.dev/docs/lambda/cli/render#__docusaurus_skipToContent_fallback)

On this page

Using the `npx remotion lambda render` command, you can render a video in the cloud.

The structure of a command is as follows:

```

npx remotion lambda render <serve-url> [<composition-id>] [<output-location>]
```

Arguments:

- Obtain a [Serve URL](https://www.remotion.dev/docs/terminology/serve-url) using the [`sites create`](https://www.remotion.dev/docs/lambda/cli/sites/create) command or by calling [`deploySite()`](https://www.remotion.dev/docs/lambda/deploysite).
- The [Composition ID](https://www.remotion.dev/docs/terminology/composition#composition-id). If not specified, the list of compositions will be fetched and you can choose a composition.
- The `output-location` parameter is optional. If you don't specify it, the video is stored in your S3 bucket. If you specify a location, it gets downloaded to your device in an additional step.

## Example commands [​](https://www.remotion.dev/docs/lambda/cli/render\#example-commands "Direct link to Example commands")

Rendering a video:

```

npx remotion lambda render https://remotionlambda-abcdef.s3.eu-central-1.amazonaws.com/sites/testbed/index.html my-comp
```

Rendering a video and saving it to `out/video.mp4`:

```

npx remotion lambda render https://remotionlambda-abcdef.s3.eu-central-1.amazonaws.com/sites/testbed/index.html my-comp out/video.mp4
```

Using the shorthand serve URL:

```

npx remotion lambda render testbed my-comp
```

info

If you are using the shorthand serve URL, you have to pass a composition ID. Available compositions can only be fetched if a complete serve URL is passed.

Passing in input props:

```

npx remotion lambda render --props='{"hi": "there"}' testbed my-comp
```

Printing debug information including a CloudWatch link:

```

npx remotion lambda render --log=verbose testbed my-comp
```

Keeping the output video private:

```

npx remotion lambda render --privacy=private testbed my-comp
```

Rendering only the audio:

```

npx remotion lambda render --codec=mp3 testbed my-comp
```

## Flags [​](https://www.remotion.dev/docs/lambda/cli/render\#flags "Direct link to Flags")

### `--region` [​](https://www.remotion.dev/docs/lambda/cli/render\#--region "Direct link to --region")

The [AWS region](https://www.remotion.dev/docs/lambda/region-selection) to select. Both project and function should be in this region.

### `--props` [​](https://www.remotion.dev/docs/lambda/cli/render\#--props "Direct link to --props")

[Input Props to pass to the selected composition of your video.](https://www.remotion.dev/docs/passing-props#passing-input-props-in-the-cli).

Must be a serialized JSON string ( `--props='{"hello": "world"}'`) or a path to a JSON file ( `./path/to/props.json`).

From the root component the props can be read using [`getInputProps()`](https://www.remotion.dev/docs/get-input-props).

You may transform input props using [`calculateMetadata()`](https://www.remotion.dev/docs/calculate-metadata).

note

Inline JSON string isn't supported on Windows shells because it removes the `"` character, use a file name instead.

### `--log` [​](https://www.remotion.dev/docs/lambda/cli/render\#--log "Direct link to --log")

Log level to be used inside the Lambda function. Also, if you set it to `verbose`, a link to CloudWatch will be printed where you can inspect logs.

### `--privacy` [​](https://www.remotion.dev/docs/lambda/cli/render\#--privacy "Direct link to --privacy")

One of:

- `"public"` ( _default_): The rendered media is publicly accessible under the S3 URL.
- `"private"`: The rendered media is not publicly available, but signed links can be created using [presignUrl()](https://www.remotion.dev/docs/lambda/presignurl).
- `"no-acl"` ( _available from v.3.1.7_): The ACL option is not being set at all, this option is useful if you are writing to another bucket that does not support ACL using [`outName`](https://www.remotion.dev/docs/lambda/cli/render#--out-name).

### `--max-retries` [​](https://www.remotion.dev/docs/lambda/cli/render\#--max-retries "Direct link to --max-retries")

How many times a single chunk is being retried if it fails to render. Default `1`.

### `--frames-per-lambda` [​](https://www.remotion.dev/docs/lambda/cli/render\#--frames-per-lambda "Direct link to --frames-per-lambda")

How many frames should be rendered in a single Lambda function. Increase it to require less Lambda functions to render the video, decrease it to make the render faster.

Default value: [Dependant on video length](https://www.remotion.dev/docs/lambda/concurrency)

Minimum value: `4`

note

The `framesPerLambda` parameter cannot result in more than 200 functions being spawned. See: [Concurrency](https://www.remotion.dev/docs/lambda/concurrency)

### `--concurrency` [v4.0.322](https://github.com/remotion-dev/remotion/releases/v4.0.322) [​](https://www.remotion.dev/docs/lambda/cli/render\#--concurrency "Direct link to --concurrency")

Specify the number of Lambda functions to use for rendering. This is an alternative to `--frames-per-lambda` that allows you to set the concurrency directly without needing to know the video duration.

The concurrency is defined as `frameCount / framesPerLambda`. Remotion will automatically calculate the appropriate `framesPerLambda` value based on your concurrency setting.

Maximum value: 200

Minimum value: Depends on video length (must result in `framesPerLambda >= 4`)

note

Cannot be used together with `--frames-per-lambda`. Use only one of them.

### `--concurrency-per-lambda` [v3.0.30](https://github.com/remotion-dev/remotion/releases/v3.0.30) [​](https://www.remotion.dev/docs/lambda/cli/render\#--concurrency-per-lambda "Direct link to --concurrency-per-lambda")

By default, each Lambda function renders with concurrency 1 (one open browser tab). You may use the option to customize this value.

### `--jpeg-quality` [​](https://www.remotion.dev/docs/lambda/cli/render\#--jpeg-quality "Direct link to --jpeg-quality")

[Value between 0 and 100 for JPEG rendering quality](https://www.remotion.dev/docs/config#setjpegquality). Doesn't work when PNG frames are rendered.

### ~~`--quality`~~ [​](https://www.remotion.dev/docs/lambda/cli/render\#--quality "Direct link to --quality")

Renamed to `jpegQuality` in `v4.0.0`.

### `--muted` [v3.2.1](https://github.com/remotion-dev/remotion/releases/v3.2.1) [​](https://www.remotion.dev/docs/lambda/cli/render\#--muted "Direct link to --muted")

[Disables audio output.](https://www.remotion.dev/docs/cli/render#--muted) This option may only be used when rendering a video.

### `--codec` [​](https://www.remotion.dev/docs/lambda/cli/render\#--codec "Direct link to --codec")

[`h264` or `h265` (supported since v4.0.32) or `png` or `vp8` or `mp3` or `aac` or `wav` or `prores`](https://www.remotion.dev/docs/config#setcodec). If you don't supply `--codec`, it will use `h264`.

### `--audio-codec` [v3.3.42](https://github.com/remotion-dev/remotion/releases/v3.3.42) [​](https://www.remotion.dev/docs/lambda/cli/render\#--audio-codec "Direct link to --audio-codec")

Set the format of the audio that is embedded in the video. Not all codec and audio codec combinations are supported and certain combinations require a certain file extension and container format. See the table in the docs to see possible combinations.

### `--audio-bitrate` [v3.2.32](https://github.com/remotion-dev/remotion/releases/v3.2.32) [​](https://www.remotion.dev/docs/lambda/cli/render\#--audio-bitrate "Direct link to --audio-bitrate")

Specify the target bitrate for the generated video. The syntax for FFmpeg's `-b:a` parameter should be used. FFmpeg may encode the video in a way that will not result in the exact audio bitrate specified. Example values: `512K` for 512 kbps, `1M` for 1 Mbps. Default: `320k`

### `--video-bitrate` [v3.2.32](https://github.com/remotion-dev/remotion/releases/v3.2.32) [​](https://www.remotion.dev/docs/lambda/cli/render\#--video-bitrate "Direct link to --video-bitrate")

Specify the target bitrate for the generated video. The syntax for FFmpeg's `-b:v` parameter should be used. FFmpeg may encode the video in a way that will not result in the exact video bitrate specified. Example values: `512K` for 512 kbps, `1M` for 1 Mbps.

### `--prores-profile` [​](https://www.remotion.dev/docs/lambda/cli/render\#--prores-profile "Direct link to --prores-profile")

[Set the ProRes profile](https://www.remotion.dev/docs/config#setproresprofile). This option is only valid if the [`codec`](https://www.remotion.dev/docs/lambda/cli/render#--codec) has been set to `prores`. Possible values: `4444-xq`, `4444`, `hq`, `standard`, `light`, `proxy`. See [here](https://video.stackexchange.com/a/14715) for explanation of possible values. Default: `hq`.

### `--x264-preset` [​](https://www.remotion.dev/docs/lambda/cli/render\#--x264-preset "Direct link to --x264-preset")

Sets a x264 preset profile. Only applies to videos rendered with `h264` codec.

Possible values: `superfast`, `veryfast`, `faster`, `fast`, `medium`, `slow`, `slower`, `veryslow`, `placebo`.

Default: `medium`

### `--crf` [​](https://www.remotion.dev/docs/lambda/cli/render\#--crf "Direct link to --crf")

[To set Constant Rate Factor (CRF) of the output](https://www.remotion.dev/docs/config#setcrf). Minimum 0. Use this rate control mode if you want to keep the best quality and care less about the file size.

### `--pixel-format` [​](https://www.remotion.dev/docs/lambda/cli/render\#--pixel-format "Direct link to --pixel-format")

[Set a custom pixel format. See here for available values.](https://www.remotion.dev/docs/config#setpixelformat)

### `--image-format` [​](https://www.remotion.dev/docs/lambda/cli/render\#--image-format "Direct link to --image-format")

[`jpeg` or `png` \- JPEG is faster, but doesn't support transparency.](https://www.remotion.dev/docs/config#setvideoimageformat) The default image format is `jpeg`.

### `--scale` [​](https://www.remotion.dev/docs/lambda/cli/render\#--scale "Direct link to --scale")

[Scales the output frames by the factor you pass in.](https://www.remotion.dev/docs/scaling) For example, a 1280x720px frame will become a 1920x1080px frame with a scale factor of `1.5`. Vector elements like fonts and HTML markups will be rendered with extra details.

### `--env-file` [​](https://www.remotion.dev/docs/lambda/cli/render\#--env-file "Direct link to --env-file")

Specify a location for a dotenv file - Default `.env`. [Read about how environment variables work in Remotion.](https://www.remotion.dev/docs/env-variables)

### `--frames` [​](https://www.remotion.dev/docs/lambda/cli/render\#--frames "Direct link to --frames")

[Render a subset of a video](https://www.remotion.dev/docs/config#setframerange). Example: `--frames=0-9` to select the first 10 frames. To render a still, use the [`still`](https://www.remotion.dev/docs/lambda/cli/still) command.

### `--every-nth-frame` [v3.1.0](https://github.com/remotion-dev/remotion/releases/v3.1.0) [​](https://www.remotion.dev/docs/lambda/cli/render\#--every-nth-frame "Direct link to --every-nth-frame")

[Render only every nth frame.](https://www.remotion.dev/docs/config#seteverynthframe) This option may only be set when rendering GIFs. This allows you to lower the FPS of the GIF.

For example only every second frame, every third frame and so on. Only works for rendering GIFs. [See here for more details.](https://www.remotion.dev/docs/render-as-gif)

### `--number-of-gif-loops` [v3.1.0](https://github.com/remotion-dev/remotion/releases/v3.1.0) [​](https://www.remotion.dev/docs/lambda/cli/render\#--number-of-gif-loops "Direct link to --number-of-gif-loops")

Allows you to set the number of loops as follows:

- `null` (or omitting in the CLI) plays the GIF indefinitely.
- `0` disables looping
- `1` loops the GIF once (plays twice in total)
- `2` loops the GIF twice (plays three times in total) and so on.

### `--timeout` [​](https://www.remotion.dev/docs/lambda/cli/render\#--timeout "Direct link to --timeout")

A number describing how long the render may take to resolve all [`delayRender()`](https://www.remotion.dev/docs/delay-render) calls [before it times out](https://www.remotion.dev/docs/timeout). Default: `30000`

### `--out-name` [​](https://www.remotion.dev/docs/lambda/cli/render\#--out-name "Direct link to --out-name")

The file name of the media output as stored in the S3 bucket. By default, it is `out` plus the appropriate file extension, for example: `out.mp4`. Must match `/([0-9a-zA-Z-!_.*'()/]+)/g`.

### `--overwrite` [v3.2.25](https://github.com/remotion-dev/remotion/releases/v3.2.25) [​](https://www.remotion.dev/docs/lambda/cli/render\#--overwrite "Direct link to --overwrite")

If a custom out name is specified and a file already exists at this key in the S3 bucket, decide whether that file will be deleted before the render begins. Default `false`.

An existing file at the output S3 key will conflict with the render and must be deleted beforehand. If this setting is `false` and a conflict occurs, an error will be thrown.

### `--webhook` [v3.2.30](https://github.com/remotion-dev/remotion/releases/v3.2.30) [​](https://www.remotion.dev/docs/lambda/cli/render\#--webhook "Direct link to --webhook")

Sets a webhook to be called when the render finishes or fails. [`renderMediaOnLambda() -> webhook.url`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#webhook). To be used together with `--webhook-secret`.

### `--webhook-secret` [v3.2.30](https://github.com/remotion-dev/remotion/releases/v3.2.30) [​](https://www.remotion.dev/docs/lambda/cli/render\#--webhook-secret "Direct link to --webhook-secret")

Sets a webhook secret for the webhook (see above). [`renderMediaOnLambda() -> webhook.secret`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#webhook). To be used together with `--webhook`.

### `--height` [v3.2.40](https://github.com/remotion-dev/remotion/releases/v3.2.40) [​](https://www.remotion.dev/docs/lambda/cli/render\#--height "Direct link to --height")

[Overrides composition height.](https://www.remotion.dev/docs/config#overrideheight)

### `--width` [v3.2.40](https://github.com/remotion-dev/remotion/releases/v3.2.40) [​](https://www.remotion.dev/docs/lambda/cli/render\#--width "Direct link to --width")

[Overrides composition width.](https://www.remotion.dev/docs/config#overridewidth)

### `--function-name` [v3.3.38](https://github.com/remotion-dev/remotion/releases/v3.3.38) [​](https://www.remotion.dev/docs/lambda/cli/render\#--function-name "Direct link to --function-name")

Specify the name of the function which should be used to invoke and orchestrate the render. You only need to pass it if there are multiple functions with different configurations.

### `--renderer-function-name` [v3.3.38](https://github.com/remotion-dev/remotion/releases/v3.3.38) [​](https://www.remotion.dev/docs/lambda/cli/render\#--renderer-function-name "Direct link to --renderer-function-name")

If specified, this function will be used for rendering the individual chunks. This is useful if you want to use a function with higher or lower power for rendering the chunks than the main orchestration function.

If you want to use this option, the function must be in the same region, the same account and have the same version as the main function.

### `--force-bucket-name` [v3.3.42](https://github.com/remotion-dev/remotion/releases/v3.3.42) [​](https://www.remotion.dev/docs/lambda/cli/render\#--force-bucket-name "Direct link to --force-bucket-name")

Specify a specific bucket name to be used. [This is not recommended](https://www.remotion.dev/docs/lambda/multiple-buckets), instead let Remotion discover the right bucket automatically.

### `--ignore-certificate-errors` [​](https://www.remotion.dev/docs/lambda/cli/render\#--ignore-certificate-errors "Direct link to --ignore-certificate-errors")

Results in invalid SSL certificates in Chrome, such as self-signed ones, being ignored.

### `--disable-web-security` [​](https://www.remotion.dev/docs/lambda/cli/render\#--disable-web-security "Direct link to --disable-web-security")

This will most notably disable CORS in Chrome among other security features.

### `--gl` [​](https://www.remotion.dev/docs/lambda/cli/render\#--gl "Direct link to --gl")

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

### `--user-agent` [v3.3.83](https://github.com/remotion-dev/remotion/releases/v3.3.83) [​](https://www.remotion.dev/docs/lambda/cli/render\#--user-agent "Direct link to --user-agent")

Lets you set a custom user agent that the headless Chrome browser assumes.

### `--offthreadvideo-cache-size-in-bytes` [v4.0.23](https://github.com/remotion-dev/remotion/releases/v4.0.23) [​](https://www.remotion.dev/docs/lambda/cli/render\#--offthreadvideo-cache-size-in-bytes "Direct link to --offthreadvideo-cache-size-in-bytes")

From v4.0, Remotion has a cache for [`<OffthreadVideo>`](https://remotion.dev/docs/offthreadvideo) frames. The default is `null`, corresponding to half of the system memory available when the render starts.

This option allows to override the size of the cache. The higher it is, the faster the render will be, but the more memory will be used.

The used value will be printed when running in verbose mode.

Default: `null`

### `--offthreadvideo-video-threads` [v4.0.261](https://github.com/remotion-dev/remotion/releases/v4.0.261) [​](https://www.remotion.dev/docs/lambda/cli/render\#--offthreadvideo-video-threads "Direct link to --offthreadvideo-video-threads")

The number of threads that [`<OffthreadVideo>`](https://remotion.dev/docs/offthreadvideo) can start to extract frames. The default is2. Increase carefully, as too many threads may cause instability.

### `--delete-after` [v4.0.32](https://github.com/remotion-dev/remotion/releases/v4.0.32) [​](https://www.remotion.dev/docs/lambda/cli/render\#--delete-after "Direct link to --delete-after")

Automatically delete the render after a certain period. Accepted values are `1-day`, `3-days`, `7-days` and `30-days`.

For this to work, your bucket needs to have [lifecycles enabled](https://www.remotion.dev/docs/lambda/autodelete).

### `--webhook-custom-data` [v4.0.25](https://github.com/remotion-dev/remotion/releases/v4.0.25) [​](https://www.remotion.dev/docs/lambda/cli/render\#--webhook-custom-data "Direct link to --webhook-custom-data")

Pass up to 1,024 bytes of a JSON-serializable object to the webhook. This data will be included in the webhook payload.Alternatively, pass a file path pointing to a JSON file

### `--color-space` [v4.0.28](https://github.com/remotion-dev/remotion/releases/v4.0.28) [​](https://www.remotion.dev/docs/lambda/cli/render\#--color-space "Direct link to --color-space")

Color space to use for the video. Acceptable values: `"default"`(default since 5.0), `"bt709"`(since v4.0.28), `"bt2020-ncl"`(since v4.0.88), `"bt2020-cl"`(since v4.0.88), .

For best color accuracy, it is recommended to also use `"png"` as the image format to have accurate color transformations throughout.

Only since v4.0.83, colorspace conversion is actually performed, previously it would only tag the metadata of the video.

### `--prefer-lossless` [v4.0.110](https://github.com/remotion-dev/remotion/releases/v4.0.110) [​](https://www.remotion.dev/docs/lambda/cli/render\#--prefer-lossless "Direct link to --prefer-lossless")

Uses a lossless audio codec, if one is available for the codec. If you set `audioCodec`, it takes priority over `preferLossless`.

### `--metadata` [v4.0.216](https://github.com/remotion-dev/remotion/releases/v4.0.216) [​](https://www.remotion.dev/docs/lambda/cli/render\#--metadata "Direct link to --metadata")

Metadata to be embedded in the video. See [here](https://www.remotion.dev/docs/metadata) for which metadata is accepted.

The parameter must be in the format of `--metadata key=value` and can be passed multiple times.

### `--force-path-style` [v4.0.202](https://github.com/remotion-dev/remotion/releases/v4.0.202) [​](https://www.remotion.dev/docs/lambda/cli/render\#--force-path-style "Direct link to --force-path-style")

Passes `forcePathStyle` to the AWS S3 client. If you don't know what this is, you probably don't need it.

### `--api-Key` [v4.0.253](https://github.com/remotion-dev/remotion/releases/v4.0.253) [​](https://www.remotion.dev/docs/lambda/cli/render\#--api-key "Direct link to --api-key")

API key for sending a usage event using `@remotion/licensing`.

### `--storage-class` [v4.0.305](https://github.com/remotion-dev/remotion/releases/v4.0.305) [​](https://www.remotion.dev/docs/lambda/cli/render\#--storage-class "Direct link to --storage-class")

An [identifier](https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html#sc-compare) for the S3 storage class of the rendered media. Default: `undefined` (which is `STANDARD`).

- [Example commands](https://www.remotion.dev/docs/lambda/cli/render#example-commands)
- [Flags](https://www.remotion.dev/docs/lambda/cli/render#flags)
  - [`--region`](https://www.remotion.dev/docs/lambda/cli/render#--region)
  - [`--props`](https://www.remotion.dev/docs/lambda/cli/render#--props)
  - [`--log`](https://www.remotion.dev/docs/lambda/cli/render#--log)
  - [`--privacy`](https://www.remotion.dev/docs/lambda/cli/render#--privacy)
  - [`--max-retries`](https://www.remotion.dev/docs/lambda/cli/render#--max-retries)
  - [`--frames-per-lambda`](https://www.remotion.dev/docs/lambda/cli/render#--frames-per-lambda)
  - [`--concurrency`](https://www.remotion.dev/docs/lambda/cli/render#--concurrency)
  - [`--concurrency-per-lambda`](https://www.remotion.dev/docs/lambda/cli/render#--concurrency-per-lambda)
  - [`--jpeg-quality`](https://www.remotion.dev/docs/lambda/cli/render#--jpeg-quality)
  - [~~`--quality`~~](https://www.remotion.dev/docs/lambda/cli/render#--quality)
  - [`--muted`](https://www.remotion.dev/docs/lambda/cli/render#--muted)
  - [`--codec`](https://www.remotion.dev/docs/lambda/cli/render#--codec)
  - [`--audio-codec`](https://www.remotion.dev/docs/lambda/cli/render#--audio-codec)
  - [`--audio-bitrate`](https://www.remotion.dev/docs/lambda/cli/render#--audio-bitrate)
  - [`--video-bitrate`](https://www.remotion.dev/docs/lambda/cli/render#--video-bitrate)
  - [`--prores-profile`](https://www.remotion.dev/docs/lambda/cli/render#--prores-profile)
  - [`--x264-preset`](https://www.remotion.dev/docs/lambda/cli/render#--x264-preset)
  - [`--crf`](https://www.remotion.dev/docs/lambda/cli/render#--crf)
  - [`--pixel-format`](https://www.remotion.dev/docs/lambda/cli/render#--pixel-format)
  - [`--image-format`](https://www.remotion.dev/docs/lambda/cli/render#--image-format)
  - [`--scale`](https://www.remotion.dev/docs/lambda/cli/render#--scale)
  - [`--env-file`](https://www.remotion.dev/docs/lambda/cli/render#--env-file)
  - [`--frames`](https://www.remotion.dev/docs/lambda/cli/render#--frames)
  - [`--every-nth-frame`](https://www.remotion.dev/docs/lambda/cli/render#--every-nth-frame)
  - [`--number-of-gif-loops`](https://www.remotion.dev/docs/lambda/cli/render#--number-of-gif-loops)
  - [`--timeout`](https://www.remotion.dev/docs/lambda/cli/render#--timeout)
  - [`--out-name`](https://www.remotion.dev/docs/lambda/cli/render#--out-name)
  - [`--overwrite`](https://www.remotion.dev/docs/lambda/cli/render#--overwrite)
  - [`--webhook`](https://www.remotion.dev/docs/lambda/cli/render#--webhook)
  - [`--webhook-secret`](https://www.remotion.dev/docs/lambda/cli/render#--webhook-secret)
  - [`--height`](https://www.remotion.dev/docs/lambda/cli/render#--height)
  - [`--width`](https://www.remotion.dev/docs/lambda/cli/render#--width)
  - [`--function-name`](https://www.remotion.dev/docs/lambda/cli/render#--function-name)
  - [`--renderer-function-name`](https://www.remotion.dev/docs/lambda/cli/render#--renderer-function-name)
  - [`--force-bucket-name`](https://www.remotion.dev/docs/lambda/cli/render#--force-bucket-name)
  - [`--ignore-certificate-errors`](https://www.remotion.dev/docs/lambda/cli/render#--ignore-certificate-errors)
  - [`--disable-web-security`](https://www.remotion.dev/docs/lambda/cli/render#--disable-web-security)
  - [`--gl`](https://www.remotion.dev/docs/lambda/cli/render#--gl)
  - [`--user-agent`](https://www.remotion.dev/docs/lambda/cli/render#--user-agent)
  - [`--offthreadvideo-cache-size-in-bytes`](https://www.remotion.dev/docs/lambda/cli/render#--offthreadvideo-cache-size-in-bytes)
  - [`--offthreadvideo-video-threads`](https://www.remotion.dev/docs/lambda/cli/render#--offthreadvideo-video-threads)
  - [`--delete-after`](https://www.remotion.dev/docs/lambda/cli/render#--delete-after)
  - [`--webhook-custom-data`](https://www.remotion.dev/docs/lambda/cli/render#--webhook-custom-data)
  - [`--color-space`](https://www.remotion.dev/docs/lambda/cli/render#--color-space)
  - [`--prefer-lossless`](https://www.remotion.dev/docs/lambda/cli/render#--prefer-lossless)
  - [`--metadata`](https://www.remotion.dev/docs/lambda/cli/render#--metadata)
  - [`--force-path-style`](https://www.remotion.dev/docs/lambda/cli/render#--force-path-style)
  - [`--api-Key`](https://www.remotion.dev/docs/lambda/cli/render#--api-key)
  - [`--storage-class`](https://www.remotion.dev/docs/lambda/cli/render#--storage-class)

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