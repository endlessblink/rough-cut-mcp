[Skip to main content](https://www.remotion.dev/docs/lambda/limits#__docusaurus_skipToContent_fallback)

On this page

The standard AWS Lambda quotas apply ( [see here](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html)), most notably:

- [**Concurrency**](https://www.remotion.dev/docs/lambda/concurrency): By default, the maximum concurrent executions per region per account is 1000 executions. This limit might be lower for new accounts and users within an enterprise.
- [**Storage**](https://www.remotion.dev/docs/lambda/disk-size): Configurable, limited to 10GB at most
- [**RAM**](https://www.remotion.dev/docs/lambda/runtime#memory-size): Configurable, limited to 10GB at most
- [**Execution limit**](https://www.remotion.dev/docs/lambda/runtime#timeout): Configurable, at most 15 minutes

## Upgrading your concurrency limit [​](https://www.remotion.dev/docs/lambda/limits\#upgrading-your-concurrency-limit "Direct link to Upgrading your concurrency limit")

For scaling your renders, you should request a quota increase under [`https://console.aws.amazon.com/servicequotas/home`](https://console.aws.amazon.com/servicequotas/home) or using the [Remotion CLI](https://www.remotion.dev/docs/lambda/cli/quotas):

```

npx remotion lambda quotas increase
```

This only works for AWS Root accounts, not the children of an organization. You can still request an increase via the console.

## If AWS asks you for the reason [​](https://www.remotion.dev/docs/lambda/limits\#if-aws-asks-you-for-the-reason "Direct link to If AWS asks you for the reason")

AWS might ask you why you want to increase your concurrency limit. Commonly they send you this questionnaire.

> If you would still like a higher limit, please provide the following:
>
> 1. The main lambda functions ARNs of this application
> 2. Expected transactions per second per function
> 3. Expected duration per function
> 4. How is each function invoked
> 5. What services or resources do primary functions interact with
> 6. Time periods of high demand that demonstrate approaching the provided concurrency limit.

You can answer it as follows:

> 1. The functions are \[function-names\]

You can get a list of Remotion Lambda functions using `npx remotion lambda functions ls -q`.

> 2. The transactions per second are \[Provide a rough estimation\]
> 3. The duration is usually around 30 seconds to 1 minute.
> 4. In development phase it will be invoked via the Remotion CLI, and in production via a NodeJS app.
> 5. FFmpeg and Puppeteer. The npm package is called @remotion/lambda.
> 6. The process has a rendering strategy of splitting the rendering in multiple threads, to speed up the result. That is the reason why the quota increase is needed, as explained here: [https://www.remotion.dev/lambda](https://www.remotion.dev/lambda)

This response has previously been successfully used to obtain an increase of the concurrency limit.

## See also [​](https://www.remotion.dev/docs/lambda/limits\#see-also "Direct link to See also")

- [Lambda Rate Limit Troubleshooting](https://www.remotion.dev/docs/lambda/troubleshooting/rate-limit)

- [Upgrading your concurrency limit](https://www.remotion.dev/docs/lambda/limits#upgrading-your-concurrency-limit)
- [If AWS asks you for the reason](https://www.remotion.dev/docs/lambda/limits#if-aws-asks-you-for-the-reason)
- [See also](https://www.remotion.dev/docs/lambda/limits#see-also)

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