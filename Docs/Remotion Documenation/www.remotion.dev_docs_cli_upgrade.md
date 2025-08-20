---
url: "https://www.remotion.dev/docs/cli/upgrade"
title: "npx remotion upgrade | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/cli/upgrade#__docusaurus_skipToContent_fallback)

On this page

Upgrades all Remotion-related packages.

```

npx remotion upgrade
```

## Flags [​](https://www.remotion.dev/docs/cli/upgrade\#flags "Direct link to Flags")

### `--package-manager` [v3.2.33](https://github.com/remotion-dev/remotion/releases/v3.2.33) [​](https://www.remotion.dev/docs/cli/upgrade\#--package-manager "Direct link to --package-manager")

_optional_

Forces a specific package manager to be used. This is useful if you are using Remotion in a monorepo and you want to upgrade all packages at once. By default, Remotion will auto-detect the package manager.

Acceptable values are `npm`, `yarn` and `pnpm`

### `--version` [v4.0.15](https://github.com/remotion-dev/remotion/releases/v4.0.15) [​](https://www.remotion.dev/docs/cli/upgrade\#--version "Direct link to --version")

Install a specific version. Also enables downgrading to an older version.

## Package manager support [​](https://www.remotion.dev/docs/cli/upgrade\#package-manager-support "Direct link to Package manager support")

`npm`, `yarn` and `pnpm` are all supported.

## Additional arguments [​](https://www.remotion.dev/docs/cli/upgrade\#additional-arguments "Direct link to Additional arguments")

Any additional arguments you pass to this command will be forwarded as flags to the package manager, before the list of packages.

Before v4.0.246, additional arguments were ignored.

## Difference to `npm update`, `yarn upgrade`, `pnpm up` [​](https://www.remotion.dev/docs/cli/upgrade\#difference-to-npm-update-yarn-upgrade-pnpm-up "Direct link to difference-to-npm-update-yarn-upgrade-pnpm-up")

These commands, when executed without arguments will upgrade all dependencies in your project. We recommend against it because you may unintentionally break other parts of your project when you only wanted to upgrade Remotion.

- [Flags](https://www.remotion.dev/docs/cli/upgrade#flags)
  - [`--package-manager`](https://www.remotion.dev/docs/cli/upgrade#--package-manager)
  - [`--version`](https://www.remotion.dev/docs/cli/upgrade#--version)
- [Package manager support](https://www.remotion.dev/docs/cli/upgrade#package-manager-support)
- [Additional arguments](https://www.remotion.dev/docs/cli/upgrade#additional-arguments)
- [Difference to `npm update`, `yarn upgrade`, `pnpm up`](https://www.remotion.dev/docs/cli/upgrade#difference-to-npm-update-yarn-upgrade-pnpm-up)

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