[Skip to main content](https://www.remotion.dev/docs/lambda/getfunctioninfo#__docusaurus_skipToContent_fallback)

On this page

Gets information about a function given its name and region.

To get a list of deployed functions, use [`getFunctions()`](https://www.remotion.dev/docs/lambda/getfunctions).

To deploy a function, use [`deployFunction()`](https://www.remotion.dev/docs/lambda/deployfunction).

## Example [​](https://www.remotion.dev/docs/lambda/getfunctioninfo\#example "Direct link to Example")

```

ts

import {getFunctionInfo} from '@remotion/lambda';

const info = await getFunctionInfo({
  functionName: 'remotion-render-d7nd2a9f',
  region: 'eu-central-1',
});
console.log(info.functionName); // remotion-render-d7nd2a9f
console.log(info.memorySizeInMb); // 1500
console.log(info.diskSizeInMb); // 2048
console.log(info.version); // '2021-07-14'
console.log(info.timeoutInSeconds); // 120
```

## Arguments [​](https://www.remotion.dev/docs/lambda/getfunctioninfo\#arguments "Direct link to Arguments")

An object containing the following properties:

### `region` [​](https://www.remotion.dev/docs/lambda/getfunctioninfo\#region "Direct link to region")

The [AWS region](https://www.remotion.dev/docs/lambda/region-selection) the function resides in.

### `functionName` [​](https://www.remotion.dev/docs/lambda/getfunctioninfo\#functionname "Direct link to functionname")

The name of the function.

### `logLevel?` [v4.0.115](https://github.com/remotion-dev/remotion/releases/v4.0.115) [​](https://www.remotion.dev/docs/lambda/getfunctioninfo\#loglevel "Direct link to loglevel")

One of `trace`, `verbose`, `info`, `warn`, `error`.

Determines how much info is being logged to the console.

Default `info`.

## Return value [​](https://www.remotion.dev/docs/lambda/getfunctioninfo\#return-value "Direct link to Return value")

If the function does not exist, an error is thrown by the AWS SDK.
If the function exists, promise resolving to an object with the following properties is returned:

### `memorySizeInMb` [​](https://www.remotion.dev/docs/lambda/getfunctioninfo\#memorysizeinmb "Direct link to memorysizeinmb")

The amount of memory allocated to the function.

### `diskSizeInMb` [​](https://www.remotion.dev/docs/lambda/getfunctioninfo\#disksizeinmb "Direct link to disksizeinmb")

The amount of disk space allocated to the function.

### `functionName` [​](https://www.remotion.dev/docs/lambda/getfunctioninfo\#functionname-1 "Direct link to functionname-1")

The name of the function.

### `version` [​](https://www.remotion.dev/docs/lambda/getfunctioninfo\#version "Direct link to version")

The version of the function. Remotion is versioning the Lambda function and a render can only be triggered from a version of `@remotion/lambda` that is matching the one of the function.

### `timeoutInSeconds` [​](https://www.remotion.dev/docs/lambda/getfunctioninfo\#timeoutinseconds "Direct link to timeoutinseconds")

The timeout that has been assigned to the Lambda function.

## See also [​](https://www.remotion.dev/docs/lambda/getfunctioninfo\#see-also "Direct link to See also")

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/lambda/src/api/get-function-info.ts)
- [`getFunctions()`](https://www.remotion.dev/docs/lambda/getfunctions)
- [`deployFunction()`](https://www.remotion.dev/docs/lambda/deployfunction)
- [`deleteFunction()`](https://www.remotion.dev/docs/lambda/deletefunction)

- [Example](https://www.remotion.dev/docs/lambda/getfunctioninfo#example)
- [Arguments](https://www.remotion.dev/docs/lambda/getfunctioninfo#arguments)
  - [`region`](https://www.remotion.dev/docs/lambda/getfunctioninfo#region)
  - [`functionName`](https://www.remotion.dev/docs/lambda/getfunctioninfo#functionname)
  - [`logLevel?`](https://www.remotion.dev/docs/lambda/getfunctioninfo#loglevel)
- [Return value](https://www.remotion.dev/docs/lambda/getfunctioninfo#return-value)
  - [`memorySizeInMb`](https://www.remotion.dev/docs/lambda/getfunctioninfo#memorysizeinmb)
  - [`diskSizeInMb`](https://www.remotion.dev/docs/lambda/getfunctioninfo#disksizeinmb)
  - [`functionName`](https://www.remotion.dev/docs/lambda/getfunctioninfo#functionname-1)
  - [`version`](https://www.remotion.dev/docs/lambda/getfunctioninfo#version)
  - [`timeoutInSeconds`](https://www.remotion.dev/docs/lambda/getfunctioninfo#timeoutinseconds)
- [See also](https://www.remotion.dev/docs/lambda/getfunctioninfo#see-also)

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