---
url: "https://www.remotion.dev/docs/cloudrun/deleteservice"
title: "deleteService() | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/cloudrun/deleteservice#__docusaurus_skipToContent_fallback)

On this page

EXPERIMENTAL

Cloud Run is in [Alpha status and not actively being developed.](https://www.remotion.dev/docs/cloudrun/status)

Deletes a deployed Cloud Run service based on its name.

To retrieve a list of services, call [`getServices()`](https://www.remotion.dev/docs/cloudrun/getservices) first.

## Example [​](https://www.remotion.dev/docs/cloudrun/deleteservice\#example "Direct link to Example")

```

ts

import {deleteService, getServices} from '@remotion/cloudrun';

const services = await getServices({
  region: 'us-east1',
  compatibleOnly: false,
});
for (const service of services) {
  await deleteService({
    region: 'us-east1',
    serviceName: service.serviceName,
  });
}
```

## Arguments [​](https://www.remotion.dev/docs/cloudrun/deleteservice\#arguments "Direct link to Arguments")

An object with the following properties:

### `region` [​](https://www.remotion.dev/docs/cloudrun/deleteservice\#region "Direct link to region")

The [GCP region](https://www.remotion.dev/docs/cloudrun/region-selection) to which the service was deployed to.

### `serviceName` [​](https://www.remotion.dev/docs/cloudrun/deleteservice\#servicename "Direct link to servicename")

The name of the service to be deleted.

## Return value [​](https://www.remotion.dev/docs/cloudrun/deleteservice\#return-value "Direct link to Return value")

Nothing. If the deletion failed, the service rejects with an error.

## See also [​](https://www.remotion.dev/docs/cloudrun/deleteservice\#see-also "Direct link to See also")

- [Source code for this service](https://github.com/remotion-dev/remotion/blob/main/packages/cloudrun/src/api/delete-service.ts)
- [deployService()](https://www.remotion.dev/docs/cloudrun/deployservice)
- [getServices()](https://www.remotion.dev/docs/cloudrun/getservices)

- [Example](https://www.remotion.dev/docs/cloudrun/deleteservice#example)
- [Arguments](https://www.remotion.dev/docs/cloudrun/deleteservice#arguments)
  - [`region`](https://www.remotion.dev/docs/cloudrun/deleteservice#region)
  - [`serviceName`](https://www.remotion.dev/docs/cloudrun/deleteservice#servicename)
- [Return value](https://www.remotion.dev/docs/cloudrun/deleteservice#return-value)
- [See also](https://www.remotion.dev/docs/cloudrun/deleteservice#see-also)

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