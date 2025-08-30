[Skip to main content](https://www.remotion.dev/docs/lambda/getregions#__docusaurus_skipToContent_fallback)

On this page

Gets an array of all supported AWS regions of this release of Remotion Lambda.

## Example [​](https://www.remotion.dev/docs/lambda/getregions\#example "Direct link to Example")

```

tsx

const regions = getRegions();
// ["eu-central-1", "us-east-1"]
```

## API [​](https://www.remotion.dev/docs/lambda/getregions\#api "Direct link to API")

The function takes an optional object, with the following options:

### `enabledByDefaultOnly` [​](https://www.remotion.dev/docs/lambda/getregions\#enabledbydefaultonly "Direct link to enabledbydefaultonly")

_available from v3.3.11_

Only return [the regions which are enabled by default](https://docs.aws.amazon.com/general/latest/gr/rande-manage.html) in a new AWS account.

## Return value [​](https://www.remotion.dev/docs/lambda/getregions\#return-value "Direct link to Return value")

An array of supported regions by this release of Remotion Lambda.

## See also [​](https://www.remotion.dev/docs/lambda/getregions\#see-also "Direct link to See also")

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/lambda/src/api/get-regions.ts)
- [Region selection](https://www.remotion.dev/docs/lambda/region-selection)

- [Example](https://www.remotion.dev/docs/lambda/getregions#example)
- [API](https://www.remotion.dev/docs/lambda/getregions#api)
  - [`enabledByDefaultOnly`](https://www.remotion.dev/docs/lambda/getregions#enabledbydefaultonly)
- [Return value](https://www.remotion.dev/docs/lambda/getregions#return-value)
- [See also](https://www.remotion.dev/docs/lambda/getregions#see-also)

Remotion

![Logo](https://raw.githubusercontent.com/remotion-dev/brand/refs/heads/main/logo.svg)

Remotion

You may ask your questions about the Remotion documentation and the bot answers it based on the documentation. Go through the sources for better answers appropriately.

QUICK QUESTIONS

How to install it?

How to setup Remotion Lambda?

Why is my composition flickering?

Powered by [CrawlChat](https://crawlchat.app/?ref=powered-by-remotion)