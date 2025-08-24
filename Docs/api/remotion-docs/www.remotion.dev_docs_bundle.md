---
url: "https://www.remotion.dev/docs/bundle"
title: "bundle() | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/bundle#__docusaurus_skipToContent_fallback)

On this page

_Part of the `@remotion/bundler` package._

Bundles a Remotion project using Webpack and prepares it for rendering using [`renderMedia()`](https://www.remotion.dev/docs/renderer/render-media). [See a full server-side rendering example.](https://www.remotion.dev/docs/ssr-node)

You only need to call this function when the source code changes. You can render multiple videos from the same bundle and parametrize them using [input props](https://www.remotion.dev/docs/passing-props).

Calling `bundle()` for every video that you render is an anti-pattern.

`bundle()` cannot be called in a serverless function, see: [Calling bundle() in bundled code](https://www.remotion.dev/docs/troubleshooting/bundling-bundle).

## Example [​](https://www.remotion.dev/docs/bundle\#example "Direct link to Example")

```

render.mjs
tsx

import path from 'path';
import {bundle} from '@remotion/bundler';

const serveUrl = await bundle({
  entryPoint: path.join(process.cwd(), './src/index.ts'),
  // If you have a webpack override in remotion.config.ts, pass it here as well.
  webpackOverride: (config) => config,
});
```

## Arguments [​](https://www.remotion.dev/docs/bundle\#arguments "Direct link to Arguments")

### `entryPoint` [​](https://www.remotion.dev/docs/bundle\#entrypoint "Direct link to entrypoint")

A `string` containing an absolute path of the entry point of a Remotion project. [In most Remotion project created with the template, the entry point is located at `src/index.ts`](https://www.remotion.dev/docs/terminology/entry-point).

### `onProgress?` [​](https://www.remotion.dev/docs/bundle\#onprogress "Direct link to onprogress")

A callback function that notifies about the progress of the Webpack bundling. Passes a number between `0` and `100`. Example function:

```

ts

const onProgress = (progress: number) => {
  console.log(`Webpack bundling progress: ${progress}%`);
};
```

### `webpackOverride?` [​](https://www.remotion.dev/docs/bundle\#webpackoverride "Direct link to webpackoverride")

_optional_

A function to override the webpack config reducer-style. Takes a function which gives you the current webpack config which you can transform and return a modified version of it. For example:

```

ts

const webpackOverride: WebpackOverrideFn = (webpackConfig) => {
  return {
    ...webpackConfig,
    // Override properties
  };
};
```

### `outDir?` [​](https://www.remotion.dev/docs/bundle\#outdir "Direct link to outdir")

_optional_

Specify a desired output directory. If no passed, the webpack bundle will be created in a temp dir.

### `enableCaching?` [​](https://www.remotion.dev/docs/bundle\#enablecaching "Direct link to enablecaching")

_optional_

A `boolean` specifying whether Webpack caching should be enabled. Default `true`, it is recommended to leave caching enabled at all times since file changes should be recognized by Webpack nonetheless.

### `publicPath?` [​](https://www.remotion.dev/docs/bundle\#publicpath "Direct link to publicpath")

_optional_

The path of the URL where the bundle is going to be hosted. By default it is `/`, meaning that the bundle is going to be hosted at the root of the domain (e.g. `https://localhost:3000/`). If you are deploying to a subdirectory (e.g. `/sites/my-site/`), you should set this to the subdirectory.

### `rootDir?` [v3.1.6](https://github.com/remotion-dev/remotion/releases/v3.1.6) [​](https://www.remotion.dev/docs/bundle\#rootdir "Direct link to rootdir")

_optional_

The directory in which the Remotion project is rooted in. This should be set to the directory that contains the `package.json` which installs Remotion. By default, it is the current working directory.

note

The current working directory is the directory from which your program gets executed from. It is not the same as the file where bundle() gets called.

### `publicDir?` [v3.2.13](https://github.com/remotion-dev/remotion/releases/v3.2.13) [​](https://www.remotion.dev/docs/bundle\#publicdir "Direct link to publicdir")

Set the directory in which the files that can be loaded using [`staticFile()`](https://www.remotion.dev/docs/staticfile) are located. By default it is the folder `public/` located in the [Remotion Root](https://www.remotion.dev/docs/terminology/remotion-root). If you pass a relative path, it will be resolved against the [Remotion Root](https://www.remotion.dev/docs/terminology/remotion-root).

### `onPublicDirCopyProgress?` [v3.3.3](https://github.com/remotion-dev/remotion/releases/v3.3.3) [​](https://www.remotion.dev/docs/bundle\#onpublicdircopyprogress "Direct link to onpublicdircopyprogress")

Reports progress of how many bytes have been written while copying the `public/` directoy. Useful to warn the user if the directory is large that this operation is slow.

### `onSymlinkDetected?` [v3.3.3](https://github.com/remotion-dev/remotion/releases/v3.3.3) [​](https://www.remotion.dev/docs/bundle\#onsymlinkdetected "Direct link to onsymlinkdetected")

Gets called when a symbolic link is detected in the `public/` directory. Since Remotion will forward the symbolic link, it might be useful to display a hint to the user that if the original symbolic link gets deleted, the bundle will also break.

### `ignoreRegisterRootWarning?` [v3.3.46](https://github.com/remotion-dev/remotion/releases/v3.3.46) [​](https://www.remotion.dev/docs/bundle\#ignoreregisterrootwarning "Direct link to ignoreregisterrootwarning")

Ignore an error that gets thrown if you pass an entry point file which does not contain `registerRoot`.

## Legacy function signature [​](https://www.remotion.dev/docs/bundle\#legacy-function-signature "Direct link to Legacy function signature")

Remotion versions earlier than v3.2.17 had the following function signature instead:

```

ts

const bundle: (
  entryPoint: string,
  onProgress?: (progress: number) => void,
  options?: {
    webpackOverride?: WebpackOverrideFn;
    outDir?: string;
    enableCaching?: boolean;
    publicPath?: string;
    rootDir?: string;
    publicDir?: string | null;
  },
) => Promise<string>;
```

Example:

```

ts

await bundle('src/index.ts', () => console.log(progress * 100 + '% done'), {
  webpackOverride,
});
```

It is still supported in Remotion v3, but we encourage to migrate to the new function signature.

## Return value [​](https://www.remotion.dev/docs/bundle\#return-value "Direct link to Return value")

A promise which will resolve into a `string` specifying the output directory.

## See also [​](https://www.remotion.dev/docs/bundle\#see-also "Direct link to See also")

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/bundler/src/bundle.ts)
- [Server-Side rendering](https://www.remotion.dev/docs/ssr)
- [getCompositions()](https://www.remotion.dev/docs/renderer/get-compositions)
- [renderMedia()](https://www.remotion.dev/docs/renderer/render-media)
- [stitchFramesToVideo()](https://www.remotion.dev/docs/renderer/stitch-frames-to-video)
- [Calling bundle() in bundled code](https://www.remotion.dev/docs/troubleshooting/bundling-bundle)

- [Example](https://www.remotion.dev/docs/bundle#example)
- [Arguments](https://www.remotion.dev/docs/bundle#arguments)
  - [`entryPoint`](https://www.remotion.dev/docs/bundle#entrypoint)
  - [`onProgress?`](https://www.remotion.dev/docs/bundle#onprogress)
  - [`webpackOverride?`](https://www.remotion.dev/docs/bundle#webpackoverride)
  - [`outDir?`](https://www.remotion.dev/docs/bundle#outdir)
  - [`enableCaching?`](https://www.remotion.dev/docs/bundle#enablecaching)
  - [`publicPath?`](https://www.remotion.dev/docs/bundle#publicpath)
  - [`rootDir?`](https://www.remotion.dev/docs/bundle#rootdir)
  - [`publicDir?`](https://www.remotion.dev/docs/bundle#publicdir)
  - [`onPublicDirCopyProgress?`](https://www.remotion.dev/docs/bundle#onpublicdircopyprogress)
  - [`onSymlinkDetected?`](https://www.remotion.dev/docs/bundle#onsymlinkdetected)
  - [`ignoreRegisterRootWarning?`](https://www.remotion.dev/docs/bundle#ignoreregisterrootwarning)
- [Legacy function signature](https://www.remotion.dev/docs/bundle#legacy-function-signature)
- [Return value](https://www.remotion.dev/docs/bundle#return-value)
- [See also](https://www.remotion.dev/docs/bundle#see-also)

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