[Skip to main content](https://www.remotion.dev/docs/cloudrun/region-selection#__docusaurus_skipToContent_fallback)

On this page

EXPERIMENTAL

Cloud Run is in [Alpha status and not actively being developed.](https://www.remotion.dev/docs/cloudrun/status)

Before going live with Remotion Cloud Run, you need to think about into which GCP region you are deploying your service and bucket (which will hold your sites and renders).

This document explains how to select a region and which considerations you need to make.

## Available regions [​](https://www.remotion.dev/docs/cloudrun/region-selection\#available-regions "Direct link to Available regions")

The following GCP regions are available:

- `asia-east1`
- `asia-east2`
- `asia-northeast1`
- `asia-northeast2`
- `asia-northeast3`
- `asia-south1`
- `asia-south2`
- `asia-southeast1`
- `asia-southeast2`
- `australia-southeast1`
- `australia-southeast2`
- `europe-central2`
- `europe-north1`
- `europe-southwest1`
- `europe-west1`
- `europe-west2`
- `europe-west3`
- `europe-west4`
- `europe-west6`
- `europe-west8`
- `europe-west9`
- `me-west1`
- `northamerica-northeast1`
- `northamerica-northeast2`
- `southamerica-east1`
- `southamerica-west1`
- `us-central1`
- `us-east1`
- `us-east4`
- `us-east5`
- `us-south1`
- `us-west1`
- `us-west2`
- `us-west3`
- `us-west4`

You can call [`getRegions()`](https://www.remotion.dev/docs/cloudrun/getregions) or type [`npx remotion cloudrun regions`](https://www.remotion.dev/docs/cloudrun/cli/regions) to get this list programmatically.

## Default region [​](https://www.remotion.dev/docs/cloudrun/region-selection\#default-region "Direct link to Default region")

The default region is `us-east1`.

## Selecting a region [​](https://www.remotion.dev/docs/cloudrun/region-selection\#selecting-a-region "Direct link to Selecting a region")

There are 3 ways to select a region:

- When using the Node.JS APIs, you have to pass the region explicitly to each function. Make sure your projects satisfy the Typescript types or follow the documentation.

- When using the CLI, you can set the region using the `REMOTION_GCP_REGION` environment variable. It's best to put it in a `.env` file.

- You can also pass the `--region` flag to all CLI commands to override the region. The flag takes precedence over the environment variable.


info

The REMOTION\_GCP\_REGION environment variable and `--region` flag do not have an effect when using the Node.JS APIs. You need to pass a region explicitly.

If you don't set a region, Remotion will use the default region.

## Which region should I choose? [​](https://www.remotion.dev/docs/cloudrun/region-selection\#which-region-should-i-choose "Direct link to Which region should I choose?")

Note that each region falls into one of two different pricing tiers. Some regions also offer low CO2 intensity electricity usage. The full list of regions per tier is available in the [Cloud Run Docs](https://cloud.google.com/run/docs/locations).

## Other considerations [​](https://www.remotion.dev/docs/cloudrun/region-selection\#other-considerations "Direct link to Other considerations")

- The Cloud Run service and Cloud Storage bucket should be in the same region to eliminate latency across datacenters.

- [Available regions](https://www.remotion.dev/docs/cloudrun/region-selection#available-regions)
- [Default region](https://www.remotion.dev/docs/cloudrun/region-selection#default-region)
- [Selecting a region](https://www.remotion.dev/docs/cloudrun/region-selection#selecting-a-region)
- [Which region should I choose?](https://www.remotion.dev/docs/cloudrun/region-selection#which-region-should-i-choose)
- [Other considerations](https://www.remotion.dev/docs/cloudrun/region-selection#other-considerations)

Remotion

![Logo](https://raw.githubusercontent.com/remotion-dev/brand/refs/heads/main/logo.svg)

Remotion

You may ask your questions about the Remotion documentation and the bot answers it based on the documentation. Go through the sources for better answers appropriately.

QUICK QUESTIONS

How to install it?

How to setup Remotion Lambda?

Why is my composition flickering?

Powered by [CrawlChat](https://crawlchat.app/?ref=powered-by-remotion)