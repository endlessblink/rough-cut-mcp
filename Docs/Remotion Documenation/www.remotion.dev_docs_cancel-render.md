---
url: "https://www.remotion.dev/docs/cancel-render"
title: "cancelRender() | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/cancel-render#__docusaurus_skipToContent_fallback)

On this page

_Available from v3.3.44_

By invoking `cancelRender()`, Remotion will stop rendering all the frames, and not do any retries.

Pass a `string` or an `Error` (for best stack traces) to `cancelRender()` so you can identify the error when your render failed.

## Example [​](https://www.remotion.dev/docs/cancel-render\#example "Direct link to Example")

```

MyComposition.tsx
tsx

import React, { useEffect, useState } from "react";
import { cancelRender, continueRender, delayRender } from "remotion";

export const MyComp: React.FC = () => {
  const [handle] = useState(() => delayRender("Fetching data..."));

  useEffect(() => {
    fetch("https://example.com")
      .then(() => {
        continueRender(handle);
      })
      .catch((err) => cancelRender(err));
  }, []);

  return null;
};
```

## See also [​](https://www.remotion.dev/docs/cancel-render\#see-also "Direct link to See also")

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/core/src/cancel-render.ts)
- [delayRender()](https://www.remotion.dev/docs/delay-render)
- [continueRender()](https://www.remotion.dev/docs/continue-render)

- [Example](https://www.remotion.dev/docs/cancel-render#example)
- [See also](https://www.remotion.dev/docs/cancel-render#see-also)

Remotion

![Logo](https://raw.githubusercontent.com/remotion-dev/brand/refs/heads/main/logo.svg)

Remotion

You may ask your questions about the Remotion documentation and the bot answers it based on the documentation. Go through the sources for better answers appropriately.

## QUICK QUESTIONS

How to install it?

How to setup Remotion Lambda?

Why is my composition flickering?

Powered by[CrawlChat](https://crawlchat.app/?ref=powered-by-remotion)

Ask AI