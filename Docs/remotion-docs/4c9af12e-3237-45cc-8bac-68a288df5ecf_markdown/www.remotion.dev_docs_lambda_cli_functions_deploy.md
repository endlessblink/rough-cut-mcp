[Skip to main content](https://www.remotion.dev/docs/lambda/cli/functions/deploy#__docusaurus_skipToContent_fallback)

On this page

```

npx remotion lambda functions deploy
```

Creates a new function in your AWS account. If a function in the same region, with the same Remotion version, with the same amount of memory, disk space and timeout already exists, the name of the already deployed function will be returned instead.

By default, a CloudWatch Log Group will be created that will log debug information to CloudWatch that you can consult in the case something is going wrong. The default retention period for these logs is 14 days, which can be changed.

Example output

```
Region = eu-central-1,
Memory = 2048MB,
Disk = 2048MB,
Timeout = 120sec,
Version = 2021-12-17,
CloudWatch Enabled = true,
CloudWatch Retention Period = 14 days
VPC Subnet IDs = subnet-0f6a0f6a0f6a0f6a0, subnet-0f6a0f6a0f6a0f6a1
VPC Security Group IDs = sg-0f6a0f6a0f6a0f6a0, sg-0f6a0f6a0f6a0f6a1
Deployed as remotion-render-2021-12-17-2048mb-120sec

```

## `--region` [​](https://www.remotion.dev/docs/lambda/cli/functions/deploy\#--region "Direct link to --region")

The [AWS region](https://www.remotion.dev/docs/lambda/region-selection) to select.

## `--memory` [​](https://www.remotion.dev/docs/lambda/cli/functions/deploy\#--memory "Direct link to --memory")

Memory size in megabytes. Default: 2048 MB.

## `--disk` [​](https://www.remotion.dev/docs/lambda/cli/functions/deploy\#--disk "Direct link to --disk")

Disk size in megabytes. See also: [Disk size](https://www.remotion.dev/docs/lambda/disk-size).

| Remotion Version | Default |
| --- | --- |
| <5.0.0 | 2048MB |
| >=5.0.0 | 10240MB |

## `--timeout` [​](https://www.remotion.dev/docs/lambda/cli/functions/deploy\#--timeout "Direct link to --timeout")

Timeout of the Lambda function in seconds. Default: 120 seconds.

note

Not to be confused with the [`--timeout` flag for `npx remotion lambda render` which defines the timeout for `delayRender()`](https://www.remotion.dev/docs/cli/render#--timeout).

## `--disable-cloudwatch` [​](https://www.remotion.dev/docs/lambda/cli/functions/deploy\#--disable-cloudwatch "Direct link to --disable-cloudwatch")

Does not create a CloudWatch log group.

## `--retention-period` [​](https://www.remotion.dev/docs/lambda/cli/functions/deploy\#--retention-period "Direct link to --retention-period")

Retention period for the CloudWatch Logs in days. Default: 14 days.

## `--enable-lambda-insights` [v4.0.61](https://github.com/remotion-dev/remotion/releases/v4.0.61) [​](https://www.remotion.dev/docs/lambda/cli/functions/deploy\#--enable-lambda-insights "Direct link to --enable-lambda-insights")

Enable [Lambda Insights in AWS CloudWatch](https://remotion.dev/docs/lambda/insights). For this to work, you may have to update your role permission.

## `--custom-role-arn` [​](https://www.remotion.dev/docs/lambda/cli/functions/deploy\#--custom-role-arn "Direct link to --custom-role-arn")

Use a custom role for the function instead of the default ( `arn:aws:iam::[aws-account-id]:role/remotion-lambda-role`)

## `--quiet`, `-q` [​](https://www.remotion.dev/docs/lambda/cli/functions/deploy\#--quiet--q "Direct link to --quiet--q")

Only logs the function name.

## `--vpc-subnet-ids` [v4.0.160](https://github.com/remotion-dev/remotion/releases/v4.0.160) [​](https://www.remotion.dev/docs/lambda/cli/functions/deploy\#--vpc-subnet-ids "Direct link to --vpc-subnet-ids")

Comma separated list of VPC subnet IDs to use for the Lambda function VPC configuration.

## `--vpc-security-group-ids` [v4.0.160](https://github.com/remotion-dev/remotion/releases/v4.0.160) [​](https://www.remotion.dev/docs/lambda/cli/functions/deploy\#--vpc-security-group-ids "Direct link to --vpc-security-group-ids")

Comma separated list of VPC security group IDs to use for the Lambda function VPC configuration.

## `--runtime-preference` [v4.0.205](https://github.com/remotion-dev/remotion/releases/v4.0.205) [​](https://www.remotion.dev/docs/lambda/cli/functions/deploy\#--runtime-preference "Direct link to --runtime-preference")

One of:

- `default`: Currently resolving to `prefer-cjk`
- `prefer-apple-emojis`: Use Apple Emojis instead of Google Emojis. CJK characters will be removed.
- `prefer-cjk`: Include CJK (Chinese, Japanese, Korean) characters and Google Emojis. Apple Emojis will be removed.

note

Apple Emojis are intellectual property of Apple Inc.

You are responsible for the use of Apple Emojis in your project.

- [`--region`](https://www.remotion.dev/docs/lambda/cli/functions/deploy#--region)
- [`--memory`](https://www.remotion.dev/docs/lambda/cli/functions/deploy#--memory)
- [`--disk`](https://www.remotion.dev/docs/lambda/cli/functions/deploy#--disk)
- [`--timeout`](https://www.remotion.dev/docs/lambda/cli/functions/deploy#--timeout)
- [`--disable-cloudwatch`](https://www.remotion.dev/docs/lambda/cli/functions/deploy#--disable-cloudwatch)
- [`--retention-period`](https://www.remotion.dev/docs/lambda/cli/functions/deploy#--retention-period)
- [`--enable-lambda-insights`](https://www.remotion.dev/docs/lambda/cli/functions/deploy#--enable-lambda-insights)
- [`--custom-role-arn`](https://www.remotion.dev/docs/lambda/cli/functions/deploy#--custom-role-arn)
- [`--quiet`, `-q`](https://www.remotion.dev/docs/lambda/cli/functions/deploy#--quiet--q)
- [`--vpc-subnet-ids`](https://www.remotion.dev/docs/lambda/cli/functions/deploy#--vpc-subnet-ids)
- [`--vpc-security-group-ids`](https://www.remotion.dev/docs/lambda/cli/functions/deploy#--vpc-security-group-ids)
- [`--runtime-preference`](https://www.remotion.dev/docs/lambda/cli/functions/deploy#--runtime-preference)

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