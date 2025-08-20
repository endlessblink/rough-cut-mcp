---
url: "https://www.remotion.dev/docs/cloudrun/cli/services/rmall"
title: "npx remotion cloudrun services rmall | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/cloudrun/cli/services/rmall#__docusaurus_skipToContent_fallback)

On this page

EXPERIMENTAL

Cloud Run is in [Alpha status and not actively being developed.](https://www.remotion.dev/docs/cloudrun/status)

```

npx remotion cloudrun services rmall
```

Removes all services from your GCP project for a certain region.

Example output

```
2 services in us-east1

Service name: remotion--3-3-95--mem512mi--cpu2--t-1200
Version: 3.3.95
CPU Limit: 2

Memory Limit: 512Mi
Timeout: 1200sec
Region: us-east1
Service URL: https://remotion--3-3-95--mem512mi--cpu2--t-1200-1a2b3c4d5e-ue.a.run.app
GCP Console URL: https://console.cloud.google.com/run/detail/us-east1/remotion--3-3-95--mem512mi--cpu2--t-1200/logs

Delete? (Y/n) n

Skipping service - remotion--3-3-95--mem512mi--cpu2--t-1200.

Service name: remotion--3-3-82--mem512mi--cpu1-0--t-800
Version: 3.3.82
CPU Limit: 1.0
Memory Limit: 512Mi
Timeout: 800sec
Region: us-east1
Service URL: https://remotion--3-3-82--mem512mi--cpu1-0--t-800-1a2b3c4d5e-ue.a.run.app
GCP Console URL: https://console.cloud.google.com/run/detail/us-east1/remotion--3-3-82--mem512mi--cpu1-0--t-800/logs

Delete? (Y/n) n

Skipping service - remotion--3-3-82--mem512mi--cpu1-0--t-800.

```

## `--region` [​](https://www.remotion.dev/docs/cloudrun/cli/services/rmall\#--region "Direct link to --region")

The [GCP region](https://www.remotion.dev/docs/cloudrun/region-selection) to remove services from.

## `--yes`, `-y` [​](https://www.remotion.dev/docs/cloudrun/cli/services/rmall\#--yes--y "Direct link to --yes--y")

Skips confirmation.

## See also [​](https://www.remotion.dev/docs/cloudrun/cli/services/rmall\#see-also "Direct link to See also")

- [Setup guide](https://www.remotion.dev/docs/cloudrun/setup)
- [Cloud Run services](https://www.remotion.dev/docs/cloudrun/cli/services)

- [`--region`](https://www.remotion.dev/docs/cloudrun/cli/services/rmall#--region)
- [`--yes`, `-y`](https://www.remotion.dev/docs/cloudrun/cli/services/rmall#--yes--y)
- [See also](https://www.remotion.dev/docs/cloudrun/cli/services/rmall#see-also)

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