---
url: "https://www.remotion.dev/docs/4-0-alpha"
title: "v4.0 Alpha | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/4-0-alpha#__docusaurus_skipToContent_fallback)

On this page

Remotion 4.0 has now been released. This page has been archived.

Thanks for testing and reporting bugs! 🎉

## How to upgrade [​](https://www.remotion.dev/docs/4-0-alpha\#how-to-upgrade "Direct link to How to upgrade")

See the [changelog](https://www.remotion.dev/docs/4-0-alpha#changelog) to find the latest version.
Upgrade `remotion` and all packages starting with `@remotion` to the latest version, e.g. `4.0.0`:

```

package.json
diff

- "remotion": "^3.3.87"
- "@remotion/bundler": "^3.3.87"
- "@remotion/eslint-config": "^3.3.87"
- "@remotion/eslint-plugin": "^3.3.87"
- "@remotion/cli": "^3.3.87"
- "@remotion/renderer": "^3.3.87"
+ "remotion": "4.0.0-alpha13"
+ "@remotion/bundler": "4.0.0-alpha13"
+ "@remotion/eslint-config": "4.0.0-alpha13"
+ "@remotion/eslint-plugin": "4.0.0-alpha13"
+ "@remotion/cli": "4.0.0-alpha13"
+ "@remotion/renderer": "4.0.0-alpha13"
```

Make sure the versions don't have a `^` character in front of it.

Most important breaking changes:

[1](https://www.remotion.dev/docs/4-0-alpha#1)

The config file must now import the config like the following:

```

ts

import { Config } from "@remotion/cli/config";
```

[2](https://www.remotion.dev/docs/4-0-alpha#2)

Also in the config file:

```

ts

Config.setImageFormat("jpeg");
```

has been replaced with

```

ts

Config.setVideoImageFormat("jpeg");
```

See how to migrate: [Migration guide](https://www.remotion.dev/docs/4-0-migration)

## Changelog [​](https://www.remotion.dev/docs/4-0-alpha\#changelog "Direct link to Changelog")

### `4.0.0-alpha22` [​](https://www.remotion.dev/docs/4-0-alpha\#400-alpha22 "Direct link to 400-alpha22")

Release candidate!

- Fix rotated videos with OffthreadVideo
- `height`, `width` etc. is optional when passing `calculateMetadata()`

### `4.0.0-alpha21` [​](https://www.remotion.dev/docs/4-0-alpha\#400-alpha21 "Direct link to 400-alpha21")

- calculateMetadata() behaves correctly on Lambda
- Fixed known crashes with OffthreadVideo

### `4.0.0-alpha19` [​](https://www.remotion.dev/docs/4-0-alpha\#400-alpha19 "Direct link to 400-alpha19")

- Nicer logging
- Warn if props are bigger than 10MB
- Upgrade ESBuild to 0.18 (TS 5.0 support)

### `4.0.0-alpha18` [​](https://www.remotion.dev/docs/4-0-alpha\#400-alpha18 "Direct link to 400-alpha18")

- Nicer and less buggy logging in the CLI

### `4.0.0-alpha16` [​](https://www.remotion.dev/docs/4-0-alpha\#400-alpha16 "Direct link to 400-alpha16")

- Intention: Lower the minimum required `glibc` version on Linux x64 to support Ubuntu 20.04

### `4.0.0-alpha14` [​](https://www.remotion.dev/docs/4-0-alpha\#400-alpha14 "Direct link to 400-alpha14")

- Make renders via the CLI faster using a reusable server
- `console.log`'s are symbolicated when rendering locally using `--log=verbose`
- Fix bug in composition metadata resolution
- New design for the schema editor
- Upgrade TypeScript ESLint, Prettier and Turborepo

### `4.0.0-alpha13` [​](https://www.remotion.dev/docs/4-0-alpha\#400-alpha13 "Direct link to 400-alpha13")

- Fix editor props not being applied

### `4.0.0-alpha12` [​](https://www.remotion.dev/docs/4-0-alpha\#400-alpha12 "Direct link to 400-alpha12")

- More performant Studio

### `4.0.0-alpha11` [​](https://www.remotion.dev/docs/4-0-alpha\#400-alpha11 "Direct link to 400-alpha11")

- Performance improvements for the Remotion Studio
- Your component should do less unnecessary re-renders.

### `4.0.0-alpha10` [​](https://www.remotion.dev/docs/4-0-alpha\#400-alpha10 "Direct link to 400-alpha10")

- Renamed Remotion Preview to Remotion Studio
- Various fixes for the Remotion Studio
- New prop for Composition: `calculateMetadata`! See: [Data fetching](https://www.remotion.dev/docs/data-fetching) and [Variable metadata](https://www.remotion.dev/docs/dynamic-metadata)

### `4.0.0-alpha9` [​](https://www.remotion.dev/docs/4-0-alpha\#400-alpha9 "Direct link to 400-alpha9")

- Various polish for the Remotion Preview

### `4.0.0-alpha8` [​](https://www.remotion.dev/docs/4-0-alpha\#400-alpha8 "Direct link to 400-alpha8")

- Props editor polish
- Fix a crash with `<OffthreadVideo>`

### `4.0.0-alpha7` [​](https://www.remotion.dev/docs/4-0-alpha\#400-alpha7 "Direct link to 400-alpha7")

- Fix bugs reported with `<OffthreadVideo>` and more verbose logging
- Refined editor
- Fix Lambda issues
- Revamped CLI verbose logging mode
- FFmpeg is now in the Lambda function instead of a Lambda Layer

### `4.0.0-alpha6` [​](https://www.remotion.dev/docs/4-0-alpha\#400-alpha6 "Direct link to 400-alpha6")

- Fixes `EACCES` errors appearing
- GUI design improvements
- Fix warnings if Zod is not installed
- Breaking change: `staticFile()` now encodes the filename using `encodeURIComponent`. You don't have to and should not do it manually anymore - see migration guide

### `4.0.0-alpha5` [​](https://www.remotion.dev/docs/4-0-alpha\#400-alpha5 "Direct link to 400-alpha5")

May 3rd 2023:

- Features the new Rust renderer enabling faster `<OffthreadVideo>`!
- `z` is not exported from Remotion anymore, instead, just install `zod`!
- `zColor` is now to be installed from `@remotion/zod-types`
- Overall polish of the editor

### `4.0.0-alpha.185+1b8f0e746` [​](https://www.remotion.dev/docs/4-0-alpha\#400-alpha1851b8f0e746 "Direct link to 400-alpha1851b8f0e746")

- Fix rendering with FFmpeg on Linux
- Make all strings `as const` when saving back to the root file to ensure type safety.
- New [`zColor()`](https://www.remotion.dev/docs/zod-types/z-color) API
- New sidebar design and new mechanism for toggling sidebars
- Create new array items
- Zod union type support
- Overall polish!

### `4.0.0-alpha.127+bcc7f944b` [​](https://www.remotion.dev/docs/4-0-alpha\#400-alpha127bcc7f944b "Direct link to 400-alpha127bcc7f944b")

Improve the saving back to code feature if you are using `as const`.

### `4.0.0-alpha.115+764023ad5` [​](https://www.remotion.dev/docs/4-0-alpha\#400-alpha115764023ad5 "Direct link to 400-alpha115764023ad5")

Initial v4 alpha release

- [How to upgrade](https://www.remotion.dev/docs/4-0-alpha#how-to-upgrade)
- [Changelog](https://www.remotion.dev/docs/4-0-alpha#changelog)
  - [`4.0.0-alpha22`](https://www.remotion.dev/docs/4-0-alpha#400-alpha22)
  - [`4.0.0-alpha21`](https://www.remotion.dev/docs/4-0-alpha#400-alpha21)
  - [`4.0.0-alpha19`](https://www.remotion.dev/docs/4-0-alpha#400-alpha19)
  - [`4.0.0-alpha18`](https://www.remotion.dev/docs/4-0-alpha#400-alpha18)
  - [`4.0.0-alpha16`](https://www.remotion.dev/docs/4-0-alpha#400-alpha16)
  - [`4.0.0-alpha14`](https://www.remotion.dev/docs/4-0-alpha#400-alpha14)
  - [`4.0.0-alpha13`](https://www.remotion.dev/docs/4-0-alpha#400-alpha13)
  - [`4.0.0-alpha12`](https://www.remotion.dev/docs/4-0-alpha#400-alpha12)
  - [`4.0.0-alpha11`](https://www.remotion.dev/docs/4-0-alpha#400-alpha11)
  - [`4.0.0-alpha10`](https://www.remotion.dev/docs/4-0-alpha#400-alpha10)
  - [`4.0.0-alpha9`](https://www.remotion.dev/docs/4-0-alpha#400-alpha9)
  - [`4.0.0-alpha8`](https://www.remotion.dev/docs/4-0-alpha#400-alpha8)
  - [`4.0.0-alpha7`](https://www.remotion.dev/docs/4-0-alpha#400-alpha7)
  - [`4.0.0-alpha6`](https://www.remotion.dev/docs/4-0-alpha#400-alpha6)
  - [`4.0.0-alpha5`](https://www.remotion.dev/docs/4-0-alpha#400-alpha5)
  - [`4.0.0-alpha.185+1b8f0e746`](https://www.remotion.dev/docs/4-0-alpha#400-alpha1851b8f0e746)
  - [`4.0.0-alpha.127+bcc7f944b`](https://www.remotion.dev/docs/4-0-alpha#400-alpha127bcc7f944b)
  - [`4.0.0-alpha.115+764023ad5`](https://www.remotion.dev/docs/4-0-alpha#400-alpha115764023ad5)

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