[Skip to main content](https://www.remotion.dev/docs/lambda/feb-2022-outage#__docusaurus_skipToContent_fallback)

On this page

tip

**Update 2022/02/06:**

The problem is now solved. Your Lambda functions should work as normal. We recommend everyone to go back to use ARM64 Lambdas. We will consult with AWS support on how to prevent issues like this in the future.

On February 3rd 2022, AWS made a change to their Lambda micro-VMs that breaks Remotion Lambda. This document contains information for affected users.

## Hotfix solution [​](https://www.remotion.dev/docs/lambda/feb-2022-outage\#hotfix-solution "Direct link to Hotfix solution")

[Upgrade](https://www.remotion.dev/docs/lambda/upgrading) your Lambda functions to the latest version and deploy them with a `x86_64` architecture.

Via CLI:

```

npx remotion lambda functions deploy --architecture=x86_64
```

Via Node.JS:

## Example [​](https://www.remotion.dev/docs/lambda/feb-2022-outage\#example "Direct link to Example")

```

ts

import {deployFunction} from '@remotion/lambda';

const {functionName} = await deployFunction({
  region: 'us-east-1',
  timeoutInSeconds: 120,
  memorySizeInMb: 1024,
  createCloudWatchLogGroup: true,
  architecture: 'x86_64',
});
console.log(functionName);
```

## Caveat [​](https://www.remotion.dev/docs/lambda/feb-2022-outage\#caveat "Direct link to Caveat")

The x86\_64 version **does not contain fonts for Japanese/Chinese/Korean**! Since the binaries are bigger on the **x86\_64** version, we exceeded the file limit and had to delete the biggest font in order to stay within the AWS bounds.

x86\_64 is also slower and has about a 30% higher cost/performance ratio.

## AWS mitigation [​](https://www.remotion.dev/docs/lambda/feb-2022-outage\#aws-mitigation "Direct link to AWS mitigation")

We contacted AWS and hope to receive an answer soon.

## Long-term solution [​](https://www.remotion.dev/docs/lambda/feb-2022-outage\#long-term-solution "Direct link to Long-term solution")

ARM64 is the preferred and default solution. Once the problem is solved, we recommend everyone to switch back.

## Contact [​](https://www.remotion.dev/docs/lambda/feb-2022-outage\#contact "Direct link to Contact")

Join the discussion in our Discord channel if you have questions.

- [Hotfix solution](https://www.remotion.dev/docs/lambda/feb-2022-outage#hotfix-solution)
- [Example](https://www.remotion.dev/docs/lambda/feb-2022-outage#example)
- [Caveat](https://www.remotion.dev/docs/lambda/feb-2022-outage#caveat)
- [AWS mitigation](https://www.remotion.dev/docs/lambda/feb-2022-outage#aws-mitigation)
- [Long-term solution](https://www.remotion.dev/docs/lambda/feb-2022-outage#long-term-solution)
- [Contact](https://www.remotion.dev/docs/lambda/feb-2022-outage#contact)

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