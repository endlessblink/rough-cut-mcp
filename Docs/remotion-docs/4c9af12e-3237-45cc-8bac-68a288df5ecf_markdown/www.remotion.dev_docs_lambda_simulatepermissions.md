[Skip to main content](https://www.remotion.dev/docs/lambda/simulatepermissions#__docusaurus_skipToContent_fallback)

On this page

Runs tests through the AWS Simulator ensuring that all the necessary permissions are set for the authenticated user.

The CLI equivalent is `npx remotion lambda policies validate`.

The function does not reject with an error if a permission is missing, rather the missing permission is indicated in the return value.

This function does only validate the validity of the **user policy**, not the **role policy**.

## Example [​](https://www.remotion.dev/docs/lambda/simulatepermissions\#example "Direct link to Example")

```

ts

import {simulatePermissions} from '@remotion/lambda';

const {results} = await simulatePermissions({
  region: 'us-east-1',
});

for (const result of results) {
  console.log(result.decision); // "allowed"
  console.log(result.name); // "iam:SimulatePrincipalPolicy"
}
```

## Arguments [​](https://www.remotion.dev/docs/lambda/simulatepermissions\#arguments "Direct link to Arguments")

An object with the following properties:

### `region` [​](https://www.remotion.dev/docs/lambda/simulatepermissions\#region "Direct link to region")

The [AWS region](https://www.remotion.dev/docs/lambda/region-selection) that you would like to query.

### `onSimulation` [​](https://www.remotion.dev/docs/lambda/simulatepermissions\#onsimulation "Direct link to onsimulation")

_optional_

A callback function that gets called every time a new simulation has been executed. This allows you to react to new simulation results coming in much faster than waiting for the return value of the function. Example:

```

ts

import {simulatePermissions} from '@remotion/lambda';

const {results} = await simulatePermissions({
  region: 'us-east-1',
  onSimulation: (result) => {
    console.log(result.decision); // "allowed"
    console.log(result.name); // "iam:SimulatePrincipalPolicy"
  },
});
```

## Return value [​](https://www.remotion.dev/docs/lambda/simulatepermissions\#return-value "Direct link to Return value")

**An array of objects** containing simulation results of each necessary permission. The objects contain the following keys:

### `decision` [​](https://www.remotion.dev/docs/lambda/simulatepermissions\#decision "Direct link to decision")

Either `"allowed"`, `"implicitDeny"` or `"explicitDeny"`.

### `name` [​](https://www.remotion.dev/docs/lambda/simulatepermissions\#name "Direct link to name")

The identifier of the required permission. See the [Permissions page](https://www.remotion.dev/docs/lambda/permissions) to see a list of required permissions.

## See also [​](https://www.remotion.dev/docs/lambda/simulatepermissions\#see-also "Direct link to See also")

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/lambda/src/api/iam-validation/simulate.ts)
- [getUserPolicy()](https://www.remotion.dev/docs/lambda/getuserpolicy)
- [getRolePolicy()](https://www.remotion.dev/docs/lambda/getrolepolicy)
- [Permissions](https://www.remotion.dev/docs/lambda/permissions)

- [Example](https://www.remotion.dev/docs/lambda/simulatepermissions#example)
- [Arguments](https://www.remotion.dev/docs/lambda/simulatepermissions#arguments)
  - [`region`](https://www.remotion.dev/docs/lambda/simulatepermissions#region)
  - [`onSimulation`](https://www.remotion.dev/docs/lambda/simulatepermissions#onsimulation)
- [Return value](https://www.remotion.dev/docs/lambda/simulatepermissions#return-value)
  - [`decision`](https://www.remotion.dev/docs/lambda/simulatepermissions#decision)
  - [`name`](https://www.remotion.dev/docs/lambda/simulatepermissions#name)
- [See also](https://www.remotion.dev/docs/lambda/simulatepermissions#see-also)

Remotion

![Logo](https://raw.githubusercontent.com/remotion-dev/brand/refs/heads/main/logo.svg)

Remotion

You may ask your questions about the Remotion documentation and the bot answers it based on the documentation. Go through the sources for better answers appropriately.

QUICK QUESTIONS

How to install it?

How to setup Remotion Lambda?

Why is my composition flickering?

Powered by [CrawlChat](https://crawlchat.app/?ref=powered-by-remotion)