---
url: "https://www.remotion.dev/docs/cloudrun/cli/sites/rmall"
title: "npx remotion cloudrun sites rmall | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/cloudrun/cli/sites/rmall#__docusaurus_skipToContent_fallback)

On this page

EXPERIMENTAL

Cloud Run is in [Alpha status and not actively being developed.](https://www.remotion.dev/docs/cloudrun/status)

```

bash

npx remotion cloudrun sites rmall
```

Remove all sites in the selected GCP project.

Example output

```
Retrieving sites in us-east1.

Site: another-site
Bucket: remotioncloudrun-12345
Region: us-east1
Serve Url: https://storage.googleapis.com/remotioncloudrun-12345/sites/another-site/index.html

Delete? (Y/n) n

Skipping site - another-site.

Site: test-site
Bucket: remotioncloudrun-12345
Region: us-east1
Serve Url: https://storage.googleapis.com/remotioncloudrun-12345/sites/test-site/index.html

Delete? (Y/n) n

Skipping site - test-site.
```

## `--region` [​](https://www.remotion.dev/docs/cloudrun/cli/sites/rmall\#--region "Direct link to --region")

The [GCP region](https://www.remotion.dev/docs/cloudrun/region-selection) to remove all sites from.

## `--all-regions`, [​](https://www.remotion.dev/docs/cloudrun/cli/sites/rmall\#--all-regions "Direct link to --all-regions")

Ignores region, removing sites across all regions for the project.

```

npx remotion cloudrun sites rmall --all-regions
```

Example output

```
Retrieving sites in all regions.

Site: another-site
Bucket: remotioncloudrun-12345
Region: us-east1
Serve Url: https://storage.googleapis.com/remotioncloudrun-12345/sites/another-site/index.html

Delete? (Y/n) n

Skipping site - another-site.

Site: test-site
Bucket: remotioncloudrun-12345
Region: us-east1
Serve Url: https://storage.googleapis.com/remotioncloudrun-12345/sites/test-site/index.html

Delete? (Y/n) n

Skipping site - test-site.

Site: central-site
Bucket: remotioncloudrun-abcdefgh
Region: us-central1
Serve Url: https://storage.googleapis.com/remotioncloudrun-abcdefgh/sites/central-site/index.html

Delete? (Y/n) n

Skipping site - central-site.
```

## `--yes`, `-y` [​](https://www.remotion.dev/docs/cloudrun/cli/sites/rmall\#--yes--y "Direct link to --yes--y")

Removes all sites without asking for confirmation.

```

npx remotion cloudrun sites rmall -y
```

## See also [​](https://www.remotion.dev/docs/cloudrun/cli/sites/rmall\#see-also "Direct link to See also")

- [Setup guide](https://www.remotion.dev/docs/cloudrun/setup)
- [Cloud Run sites](https://www.remotion.dev/docs/cloudrun/cli/sites)

- [`--region`](https://www.remotion.dev/docs/cloudrun/cli/sites/rmall#--region)
- [`--all-regions`,](https://www.remotion.dev/docs/cloudrun/cli/sites/rmall#--all-regions)
- [`--yes`, `-y`](https://www.remotion.dev/docs/cloudrun/cli/sites/rmall#--yes--y)
- [See also](https://www.remotion.dev/docs/cloudrun/cli/sites/rmall#see-also)

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