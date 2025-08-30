[Skip to main content](https://www.remotion.dev/docs/lambda/renderstillonlambda#__docusaurus_skipToContent_fallback)

On this page

Renders a still image inside a lambda function and writes it to the specified output location.

If you want to render a video or audio instead, use [`renderMediaOnLambda()`](https://www.remotion.dev/docs/lambda/rendermediaonlambda) instead.

If you want to render a still locally instead, use [`renderStill()`](https://www.remotion.dev/docs/renderer/render-still) instead.

## Example [​](https://www.remotion.dev/docs/lambda/renderstillonlambda\#example "Direct link to Example")

```

tsx

import {renderStillOnLambda} from '@remotion/lambda/client';

const {estimatedPrice, url, sizeInBytes} = await renderStillOnLambda({
  region: 'us-east-1',
  functionName: 'remotion-render-bds9aab',
  serveUrl: 'https://remotionlambda-qg35eyp1s1.s3.eu-central-1.amazonaws.com/sites/bf2jrbfkw',
  composition: 'MyVideo',
  inputProps: {},
  imageFormat: 'png',
  maxRetries: 1,
  privacy: 'public',
  envVariables: {},
  frame: 10,
});
```

note

Preferrably import this function from `@remotion/lambda/client` to avoid problems [inside serverless functions](https://www.remotion.dev/docs/lambda/light-client).

## Arguments [​](https://www.remotion.dev/docs/lambda/renderstillonlambda\#arguments "Direct link to Arguments")

An object with the following properties:

### `region` [​](https://www.remotion.dev/docs/lambda/renderstillonlambda\#region "Direct link to region")

In which region your Lambda function is deployed. It's highly recommended that your Remotion site is also in the same region.

### `functionName` [​](https://www.remotion.dev/docs/lambda/renderstillonlambda\#functionname "Direct link to functionname")

The name of the deployed Lambda function.
Use [`deployFunction()`](https://www.remotion.dev/docs/lambda/deployfunction) to create a new function and [`getFunctions()`](https://www.remotion.dev/docs/lambda/getfunctions) to obtain currently deployed Lambdas.

### `serveUrl` [​](https://www.remotion.dev/docs/lambda/renderstillonlambda\#serveurl "Direct link to serveurl")

A URL pointing to a Remotion project. Use [`deploySite()`](https://www.remotion.dev/docs/lambda/deploysite) to deploy a Remotion project.

### `composition` [​](https://www.remotion.dev/docs/lambda/renderstillonlambda\#composition "Direct link to composition")

The `id` of the [composition](https://www.remotion.dev/docs/composition) you want to render..

### `inputProps` [​](https://www.remotion.dev/docs/lambda/renderstillonlambda\#inputprops "Direct link to inputprops")

[Input Props to pass to the selected composition of your video.](https://www.remotion.dev/docs/passing-props#passing-input-props-in-the-cli).

Must be a JSON object.

From the root component the props can be read using [`getInputProps()`](https://www.remotion.dev/docs/get-input-props).

You may transform input props using [`calculateMetadata()`](https://www.remotion.dev/docs/calculate-metadata).

### `privacy` [​](https://www.remotion.dev/docs/lambda/renderstillonlambda\#privacy "Direct link to privacy")

One of:

- `"public"` ( _default_): The rendered still is publicly accessible under the S3 URL.
- `"private"`: The rendered still is not publicly available, but signed links can be created using [presignUrl()](https://www.remotion.dev/docs/lambda/presignurl).
- `"no-acl"` ( _available from v.3.1.7_): The ACL option is not being set at all, this option is useful if you are writing to another bucket that does not support ACL using [`outName`](https://www.remotion.dev/docs/lambda/renderstillonlambda#outname).

### `frame?` [​](https://www.remotion.dev/docs/lambda/renderstillonlambda\#frame "Direct link to frame")

_optional - default `0`_

Which frame of the composition should be rendered. Frames are zero-indexed.

From v3.2.27, negative values are allowed, with `-1` being the last frame.

### `imageFormat?` [​](https://www.remotion.dev/docs/lambda/renderstillonlambda\#imageformat "Direct link to imageformat")

_optional - default `"png"`_

See [`renderStill() -> imageFormat`](https://www.remotion.dev/docs/renderer/render-still#imageformat).

### `onInit?` [v4.0.6](https://github.com/remotion-dev/remotion/releases/v4.0.6) [​](https://www.remotion.dev/docs/lambda/renderstillonlambda\#oninit "Direct link to oninit")

A callback function that gets called when the render starts, useful to obtain the link to the logs even if the render fails.

It receives an object with the following properties:

- `renderId`: The ID of the render.
- `cloudWatchLogs`: A link to the CloudWatch logs of the Lambda function, if you did not disable it.
- `lambdaInsightsUrl` [v4.0.61](https://github.com/remotion-dev/remotion/releases/v4.0.61): A link to the [Lambda insights](https://www.remotion.dev/docs/lambda/insights), if you enabled it.

Example usage:

```

tsx

import {renderStillOnLambda, RenderStillOnLambdaInput} from '@remotion/lambda/client';

const otherParameters: RenderStillOnLambdaInput = {
  region: 'us-east-1',
  functionName: 'remotion-render-bds9aab',
  serveUrl: 'https://remotionlambda-qg35eyp1s1.s3.eu-central-1.amazonaws.com/sites/bf2jrbfkw',
  composition: 'MyVideo',
  inputProps: {},
  imageFormat: 'png',
  maxRetries: 1,
  privacy: 'public',
  envVariables: {},
  frame: 10,
};
await renderStillOnLambda({
  ...otherParameters,
  onInit: ({cloudWatchLogs, renderId, lambdaInsightsUrl}) => {
    console.log(console.log(`Render invoked with ID = ${renderId}`));
    console.log(`CloudWatch logs (if enabled): ${cloudWatchLogs}`);
    console.log(`Lambda Insights (if enabled): ${lambdaInsightsUrl}`);
  },
});
```

### `jpegQuality?` [​](https://www.remotion.dev/docs/lambda/renderstillonlambda\#jpegquality "Direct link to jpegquality")

_optional_

Sets the quality of the generated JPEG images. Must be an integer between 0 and 100. Default is to leave it up to the browser, [current default is 80](https://github.com/chromium/chromium/blob/99314be8152e688bafbbf9a615536bdbb289ea87/headless/lib/browser/protocol/headless_handler.cc#L32).

Only applies if `imageFormat` is `"jpeg"`, otherwise this option is invalid.

### ~~`quality?`~~ [​](https://www.remotion.dev/docs/lambda/renderstillonlambda\#quality "Direct link to quality")

Renamed to `jpegQuality` in `v4.0.0`.

### `maxRetries?` [​](https://www.remotion.dev/docs/lambda/renderstillonlambda\#maxretries "Direct link to maxretries")

_optional - default `1`_

How often a frame render may be retried until it fails.

note

A retry only gets executed if a the error is in the [list of flaky errors](https://github.com/remotion-dev/remotion/blob/main/packages/lambda-client/src/is-flaky-error.ts).

### `envVariables?` [​](https://www.remotion.dev/docs/lambda/renderstillonlambda\#envvariables "Direct link to envvariables")

_optional - default `{}`_

See [`renderStill() -> envVariables`](https://www.remotion.dev/docs/renderer/render-still#envvariables).

### `forceHeight?` [​](https://www.remotion.dev/docs/lambda/renderstillonlambda\#forceheight "Direct link to forceheight")

_optional, available from v3.2.40_

Overrides the default composition height.

### `forceWidth?` [​](https://www.remotion.dev/docs/lambda/renderstillonlambda\#forcewidth "Direct link to forcewidth")

_optional, available from v3.2.40_

Overrides the default composition width.

### `scale?` [​](https://www.remotion.dev/docs/lambda/renderstillonlambda\#scale "Direct link to scale")

_optional_

Scales the output dimensions by a factor. See [Scaling](https://www.remotion.dev/docs/scaling) to learn more about this feature.

### `outName?` [​](https://www.remotion.dev/docs/lambda/renderstillonlambda\#outname "Direct link to outname")

_optional_

It can either be:

- `undefined` \- it will default to `out` plus the appropriate file extension, for example: `renders/${renderId}/out.mp4`.
- A `string` \- it will get saved to the same S3 bucket as your site under the key `renders/{renderId}/{outName}`. Make sure to include the file extension at the end of the string.
- An object if you want to render to a different bucket or cloud provider - [see here for detailed instructions](https://www.remotion.dev/docs/lambda/custom-destination).

### `timeoutInMilliseconds?` [​](https://www.remotion.dev/docs/lambda/renderstillonlambda\#timeoutinmilliseconds "Direct link to timeoutinmilliseconds")

_optional_

A number describing how long the render may take to resolve all [`delayRender()`](https://www.remotion.dev/docs/delay-render) calls [before it times out](https://www.remotion.dev/docs/timeout). Default: `30000`

### `downloadBehavior?` [​](https://www.remotion.dev/docs/lambda/renderstillonlambda\#downloadbehavior "Direct link to downloadbehavior")

_optional, available since v3.1.5_

How the output file should behave when accessed through the S3 output link in the browser.

Either:

- `{"type": "play-in-browser"}` \- the default. The video will play in the browser.
- `{"type": "download", fileName: null}` or `{"type": "download", fileName: "download.mp4"}` \- a `Content-Disposition` header will be added which makes the browser download the file. You can optionally override the filename.

### `offthreadVideoCacheSizeInBytes?` [v4.0.23](https://github.com/remotion-dev/remotion/releases/v4.0.23) [​](https://www.remotion.dev/docs/lambda/renderstillonlambda\#offthreadvideocachesizeinbytes "Direct link to offthreadvideocachesizeinbytes")

From v4.0, Remotion has a cache for [`<OffthreadVideo>`](https://remotion.dev/docs/offthreadvideo) frames. The default is `null`, corresponding to half of the system memory available when the render starts.

This option allows to override the size of the cache. The higher it is, the faster the render will be, but the more memory will be used.

The used value will be printed when running in verbose mode.

Default: `null`

### `offthreadVideoThreads?` [v4.0.261](https://github.com/remotion-dev/remotion/releases/v4.0.261) [​](https://www.remotion.dev/docs/lambda/renderstillonlambda\#offthreadvideothreads "Direct link to offthreadvideothreads")

The number of threads that [`<OffthreadVideo>`](https://remotion.dev/docs/offthreadvideo) can start to extract frames. The default is2. Increase carefully, as too many threads may cause instability.

### `deleteAfter?` [v4.0.32](https://github.com/remotion-dev/remotion/releases/v4.0.32) [​](https://www.remotion.dev/docs/lambda/renderstillonlambda\#deleteafter "Direct link to deleteafter")

Automatically delete the render after a certain period. Accepted values are `1-day`, `3-days`, `7-days` and `30-days`.

For this to work, your bucket needs to have [lifecycles enabled](https://www.remotion.dev/docs/lambda/autodelete).

### `chromiumOptions?` [​](https://www.remotion.dev/docs/lambda/renderstillonlambda\#chromiumoptions "Direct link to chromiumoptions")

_optional_

Allows you to set certain Chromium / Google Chrome flags. See: [Chromium flags](https://www.remotion.dev/docs/chromium-flags).

#### `disableWebSecurity` [​](https://www.remotion.dev/docs/lambda/renderstillonlambda\#disablewebsecurity "Direct link to disablewebsecurity")

_boolean - default `false`_

This will most notably disable CORS among other security features.

#### `ignoreCertificateErrors` [​](https://www.remotion.dev/docs/lambda/renderstillonlambda\#ignorecertificateerrors "Direct link to ignorecertificateerrors")

_boolean - default `false`_

Results in invalid SSL certificates, such as self-signed ones, being ignored.

#### `gl` [​](https://www.remotion.dev/docs/lambda/renderstillonlambda\#gl "Direct link to gl")

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

#### `userAgent` [v3.3.83](https://github.com/remotion-dev/remotion/releases/v3.3.83) [​](https://www.remotion.dev/docs/lambda/renderstillonlambda\#useragent "Direct link to useragent")

Lets you set a custom user agent that the headless Chrome browser assumes.

### `forceBucketName?` [​](https://www.remotion.dev/docs/lambda/renderstillonlambda\#forcebucketname "Direct link to forcebucketname")

_optional_

Specify a specific bucket name to be used. [This is not recommended](https://www.remotion.dev/docs/lambda/multiple-buckets), instead let Remotion discover the right bucket automatically.

### `logLevel?` [​](https://www.remotion.dev/docs/lambda/renderstillonlambda\#loglevel "Direct link to loglevel")

_optional_

One of `trace`, `verbose`, `info`, `warn`, `error`.

Determines how much info is being logged to the console.

Default `info`.

Logs can be read through the CloudWatch URL that this function returns.

### `forcePathStyle?` [v4.0.202](https://github.com/remotion-dev/remotion/releases/v4.0.202) [​](https://www.remotion.dev/docs/lambda/renderstillonlambda\#forcepathstyle "Direct link to forcepathstyle")

Passes `forcePathStyle` to the AWS S3 client. If you don't know what this is, you probably don't need it.

### `storageClass?` [v4.0.305](https://github.com/remotion-dev/remotion/releases/v4.0.305) [​](https://www.remotion.dev/docs/lambda/renderstillonlambda\#storageclass "Direct link to storageclass")

An [identifier](https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html#sc-compare) for the S3 storage class of the rendered media. Default: `undefined` (which is `STANDARD`).

### ~~`dumpBrowserLogs?`~~ [​](https://www.remotion.dev/docs/lambda/renderstillonlambda\#dumpbrowserlogs "Direct link to dumpbrowserlogs")

_optional - default `false`, deprecated in v4.0_

Deprecated in favor of [`logLevel`](https://www.remotion.dev/docs/lambda/renderstillonlambda#loglevel).

## Return value [​](https://www.remotion.dev/docs/lambda/renderstillonlambda\#return-value "Direct link to Return value")

Returns a promise resolving to an object with the following properties:

### `bucketName` [​](https://www.remotion.dev/docs/lambda/renderstillonlambda\#bucketname "Direct link to bucketname")

The S3 bucket in which the video was saved.

### `url` [​](https://www.remotion.dev/docs/lambda/renderstillonlambda\#url "Direct link to url")

An AWS S3 URL where the output is available.

### `outKey` [v4.0.141](https://github.com/remotion-dev/remotion/releases/v4.0.141) [​](https://www.remotion.dev/docs/lambda/renderstillonlambda\#outkey "Direct link to outkey")

The S3 key where the output is saved.

### `estimatedPrice` [​](https://www.remotion.dev/docs/lambda/renderstillonlambda\#estimatedprice "Direct link to estimatedprice")

Object containing roughly estimated information about how expensive this operation was.

### `sizeInBytes` [​](https://www.remotion.dev/docs/lambda/renderstillonlambda\#sizeinbytes "Direct link to sizeinbytes")

The size of the output image in bytes.

### `renderId` [​](https://www.remotion.dev/docs/lambda/renderstillonlambda\#renderid "Direct link to renderid")

A unique alphanumeric identifier for this render. Useful for obtaining status and finding the relevant files in the S3 bucket.

### `cloudWatchLogs` [​](https://www.remotion.dev/docs/lambda/renderstillonlambda\#cloudwatchlogs "Direct link to cloudwatchlogs")

_Available from v3.2.10_

A link to CloudWatch (if you haven't disabled it) that you can visit to see the logs for the render.

### `artifacts` [v4.0.176](https://github.com/remotion-dev/remotion/releases/v4.0.176) [​](https://www.remotion.dev/docs/lambda/renderstillonlambda\#artifacts "Direct link to artifacts")

Artifacts that were created so far during the render. [See here for an example of dealing with field.](https://www.remotion.dev/docs/artifacts#using-renderstillonlambda)

## See also [​](https://www.remotion.dev/docs/lambda/renderstillonlambda\#see-also "Direct link to See also")

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/lambda/src/api/render-still-on-lambda.ts)
- [renderMediaOnLambda()](https://www.remotion.dev/docs/lambda/rendermediaonlambda)
- [renderStill()](https://www.remotion.dev/docs/renderer/render-still)

- [Example](https://www.remotion.dev/docs/lambda/renderstillonlambda#example)
- [Arguments](https://www.remotion.dev/docs/lambda/renderstillonlambda#arguments)
  - [`region`](https://www.remotion.dev/docs/lambda/renderstillonlambda#region)
  - [`functionName`](https://www.remotion.dev/docs/lambda/renderstillonlambda#functionname)
  - [`serveUrl`](https://www.remotion.dev/docs/lambda/renderstillonlambda#serveurl)
  - [`composition`](https://www.remotion.dev/docs/lambda/renderstillonlambda#composition)
  - [`inputProps`](https://www.remotion.dev/docs/lambda/renderstillonlambda#inputprops)
  - [`privacy`](https://www.remotion.dev/docs/lambda/renderstillonlambda#privacy)
  - [`frame?`](https://www.remotion.dev/docs/lambda/renderstillonlambda#frame)
  - [`imageFormat?`](https://www.remotion.dev/docs/lambda/renderstillonlambda#imageformat)
  - [`onInit?`](https://www.remotion.dev/docs/lambda/renderstillonlambda#oninit)
  - [`jpegQuality?`](https://www.remotion.dev/docs/lambda/renderstillonlambda#jpegquality)
  - [~~`quality?`~~](https://www.remotion.dev/docs/lambda/renderstillonlambda#quality)
  - [`maxRetries?`](https://www.remotion.dev/docs/lambda/renderstillonlambda#maxretries)
  - [`envVariables?`](https://www.remotion.dev/docs/lambda/renderstillonlambda#envvariables)
  - [`forceHeight?`](https://www.remotion.dev/docs/lambda/renderstillonlambda#forceheight)
  - [`forceWidth?`](https://www.remotion.dev/docs/lambda/renderstillonlambda#forcewidth)
  - [`scale?`](https://www.remotion.dev/docs/lambda/renderstillonlambda#scale)
  - [`outName?`](https://www.remotion.dev/docs/lambda/renderstillonlambda#outname)
  - [`timeoutInMilliseconds?`](https://www.remotion.dev/docs/lambda/renderstillonlambda#timeoutinmilliseconds)
  - [`downloadBehavior?`](https://www.remotion.dev/docs/lambda/renderstillonlambda#downloadbehavior)
  - [`offthreadVideoCacheSizeInBytes?`](https://www.remotion.dev/docs/lambda/renderstillonlambda#offthreadvideocachesizeinbytes)
  - [`offthreadVideoThreads?`](https://www.remotion.dev/docs/lambda/renderstillonlambda#offthreadvideothreads)
  - [`deleteAfter?`](https://www.remotion.dev/docs/lambda/renderstillonlambda#deleteafter)
  - [`chromiumOptions?`](https://www.remotion.dev/docs/lambda/renderstillonlambda#chromiumoptions)
  - [`forceBucketName?`](https://www.remotion.dev/docs/lambda/renderstillonlambda#forcebucketname)
  - [`logLevel?`](https://www.remotion.dev/docs/lambda/renderstillonlambda#loglevel)
  - [`forcePathStyle?`](https://www.remotion.dev/docs/lambda/renderstillonlambda#forcepathstyle)
  - [`storageClass?`](https://www.remotion.dev/docs/lambda/renderstillonlambda#storageclass)
  - [~~`dumpBrowserLogs?`~~](https://www.remotion.dev/docs/lambda/renderstillonlambda#dumpbrowserlogs)
- [Return value](https://www.remotion.dev/docs/lambda/renderstillonlambda#return-value)
  - [`bucketName`](https://www.remotion.dev/docs/lambda/renderstillonlambda#bucketname)
  - [`url`](https://www.remotion.dev/docs/lambda/renderstillonlambda#url)
  - [`outKey`](https://www.remotion.dev/docs/lambda/renderstillonlambda#outkey)
  - [`estimatedPrice`](https://www.remotion.dev/docs/lambda/renderstillonlambda#estimatedprice)
  - [`sizeInBytes`](https://www.remotion.dev/docs/lambda/renderstillonlambda#sizeinbytes)
  - [`renderId`](https://www.remotion.dev/docs/lambda/renderstillonlambda#renderid)
  - [`cloudWatchLogs`](https://www.remotion.dev/docs/lambda/renderstillonlambda#cloudwatchlogs)
  - [`artifacts`](https://www.remotion.dev/docs/lambda/renderstillonlambda#artifacts)
- [See also](https://www.remotion.dev/docs/lambda/renderstillonlambda#see-also)

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