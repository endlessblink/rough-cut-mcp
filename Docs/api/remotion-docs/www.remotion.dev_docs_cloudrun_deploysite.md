---
url: "https://www.remotion.dev/docs/cloudrun/deploysite"
title: "deploySite() | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/cloudrun/deploysite#__docusaurus_skipToContent_fallback)

On this page

EXPERIMENTAL

Cloud Run is in [Alpha status and not actively being developed.](https://www.remotion.dev/docs/cloudrun/status)

Takes a Remotion project, bundles it and uploads it to an Cloud Storage bucket. Once uploaded, a Cloud Run service can render any composition in the Remotion project by specifying the URL.

- If you make changes locally, you need to redeploy the site. You can use [`siteName`](https://www.remotion.dev/docs/cloudrun/deploysite#sitename) to overwrite the previous site.
- Note that the Remotion project will be deployed to a subdirectory, not the root of the domain. Therefore you must ensure that if you have specified paths in your Remotion project, they are able to handle this scenario.
- Before calling this function, you should create a bucket, see [`getOrCreateBucket()`](https://www.remotion.dev/docs/cloudrun/getorcreatebucket).

## Example [​](https://www.remotion.dev/docs/cloudrun/deploysite\#example "Direct link to Example")

```

ts

import {deploySite} from '@remotion/cloudrun';
import path from 'path';

const {serveUrl} = await deploySite({
  entryPoint: path.resolve(process.cwd(), 'src/index.ts'),
  bucketName: 'remotioncloudrun-c7fsl3d',
  options: {
    onBundleProgress: (progress) => {
      // Progress is between 0 and 100
      console.log(`Bundle progress: ${progress}%`);
    },
    onUploadProgress: ({totalFiles, filesUploaded, totalSize, sizeUploaded}) => {
      console.log(`Upload progress: Total files ${totalFiles}, Files uploaded ${filesUploaded}, Total size ${totalSize}, Size uploaded ${sizeUploaded}`);
    },
  },
});
console.log(serveUrl);
```

## Arguments [​](https://www.remotion.dev/docs/cloudrun/deploysite\#arguments "Direct link to Arguments")

An object with the following properties:

### `entryPoint` [​](https://www.remotion.dev/docs/cloudrun/deploysite\#entrypoint "Direct link to entrypoint")

An absolute path pointing to the entry point of your Remotion project. [Usually the entry point in your Remotion project is stored at `src/entry.tsx`](https://www.remotion.dev/docs/terminology/entry-point).

### `bucketName` [​](https://www.remotion.dev/docs/cloudrun/deploysite\#bucketname "Direct link to bucketname")

The bucket to where the website will be deployed. The bucket must have been created by Remotion Cloud Run.

### `siteName?` [​](https://www.remotion.dev/docs/cloudrun/deploysite\#sitename "Direct link to sitename")

_optional_

Specify the subfolder in your Cloud Storage bucket that you want the site to deploy to. If you omit this property, a new subfolder with a random name will be created. If a site already exists with the name you passed, it will be overwritten. Can only contain the following characters: `0-9`, `a-z`, `A-Z`, `-`, `!`, `_`, `.`, `*`, `'`, `(`, `)`

### `options?` [​](https://www.remotion.dev/docs/cloudrun/deploysite\#options "Direct link to options")

_optional_

An object with the following properties:

#### `onBundleProgress` [​](https://www.remotion.dev/docs/cloudrun/deploysite\#onbundleprogress "Direct link to onbundleprogress")

Callback from Webpack when the bundling has progressed. Passes a number between 0 and 100 to the callback, see example at the top of the page.

#### `onUploadProgress` [​](https://www.remotion.dev/docs/cloudrun/deploysite\#onuploadprogress "Direct link to onuploadprogress")

Callback function that gets called when uploading of the assets has progressed. Passes an object with the following properties to the callback:

- `totalFiles` ( _number_): Total number of files in the bundle.
- `filesUploaded` ( _number_): Number of files that have been fully uploaded so far.
- `totalSize` ( _number_): Total size in bytes of all the files in the bundle.
- `sizeUploaded` ( _number_): Amount of bytes uploaded so far.

#### `webpackOverride` [​](https://www.remotion.dev/docs/cloudrun/deploysite\#webpackoverride "Direct link to webpackoverride")

Allows to pass a custom webpack override. See [`bundle()` -\> webpackOverride](https://www.remotion.dev/docs/bundle#webpackoverride) for more information.

#### `enableCaching` [​](https://www.remotion.dev/docs/cloudrun/deploysite\#enablecaching "Direct link to enablecaching")

Whether webpack caching should be enabled. See [`bundle()` -\> enableCaching](https://www.remotion.dev/docs/bundle#enablecaching) for more information.

#### `publicDir` [​](https://www.remotion.dev/docs/cloudrun/deploysite\#publicdir "Direct link to publicdir")

Set the directory in which the files that can be loaded using [`staticFile()`](https://www.remotion.dev/docs/staticfile) are located. By default it is the folder `public/` located in the [Remotion Root](https://www.remotion.dev/docs/terminology/remotion-root) folder. If you pass a relative path, it will be resolved against the [Remotion Root](https://www.remotion.dev/docs/terminology/remotion-root).

#### `rootDir` [​](https://www.remotion.dev/docs/cloudrun/deploysite\#rootdir "Direct link to rootdir")

The directory in which the Remotion project is rooted in. This should be set to the directory that contains the `package.json` which installs Remotion. By default, it is the current working directory.

note

The current working directory is the directory from which your program gets executed from. It is not the same as the file where bundle() gets called.

#### `ignoreRegisterRootWarning` [​](https://www.remotion.dev/docs/cloudrun/deploysite\#ignoreregisterrootwarning "Direct link to ignoreregisterrootwarning")

Ignore an error that gets thrown if you pass an entry point file which does not contain `registerRoot`.

## Return value [​](https://www.remotion.dev/docs/cloudrun/deploysite\#return-value "Direct link to Return value")

An object with the following values:

### `serveUrl` [​](https://www.remotion.dev/docs/cloudrun/deploysite\#serveurl "Direct link to serveurl")

string\_

An URL such as `https://storage.googleapis.com/remotioncloudrun-123asd321/sites/abcdefgh/index.html`.

You can use this "Serve URL" to render a video on Remotion Cloud Run using:

- The [`npx remotion cloudrun render`](https://www.remotion.dev/docs/cloudrun/cli/render) command
- The [`renderMediaOnCloudrun()`](https://www.remotion.dev/docs/cloudrun/rendermediaoncloudrun) and [`renderStillOnCloudrun()`](https://www.remotion.dev/docs/cloudrun/renderstilloncloudrun) functions.
- Locally using the [`renderMedia()`](https://www.remotion.dev/docs/renderer/render-media) and [`renderStill()`](https://www.remotion.dev/docs/renderer/render-still) functions.
- Locally using the [`npx remotion render`](https://www.remotion.dev/docs/cli) and [`npx remotion still`](https://www.remotion.dev/docs/cli) commands

If you are rendering on Cloud Run, you can also pass the site name (in this case `abcdefgh`) as an abbreviation.

### `siteName` [​](https://www.remotion.dev/docs/cloudrun/deploysite\#sitename-1 "Direct link to sitename-1")

_string_

The identifier of the site that was given. Is either the site name that you have passed into this function, or a random string that was generated if you didn't pass a site name.

### `stats` [​](https://www.remotion.dev/docs/cloudrun/deploysite\#stats "Direct link to stats")

An object with 3 entries:

- `uploadedFiles`
- `deletedFiles`
- `untouchedFiles`

Each one is a `number`.

## See also [​](https://www.remotion.dev/docs/cloudrun/deploysite\#see-also "Direct link to See also")

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/cloudrun/src/api/deploy-site.ts)
- [CLI equivalent: `npx remotion cloudrun sites create`](https://www.remotion.dev/docs/cloudrun/cli/sites/create)
- [getSites()](https://www.remotion.dev/docs/cloudrun/getsites)
- [deleteSite()](https://www.remotion.dev/docs/cloudrun/deletesite)

- [Example](https://www.remotion.dev/docs/cloudrun/deploysite#example)
- [Arguments](https://www.remotion.dev/docs/cloudrun/deploysite#arguments)
  - [`entryPoint`](https://www.remotion.dev/docs/cloudrun/deploysite#entrypoint)
  - [`bucketName`](https://www.remotion.dev/docs/cloudrun/deploysite#bucketname)
  - [`siteName?`](https://www.remotion.dev/docs/cloudrun/deploysite#sitename)
  - [`options?`](https://www.remotion.dev/docs/cloudrun/deploysite#options)
- [Return value](https://www.remotion.dev/docs/cloudrun/deploysite#return-value)
  - [`serveUrl`](https://www.remotion.dev/docs/cloudrun/deploysite#serveurl)
  - [`siteName`](https://www.remotion.dev/docs/cloudrun/deploysite#sitename-1)
  - [`stats`](https://www.remotion.dev/docs/cloudrun/deploysite#stats)
- [See also](https://www.remotion.dev/docs/cloudrun/deploysite#see-also)

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