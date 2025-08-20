---
url: "https://www.remotion.dev/docs/artifacts"
title: "Emitting Artifacts | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/artifacts#__docusaurus_skipToContent_fallback)

On this page

Sometimes you wish to generate additional files when rendering your video. For example:

- A `.srt` subtitle file
- A `.txt` containing chapters of the video
- A `CREDITS` file for the assets used in the video
- Debug information from the render.

You can use the [`<Artifact>`](https://www.remotion.dev/docs/artifact) component to emit arbitrary files from your video.

note

Emitting artifacts is not currently supported by `@remotion/cloudrun`.

## Example [​](https://www.remotion.dev/docs/artifacts\#example "Direct link to Example")

```

MyComp.tsx
tsx

import React from 'react';
import {Artifact, useCurrentFrame} from 'remotion';
import {generateSubtitles} from './subtitles';

export const MyComp: React.FC = () => {
  const frame = useCurrentFrame();
  return <>{frame === 0 ? <Artifact filename="captions.srt" content={generateSubtitles()} /> : null}</>;
};
```

## Rules of artifacts [​](https://www.remotion.dev/docs/artifacts\#rules-of-artifacts "Direct link to Rules of artifacts")

[1](https://www.remotion.dev/docs/artifacts#1)

The asset should only be rendered for one single frame of the video. Otherwise, the asset will get emitted multiple times.

[2](https://www.remotion.dev/docs/artifacts#2)

It is possible to emit multiple assets, but they may not have the same filename.

[3](https://www.remotion.dev/docs/artifacts#3)

For the `content` prop it is possible to pass a `string`, or a `Uint8Array` for binary data. Passing an `Uint8Array` should not be considered faster due to it having to be serialized.

## Emitting thumbnails [v4.0.290](https://github.com/remotion-dev/remotion/releases/v4.0.290) [​](https://www.remotion.dev/docs/artifacts\#emitting-thumbnails "Direct link to emitting-thumbnails")

You can emit the image data of the current frame as an artifact.

```

Emitting the first frame as a thumbnail
tsx

import {Artifact, useCurrentFrame} from 'remotion';

export const MyComp: React.FC = () => {
  const frame = useCurrentFrame();
  return <>{frame === 0 ? <Artifact content={Artifact.Thumbnail} filename="thumbnail.jpeg" /> : null}</>;
};
```

[1](https://www.remotion.dev/docs/artifacts#1)

The [`content`](https://www.remotion.dev/docs/artifact#content) prop should be set to [`Artifact.Thumbnail`](https://www.remotion.dev/docs/artifact#artifactthumbnail).

[2](https://www.remotion.dev/docs/artifacts#2)

The [`imageFormat`](https://www.remotion.dev/docs/renderer/render-media#imageformat) setting determines the format of the image. The extension you pass is meaningless.

[3](https://www.remotion.dev/docs/artifacts#3)

The other rules of artifacts still apply.

## Receiving artifacts [​](https://www.remotion.dev/docs/artifacts\#receiving-artifacts "Direct link to Receiving artifacts")

### In the CLI or Studio [​](https://www.remotion.dev/docs/artifacts\#in-the-cli-or-studio "Direct link to In the CLI or Studio")

Artifacts get saved to `out/[composition-id]/[filename]` when rendering a video.

### Using `renderMedia()`, `renderStill()` or `renderFrames()` [​](https://www.remotion.dev/docs/artifacts\#using-rendermedia-renderstill-or-renderframes "Direct link to using-rendermedia-renderstill-or-renderframes")

Use the [`onArtifact`](https://www.remotion.dev/docs/renderer/render-media#onartifact) callback to receive the artifacts.

```

render.mjs
tsx

import {renderMedia, OnArtifact} from '@remotion/renderer';

const onArtifact: OnArtifact = (artifact) => {
  console.log(artifact.filename); // string
  console.log(artifact.content); // string | Uint8Array
  console.log(artifact.frame); // number, frame in the composition which emitted this

  // Example action: Write the artifact to disk
  fs.writeFileSync(artifact.filename, artifact.content);
};

await renderMedia({
  composition,
  serveUrl,
  onArtifact,
  codec: 'h264',
  inputProps,
});
```

### Using the Remotion Lambda CLI [​](https://www.remotion.dev/docs/artifacts\#using-the-remotion-lambda-cli "Direct link to Using the Remotion Lambda CLI")

When using [`npx remotion lambda render`](https://www.remotion.dev/docs/lambda/cli/render) or [`npx remotion lambda still`](https://www.remotion.dev/docs/lambda/cli/still), artifacts get saved to the S3 bucket under the key `renders/[render-id]/artifacts/[filename]`.

They will get logged to the console and you can click them to download them.

The `--privacy` option also applies to artifacts.

### Using `renderMediaOnLambda()` [​](https://www.remotion.dev/docs/artifacts\#using-rendermediaonlambda "Direct link to using-rendermediaonlambda")

When using [`renderMediaOnLambda()`](https://www.remotion.dev/docs/lambda/rendermediaonlambda), artifacts get saved to the S3 bucket under the key `renders/[render-id]/artifacts/[filename]`.

You can obtain a list of currently received assets from [`getRenderProgress()`](https://www.remotion.dev/docs/lambda/getrenderprogress#artifacts).

```

progress.ts
tsx

import {getRenderProgress} from '@remotion/lambda/client';

const renderProgress = await getRenderProgress({
  renderId: 'hi',
  functionName: 'hi',
  bucketName: 'hi',
  region: 'eu-central-1',
});

for (const artifact of renderProgress.artifacts) {
  console.log(artifact.filename); // "hello-world.txt"
  console.log(artifact.sizeInBytes); // 12
  console.log(artifact.s3Url); // "https://s3.eu-central-1.amazonaws.com/remotion-lambda-abcdef/renders/abcdef/artifacts/hello-world.txt"
  console.log(artifact.s3Key); // "renders/abcdef/artifacts/hello-world.txt"
}
```

### Using `renderStillOnLambda()` [​](https://www.remotion.dev/docs/artifacts\#using-renderstillonlambda "Direct link to using-renderstillonlambda")

When using [`renderStillOnLambda()`](https://www.remotion.dev/docs/lambda/renderstillonlambda), artifacts get saved to the S3 bucket under the key `renders/[render-id]/artifacts/[filename]`.

You can obtain a list of received assets from [`artifacts`](https://www.remotion.dev/docs/lambda/renderstillonlambda#artifacts) field of `renderStillOnLambda()`.

```

still.ts
tsx

import {renderStillOnLambda} from '@remotion/lambda/client';

const stillResponse = await renderStillOnLambda({
  functionName,
  region,
  serveUrl,
  composition,
  inputProps,
  imageFormat,
  privacy,
});

for (const artifact of stillResponse.artifacts) {
  console.log(artifact.filename); // "hello-world.txt"
  console.log(artifact.sizeInBytes); // 12
  console.log(artifact.s3Url); // "https://s3.eu-central-1.amazonaws.com/remotion-lambda-abcdef/renders/abcdef/artifacts/hello-world.txt"
  console.log(artifact.s3Key); // "renders/abcdef/artifacts/hello-world.txt"
}
```

### Using Cloud Run [​](https://www.remotion.dev/docs/artifacts\#using-cloud-run "Direct link to Using Cloud Run")

In the Cloud Run Alpha, emitting artifacts is not supported and will throw an error.

We plan on revising Cloud Run to use the same runtime as Lambda in the future and will bring this feature along.

## See also [​](https://www.remotion.dev/docs/artifacts\#see-also "Direct link to See also")

- [`<Artifact>`](https://www.remotion.dev/docs/artifact)

- [Example](https://www.remotion.dev/docs/artifacts#example)
- [Rules of artifacts](https://www.remotion.dev/docs/artifacts#rules-of-artifacts)
- [Emitting thumbnails](https://www.remotion.dev/docs/artifacts#emitting-thumbnails)
- [Receiving artifacts](https://www.remotion.dev/docs/artifacts#receiving-artifacts)
  - [In the CLI or Studio](https://www.remotion.dev/docs/artifacts#in-the-cli-or-studio)
  - [Using `renderMedia()`, `renderStill()` or `renderFrames()`](https://www.remotion.dev/docs/artifacts#using-rendermedia-renderstill-or-renderframes)
  - [Using the Remotion Lambda CLI](https://www.remotion.dev/docs/artifacts#using-the-remotion-lambda-cli)
  - [Using `renderMediaOnLambda()`](https://www.remotion.dev/docs/artifacts#using-rendermediaonlambda)
  - [Using `renderStillOnLambda()`](https://www.remotion.dev/docs/artifacts#using-renderstillonlambda)
  - [Using Cloud Run](https://www.remotion.dev/docs/artifacts#using-cloud-run)
- [See also](https://www.remotion.dev/docs/artifacts#see-also)

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