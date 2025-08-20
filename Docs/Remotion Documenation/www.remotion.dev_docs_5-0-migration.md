---
url: "https://www.remotion.dev/docs/5-0-migration"
title: "v5.0 Migration | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/5-0-migration#__docusaurus_skipToContent_fallback)

On this page

note

Remotion 5.0 is not yet released. This is an incomplete list of breaking changes that are planned for the release.

## How to upgrade [​](https://www.remotion.dev/docs/5-0-migration\#how-to-upgrade "Direct link to How to upgrade")

See the [changelog](https://remotion.dev/changelog) to find the latest version.
Upgrade `remotion` and all packages starting with `@remotion` to the latest version, e.g. `5.0.0`:

```

diff

- "remotion": "4.0.141"
- "@remotion/bundler": "4.0.141"
- "@remotion/eslint-config": "4.0.141"
- "@remotion/eslint-plugin": "4.0.141"
- "@remotion/cli": "4.0.141"
- "@remotion/renderer": "4.0.141"
+ "remotion": "5.0.0"
+ "@remotion/bundler": "5.0.0"
+ "@remotion/eslint-config": "5.0.0"
+ "@remotion/eslint-plugin": "5.0.0"
+ "@remotion/cli": "5.0.0"
+ "@remotion/renderer": "5.0.0"
```

Run `npm i `, `yarn`, `pnpm i` or `bun i` respectively afterwards.

## Runtime requirements [​](https://www.remotion.dev/docs/5-0-migration\#runtime-requirements "Direct link to Runtime requirements")

The minimum Node version is now 18.0.0. The minimum Bun version is 1.1.3.

## `selectComposition()` and `getCompositions()` now require `inputProps` [​](https://www.remotion.dev/docs/5-0-migration\#selectcomposition-and-getcompositions-now-require-inputprops "Direct link to selectcomposition-and-getcompositions-now-require-inputprops")

`inputProps` is now required in [`selectComposition()`](https://www.remotion.dev/docs/renderer/select-composition) and [`getCompositions()`](https://www.remotion.dev/docs/renderer/get-compositions).

A common footgun was the render was not working as intended because the input props were not passed.

**Required action**: Pass an empty object `{}` if you don't have any input props.

## `visualizeAudio()` yields different result [​](https://www.remotion.dev/docs/5-0-migration\#visualizeaudio-yields-different-result "Direct link to visualizeaudio-yields-different-result")

[`optimizeFor: "speed"`](https://www.remotion.dev/docs/visualize-audio#optimizefor) is now the default. This will yield slightly different results.

**Required action**: Review the visualization of your audio. If unsatisfactory, revert to the old behavior by setting `optimizeFor: "accuracy"`.

## TransitionSeries does not support `layout="none"` anymore [​](https://www.remotion.dev/docs/5-0-migration\#transitionseries-does-not-support-layoutnone-anymore "Direct link to transitionseries-does-not-support-layoutnone-anymore")

Having a [TransitionSeries](https://www.remotion.dev/docs/transitions/transitionseries) with `layout="none"` is not supported anymore.

It never made sense to have this prop as transitioned elements need to be positioned absolutely.

**Required action**: Remove the `layout` prop.

## Zod should be upgraded to 3.23.8 [​](https://www.remotion.dev/docs/5-0-migration\#zod-should-be-upgraded-to-3238 "Direct link to Zod should be upgraded to 3.23.8")

Remotion previously used the types of Zod 3.22.3. With Remotion 5.0, the types of 3.23.8 are used.

**Required action**: If you use Zod, Upgrade Zod to 3.23.8.

## `measureSpring()` does not accept `from` and `to` options anymore [​](https://www.remotion.dev/docs/5-0-migration\#measurespring-does-not-accept-from-and-to-options-anymore "Direct link to measurespring-does-not-accept-from-and-to-options-anymore")

The values passed in there did not influence the calculation at all. Therefore we removed those options.

**Required action**: Remove the `from` and `to` options from your code.

## `overwrite` is now `true` by default in `renderMediaOnLambda()` [​](https://www.remotion.dev/docs/5-0-migration\#overwrite-is-now-true-by-default-in-rendermediaonlambda "Direct link to overwrite-is-now-true-by-default-in-rendermediaonlambda")

The default value of `overwrite` has been changed to `true` in `renderMediaOnLambda()`. This skips a check that the file already exists in the S3 bucket, which makes the render start faster.

**Required action**: If you want to keep the old behavior, set `overwrite: false`, explicitly.

## `openBrowser()` now takes a `logLevel` instead of `shouldDumpIo` [​](https://www.remotion.dev/docs/5-0-migration\#openbrowser-now-takes-a-loglevel-instead-of-shoulddumpio "Direct link to openbrowser-now-takes-a-loglevel-instead-of-shoulddumpio")

The `shouldDumpIo` option has been be removed in 5.0.

Use `logLevel: "verbose"` instead.

## `diskSizeInMb` is now 10240 by default [​](https://www.remotion.dev/docs/5-0-migration\#disksizeinmb-is-now-10240-by-default "Direct link to disksizeinmb-is-now-10240-by-default")

For Remotion Lambda, the default disk size is now 10240 MB.

This will add a miniscule cost to your renders technically, but will lead to more reliable and faster renders, since Chrome is less likely to run out of disk cache.

**Required actions**:

- If you want to keep the old behavior, set `diskSizeInMb: 2048`, explicitly.
- If your Lambda function name is hardcoded to include `disk2048mb`, unhardcode it and use `speculateFunctionName()` to get the correct name.

## Some APIs should be imported from `@remotion/lambda/client` [​](https://www.remotion.dev/docs/5-0-migration\#some-apis-should-be-imported-from-remotionlambdaclient "Direct link to some-apis-should-be-imported-from-remotionlambdaclient")

`renderMediaOnLambda()`, `getRenderProgress()`, `renderStillOnLambda()`, `presignUrl()`, `getSites()` have been removed from `@remotion/lambda`.

They are now available in `@remotion/lambda/client`.

## `@remotion/google-fonts` requires specifying weights and subsets [​](https://www.remotion.dev/docs/5-0-migration\#remotiongoogle-fonts-requires-specifying-weights-and-subsets "Direct link to remotiongoogle-fonts-requires-specifying-weights-and-subsets")

When using `loadFonts()` from `@remotion/google-fonts`, you must now specify which font weights and subsets you want to load. Loading all weights and subsets by default is no longer supported as it can lead to timeouts.

**Required action**: Explicitly specify the weights and subsets you need:

```

ts

import {loadFont} from '@remotion/google-fonts/Roboto';

loadFont('normal', {
  weights: ['400', '700'],
  subsets: ['latin'],
});
```

## License changes [​](https://www.remotion.dev/docs/5-0-migration\#license-changes "Direct link to License changes")

Remotion 5.0 has an updated license. View the [license](https://github.com/remotion-dev/remotion/blob/5-0-license/LICENSE.md) here or compare the [changes](https://github.com/remotion-dev/remotion/pull/3750).

Besides wording changes, there are two effective changes in this license:

- Contractors also count towards team size. Previously, a company could only work with contractors and never have to get a company license.
- The company license is bound to our [terms and conditions](https://www.remotion.pro/terms) that will be introduced with Remotion 5.0.

Previously, our terms were generated by a Terms and conditions generator and did not make sense. We wrote the terms and conditions to properly define how we currently handle our licensing business and policies.

- [How to upgrade](https://www.remotion.dev/docs/5-0-migration#how-to-upgrade)
- [Runtime requirements](https://www.remotion.dev/docs/5-0-migration#runtime-requirements)
- [`selectComposition()` and `getCompositions()` now require `inputProps`](https://www.remotion.dev/docs/5-0-migration#selectcomposition-and-getcompositions-now-require-inputprops)
- [`visualizeAudio()` yields different result](https://www.remotion.dev/docs/5-0-migration#visualizeaudio-yields-different-result)
- [TransitionSeries does not support `layout="none"` anymore](https://www.remotion.dev/docs/5-0-migration#transitionseries-does-not-support-layoutnone-anymore)
- [Zod should be upgraded to 3.23.8](https://www.remotion.dev/docs/5-0-migration#zod-should-be-upgraded-to-3238)
- [`measureSpring()` does not accept `from` and `to` options anymore](https://www.remotion.dev/docs/5-0-migration#measurespring-does-not-accept-from-and-to-options-anymore)
- [`overwrite` is now `true` by default in `renderMediaOnLambda()`](https://www.remotion.dev/docs/5-0-migration#overwrite-is-now-true-by-default-in-rendermediaonlambda)
- [`openBrowser()` now takes a `logLevel` instead of `shouldDumpIo`](https://www.remotion.dev/docs/5-0-migration#openbrowser-now-takes-a-loglevel-instead-of-shoulddumpio)
- [`diskSizeInMb` is now 10240 by default](https://www.remotion.dev/docs/5-0-migration#disksizeinmb-is-now-10240-by-default)
- [Some APIs should be imported from `@remotion/lambda/client`](https://www.remotion.dev/docs/5-0-migration#some-apis-should-be-imported-from-remotionlambdaclient)
- [`@remotion/google-fonts` requires specifying weights and subsets](https://www.remotion.dev/docs/5-0-migration#remotiongoogle-fonts-requires-specifying-weights-and-subsets)
- [License changes](https://www.remotion.dev/docs/5-0-migration#license-changes)

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