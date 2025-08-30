[Skip to main content](https://www.remotion.dev/docs/lambda/rendermediaonlambda#__docusaurus_skipToContent_fallback)

On this page

Kicks off a render process on Remotion Lambda. The progress can be tracked using [getRenderProgress()](https://www.remotion.dev/docs/lambda/getrenderprogress).

Requires a [function](https://www.remotion.dev/docs/lambda/deployfunction) to already be deployed to execute the render.

A [site](https://www.remotion.dev/docs/lambda/deploysite) or a [Serve URL](https://www.remotion.dev/docs/terminology/serve-url) needs to be specified to determine what will be rendered.

## Example [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#example "Direct link to Example")

```

tsx

import {renderMediaOnLambda} from '@remotion/lambda/client';

const {bucketName, renderId} = await renderMediaOnLambda({
  region: 'us-east-1',
  functionName: 'remotion-render-bds9aab',
  composition: 'MyVideo',
  serveUrl: 'https://remotionlambda-qg35eyp1s1.s3.eu-central-1.amazonaws.com/sites/bf2jrbfkw',
  codec: 'h264',
});
```

note

Preferrably import this function from `@remotion/lambda/client` to avoid problems [inside serverless functions](https://www.remotion.dev/docs/lambda/light-client).

## Arguments [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#arguments "Direct link to Arguments")

An object with the following properties:

### `region` [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#region "Direct link to region")

In which region your Lambda function is deployed. It's highly recommended that your Remotion site is also in the same region.

### `privacy` [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#privacy "Direct link to privacy")

_optional since v3.2.27_

One of:

- `"public"` ( _default_): The rendered media is publicly accessible under the S3 URL.
- `"private"`: The rendered media is not publicly available, but signed links can be created using [presignUrl()](https://www.remotion.dev/docs/lambda/presignurl).
- `"no-acl"` ( _available from v.3.1.7_): The ACL option is not being set at all, this option is useful if you are writing to another bucket that does not support ACL using [`outName`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#outname).

### `functionName` [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#functionname "Direct link to functionname")

The name of the deployed Lambda function.
Use [`deployFunction()`](https://www.remotion.dev/docs/lambda/deployfunction) to create a new function and [`getFunctions()`](https://www.remotion.dev/docs/lambda/getfunctions) to obtain currently deployed Lambdas.

### `framesPerLambda?` [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#framesperlambda "Direct link to framesperlambda")

_optional_

The video rendering process gets distributed across multiple Lambda functions. This setting controls how many frames are rendered per Lambda invocation. The lower the number you pass, the more Lambdas get spawned.

Default value: [Dependant on video length](https://www.remotion.dev/docs/lambda/concurrency)

Minimum value: `4`

note

The `framesPerLambda` parameter cannot result in more than 200 functions being spawned. See: [Concurrency](https://www.remotion.dev/docs/lambda/concurrency)

### `concurrency?` [v4.0.322](https://github.com/remotion-dev/remotion/releases/v4.0.322) [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#concurrency "Direct link to concurrency")

_optional_

Specify the number of Lambda functions to use for rendering. This is an alternative to `framesPerLambda` that allows you to set the concurrency directly without needing to know the video duration.

The concurrency is defined as `frameCount / framesPerLambda`. Remotion will automatically calculate the appropriate `framesPerLambda` value based on your concurrency setting.

Maximum value: 200

Minimum value: Depends on video length (must result in `framesPerLambda >= 4`)

note

Cannot be used together with `framesPerLambda`. Use only one of them.

### `frameRange?` [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#framerange "Direct link to framerange")

_number \| \[number, number\] - optional_

Specify a single frame (passing a `number`) or a range of frames (passing a tuple `[number, number]`) to render a subset of a video. Example: `[0, 9]` to select the first 10 frames. By passing `null` (default) all frames of a composition get rendered. To render a still, use [`renderStillOnLambda()`](https://www.remotion.dev/docs/lambda/renderstillonlambda).

### `serveUrl` [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#serveurl "Direct link to serveurl")

A URL pointing to a Remotion project. Use [`deploySite()`](https://www.remotion.dev/docs/lambda/deploysite) to deploy a Remotion project.

### `composition` [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#composition "Direct link to composition")

The `id` of the [composition](https://www.remotion.dev/docs/composition) you want to render.

### `metadata` [v4.0.216](https://github.com/remotion-dev/remotion/releases/v4.0.216) [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#metadata "Direct link to metadata")

_object - optional_

An object containing metadata to be embedded in the video. See [here](https://www.remotion.dev/docs/metadata) for which metadata is accepted.

### `inputProps` [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#inputprops "Direct link to inputprops")

_optional since v3.2.27_

[Input Props to pass to the selected composition of your video.](https://www.remotion.dev/docs/passing-props#passing-input-props-in-the-cli).

Must be a JSON object.

From the root component the props can be read using [`getInputProps()`](https://www.remotion.dev/docs/get-input-props).

You may transform input props using [`calculateMetadata()`](https://www.remotion.dev/docs/calculate-metadata).

### `codec` [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#codec "Direct link to codec")

Which codec should be used to encode the video.

Video codecs `h264`, and `vp8` are supported, `prores` is supported since `v3.2.0`. `h265` support has been added in `v4.0.32`.

Audio codecs `mp3`, `aac` and `wav` are also supported.

The option `h264-mkv` has been renamed to just `h264` since `v3.3.34`. Use `h264` to get the same behavior.

See also [`renderMedia() -> codec`](https://www.remotion.dev/docs/renderer/render-media#codec).

### `audioCodec?` [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#audiocodec "Direct link to audiocodec")

_optional_ _"pcm-16" \| "aac" \| "mp3" \| "opus", available from v3.3.41_

Choose the encoding of your audio.

- Each Lambda chunk might actually choose an uncompressed codec and convert it in the final encoding stage to prevent audio artifacts.
- The default is dependent on the chosen `codec`.
- Choose `pcm-16` if you need uncompressed audio.
- Not all video containers support all audio codecs.
- This option takes precedence if the `codec` option also specifies an audio codec.

Refer to the [Encoding guide](https://www.remotion.dev/docs/encoding/#audio-codec) to see defaults and supported combinations.

### `forceHeight?` [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#forceheight "Direct link to forceheight")

_optional, available from v3.2.40_

Overrides default composition height.

### `forceWidth?` [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#forcewidth "Direct link to forcewidth")

_optional, available from v3.2.40_

Overrides default composition width.

### `muted?` [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#muted "Direct link to muted")

_optional_

Disables audio output. See also [`renderMedia() -> muted`](https://www.remotion.dev/docs/renderer/render-media#muted).

### `imageFormat` [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#imageformat "Direct link to imageformat")

_optional since v3.2.27_

See [`renderMedia() -> imageFormat`](https://www.remotion.dev/docs/renderer/render-media#imageformat).

### `crf?` [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#crf "Direct link to crf")

_optional_

See [`renderMedia() -> crf`](https://www.remotion.dev/docs/renderer/render-media#crf).

### `envVariables?` [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#envvariables "Direct link to envvariables")

_optional_

See [`renderMedia() -> envVariables`](https://www.remotion.dev/docs/renderer/render-media#envvariables).

### `pixelFormat?` [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#pixelformat "Direct link to pixelformat")

_optional_

See [`renderMedia() -> pixelFormat`](https://www.remotion.dev/docs/renderer/render-media#pixelformat).

### `proResProfile?` [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#proresprofile "Direct link to proresprofile")

_optional_

See [`renderMedia() -> proResProfile`](https://www.remotion.dev/docs/renderer/render-media#proresprofile).

### `x264Preset?` [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#x264preset "Direct link to x264preset")

_optional_

Sets a x264 preset profile. Only applies to videos rendered with `h264` codec.

Possible values: `superfast`, `veryfast`, `faster`, `fast`, `medium`, `slow`, `slower`, `veryslow`, `placebo`.

Default: `medium`

### `jpegQuality` [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#jpegquality "Direct link to jpegquality")

See [`renderMedia() -> jpegQuality`](https://www.remotion.dev/docs/renderer/render-media#jpegquality).

### ~~`quality`~~ [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#quality "Direct link to quality")

Renamed to `jpegQuality` in v4.0.0.

### `audioBitrate?` [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#audiobitrate "Direct link to audiobitrate")

_optional_

Specify the target bitrate for the generated video. The syntax for FFmpeg's `-b:a` parameter should be used. FFmpeg may encode the video in a way that will not result in the exact audio bitrate specified. Example values: `512K` for 512 kbps, `1M` for 1 Mbps. Default: `320k`

### `videoBitrate?` [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#videobitrate "Direct link to videobitrate")

_optional_

Specify the target bitrate for the generated video. The syntax for FFmpeg's `-b:v` parameter should be used. FFmpeg may encode the video in a way that will not result in the exact video bitrate specified. Example values: `512K` for 512 kbps, `1M` for 1 Mbps.

### `bufferSize?` [v4.0.78](https://github.com/remotion-dev/remotion/releases/v4.0.78) [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#buffersize "Direct link to buffersize")

The value for the `-bufsize` flag of FFmpeg. Should be used in conjunction with the encoding max rate flag.

### `maxRate?` [v4.0.78](https://github.com/remotion-dev/remotion/releases/v4.0.78) [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#maxrate "Direct link to maxrate")

The value for the `-maxrate` flag of FFmpeg. Should be used in conjunction with the encoding buffer size flag.

### `maxRetries` [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#maxretries "Direct link to maxretries")

_optional since v3.2.27, default `1`_

How often a chunk may be retried to render in case the render fails.
If a rendering of a chunk is failed, the error will be reported in the [`getRenderProgress()`](https://www.remotion.dev/docs/lambda/getrenderprogress) object and retried up to as many times as you specify using this option.

note

A retry only gets executed if a the error is in the [list of flaky errors](https://github.com/remotion-dev/remotion/blob/main/packages/lambda-client/src/is-flaky-error.ts).

### `scale?` [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#scale "Direct link to scale")

_optional_

Scales the output dimensions by a factor. See [Scaling](https://www.remotion.dev/docs/scaling) to learn more about this feature.

### `outName?` [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#outname "Direct link to outname")

_optional_

The file name of the media output.

It can either be:

- `undefined` \- it will default to `out` plus the appropriate file extension, for example: `renders/${renderId}/out.mp4`.
- A `string` \- it will get saved to the same S3 bucket as your site under the key `renders/{renderId}/{outName}`. Make sure to include the file extension at the end of the string.
- An object if you want to render to a different bucket or cloud provider - [see here for detailed instructions](https://www.remotion.dev/docs/lambda/custom-destination).

### `timeoutInMilliseconds?` [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#timeoutinmilliseconds "Direct link to timeoutinmilliseconds")

_optional_

A number describing how long the render may take to resolve all [`delayRender()`](https://www.remotion.dev/docs/delay-render) calls [before it times out](https://www.remotion.dev/docs/timeout). Default: `30000`

### `concurrencyPerLambda?` [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#concurrencyperlambda "Direct link to concurrencyperlambda")

_optional, available from v3.0.30_

By default, each Lambda function renders with concurrency 1 (one open browser tab). You may use the option to customize this value.

### `everyNthFrame?` [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#everynthframe "Direct link to everynthframe")

_optional, available from v3.1_

Renders only every nth frame. For example only every second frame, every third frame and so on. Only works for rendering GIFs. [See here for more details.](https://www.remotion.dev/docs/render-as-gif)

### `numberOfGifLoops?` [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#numberofgifloops "Direct link to numberofgifloops")

_optional, available since v3.1_

Allows you to set the number of loops as follows:

- `null` (or omitting in the CLI) plays the GIF indefinitely.
- `0` disables looping
- `1` loops the GIF once (plays twice in total)
- `2` loops the GIF twice (plays three times in total) and so on.

### `downloadBehavior?` [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#downloadbehavior "Direct link to downloadbehavior")

_optional, available since v3.1.5_

How the output file should behave when accessed through the S3 output link in the browser.

Either:

- `{"type": "play-in-browser"}` \- the default. The video will play in the browser.
- `{"type": "download", fileName: null}` or `{"type": "download", fileName: "download.mp4"}` \- a `Content-Disposition` header will be added which makes the browser download the file. You can optionally override the filename.

### `chromiumOptions?` [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#chromiumoptions "Direct link to chromiumoptions")

Allows you to set certain Chromium / Google Chrome flags. See: [Chromium flags](https://www.remotion.dev/docs/chromium-flags).

#### `disableWebSecurity` [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#disablewebsecurity "Direct link to disablewebsecurity")

_boolean - default `false`_

This will most notably disable CORS among other security features.

#### `ignoreCertificateErrors` [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#ignorecertificateerrors "Direct link to ignorecertificateerrors")

_boolean - default `false`_

Results in invalid SSL certificates, such as self-signed ones, being ignored.

#### `gl` [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#gl "Direct link to gl")

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

### `overwrite?` [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#overwrite "Direct link to overwrite")

_available from v3.2.25_

If a custom out name is specified and a file already exists at this key in the S3 bucket, decide whether the file should be overwritten. Default `false`.

If the file exists and `overwrite` is `false`, an error will be thrown.

### `rendererFunctionName?` [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#rendererfunctionname "Direct link to rendererfunctionname")

_optional, available from v3.3.38_

If specified, this function will be used for rendering the individual chunks. This is useful if you want to use a function with higher or lower power for rendering the chunks than the main orchestration function.

If you want to use this option, the function must be in the same region, the same account and have the same version as the main function.

### `webhook?` [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#webhook "Direct link to webhook")

_optional, available from v3.2.30_

If specified, Remotion will send a POST request to the provided endpoint to notify your application when the Lambda rendering process finishes, errors out or times out.

```

tsx

import {RenderMediaOnLambdaInput} from '@remotion/lambda';

const webhook: RenderMediaOnLambdaInput['webhook'] = {
  url: 'https://mapsnap.app/api/webhook',
  secret: process.env.WEBHOOK_SECRET as string,
  // Optionally pass up to 1024 bytes of custom data
  customData: {
    id: 42,
  },
};
```

If you don't want to set up validation, you can set `secret` to null:

```

tsx

import {RenderMediaOnLambdaInput} from '@remotion/lambda';

const webhook: RenderMediaOnLambdaInput['webhook'] = {
  url: 'https://mapsnap.app/api/webhook',
  secret: null,
};
```

[See here for detailed instructions on how to set up your webhook](https://www.remotion.dev/docs/lambda/webhooks).

### `forceBucketName?` [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#forcebucketname "Direct link to forcebucketname")

_optional, available from v3.3.42_

Specify a specific bucket name to be used. [This is not recommended](https://www.remotion.dev/docs/lambda/multiple-buckets), instead let Remotion discover the right bucket automatically.

### `logLevel?` [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#loglevel "Direct link to loglevel")

One of `trace`, `verbose`, `info`, `warn`, `error`.

Determines how much info is being logged to the console.

Default `info`.

If the `logLevel` is set to `verbose`, the Lambda function will not clean up artifacts, to aid debugging. Do not use it unless you are debugging a problem.

### `offthreadVideoCacheSizeInBytes?` [v4.0.23](https://github.com/remotion-dev/remotion/releases/v4.0.23) [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#offthreadvideocachesizeinbytes "Direct link to offthreadvideocachesizeinbytes")

From v4.0, Remotion has a cache for [`<OffthreadVideo>`](https://remotion.dev/docs/offthreadvideo) frames. The default is `null`, corresponding to half of the system memory available when the render starts.

This option allows to override the size of the cache. The higher it is, the faster the render will be, but the more memory will be used.

The used value will be printed when running in verbose mode.

Default: `null`

### `offthreadVideoThreads?` [v4.0.261](https://github.com/remotion-dev/remotion/releases/v4.0.261) [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#offthreadvideothreads "Direct link to offthreadvideothreads")

The number of threads that [`<OffthreadVideo>`](https://remotion.dev/docs/offthreadvideo) can start to extract frames. The default is2. Increase carefully, as too many threads may cause instability.

### `colorSpace?` [v4.0.28](https://github.com/remotion-dev/remotion/releases/v4.0.28) [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#colorspace "Direct link to colorspace")

Color space to use for the video. Acceptable values: `"default"`(default since 5.0), `"bt709"`(since v4.0.28), `"bt2020-ncl"`(since v4.0.88), `"bt2020-cl"`(since v4.0.88), .

For best color accuracy, it is recommended to also use `"png"` as the image format to have accurate color transformations throughout.

Only since v4.0.83, colorspace conversion is actually performed, previously it would only tag the metadata of the video.

### `deleteAfter?` [v4.0.32](https://github.com/remotion-dev/remotion/releases/v4.0.32) [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#deleteafter "Direct link to deleteafter")

Automatically delete the render after a certain period. Accepted values are `1-day`, `3-days`, `7-days` and `30-days`.

For this to work, your bucket needs to have [lifecycles enabled](https://www.remotion.dev/docs/lambda/autodelete).

### `preferLossless?` [v4.0.123](https://github.com/remotion-dev/remotion/releases/v4.0.123) [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#preferlossless "Direct link to preferlossless")

Uses a lossless audio codec, if one is available for the codec. If you set `audioCodec`, it takes priority over `preferLossless`.

### `forcePathStyle?` [v4.0.202](https://github.com/remotion-dev/remotion/releases/v4.0.202) [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#forcepathstyle "Direct link to forcepathstyle")

Passes `forcePathStyle` to the AWS S3 client. If you don't know what this is, you probably don't need it.

### `apiKey?` [v4.0.253](https://github.com/remotion-dev/remotion/releases/v4.0.253) [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#apikey "Direct link to apikey")

API key for sending a usage event using `@remotion/licensing`.

### `storageClass?` [v4.0.305](https://github.com/remotion-dev/remotion/releases/v4.0.305) [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#storageclass "Direct link to storageclass")

An [identifier](https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html#sc-compare) for the S3 storage class of the rendered media. Default: `undefined` (which is `STANDARD`).

### ~~`dumpBrowserLogs?`~~ [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#dumpbrowserlogs "Direct link to dumpbrowserlogs")

_optional - default `false`, deprecated in v4.0_

Deprecated in favor of [`logLevel`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#loglevel).

## Return value [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#return-value "Direct link to Return value")

Returns a promise resolving to an object containing four properties. Of these, `renderId`, `bucketName` are useful for passing to `getRenderProgress()`.

### `renderId` [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#renderid "Direct link to renderid")

A unique alphanumeric identifier for this render. Useful for obtaining status and finding the relevant files in the S3 bucket.

### `bucketName` [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#bucketname "Direct link to bucketname")

The S3 bucket name in which all files are being saved.

### `cloudWatchLogs` [v3.2.10](https://github.com/remotion-dev/remotion/releases/v3.2.10) [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#cloudwatchlogs "Direct link to cloudwatchlogs")

A link to CloudWatch (if you haven't disabled it) that you can visit to see the logs for the render.

### `lambdaInsightsUrl` [v4.0.61](https://github.com/remotion-dev/remotion/releases/v4.0.61) [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#lambdainsightsurl "Direct link to lambdainsightsurl")

A link to the [Lambda Insights](https://www.remotion.dev/docs/lambda/insights), if you enabled it.

### `folderInS3Console` [v3.2.43](https://github.com/remotion-dev/remotion/releases/v3.2.43) [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#folderins3console "Direct link to folderins3console")

A link to the folder in the AWS console where each chunk and render is located.

## See also [​](https://www.remotion.dev/docs/lambda/rendermediaonlambda\#see-also "Direct link to See also")

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/lambda/src/api/render-media-on-lambda.ts)
- [getRenderProgress()](https://www.remotion.dev/docs/lambda/getrenderprogress)

- [Example](https://www.remotion.dev/docs/lambda/rendermediaonlambda#example)
- [Arguments](https://www.remotion.dev/docs/lambda/rendermediaonlambda#arguments)
  - [`region`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#region)
  - [`privacy`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#privacy)
  - [`functionName`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#functionname)
  - [`framesPerLambda?`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#framesperlambda)
  - [`concurrency?`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#concurrency)
  - [`frameRange?`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#framerange)
  - [`serveUrl`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#serveurl)
  - [`composition`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#composition)
  - [`metadata`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#metadata)
  - [`inputProps`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#inputprops)
  - [`codec`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#codec)
  - [`audioCodec?`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#audiocodec)
  - [`forceHeight?`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#forceheight)
  - [`forceWidth?`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#forcewidth)
  - [`muted?`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#muted)
  - [`imageFormat`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#imageformat)
  - [`crf?`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#crf)
  - [`envVariables?`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#envvariables)
  - [`pixelFormat?`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#pixelformat)
  - [`proResProfile?`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#proresprofile)
  - [`x264Preset?`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#x264preset)
  - [`jpegQuality`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#jpegquality)
  - [~~`quality`~~](https://www.remotion.dev/docs/lambda/rendermediaonlambda#quality)
  - [`audioBitrate?`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#audiobitrate)
  - [`videoBitrate?`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#videobitrate)
  - [`bufferSize?`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#buffersize)
  - [`maxRate?`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#maxrate)
  - [`maxRetries`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#maxretries)
  - [`scale?`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#scale)
  - [`outName?`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#outname)
  - [`timeoutInMilliseconds?`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#timeoutinmilliseconds)
  - [`concurrencyPerLambda?`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#concurrencyperlambda)
  - [`everyNthFrame?`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#everynthframe)
  - [`numberOfGifLoops?`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#numberofgifloops)
  - [`downloadBehavior?`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#downloadbehavior)
  - [`chromiumOptions?`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#chromiumoptions)
  - [`overwrite?`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#overwrite)
  - [`rendererFunctionName?`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#rendererfunctionname)
  - [`webhook?`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#webhook)
  - [`forceBucketName?`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#forcebucketname)
  - [`logLevel?`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#loglevel)
  - [`offthreadVideoCacheSizeInBytes?`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#offthreadvideocachesizeinbytes)
  - [`offthreadVideoThreads?`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#offthreadvideothreads)
  - [`colorSpace?`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#colorspace)
  - [`deleteAfter?`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#deleteafter)
  - [`preferLossless?`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#preferlossless)
  - [`forcePathStyle?`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#forcepathstyle)
  - [`apiKey?`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#apikey)
  - [`storageClass?`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#storageclass)
  - [~~`dumpBrowserLogs?`~~](https://www.remotion.dev/docs/lambda/rendermediaonlambda#dumpbrowserlogs)
- [Return value](https://www.remotion.dev/docs/lambda/rendermediaonlambda#return-value)
  - [`renderId`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#renderid)
  - [`bucketName`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#bucketname)
  - [`cloudWatchLogs`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#cloudwatchlogs)
  - [`lambdaInsightsUrl`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#lambdainsightsurl)
  - [`folderInS3Console`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#folderins3console)
- [See also](https://www.remotion.dev/docs/lambda/rendermediaonlambda#see-also)

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