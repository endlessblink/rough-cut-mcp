[Skip to main content](https://www.remotion.dev/docs/lambda/api#__docusaurus_skipToContent_fallback)

On this page

- npm
- yarn
- pnpm
- bun

```

npm i --save-exact @remotion/lambda@4.0.340Copy
```

This assumes you are currently using v4.0.340 of Remotion.

Also update `remotion` and all `` `@remotion/*` `` packages to the same version.

Remove all `^` character in front of the version numbers of it as it can lead to a version conflict.

**See the [setup guide](https://www.remotion.dev/docs/lambda/setup) for complete instructions on how to get started.**

## APIs [​](https://www.remotion.dev/docs/lambda/api\#apis "Direct link to APIs")

The following Node.JS are available:

[**estimatePrice()** \\
\\
Estimate the price of a render](https://www.remotion.dev/docs/lambda/estimateprice) [**deployFunction()** \\
\\
Create a new function in AWS Lambda](https://www.remotion.dev/docs/lambda/deployfunction) [**deleteFunction()** \\
\\
Delete a function in AWS Lambda](https://www.remotion.dev/docs/lambda/deletefunction) [**getFunctionInfo()** \\
\\
Gets information about a function](https://www.remotion.dev/docs/lambda/getfunctioninfo) [**getFunctions()** \\
\\
Lists available Remotion Lambda functions](https://www.remotion.dev/docs/lambda/getfunctions) [**getCompositionsOnLambda()** \\
\\
Gets list of compositions inside a Lambda function](https://www.remotion.dev/docs/lambda/getcompositionsonlambda) [**deleteSite()** \\
\\
Delete a bundle from S3](https://www.remotion.dev/docs/lambda/deletesite) [**deploySite()** \\
\\
Bundle and upload a site to S3](https://www.remotion.dev/docs/lambda/deploysite) [**getAwsClient()** \\
\\
Access the AWS SDK directly](https://www.remotion.dev/docs/lambda/getawsclient) [**getRegions()** \\
\\
Get all available regions](https://www.remotion.dev/docs/lambda/getregions) [**getSites()** \\
\\
Get all available sites](https://www.remotion.dev/docs/lambda/getsites) [**downloadMedia()** \\
\\
Download a render artifact from S3](https://www.remotion.dev/docs/lambda/downloadmedia) [**getUserPolicy()** \\
\\
Get the policy JSON for your AWS user](https://www.remotion.dev/docs/lambda/getuserpolicy) [**getRolePolicy()** \\
\\
Get the policy JSON for your AWS role](https://www.remotion.dev/docs/lambda/getrolepolicy) [**getOrCreateBucket()** \\
\\
Ensure a Remotion S3 bucket exists](https://www.remotion.dev/docs/lambda/getorcreatebucket) [**getRenderProgress()** \\
\\
Query the progress of a render](https://www.remotion.dev/docs/lambda/getrenderprogress) [**presignUrl()** \\
\\
Make a private file public to those with the link](https://www.remotion.dev/docs/lambda/presignurl) [**renderMediaOnLambda()** \\
\\
Trigger a video or audio render](https://www.remotion.dev/docs/lambda/rendermediaonlambda) [**renderStillOnLambda()** \\
\\
Trigger a still render](https://www.remotion.dev/docs/lambda/renderstillonlambda) [**simulatePermissions()** \\
\\
Ensure permissions are correctly set up](https://www.remotion.dev/docs/lambda/simulatepermissions) [**speculateFunctionName()** \\
\\
Get the lambda function name based on its configuration](https://www.remotion.dev/docs/lambda/speculatefunctionname) [**validateWebhookSignature()** \\
\\
Validate an incoming webhook request is authentic](https://www.remotion.dev/docs/lambda/validatewebhooksignature) [**appRouterWebhook()** \\
\\
Handle incoming webhooks specifically for the Next.js app router](https://www.remotion.dev/docs/lambda/approuterwebhook) [**pagesRouterWebhook()** \\
\\
Handle incoming webhooks specifically for the Next.js pages router](https://www.remotion.dev/docs/lambda/pagesrouterwebhook) [**expressWebhook()** \\
\\
Handle incoming webhooks specifically for Express.js](https://www.remotion.dev/docs/lambda/expresswebhook)

## CLI [​](https://www.remotion.dev/docs/lambda/api\#cli "Direct link to CLI")

See [here](https://www.remotion.dev/docs/lambda/cli) for a list of CLI commands.

- [APIs](https://www.remotion.dev/docs/lambda/api#apis)
- [CLI](https://www.remotion.dev/docs/lambda/api#cli)

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