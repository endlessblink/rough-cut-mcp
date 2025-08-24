---
url: "https://www.remotion.dev/docs/cloudrun/cli/still"
title: "npx remotion cloudrun still | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/cloudrun/cli/still#__docusaurus_skipToContent_fallback)

On this page

EXPERIMENTAL

Cloud Run is in [Alpha status and not actively being developed.](https://www.remotion.dev/docs/cloudrun/status)

Using the `npx remotion cloudrun still` command, you can render an image on GCP.

The structure of a command is as follows:

```

npx remotion cloudrun still <serve-url> [<still-id>] [<output-location>]
```

- The serve URL is obtained by deploying a Remotion project to a GCP Storage Bucket using the [`sites create`](https://www.remotion.dev/docs/cloudrun/cli/sites/create) command or calling [`deployService()`](https://www.remotion.dev/docs/cloudrun/deployservice).
- The [still ID](https://www.remotion.dev/docs/terminology/composition#composition-id). If not specified, the list of compositions will be fetched and you can choose a composition.
- The `output-location` parameter is optional. If you don't specify it, the image is stored in your Cloud Storage bucket. If you specify a location, it gets downloaded to your device in an additional step.

## Example commands [​](https://www.remotion.dev/docs/cloudrun/cli/still\#example-commands "Direct link to Example commands")

Rendering a still, passing the service name:

```

npx remotion cloudrun still https://storage.googleapis.com/remotioncloudrun-123asd321/sites/abcdefgh/index.html tiles --service-name=remotion--3-3-82--mem512mi--cpu1-0--t-800
```

Using the site name as opposed to the full serve-url:

```

npx remotion cloudrun still test-site tiles --service-name=remotion--3-3-82--mem512mi--cpu1-0--t-800
```

Passing in input props:

```

npx remotion cloudrun still test-site tiles --service-name=remotion--3-3-82--mem512mi--cpu1-0--t-800 --props='{"hi": "there"}'
```

## Flags [​](https://www.remotion.dev/docs/cloudrun/cli/still\#flags "Direct link to Flags")

### `--region` [​](https://www.remotion.dev/docs/cloudrun/cli/still\#--region "Direct link to --region")

The [GCP region](https://www.remotion.dev/docs/cloudrun/region-selection) to select. For lowest latency, the service, site and output bucket should be in the same region.

### `--props` [​](https://www.remotion.dev/docs/cloudrun/cli/still\#--props "Direct link to --props")

[Input Props to pass to the selected composition of your video.](https://www.remotion.dev/docs/passing-props#passing-input-props-in-the-cli).

Must be a serialized JSON string ( `--props='{"hello": "world"}'`) or a path to a JSON file ( `./path/to/props.json`).

From the root component the props can be read using [`getInputProps()`](https://www.remotion.dev/docs/get-input-props).

You may transform input props using [`calculateMetadata()`](https://www.remotion.dev/docs/calculate-metadata).

note

Inline JSON string isn't supported on Windows shells because it removes the `"` character, use a file name instead.

### `--privacy` [​](https://www.remotion.dev/docs/cloudrun/cli/still\#--privacy "Direct link to --privacy")

One of:

- `"public"` ( _default_): The rendered still is publicly accessible under the Cloud Storage URL.
- `"private"`: The rendered still is not publicly available, but is available within the GCP project to those with the correct permissions.

### `--force-bucket-name` [​](https://www.remotion.dev/docs/cloudrun/cli/still\#--force-bucket-name "Direct link to --force-bucket-name")

Specify a specific bucket name to be used for the output. The resulting Google Cloud Storage URL will be in the format `gs://{bucket-name}/renders/{render-id}/{file-name}`. If not set, Remotion will choose the right bucket to use based on the region.

### `--jpeg-quality` [​](https://www.remotion.dev/docs/cloudrun/cli/still\#--jpeg-quality "Direct link to --jpeg-quality")

[Value between 0 and 100 for JPEG rendering quality](https://www.remotion.dev/docs/config#setjpegquality). Doesn't work when a PNG is rendered.

### `--image-format` [​](https://www.remotion.dev/docs/cloudrun/cli/still\#--image-format "Direct link to --image-format")

[`jpeg` or `png` \- JPEG is faster, but doesn't support transparency.](https://www.remotion.dev/docs/config#setstillimageformat) The default image format is `jpeg`.

### `--scale` [​](https://www.remotion.dev/docs/cloudrun/cli/still\#--scale "Direct link to --scale")

[Scales the output frame by the factor you pass in.](https://www.remotion.dev/docs/scaling) For example, a 1280x720px frame will become a 1920x1080px frame with a scale factor of `1.5`. Vector elements like fonts and HTML markups will be rendered with extra details.

### `--env-file` [​](https://www.remotion.dev/docs/cloudrun/cli/still\#--env-file "Direct link to --env-file")

Specify a location for a dotenv file - Default `.env`. [Read about how environment variables work in Remotion.](https://www.remotion.dev/docs/env-variables)

### `--out-name` [​](https://www.remotion.dev/docs/cloudrun/cli/still\#--out-name "Direct link to --out-name")

The file name of the still output as stored in the Cloud Storage bucket. By default, it is `out` plus the appropriate file extension, for example: `out.png`. Must match `/([0-9a-zA-Z-!_.*'()/]+)/g`.

### `--cloud-run-url` [​](https://www.remotion.dev/docs/cloudrun/cli/still\#--cloud-run-url "Direct link to --cloud-run-url")

Specify the url of the service which should be used to perform the render. You must set either `cloud-run-url` _or_ `service-name`, but not both.

### `--service-name` [​](https://www.remotion.dev/docs/cloudrun/cli/still\#--service-name "Direct link to --service-name")

Specify the name of the service which should be used to perform the render. This is used in conjunction with the region to determine the service endpoint, as the same service name can exist across multiple regions. You must set either `cloud-run-url` _or_ `service-name`, but not both.

### `--offthreadvideo-cache-size-in-bytes` [v4.0.23](https://github.com/remotion-dev/remotion/releases/v4.0.23) [​](https://www.remotion.dev/docs/cloudrun/cli/still\#--offthreadvideo-cache-size-in-bytes "Direct link to --offthreadvideo-cache-size-in-bytes")

From v4.0, Remotion has a cache for [`<OffthreadVideo>`](https://remotion.dev/docs/offthreadvideo) frames. The default is `null`, corresponding to half of the system memory available when the render starts.

This option allows to override the size of the cache. The higher it is, the faster the render will be, but the more memory will be used.

The used value will be printed when running in verbose mode.

Default: `null`

### `--offthreadvideo-video-threads` [v4.0.261](https://github.com/remotion-dev/remotion/releases/v4.0.261) [​](https://www.remotion.dev/docs/cloudrun/cli/still\#--offthreadvideo-video-threads "Direct link to --offthreadvideo-video-threads")

The number of threads that [`<OffthreadVideo>`](https://remotion.dev/docs/offthreadvideo) can start to extract frames. The default is 2. Increase carefully, as too many threads may cause instability.

- [Example commands](https://www.remotion.dev/docs/cloudrun/cli/still#example-commands)
- [Flags](https://www.remotion.dev/docs/cloudrun/cli/still#flags)
  - [`--region`](https://www.remotion.dev/docs/cloudrun/cli/still#--region)
  - [`--props`](https://www.remotion.dev/docs/cloudrun/cli/still#--props)
  - [`--privacy`](https://www.remotion.dev/docs/cloudrun/cli/still#--privacy)
  - [`--force-bucket-name`](https://www.remotion.dev/docs/cloudrun/cli/still#--force-bucket-name)
  - [`--jpeg-quality`](https://www.remotion.dev/docs/cloudrun/cli/still#--jpeg-quality)
  - [`--image-format`](https://www.remotion.dev/docs/cloudrun/cli/still#--image-format)
  - [`--scale`](https://www.remotion.dev/docs/cloudrun/cli/still#--scale)
  - [`--env-file`](https://www.remotion.dev/docs/cloudrun/cli/still#--env-file)
  - [`--out-name`](https://www.remotion.dev/docs/cloudrun/cli/still#--out-name)
  - [`--cloud-run-url`](https://www.remotion.dev/docs/cloudrun/cli/still#--cloud-run-url)
  - [`--service-name`](https://www.remotion.dev/docs/cloudrun/cli/still#--service-name)
  - [`--offthreadvideo-cache-size-in-bytes`](https://www.remotion.dev/docs/cloudrun/cli/still#--offthreadvideo-cache-size-in-bytes)
  - [`--offthreadvideo-video-threads`](https://www.remotion.dev/docs/cloudrun/cli/still#--offthreadvideo-video-threads)

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