[Skip to main content](https://www.remotion.dev/docs/lambda/bucket-naming#__docusaurus_skipToContent_fallback)

On this page

A Remotion Lambda bucket name (for example `remotionlambda-apsouth1-3ysk0nyazp`) has two special attributes:

[1](https://www.remotion.dev/docs/lambda/bucket-naming#1)

It is prefixed with `remotionlambda-`

[2](https://www.remotion.dev/docs/lambda/bucket-naming#2)

It contains the region in their name

It is not recommended to use a custom bucket name because it requires changing your policies and passing the bucket name explicitly to all APIs.

## Using a different bucket name [​](https://www.remotion.dev/docs/lambda/bucket-naming\#using-a-different-bucket-name "Direct link to Using a different bucket name")

note

By using a custom bucket name, you are opting out of Remotion's defaults and validation.

Ensure you are passing the bucket name explicitly to all APIs, especially to those for which the bucket name is optional.

Also ensure Lambda and S3 buckets are accessible with the role permission that you use.

To use a custom bucket name, you need to:

- Manually create a bucket in AWS yourself
- Change the [policies](https://www.remotion.dev/docs/lambda/permissions) created by Remotion Lambda to change the `remotionlambda-` prefix. This prefix is used to exlude non-Remotion buckets from being able to be accessed by credentials supposed for Remotion.
- Pass the bucket name explicitly to:
  - [`renderMediaOnLambda()`](https://www.remotion.dev/docs/lambda/rendermediaonlambda)
  - [`getCompositionsOnLambda()`](https://www.remotion.dev/docs/lambda/getcompositionsonlambda)
  - [`renderStillOnLambda()`](https://www.remotion.dev/docs/lambda/renderstillonlambda)
  - [`npx remotion lambda render`](https://www.remotion.dev/docs/lambda/cli/render)
  - [`npx remotion lambda still`](https://www.remotion.dev/docs/lambda/cli/render)
  - [`npx remotion lambda compositions`](https://www.remotion.dev/docs/lambda/cli/render)
  - [`npx remotion lambda sites create`](https://www.remotion.dev/docs/lambda/cli/sites/create)
  - [`npx remotion lambda sites rm`](https://www.remotion.dev/docs/lambda/cli/sites/rm)
  - [`npx remotion lambda sites rmall`](https://www.remotion.dev/docs/lambda/cli/sites/rmall)
    using the `--force-bucket-name` or `forceBucketName` option respectively.
- Be aware that the following APIs are unavailable when using custom bucket names:
  - [`npx remotion lambda sites ls`](https://www.remotion.dev/docs/lambda/cli/sites/ls)
  - [`getSites()`](https://www.remotion.dev/docs/lambda/getsites)
  - [`getOrCreateBucket()`](https://www.remotion.dev/docs/lambda/getorcreatebucket)
- Be aware that you are opting out of automatic bucket discovery and validation. Be careful to:
  - Ensure that you are passing valid bucket names to all APIs, especially to those for which the bucket name is optional.
  - Ensure that the buckets and Lambda functions that are interacting with each other are in the same region.

## AWS Region in the name [​](https://www.remotion.dev/docs/lambda/bucket-naming\#aws-region-in-the-name "Direct link to AWS Region in the name")

The buckets contain the region in their name (for example `remotionlambda-apsouth1-3ysk0nyazp`). This is because when the list of AWS buckets is obtained through the AWS API, the region is not included in the response.

If the region is not in the bucket name, it needs to be queried for each bucket, which requires extra API calls and slows down the render.

If you set up your buckets with a Remotion version before December 2022, you have bucket names that do not include the region in their name (for example `remotionlambda-0if1fa0wy0`). By renaming the buckets, you can speed up render and reduce API calls, especially if you have a lot of Remotion buckets across regions.

## See also [​](https://www.remotion.dev/docs/lambda/bucket-naming\#see-also "Direct link to See also")

- [Multiple buckets](https://www.remotion.dev/docs/lambda/multiple-buckets)

- [Using a different bucket name](https://www.remotion.dev/docs/lambda/bucket-naming#using-a-different-bucket-name)
- [AWS Region in the name](https://www.remotion.dev/docs/lambda/bucket-naming#aws-region-in-the-name)
- [See also](https://www.remotion.dev/docs/lambda/bucket-naming#see-also)

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