[Skip to main content](https://www.remotion.dev/docs/lambda/cli/sites/ls#__docusaurus_skipToContent_fallback)

On this page

```

npx remotion lambda sites ls
```

Get a list of sites. The URL that is printed can be passed to the `render` command to render a video.

Example output

```
Site Name Bucket Size Last updated
pr6fwglz05 remotionlambda-abcdefg 14.7 MB 2021-12-02
https://remotionlambda-abcdefg.s3.eu-central-1.amazonaws.com/sites/pr6fwglz05/index.html

testbed remotionlambda-abcdefg 14.7 MB 2021-12-02

https://remotionlambda-abcdefg.s3.eu-central-1.amazonaws.com/sites/testbed/index.html

```

## `--region` [​](https://www.remotion.dev/docs/lambda/cli/sites/ls\#--region "Direct link to --region")

The [AWS region](https://www.remotion.dev/docs/lambda/region-selection) to select. Both project and function should be in this region.

## `--quiet`, `-q` [​](https://www.remotion.dev/docs/lambda/cli/sites/ls\#--quiet--q "Direct link to --quiet--q")

Returns only a list of space-separated sites.

```

npx remotion lambda sites ls -q
```

Example output

```
pr6fwglz05 testbed

```

## `--force-path-style` [v4.0.202](https://github.com/remotion-dev/remotion/releases/v4.0.202) [​](https://www.remotion.dev/docs/lambda/cli/sites/ls\#--force-path-style "Direct link to --force-path-style")

Passes `forcePathStyle` to the AWS S3 client. If you don't know what this is, you probably don't need it.

- [`--region`](https://www.remotion.dev/docs/lambda/cli/sites/ls#--region)
- [`--quiet`, `-q`](https://www.remotion.dev/docs/lambda/cli/sites/ls#--quiet--q)
- [`--force-path-style`](https://www.remotion.dev/docs/lambda/cli/sites/ls#--force-path-style)

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