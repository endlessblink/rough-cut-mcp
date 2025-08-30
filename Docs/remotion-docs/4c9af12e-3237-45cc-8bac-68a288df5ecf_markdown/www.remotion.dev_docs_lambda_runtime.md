[Skip to main content](https://www.remotion.dev/docs/lambda/runtime#__docusaurus_skipToContent_fallback)

On this page

This page describes the environment that the Lambda function is running in.

## Node.JS Version [​](https://www.remotion.dev/docs/lambda/runtime\#nodejs-version "Direct link to Node.JS Version")

_from v4.0.245_

The Lambda function uses a NodeJS version from the `20.x` release line.

The Lambda runtime will get locked to

```

arn:aws:lambda:${region}::runtime:da57c20c4b965d5b75540f6865a35fc8030358e33ec44ecfed33e90901a27a72
```

if your user policy includes `lambda:PutRuntimeManagementConfig`, which is recommended.

Otherwise, future updates to the runtime by AWS have the potential to break the function. If you don't have this permission in your policy, a warning will be printed.

## Memory size [​](https://www.remotion.dev/docs/lambda/runtime\#memory-size "Direct link to Memory size")

The default is 2048 MB. You can configure it by passing an argument to [`deployFunction()`](https://www.remotion.dev/docs/lambda/deployfunction) or by passing a `--memory` flag to the CLI when deploying a function.

## Timeout [​](https://www.remotion.dev/docs/lambda/runtime\#timeout "Direct link to Timeout")

The default is 120 seconds. You can configure it when calling [`deployFunction()`](https://www.remotion.dev/docs/lambda/deployfunction) or by passing a `--timeout` flag to the CLI when deploying a function.

Note that you probably don't need to increase it - Since the video is rendered by splitting it into many parts and those parts are rendered in parallel, there are rare cases where you need more than 120 seconds.

## Storage space [​](https://www.remotion.dev/docs/lambda/runtime\#storage-space "Direct link to Storage space")

The function has between [512MB and 10GB of storage space](https://www.remotion.dev/docs/lambda/disk-size) in total available for video rendering depending on your configuration. Keep in mind that the concatenations of various chunks into one video takes place within a Lambda function, so the space must suffice for both the chunks and the output video.

## Core count / vCPUs [​](https://www.remotion.dev/docs/lambda/runtime\#core-count--vcpus "Direct link to Core count / vCPUs")

The amount of cores inside a Lambda is dependent on the amount of memory you give it. According to [this research](https://web.archive.org/web/20230331040434/https://www.sentiatechblog.com/aws-re-invent-2020-day-3-optimizing-lambda-cost-with-multi-threading), these are the tiers:

| Memory | vCPUs |
| --- | --- |
| 128 - 3008 MB | 2 |
| 3009 - 5307 MB | 3 |
| 5308 - 7076 MB | 4 |
| 7077 - 8845 MB | 5 |
| 8846+ MB | 6 |

You can render multiple frames at once inside a Lambda function by using the [`concurrencyPerLambda`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#concurrencyperlambda) option.

## Chrome [​](https://www.remotion.dev/docs/lambda/runtime\#chrome "Direct link to Chrome")

The function already includes a running version of Chrome.
The browser was compiled including the proprietary codecs, so you can include MP4 videos into your project.

| Remotion version | Chrome version |
| --- | --- |
| From 4.0.274 | 133.0.6943.141 |
| From 4.0.245 | 123.0.6312.86 |
| From 4.0.0 | 114.0.5731.1 |
| From 3.2.0 | 104.0.5112.64 |
| From 3.0.8 | 101.0.4951.68 |
| From 3.0.0 | 98.0.4758.139 |

## FFmpeg [​](https://www.remotion.dev/docs/lambda/runtime\#ffmpeg "Direct link to FFmpeg")

The FFmpeg which is built into `@remotion/renderer` is being used on Lambda.

## Fonts [​](https://www.remotion.dev/docs/lambda/runtime\#fonts "Direct link to Fonts")

The function includes the following fonts:

- Noto Color Emoji
- Noto Sans Black
- Noto Sans Bold
- Noto Sans Regular
- Noto Sans SemiBold
- Noto Sans Thin
- Noto Sans Arabic Regular
- Noto Sans Devanagari Regular
- Noto Sans Hebrew Regular
- Noto Sans Tamil Regular
- Noto Sans Thai Regular

Since December 2021 the following fonts are also available **only on the `arm64` version of Remotion Lambda:**

- Noto Sans Simplified Chinese Regular
- Noto Sans Simplified Chinese Bold
- Noto Sans Traditional Chinese Regular
- Noto Sans Traditional Chinese Bold
- Noto Sans Korean Regular
- Noto Sans Korean Bold
- Noto Sans Japanese Regular
- Noto Sans Japanese Bold

If you'd like to use different fonts, we recommend using Webfonts.

While the set of default fonts that we can include must be kept small in order to save space, we are happy to hear feedback if you encounter a scenario where characters cannot be rendered.

## Customize layers [​](https://www.remotion.dev/docs/lambda/runtime\#customize-layers "Direct link to Customize layers")

See: [Customize Lambda layers](https://www.remotion.dev/docs/lambda/custom-layers) to learn about how you can customize this stack.

## See also [​](https://www.remotion.dev/docs/lambda/runtime\#see-also "Direct link to See also")

- [Customize Lambda layers](https://www.remotion.dev/docs/lambda/custom-layers)

- [Node.JS Version](https://www.remotion.dev/docs/lambda/runtime#nodejs-version)
- [Memory size](https://www.remotion.dev/docs/lambda/runtime#memory-size)
- [Timeout](https://www.remotion.dev/docs/lambda/runtime#timeout)
- [Storage space](https://www.remotion.dev/docs/lambda/runtime#storage-space)
- [Core count / vCPUs](https://www.remotion.dev/docs/lambda/runtime#core-count--vcpus)
- [Chrome](https://www.remotion.dev/docs/lambda/runtime#chrome)
- [FFmpeg](https://www.remotion.dev/docs/lambda/runtime#ffmpeg)
- [Fonts](https://www.remotion.dev/docs/lambda/runtime#fonts)
- [Customize layers](https://www.remotion.dev/docs/lambda/runtime#customize-layers)
- [See also](https://www.remotion.dev/docs/lambda/runtime#see-also)

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