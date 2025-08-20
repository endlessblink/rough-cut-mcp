---
url: "https://www.remotion.dev/docs/cloudrun/cli/sites/rm"
title: "npx remotion cloudrun sites rm | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/cloudrun/cli/sites/rm#__docusaurus_skipToContent_fallback)

On this page

EXPERIMENTAL

Cloud Run is in [Alpha status and not actively being developed.](https://www.remotion.dev/docs/cloudrun/status)

```

bash

npx remotion cloudrun sites rm central-site
npx remotion cloudrun sites rm central-site another-site # multiple at once
```

Removes a site (or multiple) from Cloud Storage by it's ID.

Example output

```
Site: central-site
Bucket: remotioncloudrun-abcdefgh
Region: us-central1
Serve Url: https://storage.googleapis.com/remotioncloudrun-abcdefgh/sites/central-site/index.html

Delete? (Y/n) Y

Deleted site central-site from bucket remotioncloudrun-abcdefgh.

```

## `--region` [​](https://www.remotion.dev/docs/cloudrun/cli/sites/rm\#--region "Direct link to --region")

The [GCP region](https://www.remotion.dev/docs/cloudrun/region-selection) to remove sites from.

note

The `rm` command does not support the --all-regions flag, as it is possible to have the same site name in multiple regions. This makes it difficult to remove multiple site-names from multiple regions.

## `--yes`, `-y` [​](https://www.remotion.dev/docs/cloudrun/cli/sites/rm\#--yes--y "Direct link to --yes--y")

Removes a site (or multiple) without asking for confirmation.

```

npx remotion cloudrun sites rm central-site -y
```

## See also [​](https://www.remotion.dev/docs/cloudrun/cli/sites/rm\#see-also "Direct link to See also")

- [Setup guide](https://www.remotion.dev/docs/cloudrun/setup)
- [Cloud Run sites](https://www.remotion.dev/docs/cloudrun/cli/sites)

- [`--region`](https://www.remotion.dev/docs/cloudrun/cli/sites/rm#--region)
- [`--yes`, `-y`](https://www.remotion.dev/docs/cloudrun/cli/sites/rm#--yes--y)
- [See also](https://www.remotion.dev/docs/cloudrun/cli/sites/rm#see-also)

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