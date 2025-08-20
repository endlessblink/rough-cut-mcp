---
url: "https://www.remotion.dev/docs/cloudrun/deletesite"
title: "deleteSite() | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/cloudrun/deletesite#__docusaurus_skipToContent_fallback)

On this page

EXPERIMENTAL

Cloud Run is in [Alpha status and not actively being developed.](https://www.remotion.dev/docs/cloudrun/status)

Removes a Remotion project from your Cloud Storage bucket.

Each project is located in the `sites/` subdirectory of your Cloud Storage bucket. Calling this function is equivalent of deleting all files inside a subfolder of your `sites/` subdirectory.

## Example [​](https://www.remotion.dev/docs/cloudrun/deletesite\#example "Direct link to Example")

Gets all sites and deletes them.

```

ts

import {GcpRegion, deleteSite, getSites} from '@remotion/cloudrun';

const region: GcpRegion = 'australia-southeast1';

const {sites} = await getSites(region);

for (const site of sites) {
  await deleteSite({
    bucketName: site.bucketName,
    siteName: site.id,
  });
  console.log(`Site ${site.id} deleted.`);
}
```

## Arguments [​](https://www.remotion.dev/docs/cloudrun/deletesite\#arguments "Direct link to Arguments")

An object with the following properties:

### `bucketName` [​](https://www.remotion.dev/docs/cloudrun/deletesite\#bucketname "Direct link to bucketname")

_string_

The name of the Cloud Storage bucket in which your site resides in.

### `siteName` [​](https://www.remotion.dev/docs/cloudrun/deletesite\#sitename "Direct link to sitename")

_string_

The unique ID of the project you want to delete.

## Return value [​](https://www.remotion.dev/docs/cloudrun/deletesite\#return-value "Direct link to Return value")

A promise resolving nothing.

## See also [​](https://www.remotion.dev/docs/cloudrun/deletesite\#see-also "Direct link to See also")

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/cloudrun/src/api/delete-site.ts)
- [getSites()](https://www.remotion.dev/docs/cloudrun/getsites)
- [deploySite()](https://www.remotion.dev/docs/cloudrun/deploysite)

- [Example](https://www.remotion.dev/docs/cloudrun/deletesite#example)
- [Arguments](https://www.remotion.dev/docs/cloudrun/deletesite#arguments)
  - [`bucketName`](https://www.remotion.dev/docs/cloudrun/deletesite#bucketname)
  - [`siteName`](https://www.remotion.dev/docs/cloudrun/deletesite#sitename)
- [Return value](https://www.remotion.dev/docs/cloudrun/deletesite#return-value)
- [See also](https://www.remotion.dev/docs/cloudrun/deletesite#see-also)

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