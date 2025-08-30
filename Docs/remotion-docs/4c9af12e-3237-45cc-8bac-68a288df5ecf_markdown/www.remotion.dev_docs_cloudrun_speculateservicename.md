[Skip to main content](https://www.remotion.dev/docs/cloudrun/speculateservicename#__docusaurus_skipToContent_fallback)

On this page

EXPERIMENTAL

Cloud Run is in [Alpha status and not actively being developed.](https://www.remotion.dev/docs/cloudrun/status)

Speculate the name of the Cloud Run service that will be created by [deployService()](https://www.remotion.dev/docs/cloudrun/deployservice) or its CLI equivalent, [`npx remotion cloudrun services deploy`](https://www.remotion.dev/docs/cloudrun/cli/services). This could be useful in cases when the configuration of the Cloud Run service is known in advance, and the name of the service is needed.

If you are not sure whether a service exists, use [`getServiceInfo()`](https://www.remotion.dev/docs/cloudrun/getserviceinfo) and catch the error that gets thrown if it does not exist.

If you want to get a list of deployed services, use [`getServices()`](https://www.remotion.dev/docs/cloudrun/getservices) instead.

## Service name pattern [​](https://www.remotion.dev/docs/cloudrun/speculateservicename\#service-name-pattern "Direct link to Service name pattern")

The service name depends on the following parameters:

- Remotion version
- Memory Limit
- CPU Limit
- Timeout in seconds

The name of the service resembles the following pattern:

```

remotion--3-3-96--mem2gi--cpu1-0--t-1900
          ^^^^^^   ^^^     ^^^      ^^^
            |       |       |        |-- Timeout in seconds
            |       |       |----------- Cpu limit
            |       |------------------- Memory limit
            |--------------------------- Remotion version with dots replaced by dashes
```

## Example [​](https://www.remotion.dev/docs/cloudrun/speculateservicename\#example "Direct link to Example")

```

ts

import {speculateServiceName} from '@remotion/cloudrun';

const speculatedServiceName = speculateServiceName({
  memoryLimit: '2Gi',
  cpuLimit: '2',
  timeoutSeconds: 300,
});

console.log(speculatedServiceName); // remotion--3-3-96--mem2gi--cpu2-0--t-300
```

## Arguments [​](https://www.remotion.dev/docs/cloudrun/speculateservicename\#arguments "Direct link to Arguments")

An object with the following properties:

### `memoryLimit` [​](https://www.remotion.dev/docs/cloudrun/speculateservicename\#memorylimit "Direct link to memorylimit")

The upper bound on the amount of RAM that the Cloud Run service can consume.

### `cpuLimit` [​](https://www.remotion.dev/docs/cloudrun/speculateservicename\#cpulimit "Direct link to cpulimit")

The maximum number of CPU cores that the Cloud Run service can use to process requests.

### `timeoutSeconds` [​](https://www.remotion.dev/docs/cloudrun/speculateservicename\#timeoutseconds "Direct link to timeoutseconds")

The timeout that has been assigned to the Cloud Run service.

## Return value [​](https://www.remotion.dev/docs/cloudrun/speculateservicename\#return-value "Direct link to Return value")

A string with the speculated name of the service.

## See also [​](https://www.remotion.dev/docs/cloudrun/speculateservicename\#see-also "Direct link to See also")

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/cloudrun/src/api/speculate-service-name.ts)
- [deployService()](https://www.remotion.dev/docs/cloudrun/deployservice)
- CLI version of `deployService()`: [`npx remotion cloudrun services deploy`](https://www.remotion.dev/docs/cloudrun/cli/services/deploy)

- [Service name pattern](https://www.remotion.dev/docs/cloudrun/speculateservicename#service-name-pattern)
- [Example](https://www.remotion.dev/docs/cloudrun/speculateservicename#example)
- [Arguments](https://www.remotion.dev/docs/cloudrun/speculateservicename#arguments)
  - [`memoryLimit`](https://www.remotion.dev/docs/cloudrun/speculateservicename#memorylimit)
  - [`cpuLimit`](https://www.remotion.dev/docs/cloudrun/speculateservicename#cpulimit)
  - [`timeoutSeconds`](https://www.remotion.dev/docs/cloudrun/speculateservicename#timeoutseconds)
- [Return value](https://www.remotion.dev/docs/cloudrun/speculateservicename#return-value)
- [See also](https://www.remotion.dev/docs/cloudrun/speculateservicename#see-also)

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