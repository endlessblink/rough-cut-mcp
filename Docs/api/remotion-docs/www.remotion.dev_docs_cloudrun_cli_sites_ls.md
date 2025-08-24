---
url: "https://www.remotion.dev/docs/cloudrun/cli/sites/ls"
title: "npx remotion cloudrun sites ls | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/cloudrun/cli/sites/ls#__docusaurus_skipToContent_fallback)

On this page

EXPERIMENTAL

Cloud Run is in [Alpha status and not actively being developed.](https://www.remotion.dev/docs/cloudrun/status)

```

npx remotion cloudrun sites ls
```

Get a list of sites. The URL that is printed can be passed to the `render` command to render a video.

Example output

```
2 sites in us-east1, in the remotion-example project.

Site: another-site
Bucket: remotioncloudrun-12345
Region: us-east1
Serve Url: https://storage.googleapis.com/remotioncloudrun-12345/sites/another-site/index.html

Site: test-site
Bucket: remotioncloudrun-12345
Region: us-east1
Serve Url: https://storage.googleapis.com/remotioncloudrun-12345/sites/test-site/index.html

```

## `--region` [​](https://www.remotion.dev/docs/cloudrun/cli/sites/ls\#--region "Direct link to --region")

The [GCP region](https://www.remotion.dev/docs/cloudrun/region-selection) to list sites from.

## `--all-regions`, [​](https://www.remotion.dev/docs/cloudrun/cli/sites/ls\#--all-regions "Direct link to --all-regions")

Ignores region, returning sites across all regions for the project.

```

npx remotion cloudrun sites ls --all-regions
```

Example output

```
3 sites in all regions, in the remotion-example project.

Site: another-site
Bucket: remotioncloudrun-12345
Region: us-east1
Serve Url: https://storage.googleapis.com/remotioncloudrun-12345/sites/another-site/index.html

Site: test-site
Bucket: remotioncloudrun-12345
Region: us-east1
Serve Url: https://storage.googleapis.com/remotioncloudrun-12345/sites/test-site/index.html

Site: central-site
Bucket: remotioncloudrun-abcdefgh
Region: us-central1
Serve Url: https://storage.googleapis.com/remotioncloudrun-abcdefgh/sites/central-site/index.html
```

## `--quiet`, `-q` [​](https://www.remotion.dev/docs/cloudrun/cli/sites/ls\#--quiet--q "Direct link to --quiet--q")

Returns only a list of space-separated sites.

```

npx remotion cloudrun sites ls -q
```

Example output

```
another-site test-site central-site

```

## See also [​](https://www.remotion.dev/docs/cloudrun/cli/sites/ls\#see-also "Direct link to See also")

- [Setup guide](https://www.remotion.dev/docs/cloudrun/setup)
- [Cloud Run sites](https://www.remotion.dev/docs/cloudrun/cli/sites)

- [`--region`](https://www.remotion.dev/docs/cloudrun/cli/sites/ls#--region)
- [`--all-regions`,](https://www.remotion.dev/docs/cloudrun/cli/sites/ls#--all-regions)
- [`--quiet`, `-q`](https://www.remotion.dev/docs/cloudrun/cli/sites/ls#--quiet--q)
- [See also](https://www.remotion.dev/docs/cloudrun/cli/sites/ls#see-also)

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