[Skip to main content](https://www.remotion.dev/docs/cloudrun/getsites#__docusaurus_skipToContent_fallback)

On this page

EXPERIMENTAL

Cloud Run is in [Alpha status and not actively being developed.](https://www.remotion.dev/docs/cloudrun/status)

Gets an array of Remotion projects in Cloud Storage, in your GCP project.

The projects are located in the `sites/` subdirectory of your Cloud Storage bucket. Remember - you should only have one bucket for Remotion Cloud Run per region, therefore you do not need to specify the name of the bucket for this function.

## Example [​](https://www.remotion.dev/docs/cloudrun/getsites\#example "Direct link to Example")

Gets all sites and logs information about them.

```

ts

import {getSites} from '@remotion/cloudrun';

const {sites, buckets} = await getSites('europe-west4');

for (const site of sites) {
  console.log(site.id); // A unique ID for referring to that project
  console.log(site.bucketName); // In which bucket the site resides in.
  console.log(site.bucketRegion); // In which region the bucket resides in.
  console.log(site.serveUrl); // URL of the deployed site that you can pass to `renderMediaOnCloudRun()`
}

for (const bucket of buckets) {
  console.log(bucket.name); // The name of the Cloud Storage bucket.
  console.log(bucket.creationDate); // A unix timestamp of when the site was created.
  console.log(bucket.region); // 'europe-west4'
}
```

## Arguments [​](https://www.remotion.dev/docs/cloudrun/getsites\#arguments "Direct link to Arguments")

An object with the following properties:

### `region` [​](https://www.remotion.dev/docs/cloudrun/getsites\#region "Direct link to region")

The [GCP region](https://www.remotion.dev/docs/cloudrun/region-selection) which you want to query. Alternatively, you can pass 'all regions' to return sites across all regions.

```

ts

import {getSites} from '@remotion/cloudrun';

const {sites, buckets} = await getSites('all regions');
```

## Return value [​](https://www.remotion.dev/docs/cloudrun/getsites\#return-value "Direct link to Return value")

A promise resolving to an object with the following properties:

### `sites` [​](https://www.remotion.dev/docs/cloudrun/getsites\#sites "Direct link to sites")

An array of deployed Remotion projects that you can use for rendering.

Each item contains the following properties:

#### `id` [​](https://www.remotion.dev/docs/cloudrun/getsites\#id "Direct link to id")

A unique identifier for that project.

#### `bucketName` [​](https://www.remotion.dev/docs/cloudrun/getsites\#bucketname "Direct link to bucketname")

The bucket in which the project resides in.

#### `bucketRegion` [​](https://www.remotion.dev/docs/cloudrun/getsites\#bucketregion "Direct link to bucketregion")

The region in which the bucket resides in.

#### `serveUrl` [​](https://www.remotion.dev/docs/cloudrun/getsites\#serveurl "Direct link to serveurl")

URL of the deployed site. You can pass it into [`renderMediaOnCloudRun()`](https://www.remotion.dev/docs/cloudrun/rendermediaoncloudrun) to render a video or audio.

### `buckets` [​](https://www.remotion.dev/docs/cloudrun/getsites\#buckets "Direct link to buckets")

An array of all buckets in the selected region in your account that start with `remotioncloudrun-`.

info

You should only have [1 bucket](https://www.remotion.dev/docs/cloudrun/multiple-buckets) per region for all your Remotion projects.

Each item contains the following properties:

#### `region` [​](https://www.remotion.dev/docs/cloudrun/getsites\#region-1 "Direct link to region-1")

The region the bucket resides in.

#### `name` [​](https://www.remotion.dev/docs/cloudrun/getsites\#name "Direct link to name")

The name of the bucket. Cloud Storage buckets have globally unique names.

#### `creationDate` [​](https://www.remotion.dev/docs/cloudrun/getsites\#creationdate "Direct link to creationdate")

A UNIX timestamp of the point when the bucket was first created.

## See also [​](https://www.remotion.dev/docs/cloudrun/getsites\#see-also "Direct link to See also")

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/cloudrun/src/api/get-sites.ts)
- [deleteSite()](https://www.remotion.dev/docs/cloudrun/deletesite)

- [Example](https://www.remotion.dev/docs/cloudrun/getsites#example)
- [Arguments](https://www.remotion.dev/docs/cloudrun/getsites#arguments)
  - [`region`](https://www.remotion.dev/docs/cloudrun/getsites#region)
- [Return value](https://www.remotion.dev/docs/cloudrun/getsites#return-value)
  - [`sites`](https://www.remotion.dev/docs/cloudrun/getsites#sites)
  - [`buckets`](https://www.remotion.dev/docs/cloudrun/getsites#buckets)
- [See also](https://www.remotion.dev/docs/cloudrun/getsites#see-also)

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