---
url: "https://www.remotion.dev/docs/cloudrun/cli/services/deploy"
title: "npx remotion cloudrun services deploy | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/cloudrun/cli/services/deploy#__docusaurus_skipToContent_fallback)

On this page

EXPERIMENTAL

Cloud Run is in [Alpha status and not actively being developed.](https://www.remotion.dev/docs/cloudrun/status)

```

npx remotion cloudrun services deploy
```

Creates a new service in your GCP project. If a service exists in the same region, with the same Remotion version, with the same amount of memory, disk space and timeout duration, the name of the already deployed service will be returned instead.

Example output

```
Validating Deployment of Cloud Run Service:

Remotion Version: 3.3.95
Memory Limit: 2Gi
CPU Limit: 1.0
Timeout: 300
Project Name: remotion-example
Region: us-east1

Deploying Cloud Run Service...

Cloud Run Deployed!

Service name: remotion--3-3-95--mem512mi--cpu2--t-1200
Version: 3.3.95
CPU Limit: 2

Memory Limit: 512Mi
Timeout: 1200sec
Region: us-east1
Service URL: https://remotion--3-3-95--mem512mi--cpu2--t-1200-1a2b3c4d5e-ue.a.run.app
GCP Console URL: https://console.cloud.google.com/run/detail/us-east1/remotion--3-3-95--mem512mi--cpu2--t-1200/logs

```

## `--region` [​](https://www.remotion.dev/docs/cloudrun/cli/services/deploy\#--region "Direct link to --region")

The [GCP region](https://www.remotion.dev/docs/cloudrun/region-selection) to select. The site that the service will be accessing should also be in this same region to minimise latency.

## `--memoryLimit` [​](https://www.remotion.dev/docs/cloudrun/cli/services/deploy\#--memorylimit "Direct link to --memorylimit")

The upper bound on the amount of RAM that the Cloud Run service can consume. Default: 2 GB.

## `--cpuLimit` [​](https://www.remotion.dev/docs/cloudrun/cli/services/deploy\#--cpulimit "Direct link to --cpulimit")

The maximum number of CPU cores that the Cloud Run service can use to process requests. Default: 1.0.

## `--minInstances` [​](https://www.remotion.dev/docs/cloudrun/cli/services/deploy\#--mininstances "Direct link to --mininstances")

The minimum number of service instances to have available, regardless of requests. Default: 0.

note

Any running instances, even if they are not performing a render, will be billable in GCP. The default minimum number of instances is zero, which means that when no requests are made to your service, you are not billed.

## `--maxInstances` [​](https://www.remotion.dev/docs/cloudrun/cli/services/deploy\#--maxinstances "Direct link to --maxinstances")

The maximum number of service instances that can be create by GCP in response to incoming requests. Default: 100.

## `--timeoutSeconds` [​](https://www.remotion.dev/docs/cloudrun/cli/services/deploy\#--timeoutseconds "Direct link to --timeoutseconds")

Timeout of the Cloud Run service. Default: 300 seconds.

info

Not to be confused with the [`--timeout` flag when rendering which defines the timeout for `delayRender()`](https://www.remotion.dev/docs/cli/render#--timeout).

## `--onlyAllocateCpuDuringRequestProcessing` [v4.0.221](https://github.com/remotion-dev/remotion/releases/v4.0.221) [​](https://www.remotion.dev/docs/cloudrun/cli/services/deploy\#--onlyallocatecpuduringrequestprocessing "Direct link to --onlyallocatecpuduringrequestprocessing")

If this is set to true, `cpu_idle` will be set to `true` in the service manifest.

CPU alloction will be disabled while no request is being processed, which can lead to significant cost savings.

## `--quiet`, `-q` [​](https://www.remotion.dev/docs/cloudrun/cli/services/deploy\#--quiet--q "Direct link to --quiet--q")

Only logs the service name, and 'Authenticated access granted'.

## See also [​](https://www.remotion.dev/docs/cloudrun/cli/services/deploy\#see-also "Direct link to See also")

- [Setup guide](https://www.remotion.dev/docs/cloudrun/setup)
- [Cloud Run services](https://www.remotion.dev/docs/cloudrun/cli/services)

- [`--region`](https://www.remotion.dev/docs/cloudrun/cli/services/deploy#--region)
- [`--memoryLimit`](https://www.remotion.dev/docs/cloudrun/cli/services/deploy#--memorylimit)
- [`--cpuLimit`](https://www.remotion.dev/docs/cloudrun/cli/services/deploy#--cpulimit)
- [`--minInstances`](https://www.remotion.dev/docs/cloudrun/cli/services/deploy#--mininstances)
- [`--maxInstances`](https://www.remotion.dev/docs/cloudrun/cli/services/deploy#--maxinstances)
- [`--timeoutSeconds`](https://www.remotion.dev/docs/cloudrun/cli/services/deploy#--timeoutseconds)
- [`--onlyAllocateCpuDuringRequestProcessing`](https://www.remotion.dev/docs/cloudrun/cli/services/deploy#--onlyallocatecpuduringrequestprocessing)
- [`--quiet`, `-q`](https://www.remotion.dev/docs/cloudrun/cli/services/deploy#--quiet--q)
- [See also](https://www.remotion.dev/docs/cloudrun/cli/services/deploy#see-also)

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