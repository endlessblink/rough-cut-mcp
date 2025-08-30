[Skip to main content](https://www.remotion.dev/docs/lambda/insights#__docusaurus_skipToContent_fallback)

On this page

You may enable [AWS Lambda Insights](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Lambda-Insights.html) for your Remotion Lambda function.

## Prerequisites [​](https://www.remotion.dev/docs/lambda/insights\#prerequisites "Direct link to Prerequisites")

[1](https://www.remotion.dev/docs/lambda/insights#1)

Ensure you are on at least Remotion v4.0.61.

[2](https://www.remotion.dev/docs/lambda/insights#2) If you started using Remotion before v4.0.61, update both your [AWS user permission](https://www.remotion.dev/docs/lambda/permissions#user-permissions) and [AWS role permission](https://www.remotion.dev/docs/lambda/permissions#role-permissions), since now more permissions are needed.

## Enable Lambda Insights [​](https://www.remotion.dev/docs/lambda/insights\#enable-lambda-insights-1 "Direct link to Enable Lambda Insights")

**Via CLI**:

```

npx remotion lambda functions deploy --enable-lambda-insights
```

If the function already existed before, you need to delete it beforehand.

**Via Node.js APIs:**

```

deploy.ts
tsx

import {deployFunction} from '@remotion/lambda';

const {alreadyExisted} = await deployFunction({
  createCloudWatchLogGroup: true,
  region: 'us-east-1',
  timeoutInSeconds: 120,
  memorySizeInMb: 3009,
  enableLambdaInsights: true,
});

// Note: If the function previously already existed, Lambda insights are not applied.
// Delete the old function and deploy again.
assert(!alreadyExisted);
```

## Add a role to the Lambda function [​](https://www.remotion.dev/docs/lambda/insights\#add-a-role-to-the-lambda-function "Direct link to Add a role to the Lambda function")

In order to actually allow Lambda to send data to CloudWatch, you need to do this once:

- Go to the Lambda Dashboard and select any Remotion Lambda function.
- In the "Configuration" tab, scroll down to "Monitoring and operations tools" and in the "Additional monitoring tools" section, click "Edit".
- Toggle the switch to "Enable AWS Lambda Insights". If it is already turned on, disable it, save, and then enable it again.

This will add the necessary permissions to the role of the Lambda function.

All Lambda functions share the same role with the default setup, so you only need to do this once.

## View Lambda insights [​](https://www.remotion.dev/docs/lambda/insights\#view-lambda-insights "Direct link to View Lambda insights")

In your CloudWatch dashboard ( [link for `us-east-1`](https://eu-central-1.console.aws.amazon.com/cloudwatch/home)) under Insights ➞ Lambda Insights ➞ Single function, you can view the metrics of the Remotion Lambda function.

A link to the Lambda insights is also included in the return value of [`renderMediaOnLambda()`](https://www.remotion.dev/docs/lambda/rendermediaonlambda).

If you render via the CLI with the `--log=verbose` flag, a link to the Lambda insights is also printed, regardless of if Lambda insights are enabled or not.

## Unsupported regions [​](https://www.remotion.dev/docs/lambda/insights\#unsupported-regions "Direct link to Unsupported regions")

Lambda Insights is not supported by AWS in `ap-southeast-4` and `ap-southeast-5` and `eu-central-2`.

If you deploy a Lambda function in one of these regions and attempt to enable Lambda Insight, an error will be thrown.

## See also [​](https://www.remotion.dev/docs/lambda/insights\#see-also "Direct link to See also")

- [Debugging failed Lambda renders](https://www.remotion.dev/docs/lambda/troubleshooting/debug)

- [Prerequisites](https://www.remotion.dev/docs/lambda/insights#prerequisites)
- [Enable Lambda Insights](https://www.remotion.dev/docs/lambda/insights#enable-lambda-insights-1)
- [Add a role to the Lambda function](https://www.remotion.dev/docs/lambda/insights#add-a-role-to-the-lambda-function)
- [View Lambda insights](https://www.remotion.dev/docs/lambda/insights#view-lambda-insights)
- [Unsupported regions](https://www.remotion.dev/docs/lambda/insights#unsupported-regions)
- [See also](https://www.remotion.dev/docs/lambda/insights#see-also)

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