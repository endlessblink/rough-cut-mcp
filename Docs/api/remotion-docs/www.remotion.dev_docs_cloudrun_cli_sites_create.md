---
url: "https://www.remotion.dev/docs/cloudrun/cli/sites/create"
title: "npx remotion cloudrun sites create | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/cloudrun/cli/sites/create#__docusaurus_skipToContent_fallback)

On this page

EXPERIMENTAL

Cloud Run is in [Alpha status and not actively being developed.](https://www.remotion.dev/docs/cloudrun/status)

```

bash

npx remotion cloudrun sites create <entry-point>?
```

You may pass an [entry point](https://www.remotion.dev/docs/terminology/entry-point) as the first argument, otherwise the entry point will be [determined](https://www.remotion.dev/docs/terminology/entry-point#which-entry-point-is-being-used).

Bundle and upload a Remotion video to a Cloud Storage bucket.

The result will be a URL such as `https://storage.googleapis.com/remotioncloudrun-12345/sites/mySite123/index.html`.

note

If you make changes locally, you need to redeploy the site. Use [`--site-name`](https://www.remotion.dev/docs/cloudrun/cli/sites/create#--site-name) to overwrite an existing site.

You can use this "Serve URL" to render a video on Remotion Cloud Run using:

- The [`npx remotion cloudrun render`](https://www.remotion.dev/docs/cloudrun/cli/render) command.
- Locally using the [`renderMedia()`](https://www.remotion.dev/docs/renderer/render-media) and [`renderStill()`](https://www.remotion.dev/docs/renderer/render-still) functions.
- Locally using the [`npx remotion render`](https://www.remotion.dev/docs/cli) and [`npx remotion still`](https://www.remotion.dev/docs/cli) commands

If you are rendering on Cloud Run, you can also pass the site Name (in this case `mySite123`) as an abbreviation.

## `--region` [​](https://www.remotion.dev/docs/cloudrun/cli/sites/create\#--region "Direct link to --region")

The [GCP region](https://www.remotion.dev/docs/cloudrun/region-selection) to select. The service accessing the site should also be in this same region to minimise latency.

## `--site-name` [​](https://www.remotion.dev/docs/cloudrun/cli/sites/create\#--site-name "Direct link to --site-name")

Uploads the project to a specific directory and returns a deterministic URL. If a site already existed under this name, in the same region, it will be overwritten. Can only contain the following characters: `0-9`, `a-z`, `A-Z`, `-`, `!`, `_`, `.`, `*`, `'`, `(`, `)`

```

npx remotion cloudrun sites create src/index.ts --site-name=another-site
```

## `--disable-git-source` [v4.0.182](https://github.com/remotion-dev/remotion/releases/v4.0.182) [​](https://www.remotion.dev/docs/cloudrun/cli/sites/create\#--disable-git-source "Direct link to --disable-git-source")

Disables the Git Source being connected to the Remotion Studio. Clicking on stack traces and certain menu items will be disabled.

## See also [​](https://www.remotion.dev/docs/cloudrun/cli/sites/create\#see-also "Direct link to See also")

- [Setup guide](https://www.remotion.dev/docs/cloudrun/setup)
- [Cloud Run sites](https://www.remotion.dev/docs/cloudrun/cli/sites)

- [`--region`](https://www.remotion.dev/docs/cloudrun/cli/sites/create#--region)
- [`--site-name`](https://www.remotion.dev/docs/cloudrun/cli/sites/create#--site-name)
- [`--disable-git-source`](https://www.remotion.dev/docs/cloudrun/cli/sites/create#--disable-git-source)
- [See also](https://www.remotion.dev/docs/cloudrun/cli/sites/create#see-also)

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