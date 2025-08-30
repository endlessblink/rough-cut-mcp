[Skip to main content](https://www.remotion.dev/docs/lambda/feb-2023-incident#__docusaurus_skipToContent_fallback)

On this page

info

In Remotion 4.0, this problem is fixed.

On February 24th 2023, a new version of the AWS Lambda Node.JS runtime started rolling out that breaks Remotion Lambda.

Remotion Lambda users are advised to read this document to avoid any downtime.

## Problem [​](https://www.remotion.dev/docs/lambda/feb-2023-incident\#problem "Direct link to Problem")

Users might see an error:

```

bash

Error: expected to launch
```

or

```

bash

Failed to launch the browser process!

TROUBLESHOOTING: https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md
```

## Cause [​](https://www.remotion.dev/docs/lambda/feb-2023-incident\#cause "Direct link to Cause")

AWS Lambda has rolled out an update to their Lambda runtime for Node.JS to update it from `v14.28` to `v14.29`.

This update causes the headless Chromium browser to exit with a `SIGBUS` error for a yet unknown reason.

## Advisory [​](https://www.remotion.dev/docs/lambda/feb-2023-incident\#advisory "Direct link to Advisory")

We recommend to **not deploy any new functions** until the issue is resolved as new functions are subject to getting the new runtime.

Since at a later point, AWS will roll out the runtime to any existing functions, we recommend to upgrade to Remotion `3.3.54` or later in the near future and redeploy your functions.

## Resolutions [​](https://www.remotion.dev/docs/lambda/feb-2023-incident\#resolutions "Direct link to Resolutions")

### Option 1: `v3.3.54` update (recommended) [​](https://www.remotion.dev/docs/lambda/feb-2023-incident\#option-1-v3354-update-recommended "Direct link to option-1-v3354-update-recommended")

In Remotion `v3.3.54`, Remotion will lock the AWS Lambda Node.JS runtime to `v14.28` to prevent this issue from happening.

Locking a runtime on AWS Lambda is only possible since January 23rd, 2023, hence the reason why we are only releasing this update now.

To apply the fix, you need to:

[1](https://www.remotion.dev/docs/lambda/feb-2023-incident#1)

upgrade Remotion:

```

bash

npx remotion upgrade
```

[2](https://www.remotion.dev/docs/lambda/feb-2023-incident#2)

change your policies to give your user the `
lambda:PutRuntimeManagementConfig
` permission. The easiest way is to copy the following user policy:

Show full user permissions JSON file for latest Remotion Lambda version

```
{
  "Version": "2012-10-17",
  "Statement": [\
    {\
      "Sid": "HandleQuotas",\
      "Effect": "Allow",\
      "Action": [\
        "servicequotas:GetServiceQuota",\
        "servicequotas:GetAWSDefaultServiceQuota",\
        "servicequotas:RequestServiceQuotaIncrease",\
        "servicequotas:ListRequestedServiceQuotaChangeHistoryByQuota"\
      ],\
      "Resource": [\
        "*"\
      ]\
    },\
    {\
      "Sid": "PermissionValidation",\
      "Effect": "Allow",\
      "Action": [\
        "iam:SimulatePrincipalPolicy"\
      ],\
      "Resource": [\
        "*"\
      ]\
    },\
    {\
      "Sid": "LambdaInvokation",\
      "Effect": "Allow",\
      "Action": [\
        "iam:PassRole"\
      ],\
      "Resource": [\
        "arn:aws:iam::*:role/remotion-lambda-role"\
      ]\
    },\
    {\
      "Sid": "Storage",\
      "Effect": "Allow",\
      "Action": [\
        "s3:GetObject",\
        "s3:DeleteObject",\
        "s3:PutObjectAcl",\
        "s3:PutObject",\
        "s3:CreateBucket",\
        "s3:ListBucket",\
        "s3:GetBucketLocation",\
        "s3:PutBucketAcl",\
        "s3:DeleteBucket",\
        "s3:PutBucketOwnershipControls",\
        "s3:PutBucketPublicAccessBlock",\
        "s3:PutLifecycleConfiguration"\
      ],\
      "Resource": [\
        "arn:aws:s3:::remotionlambda-*"\
      ]\
    },\
    {\
      "Sid": "BucketListing",\
      "Effect": "Allow",\
      "Action": [\
        "s3:ListAllMyBuckets"\
      ],\
      "Resource": [\
        "*"\
      ]\
    },\
    {\
      "Sid": "FunctionListing",\
      "Effect": "Allow",\
      "Action": [\
        "lambda:ListFunctions",\
        "lambda:GetFunction"\
      ],\
      "Resource": [\
        "*"\
      ]\
    },\
    {\
      "Sid": "FunctionManagement",\
      "Effect": "Allow",\
      "Action": [\
        "lambda:InvokeAsync",\
        "lambda:InvokeFunction",\
        "lambda:CreateFunction",\
        "lambda:DeleteFunction",\
        "lambda:PutFunctionEventInvokeConfig",\
        "lambda:PutRuntimeManagementConfig",\
        "lambda:TagResource"\
      ],\
      "Resource": [\
        "arn:aws:lambda:*:*:function:remotion-render-*"\
      ]\
    },\
    {\
      "Sid": "LogsRetention",\
      "Effect": "Allow",\
      "Action": [\
        "logs:CreateLogGroup",\
        "logs:PutRetentionPolicy"\
      ],\
      "Resource": [\
        "arn:aws:logs:*:*:log-group:/aws/lambda/remotion-render-*"\
      ]\
    },\
    {\
      "Sid": "FetchBinaries",\
      "Effect": "Allow",\
      "Action": [\
        "lambda:GetLayerVersion"\
      ],\
      "Resource": [\
        "arn:aws:lambda:*:678892195805:layer:remotion-binaries-*",\
        "arn:aws:lambda:*:580247275435:layer:LambdaInsightsExtension*"\
      ]\
    }\
  ]
}
```

or type in `npx remotion lambda policies user` after upgrading Remotion Lambda.

Go to the [Users](https://us-east-1.console.aws.amazon.com/iamv2/home?region=us-east-1#/users) section in the AWS console and overwrite the JSON policy of your Remotion Lambda user with the above copied JSON.

[3](https://www.remotion.dev/docs/lambda/feb-2023-incident#3)

Redeploy your functions. You don't need to delete your old functions
as it might cause downtime for your application.

[4](https://www.remotion.dev/docs/lambda/feb-2023-incident#4)

As a reminder, you also need to redeploy your site when you upgrade
to a higher Remotion version.

[5](https://www.remotion.dev/docs/lambda/feb-2023-incident#5)

If any values are hardcoded, update the function and site name in
your application code.

### Option 2: Manually update the runtime in the AWS console [​](https://www.remotion.dev/docs/lambda/feb-2023-incident\#option-2-manually-update-the-runtime-in-the-aws-console "Direct link to Option 2: Manually update the runtime in the AWS console")

Alternatively, for each of your Lambda functions, you can lock the runtime version in the AWS console:

[1](https://www.remotion.dev/docs/lambda/feb-2023-incident#1)

Go to the function in the AWS dashboard and click "Edit Runtime management
configuration".

![](https://www.remotion.dev/img/runtimesettings.png)

[2](https://www.remotion.dev/docs/lambda/feb-2023-incident#2)

Set it to "Manual".

[3](https://www.remotion.dev/docs/lambda/feb-2023-incident#3)

Set the runtime to `arn:aws:lambda:[region]::runtime:69000d3430a08938bcab71617dffcb8ea551a2cbc36c59f38c52a1ea087e461b`
. Replace `[region]` with the code for the AWS region (e.g. `us-east-1`)

[4](https://www.remotion.dev/docs/lambda/feb-2023-incident#4)

Click "Save". Repeat this for any functions you have deployed.

## Long-term solution [​](https://www.remotion.dev/docs/lambda/feb-2023-incident\#long-term-solution "Direct link to Long-term solution")

We have upgraded to a AWS Business support tier and reached out to them to make them aware of the issue and hope to cooperate on a solution soon.

Since it recently became possible to lock the AWS Lambda runtime version, we will be using this option going forward to make Remotion more resilient to future runtime updates.

## Questions? [​](https://www.remotion.dev/docs/lambda/feb-2023-incident\#questions "Direct link to Questions?")

Join our [Discord](https://remotion.dev/discord) community to get help from the Remotion team and other users.

- [Problem](https://www.remotion.dev/docs/lambda/feb-2023-incident#problem)
- [Cause](https://www.remotion.dev/docs/lambda/feb-2023-incident#cause)
- [Advisory](https://www.remotion.dev/docs/lambda/feb-2023-incident#advisory)
- [Resolutions](https://www.remotion.dev/docs/lambda/feb-2023-incident#resolutions)
  - [Option 1: `v3.3.54` update (recommended)](https://www.remotion.dev/docs/lambda/feb-2023-incident#option-1-v3354-update-recommended)
  - [Option 2: Manually update the runtime in the AWS console](https://www.remotion.dev/docs/lambda/feb-2023-incident#option-2-manually-update-the-runtime-in-the-aws-console)
- [Long-term solution](https://www.remotion.dev/docs/lambda/feb-2023-incident#long-term-solution)
- [Questions?](https://www.remotion.dev/docs/lambda/feb-2023-incident#questions)

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