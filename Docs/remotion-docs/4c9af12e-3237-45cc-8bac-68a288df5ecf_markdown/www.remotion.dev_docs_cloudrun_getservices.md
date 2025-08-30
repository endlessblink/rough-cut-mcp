[Skip to main content](https://www.remotion.dev/docs/cloudrun/getservices#__docusaurus_skipToContent_fallback)

On this page

EXPERIMENTAL

Cloud Run is in [Alpha status and not actively being developed.](https://www.remotion.dev/docs/cloudrun/status)

Retrieves a list of Remotion services deployed to GCP Cloud Run.

The parameter `compatibleOnly` determines whether only services that are compatible with the installed version of Remotion Cloud Run should be returned.

note

The Cloud Run service is versioned and the version of the service must match the version of the `@remotion/cloudrun` package. So if you upgrade Remotion, you should deploy a new service or otherwise you might get an empty array from this function.

To get information about only a single service, use [`getServiceInfo()`](https://www.remotion.dev/docs/cloudrun/getserviceinfo).

If you are sure that a service exists, you can also guess the name of it using [`speculateServiceName()`](https://www.remotion.dev/docs/cloudrun/speculateservicename) and save an API call to Cloud Run.

## Example [​](https://www.remotion.dev/docs/cloudrun/getservices\#example "Direct link to Example")

```

ts

import {getServices} from '@remotion/cloudrun/client';

const info = await getServices({
  region: 'us-east1',
  compatibleOnly: true,
});

for (const service of info) {
  console.log(service.serviceName); // "remotion--3-3-82--mem512mi--cpu1-0"
  console.log(service.timeoutInSeconds); // 300
  console.log(service.memoryLimit); // 512Mi
  console.log(service.cpuLimit); // 1.0
  console.log(service.remotionVersion); // "4.0.1"
  console.log(service.uri); // "https://remotion--3-3-82--mem512mi--cpu1-0--t-300-1a2b3c4d5e-ue.a.run.app"
  console.log(service.region); // "us-east1"
  console.log(service.consoleUrl); // "https://console.cloud.google.com/run/detail/us-east1/remotion--3-3-82--mem512mi--cpu1-0--t-300/logs"
}
```

note

Import from [`@remotion/cloudrun/client`](https://www.remotion.dev/docs/cloudrun/light-client) to not import the whole renderer, which cannot be bundled.

## Argument [​](https://www.remotion.dev/docs/cloudrun/getservices\#argument "Direct link to Argument")

An object containing the following properties:

### `region` [​](https://www.remotion.dev/docs/cloudrun/getservices\#region "Direct link to region")

The [GCP region](https://www.remotion.dev/docs/cloudrun/region-selection) that you would like to query.

```

ts

import {getServices} from '@remotion/cloudrun';

const info = await getServices({
  region: 'us-west1',
  compatibleOnly: true,
});

for (const service of info) {
  console.log(service.serviceName); // "remotion--3-3-82--mem2gi--cpu2--t-1100"
  console.log(service.timeoutInSeconds); // 1100
  console.log(service.memoryLimit); // 2Gi
  console.log(service.cpuLimit); // 2
  console.log(service.remotionVersion); // "3.3.82"
  console.log(service.uri); // "https://remotion--3-3-82--mem2gi--cpu2--t-1100-1a2b3c4d5e-uw.a.run.app"
  console.log(service.region); // "us-west1"
  console.log(service.consoleUrl); // "https://console.cloud.google.com/run/detail/us-west1/remotion--3-3-82--mem2gi--cpu2--t-1100/logs"
}
```

### `compatibleOnly` [​](https://www.remotion.dev/docs/cloudrun/getservices\#compatibleonly "Direct link to compatibleonly")

If `true`, only services that match the version of the current Remotion Cloud run package are returned. If `false`, all Remotion services are returned.

## Return value [​](https://www.remotion.dev/docs/cloudrun/getservices\#return-value "Direct link to Return value")

A promise resolving to an **array of objects** with the following properties:

### `serviceName` [​](https://www.remotion.dev/docs/cloudrun/getservices\#servicename "Direct link to servicename")

The name of the service.

### `memoryLimit` [​](https://www.remotion.dev/docs/cloudrun/getservices\#memorylimit "Direct link to memorylimit")

The upper bound on the amount of RAM that the Cloud Run service can consume.

### `cpuLimit` [​](https://www.remotion.dev/docs/cloudrun/getservices\#cpulimit "Direct link to cpulimit")

The maximum number of CPU cores that the Cloud Run service can use to process requests.

### `remotionVersion` [​](https://www.remotion.dev/docs/cloudrun/getservices\#remotionversion "Direct link to remotionversion")

The Remotion version of the service. Remotion is versioning the Cloud Run service and a render can only be triggered from a version of `@remotion/cloudrun` that is matching the one of the service.

### `timeoutInSeconds` [​](https://www.remotion.dev/docs/cloudrun/getservices\#timeoutinseconds "Direct link to timeoutinseconds")

The timeout that has been assigned to the Cloud Run service.

### `uri` [​](https://www.remotion.dev/docs/cloudrun/getservices\#uri "Direct link to uri")

The endpoint of the service.

### `region` [​](https://www.remotion.dev/docs/cloudrun/getservices\#region-1 "Direct link to region-1")

The region of the deployed service. Useful if passing 'all regions' to the region input.

### `consoleUrl` [​](https://www.remotion.dev/docs/cloudrun/getservices\#consoleurl "Direct link to consoleurl")

A link to the GCP console page for this service. Specifically, a link to logs display.

## See also [​](https://www.remotion.dev/docs/cloudrun/getservices\#see-also "Direct link to See also")

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/cloudrun/src/api/get-services.ts)
- [`getServiceInfo()`](https://www.remotion.dev/docs/cloudrun/getserviceinfo)
- [`deployService()`](https://www.remotion.dev/docs/cloudrun/deployservice)
- [`deleteService()`](https://www.remotion.dev/docs/cloudrun/deleteservice)

- [Example](https://www.remotion.dev/docs/cloudrun/getservices#example)
- [Argument](https://www.remotion.dev/docs/cloudrun/getservices#argument)
  - [`region`](https://www.remotion.dev/docs/cloudrun/getservices#region)
  - [`compatibleOnly`](https://www.remotion.dev/docs/cloudrun/getservices#compatibleonly)
- [Return value](https://www.remotion.dev/docs/cloudrun/getservices#return-value)
  - [`serviceName`](https://www.remotion.dev/docs/cloudrun/getservices#servicename)
  - [`memoryLimit`](https://www.remotion.dev/docs/cloudrun/getservices#memorylimit)
  - [`cpuLimit`](https://www.remotion.dev/docs/cloudrun/getservices#cpulimit)
  - [`remotionVersion`](https://www.remotion.dev/docs/cloudrun/getservices#remotionversion)
  - [`timeoutInSeconds`](https://www.remotion.dev/docs/cloudrun/getservices#timeoutinseconds)
  - [`uri`](https://www.remotion.dev/docs/cloudrun/getservices#uri)
  - [`region`](https://www.remotion.dev/docs/cloudrun/getservices#region-1)
  - [`consoleUrl`](https://www.remotion.dev/docs/cloudrun/getservices#consoleurl)
- [See also](https://www.remotion.dev/docs/cloudrun/getservices#see-also)

Remotion

![Logo](https://raw.githubusercontent.com/remotion-dev/brand/refs/heads/main/logo.svg)

Remotion

You may ask your questions about the Remotion documentation and the bot answers it based on the documentation. Go through the sources for better answers appropriately.

QUICK QUESTIONS

How to install it?

How to setup Remotion Lambda?

Why is my composition flickering?

Powered by [CrawlChat](https://crawlchat.app/?ref=powered-by-remotion)