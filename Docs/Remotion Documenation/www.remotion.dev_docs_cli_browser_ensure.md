---
url: "https://www.remotion.dev/docs/cli/browser/ensure"
title: "npx remotion browser ensure | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/cli/browser/ensure#__docusaurus_skipToContent_fallback)

On this page

Ensures that Remotion has a browser it can use for rendering.

```

npx remotion browser ensure
```

## Arguments [​](https://www.remotion.dev/docs/cli/browser/ensure\#arguments "Direct link to Arguments")

### `--browser-executable` [​](https://www.remotion.dev/docs/cli/browser/ensure\#--browser-executable "Direct link to --browser-executable")

[Path to a custom Chrome executable](https://www.remotion.dev/docs/config#setbrowserexecutable). If not specified and Remotion cannot find one, one will be downloaded by this command.

### `--log` [​](https://www.remotion.dev/docs/cli/browser/ensure\#--log "Direct link to --log")

One of `trace`, `verbose`, `info`, `warn`, `error`.

Determines how much info is being logged to the console.

Default `info`.

### `--chrome-mode` [v4.0.248](https://github.com/remotion-dev/remotion/releases/v4.0.248) [​](https://www.remotion.dev/docs/cli/browser/ensure\#--chrome-mode "Direct link to --chrome-mode")

One of `headless-shell, ` `chrome-for-testing`. Default `headless-shell`. [Use `chrome-for-testing` to take advantage of GPU drivers on Linux.](https://remotion.dev/docs/miscellaneous/chrome-headless-shell)

## See also [​](https://www.remotion.dev/docs/cli/browser/ensure\#see-also "Direct link to See also")

- [Source code for this command](https://github.com/remotion-dev/remotion/blob/main/packages/cli/src/browser/ensure.ts)
- [Chrome Headless Shell](https://www.remotion.dev/docs/miscellaneous/chrome-headless-shell)
- [`ensureBrowser()`](https://www.remotion.dev/docs/renderer/ensure-browser)

- [Arguments](https://www.remotion.dev/docs/cli/browser/ensure#arguments)
  - [`--browser-executable`](https://www.remotion.dev/docs/cli/browser/ensure#--browser-executable)
  - [`--log`](https://www.remotion.dev/docs/cli/browser/ensure#--log)
  - [`--chrome-mode`](https://www.remotion.dev/docs/cli/browser/ensure#--chrome-mode)
- [See also](https://www.remotion.dev/docs/cli/browser/ensure#see-also)

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