[Skip to main content](https://www.remotion.dev/docs/enable-scss/enable-scss#__docusaurus_skipToContent_fallback)

On this page

_available from v4.0.162_

A function that modifies the default Webpack configuration to make the necessary changes to support SASS/SCSS.

```

remotion.config.ts
ts

import { Config } from "@remotion/cli/config";
import { enableScss } from "@remotion/enable-scss";

Config.overrideWebpackConfig((currentConfiguration) => {
  return enableScss(currentConfiguration);
});
```

If you want to make other configuration changes, you can do so by doing them reducer-style:

```

remotion.config.ts
ts

import { Config } from "@remotion/cli/config";
import { enableScss } from "@remotion/enable-scss";

Config.overrideWebpackConfig((currentConfiguration) => {
  return enableScss({
    ...currentConfiguration,
    // Make other changes
  });
});
```

## See also [​](https://www.remotion.dev/docs/enable-scss/enable-scss\#see-also "Direct link to See also")

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/enable-scss/src/enable-scss.ts)

- [See also](https://www.remotion.dev/docs/enable-scss/enable-scss#see-also)

Remotion

![Logo](https://raw.githubusercontent.com/remotion-dev/brand/refs/heads/main/logo.svg)

Remotion

You may ask your questions about the Remotion documentation and the bot answers it based on the documentation. Go through the sources for better answers appropriately.

QUICK QUESTIONS

How to install it?

How to setup Remotion Lambda?

Why is my composition flickering?

Powered by [CrawlChat](https://crawlchat.app/?ref=powered-by-remotion)