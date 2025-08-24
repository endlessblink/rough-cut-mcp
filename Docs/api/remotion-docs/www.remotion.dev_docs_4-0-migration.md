---
url: "https://www.remotion.dev/docs/4-0-migration"
title: "v4.0 Migration | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/4-0-migration#__docusaurus_skipToContent_fallback)

On this page

When upgrading from Remotion 3 to Remotion 4, note the following changes and apply them to your project.

## How to upgrade [​](https://www.remotion.dev/docs/4-0-migration\#how-to-upgrade "Direct link to How to upgrade")

See the [changelog](https://remotion.dev/changelog) to find the latest version.
Upgrade `remotion` and all packages starting with `@remotion` to the latest version, e.g. `4.0.0`:

```

diff

- "remotion": "^3.3.43"
- "@remotion/bundler": "^3.3.43"
- "@remotion/eslint-config": "^3.3.43"
- "@remotion/eslint-plugin": "^3.3.43"
- "@remotion/cli": "^3.3.43"
- "@remotion/renderer": "^3.3.43"
+ "remotion": "4.0.0"
+ "@remotion/bundler": "4.0.0"
+ "@remotion/eslint-config": "4.0.0"
+ "@remotion/eslint-plugin": "4.0.0"
+ "@remotion/cli": "4.0.0"
+ "@remotion/renderer": "4.0.0"
```

Run `npm i `, `yarn` or `pnpm i` respectively afterwards.

## System requirements [​](https://www.remotion.dev/docs/4-0-migration\#system-requirements "Direct link to System requirements")

The minimum Node version is now 16.0.0.

Only the following platforms are supported: Windows (x64 only), macOS, Linux.

Linux distros with glibc need to have at least version 2.35. [See here](https://github.com/remotion-dev/remotion/issues/2439) for more information.

## Config file changes [​](https://www.remotion.dev/docs/4-0-migration\#config-file-changes "Direct link to Config file changes")

The CLI configuration file has been moved out from the core Remotion package to `@remotion/cli/config`. Update your imports like this:

```

diff

- import {Config} from 'remotion';
+ import {Config} from '@remotion/cli/config';
```

The options have been flattened. For example, instead of `Config.Bundling.overrideWebpackConfig`, you now use `Config.overrideWebpackConfig`.

```

diff

- Config.Bundling.overrideWebpackConfig()
+ Config.overrideWebpackConfig()

- Config.Output.setOverwriteOutput(true);
+ Config.setOverwriteOutput(true);
```

Apply this to all configuration calls.

## Separating `ImageFormat` [​](https://www.remotion.dev/docs/4-0-migration\#separating-imageformat "Direct link to separating-imageformat")

Previously, the `imageFormat` option would be used for both stills and videos. While for stills, PNG is often preferrable, for videos it is overall faster to use JPEG as a default. In Remotion 4.0, the image formats are being separated so you can set defaults for videos and stills separately.

- `Config.setImageFormat` got replaced by [`Config.setVideoImageFormat()`](https://www.remotion.dev/docs/config#setvideoimageformat) and [`Config.setStillImageFormat()`](https://www.remotion.dev/docs/config#setstillimageformat).

```

diff

- Config.setImageFormat('jpeg');
+ Config.setVideoImageFormat('jpeg');
```

- The CLI option is still `--image-format` for all commands.
- The Node.JS API name is still `imageFormat`.
- The TypeScript type `ImageFormat` has been separated into `StillImageFormat` and `VideoImageFormat`.
- `StillImageFormat` now also supports `webp` and `pdf`!

## Streamlined logging [​](https://www.remotion.dev/docs/4-0-migration\#streamlined-logging "Direct link to Streamlined logging")

For [`getCompositions()`](https://www.remotion.dev/docs/renderer/render-media), [`renderMedia()`](https://www.remotion.dev/docs/renderer/render-media), [`renderStill()`](https://www.remotion.dev/docs/renderer/render-still), [`getCompositionsOnLambda()`](https://www.remotion.dev/docs/lambda/getcompositionsonlambda), [`renderMediaOnLambda()`](https://www.remotion.dev/docs/lambda/rendermediaonlambda) and [`renderStillOnLambda()`](https://www.remotion.dev/docs/lambda/renderstillonlambda):

[`verbose`](https://www.remotion.dev/docs/renderer/render-media#verbose) and [`dumpBrowserLogs`](https://www.remotion.dev/docs/renderer/render-media#dumpbrowserlogs) have been deprecated in favor of [`"logLevel": "verbose"`](https://www.remotion.dev/docs/renderer/render-media#loglevel). This makes the options equivalent to the CLI options.

## Dropped support for Lambda `architecture` [​](https://www.remotion.dev/docs/4-0-migration\#dropped-support-for-lambda-architecture "Direct link to dropped-support-for-lambda-architecture")

When deploying a Lambda, you were previously able to choose between the `arm64` and `x86_64` architecture.

From v4.0 on, only `arm64` is supported. It should be faster, cheaper and not have any different behavior than `x86_64`.

**How to upgrade**:

- Remove the `architecture` option from `estimatePrice()` and `deployFunction()`.

## Rich timeline removed [​](https://www.remotion.dev/docs/4-0-migration\#rich-timeline-removed "Direct link to Rich timeline removed")

The option to use the "Rich timeline" has been removed due to performance problems.

The timeline is now always in simple mode, but supports more timeline layers at once.

## ProRes videos now export uncompressed audio by default [​](https://www.remotion.dev/docs/4-0-migration\#prores-videos-now-export-uncompressed-audio-by-default "Direct link to ProRes videos now export uncompressed audio by default")

Previously, the `aac` audio codec was the default for ProRes exports. The default is now `pcm_s16le` which stands for uncompressed 16-bit low-endian PCM audio.

This change was made since users export ProRes mainly for getting high-quality footage to be further used in video editing programs.

## Renamed `quality` option to `jpegQuality` [​](https://www.remotion.dev/docs/4-0-migration\#renamed-quality-option-to-jpegquality "Direct link to renamed-quality-option-to-jpegquality")

To clarify the meaning of this option, it is now universally called "JPEG Quality". Adjust the following options:

- [`npx remotion render`](https://www.remotion.dev/docs/cli/render): Use `--jpeg-quality` insted of `--quality`
- [`npx remotion still`](https://www.remotion.dev/docs/cli/still): Use `--jpeg-quality` insted of `--quality`
- [`npx remotion benchmark`](https://www.remotion.dev/docs/cli/benchmark): Use `--jpeg-quality` insted of `--quality`
- [`npx remotion lambda render`](https://www.remotion.dev/docs/lambda/cli/render): Use `--jpeg-quality` insted of `--quality`
- [`npx remotion lambda still`](https://www.remotion.dev/docs/lambda/cli/still): Use `--jpeg-quality` insted of `--quality`
- [`renderFrames()`](https://www.remotion.dev/docs/renderer/render-frames): Use `jpegQuality` instead of `quality`
- [`renderMedia()`](https://www.remotion.dev/docs/renderer/render-media): Use `jpegQuality` instead of `quality`
- [`renderStill()`](https://www.remotion.dev/docs/renderer/render-still): Use `jpegQuality` instead of `quality`
- [`renderMediaOnLambda()`](https://www.remotion.dev/docs/lambda/rendermediaonlambda): Use `jpegQuality` instead of `quality`
- [`renderStillOnLambda()`](https://www.remotion.dev/docs/lambda/renderstillonlambda): Use `jpegQuality` instead of `quality`

## No more FFmpeg install, `ffmpegExecutable` option removed [​](https://www.remotion.dev/docs/4-0-migration\#no-more-ffmpeg-install-ffmpegexecutable-option-removed "Direct link to no-more-ffmpeg-install-ffmpegexecutable-option-removed")

FFmpeg is now baked into the `@remotion/renderer` package. Therefore, the `ffmpegExecutable` and `ffprobeExecutable` options have been removed.

Furthermore, the `npx remotion install ffmpeg` and `npx remotion install ffprobe` commands no longer exist.

**How to upgrade:**

- Remove the `ffmpegExecutable` option from [`renderMedia()`](https://www.remotion.dev/docs/renderer/render-media), [`renderStill()`](https://www.remotion.dev/docs/renderer/render-still), [`getCompositions()`](https://www.remotion.dev/docs/renderer/get-compositions), [`renderFrames()`](https://www.remotion.dev/docs/renderer/render-frames) and [`stitchFramesToVideo()`](https://www.remotion.dev/docs/renderer/stitch-frames-to-video) calls.
- Remove the `ffprobeExecutable` option from [`renderMedia()`](https://www.remotion.dev/docs/renderer/render-media), [`renderStill()`](https://www.remotion.dev/docs/renderer/render-still), [`getCompositions()`](https://www.remotion.dev/docs/renderer/get-compositions), [`renderFrames()`](https://www.remotion.dev/docs/renderer/render-frames) and [`stitchFramesToVideo()`](https://www.remotion.dev/docs/renderer/stitch-frames-to-video) calls.
- Remove all calls to [`ensureFfmpeg()`](https://www.remotion.dev/docs/renderer/ensure-ffmpeg).
- Remove all calls to [`ensureFfprobe()`](https://www.remotion.dev/docs/renderer/ensure-ffprobe).
- Remove the `--ffmpeg-executable` flag from [`npx remotion render`](https://www.remotion.dev/docs/cli/render), [`npx remotion still`](https://www.remotion.dev/docs/cli/still) and [`npx remotion benchmark`](https://www.remotion.dev/docs/cli/benchmark)
- Remove the `--ffprobe-executable` flag from [`npx remotion render`](https://www.remotion.dev/docs/cli/render), [`npx remotion still`](https://www.remotion.dev/docs/cli/still) and [`npx remotion benchmark`](https://www.remotion.dev/docs/cli/benchmark)
- Don't use the [`npx remotion install`](https://www.remotion.dev/docs/cli/install) command anymore

## Added `npx remotion ffmpeg` and `npx remotion ffprobe` [​](https://www.remotion.dev/docs/4-0-migration\#added-npx-remotion-ffmpeg-and-npx-remotion-ffprobe "Direct link to added-npx-remotion-ffmpeg-and-npx-remotion-ffprobe")

Since FFmpeg and FFprobe no longer have to be installed, the `ffmpeg` and `ffprobe` commands might also not be in your environment anymore. In order to still be able to use some of FFmpeg's handy commands, we introduced [`npx remotion ffmpeg`](https://www.remotion.dev/docs/cli/ffmpeg) and [`npx remotion ffprobe`](https://www.remotion.dev/docs/cli/ffprobe).
Note that in order to keep the binary size small, those FFmpeg binaries only understand the codecs that Remotion itself supports: H.264, H.265, VP8, VP9 and ProRes.

A binary from the 6.0 release line of FFmpeg is used.

## Moved `onSlowestFrames` API [​](https://www.remotion.dev/docs/4-0-migration\#moved-onslowestframes-api "Direct link to moved-onslowestframes-api")

In V3, `onSlowestFrames` has been a callback function that you could pass to `renderMedia()`.

In V4, this data has been moved to the [return value](https://www.remotion.dev/docs/renderer/render-media#return-value).

## ImageFormat removed [​](https://www.remotion.dev/docs/4-0-migration\#imageformat-removed "Direct link to ImageFormat removed")

The [@remotion/renderer](https://www.remotion.dev/docs/renderer) `ImageFormat` Type got replaced by the more specific Types `VideoImageFormat` and `StillImageFormat`.

## Removal of deprecated APIs [​](https://www.remotion.dev/docs/4-0-migration\#removal-of-deprecated-apis "Direct link to Removal of deprecated APIs")

- `Config.setOutputFormat()` was deprecated in v1.4 and has now been removed. Use `setImageSequence()`, `setVideoImageFormat()` and `setCodec()` in combination instead.

- `downloadVideo()` alias has been removed, use [`downloadMedia()`](https://www.remotion.dev/docs/lambda/downloadmedia) with the same API instead.

- `<MotionBlur>` has been removed. Use [`<Trail>`](https://www.remotion.dev/docs/motion-blur/trail) instead.

- `getParts()` has been removed. Use [`getSubpaths()`](https://www.remotion.dev/docs/paths/get-subpaths) instead:


```

paths.ts
tsx

import {getLength, getPointAtLength, getSubpaths, getTangentAtLength} from '@remotion/paths';

const path = 'M 0 0 L 100 100';
const parts = getSubpaths(path[0]);
const length = getLength(parts[0]);
const start = getPointAtLength(parts[0], 0);
const end = getPointAtLength(parts[0], length);
const tangent = getTangentAtLength(parts[0], length / 2);
```

- `webpackBundle` has been removed from `renderFrames()` and `renderMedia()` \- rename it to `serveUrl` instead
- `parallelism` has been removed from `renderFrames()` and `renderMedia()` \- rename it to `concurrency` instead.
- `config` has been removed from `renderFrames()` \- rename it to `composition` instead.

## `onBucketEnsured` option has been removed [​](https://www.remotion.dev/docs/4-0-migration\#onbucketensured-option-has-been-removed "Direct link to onbucketensured-option-has-been-removed")

The `onBucketEnsured()` option of [`getOrCreateBucket()`](https://www.remotion.dev/docs/lambda/getorcreatebucket) has been removed because creating the bucket is the only operation of `getOrCreateBucket()`. Therefore, you can just await the function itself.

## `imageFormat` removed from `<OffthreadVideo>` [​](https://www.remotion.dev/docs/4-0-migration\#imageformat-removed-from-offthreadvideo "Direct link to imageformat-removed-from-offthreadvideo")

Until now, you could optionally pass the `imageFormat` prop into `<OffthreadVideo>`. This option was introduced in order to make transparent videos possible.

Now, you can instead use the optional `transparent` prop.

Due to this this change, the `OffthreadVideoImageFormat` type is no longer neccessary and has therefore been removed.

## `OffthreadVideoImageFormat` removed [​](https://www.remotion.dev/docs/4-0-migration\#offthreadvideoimageformat-removed "Direct link to offthreadvideoimageformat-removed")

## `<Img>` will cancel the render if the image cannot be loaded [​](https://www.remotion.dev/docs/4-0-migration\#img-will-cancel-the-render-if-the-image-cannot-be-loaded "Direct link to img-will-cancel-the-render-if-the-image-cannot-be-loaded")

Before, [`<Img>`](https://www.remotion.dev/docs/img) would only log to the console if an image cannot be loaded and inevitably lead to a timeout if the error is not handled.

If this happens now and the error is not handled, the render will be aborted and the error reported.

## `crf` is not allowed for GIFs anymore [​](https://www.remotion.dev/docs/4-0-migration\#crf-is-not-allowed-for-gifs-anymore "Direct link to crf-is-not-allowed-for-gifs-anymore")

Previously you were able to set a value for `crf` when rendering a GIF. This was a mistake and GIF does not support them.

## `staticFile()` URI-unsafe characters handling [​](https://www.remotion.dev/docs/4-0-migration\#staticfile-uri-unsafe-characters-handling "Direct link to staticfile-uri-unsafe-characters-handling")

Previously, [`staticFile()`](https://www.remotion.dev/docs/staticfile) did not handle URI-unsafe characters contained in the provided path:

```

Before v4
tsx

staticFile('my-image#portrait.png'); //output: "my-image#portrait.png"
```

This could lead to problems, when unsafe characters such as `#`, `?` and `&` were part of the filename.

Now, [`staticFile()`](https://www.remotion.dev/docs/staticfile) encodes the filename using `encodeURIComponent`:

```

Since v4.0.0
tsx

staticFile('my-image#portrait.png'); // "my-image%23portrait.png"
```

## Type `WebpackOverrideFn` moved [​](https://www.remotion.dev/docs/4-0-migration\#type-webpackoverridefn-moved "Direct link to type-webpackoverridefn-moved")

The `WebpackOverrideFn` type useful for overriding the Webpack config in the config file and in [`bundle()`](https://www.remotion.dev/docs/bundle) has moved from the `remotion` to the `@remotion/bundler` package.

**How to upgrade:**

If you encoded the path by yourself until now, don't do so anymore to avoid double encoding.

## `react-native` no longer aliases to `react-native-web` [​](https://www.remotion.dev/docs/4-0-migration\#react-native-no-longer-aliases-to-react-native-web "Direct link to react-native-no-longer-aliases-to-react-native-web")

Remotion no longer aliases `react-native` automatically to `react-native-web`.

If you are using `react-native-web`, override the Webpack config like this to restore the previous behavior:

```

remotion.config.ts
ts

import {Config} from '@remotion/cli/config';

Config.overrideWebpackConfig((config) => {
  return {
    ...config,
    resolve: {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        'react-native$': 'react-native-web',
      },
    },
  };
});
```

The [`@remotion/skia`](https://www.remotion.dev/docs/skia) package does not require `react-native` or `react-native-web` anymore.

## The `TComposition` type now includes a Zod schema [​](https://www.remotion.dev/docs/4-0-migration\#the-tcomposition-type-now-includes-a-zod-schema "Direct link to the-tcomposition-type-now-includes-a-zod-schema")

The `TComposition` type now has two generic arguments:

```

ts

export type TComposition<Schema extends AnyZodObject, Props> = {};
```

If you need a type for a generic composition, you can use the new `AnyComposition` type:

```

ts

import {AnyComposition} from 'remotion';

const composition: AnyComposition = {
  width: 1920,
  height: 1080,
  // ...
};
```

## `getCanExtractFramesFast()` function has been removed [​](https://www.remotion.dev/docs/4-0-migration\#getcanextractframesfast-function-has-been-removed "Direct link to getcanextractframesfast-function-has-been-removed")

The [`getCanExtractFramesFast()`](https://www.remotion.dev/docs/renderer/get-can-extract-frames-fast) function has been removed, since frames can always be extracted fast now using `<OffthreadVideo>`.

**How to upgrade:**

You can now remove your re-encoding logic!

## Input props must be an object [​](https://www.remotion.dev/docs/4-0-migration\#input-props-must-be-an-object "Direct link to Input props must be an object")

Since the input props are passed to a React component, they must not explicitly be objects ( `{}`). You can still use other data structures such as arrays, but they must be wrapped in an object.

## Cannot use an `interface` for props [​](https://www.remotion.dev/docs/4-0-migration\#cannot-use-an-interface-for-props "Direct link to cannot-use-an-interface-for-props")

The following code now gives a type error:

```

tsx

interface MyProps {
  title: string;
}

const Hi = (props: MyProps) => {
  return <div>{props.title}</div>;
};

<Still component={Hi} id="interface-props" defaultProps={{title: 'hi'}} height={1080} width={1080} />;
```

This is because props must now be an object and satisfy the shape `Record<string, unknown>`.

`interface`'s do not satisfy this shape, so you must use a `type` instead:

```

tsx

type MyProps = {
  title: string;
};
```

See also: [Input props must be an object](https://www.remotion.dev/docs/4-0-migration#input-props-must-be-an-object)

## `defaultProps` is required if the component has props [​](https://www.remotion.dev/docs/4-0-migration\#defaultprops-is-required-if-the-component-has-props "Direct link to defaultprops-is-required-if-the-component-has-props")

If you register a composition with a component that requires some props, you now are required to provide a `defaultProps` object.

## `inputProps` option of `renderMedia()` now works differently [​](https://www.remotion.dev/docs/4-0-migration\#inputprops-option-of-rendermedia-now-works-differently "Direct link to inputprops-option-of-rendermedia-now-works-differently")

[`renderMedia()`](https://www.remotion.dev/docs/renderer/render-media) accepts a `VideoConfig` object for the `composition` option, which now has a `props` field:

```

tsx

await renderMedia({
  ...options,
  composition: {
    ...composition,
    props: {
      title: 'Hello world',
    },
  },
  inputProps: {
    title: 'Hi there',
  },
});
```

The `composition.props` are now the effective props that get passed to the component, while `inputProps` are what can be retrieved using [`getInputProps()`](https://www.remotion.dev/docs/get-input-props).

Previously, `inputProps` would override the default props and be passed to the component.

The recommended way is to get the `composition` object using [`selectComposition()`](https://www.remotion.dev/docs/renderer/select-composition) or [`getCompositions()`](https://www.remotion.dev/docs/renderer/get-compositions). However, for the purpose of starting renders faster, the `composition` object may be constructed manually.

## Changelog [​](https://www.remotion.dev/docs/4-0-migration\#changelog "Direct link to Changelog")

- **remotion**: `defaultProps` of a [`<Composition>`](https://www.remotion.dev/docs/composition) is now mandatory if the component accepts props
- **remotion**: [`<Composition>`](https://www.remotion.dev/docs/composition) now accepts a schema
- **remotion**: [`<Composition>`](https://www.remotion.dev/docs/composition) now accepts a [`calculateMetadata`](https://www.remotion.dev/docs/composition) prop
- **remotion**: The `OffthreadVideoImageFormat` type has been removed.
- **remotion**: [`imageFormat`](https://www.remotion.dev/docs/offthreadvideo#imageformat-) has been removed from `<OffthreadVideo>`
- **remotion**: [`transparent`](https://www.remotion.dev/docs/offthreadvideo#transparent) has been added to `<OffthreadVideo>`.
- **remotion**: [`<Img>`](https://www.remotion.dev/docs/img) will cancel the render if the image cannot be loaded
- **remotion**: If an [`<Audio>`](https://www.remotion.dev/docs/audio) tag cannot be loaded, it will cancel the render.
- **remotion**: The `TComposition` type now requires a Zod schema as a generic.
- **remotion**: Type `WebpackOverrideFn` moved from `remotion` to `@remotion/bundler`
- **remotion**: [`staticFile()`](https://www.remotion.dev/docs/staticfile#handling-uri-unsafe-characters) now supports URI-unsafe characters by default
- **remotion**: Types: `src` is required for an [`<Img>`](https://www.remotion.dev/docs/img) tag
- **@remotion/bundler**: The development Webpack cache will not be removed anymore if setting [`--bundle-cache=false`](https://www.remotion.dev/docs/cli/render#--bundle-cache).
- **@remotion/bundler**: `react-native` no longer aliases to `react-native-web`
- **@remotion/bundler**: Webpack has been upgraded to `5.83.1`
- **@remotion/cli**: `npx remotion preview` is deprecated for [`npx remotion studio`](https://www.remotion.dev/docs/cli/studio)
- **@remotion/cli**: New [Props editor](https://www.remotion.dev/docs/visual-editing) allows for editing props with schema
- **@remotion/cli**: New [Render button](https://www.remotion.dev/docs/render) allows for rendering through the CLI
- **@remotion/cli**: New [`npx remotion ffmpeg`](https://www.remotion.dev/docs/cli/ffmpeg) command
- **@remotion/cli**: New [`npx remotion ffprobe`](https://www.remotion.dev/docs/cli/ffprobe) command
- **@remotion/cli**: Configuration logic has been moved to [`@remotion/cli/config`](https://www.remotion.dev/docs/4-0-migration)
- **@remotion/cli**: [Rich timeline was removed](https://github.com/remotion-dev/remotion/issues/1602#issuecomment-1401618644).
- **@remotion/cli**: [`Config.*.setOption()`](https://www.remotion.dev/docs/4-0-migration) syntax has been removed.
- **@remotion/cli**: [`Config.setOutputFormat()`](https://www.remotion.dev/docs/config#setoutputformat) has now been removed.
- **@remotion/cli**: Studio now has custom dark scrollbars
- **@remotion/cli**: New logger for verbose mode: No more interlacing between logs and progress bars
- **@remotion/cli**: New indicator whether a file has been overwritten ( `○`) or newly created ( `+`)
- **@remotion/cli**: Printing server URL again to the console if all Studio instances have been closed
- **@remotion/cli**: Less React re-renders across the Remotion Studio
- **@remotion/cli**: Dropdowns cannot overflow anymore
- **@remotion/cli**: New shortcut for collapsing left sidebar: `Cmd/Ctrl+B`
- **@remotion/cli** Allow open of the project in editor from the Remotion Studio
- **@remotion/cli**: `Date` objects now work properly in `defaultProps`
- **@remotion/cli**: Remotion Studio is tested to work well offline.
- **@remotion/cli**: "Remotion Preview" has been renamed to ["Remotion Studio"](https://www.remotion.dev/docs/studio)
- **@remotion/eslint-config**: `eslint-plugin-react` has been updated to `7.32.2`
- **@remotion/eslint-config**: `eslint-plugin-react-hooks` has been updated to `4.6.0`
- **@remotion/eslint-plugin**: New ESLint rule: Use the right import in the config file
- **@remotion/lambda**: Lambda does not support the [x86 architecture anymore](https://www.remotion.dev/docs/lambda/runtime)
- **@remotion/lambda**: Chrome on Lambda [has been updated to 114](https://www.remotion.dev/docs/lambda/runtime)
- **@remotion/lambda**: [`downloadVideo()`](https://www.remotion.dev/docs/lambda/downloadmedia) alias has been removed.
- **@remotion/lambda**: [`estimatePrice()`](https://www.remotion.dev/docs/lambda/estimateprice) does not accept `architecture` anymore.
- **@remotion/lambda**: Removed FFmpeg from the Lambda Layer.
- **@remotion/motion-blur**: [`<MotionBlur>`](https://www.remotion.dev/docs/motion-blur/motion-blur) has been removed
- **@remotion/paths**: [`getParts()`](https://www.remotion.dev/docs/paths/get-parts) has been removed
- **@remotion/renderer**: New [`selectComposition()`](https://www.remotion.dev/docs/renderer/select-composition) API
- **@remotion/renderer**: [`getCanExtractFramesFast()`](https://www.remotion.dev/docs/renderer/get-can-extract-frames-fast) has been removed
- **@remotion/renderer**: FFmpeg is now included in Remotion (v6.0), no need to install it anymore
- **@remotion/renderer**: [ProRes](https://www.remotion.dev/docs/encoding) now exports uncompressed audio by default.
- **@remotion/renderer**: [`onSlowestFrames`](https://www.remotion.dev/docs/renderer/render-media#onslowestframes) has been removed
- **@remotion/renderer**: [`renderMedia()`](https://www.remotion.dev/docs/renderer/render-media#return-value) now returns an object instead of a `Buffer`.
- **@remotion/renderer**: The `ImageFormat` type has been removed in favor of `StillImageFormat` and `VideoImageFormat`
- **@remotion/renderer**: You can now [export stills as PDF or WebP](https://www.remotion.dev/docs/stills)
- **@remotion/renderer**: `quality` is now [`jpegQuality`](https://www.remotion.dev/docs/renderer/render-media#jpegquality)
- **@remotion/renderer**: Removed [`ensureFfmpeg()`](https://www.remotion.dev/docs/renderer/ensure-ffmpeg) and [`ensureFfprobe()`](https://www.remotion.dev/docs/renderer/ensure-ffprobe)
- **@remotion/renderer**: [`<OffthreadVideo>`](https://www.remotion.dev/docs/offthreadvideo) now uses a Rust-based frame extractor
- **@remotion/renderer**: Noisy Chrome messages are filtered out.
- **@remotion/renderer**: `console.log` statements in your React app now get printed in a tidy format, contain location, use colors and object previews are printed out.
- **@remotion/zod-types**: [New package](https://www.remotion.dev/docs/zod-types)!
- Only the following platforms are supported by Remotion now: macOS (x64 and arm64), Windows (x64), Linux (x64 and ARM, GNU Libc and MUSL)
- All packages: The minimum Node version is now 16.0.0
- All packages: ESLint has been upgraded to `8.42.0`
- All packages: TypeScript ESLint has been upgraded to `5.59.9`
- All packages: ESBuild has been updated to `0.18.6`
- For contributors: Updated `pnpm` to `8.5.1`
- For contributors: Doc snippets failing typechecks now show the failing code in CI
- [New Google TTS template!](https://www.remotion.dev/templates/google-tts)
- [Recommended Docker file](https://www.remotion.dev/docs/docker) does not install `ffmpeg` anymore

- [How to upgrade](https://www.remotion.dev/docs/4-0-migration#how-to-upgrade)
- [System requirements](https://www.remotion.dev/docs/4-0-migration#system-requirements)
- [Config file changes](https://www.remotion.dev/docs/4-0-migration#config-file-changes)
- [Separating `ImageFormat`](https://www.remotion.dev/docs/4-0-migration#separating-imageformat)
- [Streamlined logging](https://www.remotion.dev/docs/4-0-migration#streamlined-logging)
- [Dropped support for Lambda `architecture`](https://www.remotion.dev/docs/4-0-migration#dropped-support-for-lambda-architecture)
- [Rich timeline removed](https://www.remotion.dev/docs/4-0-migration#rich-timeline-removed)
- [ProRes videos now export uncompressed audio by default](https://www.remotion.dev/docs/4-0-migration#prores-videos-now-export-uncompressed-audio-by-default)
- [Renamed `quality` option to `jpegQuality`](https://www.remotion.dev/docs/4-0-migration#renamed-quality-option-to-jpegquality)
- [No more FFmpeg install, `ffmpegExecutable` option removed](https://www.remotion.dev/docs/4-0-migration#no-more-ffmpeg-install-ffmpegexecutable-option-removed)
- [Added `npx remotion ffmpeg` and `npx remotion ffprobe`](https://www.remotion.dev/docs/4-0-migration#added-npx-remotion-ffmpeg-and-npx-remotion-ffprobe)
- [Moved `onSlowestFrames` API](https://www.remotion.dev/docs/4-0-migration#moved-onslowestframes-api)
- [ImageFormat removed](https://www.remotion.dev/docs/4-0-migration#imageformat-removed)
- [Removal of deprecated APIs](https://www.remotion.dev/docs/4-0-migration#removal-of-deprecated-apis)
- [`onBucketEnsured` option has been removed](https://www.remotion.dev/docs/4-0-migration#onbucketensured-option-has-been-removed)
- [`imageFormat` removed from `<OffthreadVideo>`](https://www.remotion.dev/docs/4-0-migration#imageformat-removed-from-offthreadvideo)
- [`OffthreadVideoImageFormat` removed](https://www.remotion.dev/docs/4-0-migration#offthreadvideoimageformat-removed)
- [`<Img>` will cancel the render if the image cannot be loaded](https://www.remotion.dev/docs/4-0-migration#img-will-cancel-the-render-if-the-image-cannot-be-loaded)
- [`crf` is not allowed for GIFs anymore](https://www.remotion.dev/docs/4-0-migration#crf-is-not-allowed-for-gifs-anymore)
- [`staticFile()` URI-unsafe characters handling](https://www.remotion.dev/docs/4-0-migration#staticfile-uri-unsafe-characters-handling)
- [Type `WebpackOverrideFn` moved](https://www.remotion.dev/docs/4-0-migration#type-webpackoverridefn-moved)
- [`react-native` no longer aliases to `react-native-web`](https://www.remotion.dev/docs/4-0-migration#react-native-no-longer-aliases-to-react-native-web)
- [The `TComposition` type now includes a Zod schema](https://www.remotion.dev/docs/4-0-migration#the-tcomposition-type-now-includes-a-zod-schema)
- [`getCanExtractFramesFast()` function has been removed](https://www.remotion.dev/docs/4-0-migration#getcanextractframesfast-function-has-been-removed)
- [Input props must be an object](https://www.remotion.dev/docs/4-0-migration#input-props-must-be-an-object)
- [Cannot use an `interface` for props](https://www.remotion.dev/docs/4-0-migration#cannot-use-an-interface-for-props)
- [`defaultProps` is required if the component has props](https://www.remotion.dev/docs/4-0-migration#defaultprops-is-required-if-the-component-has-props)
- [`inputProps` option of `renderMedia()` now works differently](https://www.remotion.dev/docs/4-0-migration#inputprops-option-of-rendermedia-now-works-differently)
- [Changelog](https://www.remotion.dev/docs/4-0-migration#changelog)

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