[Skip to main content](https://www.remotion.dev/docs/lambda/deleterender#__docusaurus_skipToContent_fallback)

On this page

Deletes a rendered video, audio or still and its associated metada.

```

ts

import {deleteRender} from '@remotion/lambda';

const {freedBytes} = await deleteRender({
  bucketName: 'remotionlambda-r42fs9fk',
  region: 'us-east-1',
  renderId: '8hfxlw',
});

console.log(freedBytes); // 21249541
```

## Arguments [​](https://www.remotion.dev/docs/lambda/deleterender\#arguments "Direct link to Arguments")

An object with the following properties:

### `region` [​](https://www.remotion.dev/docs/lambda/deleterender\#region "Direct link to region")

The [AWS region](https://www.remotion.dev/docs/lambda/region-selection) in which the render has performed.

### `bucketName` [​](https://www.remotion.dev/docs/lambda/deleterender\#bucketname "Direct link to bucketname")

The bucket name in which the render was stored. This should be the same variable you used for [`renderMediaOnLambda()`](https://www.remotion.dev/docs/lambda/rendermediaonlambda) or [`renderStillOnLambda()`](https://www.remotion.dev/docs/lambda/renderstillonlambda).

### `renderId` [​](https://www.remotion.dev/docs/lambda/deleterender\#renderid "Direct link to renderid")

The ID of the render. You can retrieve this ID by calling [`renderMediaOnLambda()`](https://www.remotion.dev/docs/lambda/rendermediaonlambda) or [`renderStillOnLambda()`](https://www.remotion.dev/docs/lambda/renderstillonlambda).

### `customCredentials` [​](https://www.remotion.dev/docs/lambda/deleterender\#customcredentials "Direct link to customcredentials")

_optional, available from v3.2.23_

If the render was saved to a [different cloud](https://www.remotion.dev/docs/lambda/custom-destination#saving-to-another-cloud), pass an object with the same `endpoint`, `accessKeyId` and `secretAccessKey` as you passed to [`renderMediaOnLambda()`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#outname) or [`renderStillOnLambda()`](https://www.remotion.dev/docs/lambda/renderstillonlambda#outname).

### `forcePathStyle?` [v4.0.202](https://github.com/remotion-dev/remotion/releases/v4.0.202) [​](https://www.remotion.dev/docs/lambda/deleterender\#forcepathstyle "Direct link to forcepathstyle")

Passes `forcePathStyle` to the AWS S3 client. If you don't know what this is, you probably don't need it.

## Return value [​](https://www.remotion.dev/docs/lambda/deleterender\#return-value "Direct link to Return value")

Returns a promise resolving to an object with the following properties:

### `freedBytes` [​](https://www.remotion.dev/docs/lambda/deleterender\#freedbytes "Direct link to freedbytes")

The amount of bytes that were removed from the S3 bucket.

## See also [​](https://www.remotion.dev/docs/lambda/deleterender\#see-also "Direct link to See also")

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/lambda/src/api/delete-render.ts)

- [Arguments](https://www.remotion.dev/docs/lambda/deleterender#arguments)
  - [`region`](https://www.remotion.dev/docs/lambda/deleterender#region)
  - [`bucketName`](https://www.remotion.dev/docs/lambda/deleterender#bucketname)
  - [`renderId`](https://www.remotion.dev/docs/lambda/deleterender#renderid)
  - [`customCredentials`](https://www.remotion.dev/docs/lambda/deleterender#customcredentials)
  - [`forcePathStyle?`](https://www.remotion.dev/docs/lambda/deleterender#forcepathstyle)
- [Return value](https://www.remotion.dev/docs/lambda/deleterender#return-value)
  - [`freedBytes`](https://www.remotion.dev/docs/lambda/deleterender#freedbytes)
- [See also](https://www.remotion.dev/docs/lambda/deleterender#see-also)

Remotion

![Logo](https://raw.githubusercontent.com/remotion-dev/brand/refs/heads/main/logo.svg)

Remotion

You may ask your questions about the Remotion documentation and the bot answers it based on the documentation. Go through the sources for better answers appropriately.

QUICK QUESTIONS

How to install it?

How to setup Remotion Lambda?

Why is my composition flickering?

Powered by [CrawlChat](https://crawlchat.app/?ref=powered-by-remotion)