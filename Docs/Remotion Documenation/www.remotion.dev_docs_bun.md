---
url: "https://www.remotion.dev/docs/bun"
title: "Bun support | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/bun#__docusaurus_skipToContent_fallback)

On this page

Remotion is excited about [Bun](https://bun.sh/), and we mostly support it (from v1.0.3).

## As a package manager [​](https://www.remotion.dev/docs/bun\#as-a-package-manager "Direct link to As a package manager")

You can use `bun i` to initialize all of our Remotion templates.

To scaffold a new project with bun, use:

```

bun create video
```

This command sets all scripts to use [`bunx remotionb`](https://www.remotion.dev/docs/cli/#using-bun) which will use Bun as a runtime.

Change `remotionb` to `remotion` if you want to use Node.js as a runtime.

## Remotion CLI [​](https://www.remotion.dev/docs/bun\#remotion-cli "Direct link to Remotion CLI")

If you want to run the Remotion CLI using Bun, **use `remotionb` instead of the `remotion` command**.

It doesn't matter if you prefix `remotionb` with `npx`, `bunx` or another runner command.

```

npx remotionb render
```

## As a runtime [​](https://www.remotion.dev/docs/bun\#as-a-runtime "Direct link to As a runtime")

As of Bun 1.0.24 and Remotion 4.0.88, the following issues are known:

- ⚠️ The `lazyComponent` prop on `<Composition>` and `<Player>` does not work, and this feature is automatically disabled.
- ⚠️ A server-side rendering script may not quit automatically after it is done running.

Feel free to file more issues with Remotion if you find them.

Previous issues listed here have been resolved as of Bun 1.0.24.

## For contributors [​](https://www.remotion.dev/docs/bun\#for-contributors "Direct link to For contributors")

Start the example testbed using `bun run start-bun`.

## See also [​](https://www.remotion.dev/docs/bun\#see-also "Direct link to See also")

- [Deno support](https://www.remotion.dev/docs/deno)

- [As a package manager](https://www.remotion.dev/docs/bun#as-a-package-manager)
- [Remotion CLI](https://www.remotion.dev/docs/bun#remotion-cli)
- [As a runtime](https://www.remotion.dev/docs/bun#as-a-runtime)
- [For contributors](https://www.remotion.dev/docs/bun#for-contributors)
- [See also](https://www.remotion.dev/docs/bun#see-also)

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