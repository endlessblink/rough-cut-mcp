[Skip to main content](https://www.remotion.dev/docs/javascript#__docusaurus_skipToContent_fallback)

On this page

Since Remotion 1.3, you can opt out of Typescript and it's type checking advantages in Remotion. Continue at your own risk.

## Opting out of Typescript [​](https://www.remotion.dev/docs/javascript\#opting-out-of-typescript "Direct link to Opting out of Typescript")

You may import `.js` and `.jsx` files as normal. If you would like to completely move to JS, rename `index.ts` and `Root.tsx` so they have a `.jsx` file extension. Remove types such as `React.FC` and `SpringConfig`.

## Upgrading [​](https://www.remotion.dev/docs/javascript\#upgrading "Direct link to Upgrading")

If you upgrade from Remotion 1.2 or older, consider changing the `npm test` command to also include JavaScript files, and to remove the `tsc` command:

```

diff

-  "test": "eslint src --ext ts,tsx && tsc"
+  "test": "eslint src --ext ts,tsx,js,jsx"
```

## See also [​](https://www.remotion.dev/docs/javascript\#see-also "Direct link to See also")

- [Custom Webpack config](https://www.remotion.dev/docs/webpack) for more advanced tweaking

- [Opting out of Typescript](https://www.remotion.dev/docs/javascript#opting-out-of-typescript)
- [Upgrading](https://www.remotion.dev/docs/javascript#upgrading)
- [See also](https://www.remotion.dev/docs/javascript#see-also)

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