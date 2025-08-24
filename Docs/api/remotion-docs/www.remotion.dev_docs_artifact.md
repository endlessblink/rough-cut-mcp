---
url: "https://www.remotion.dev/docs/artifact"
title: "<Artifact> | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/artifact#__docusaurus_skipToContent_fallback)

On this page

By rendering an `<Artifact>` tag in your Remotion markup, [an extra file will get emitted during rendering](https://www.remotion.dev/docs/artifacts).

```

MyComp.tsx
tsx

import {Artifact, useCurrentFrame} from 'remotion';

export const MyComp: React.FC = () => {
  const frame = useCurrentFrame();

  return frame === 0 ? <Artifact filename="my-file.txt" content="Hello World!" /> : null;
};
```

If rendered on the CLI or via the Studio, this will emit an additional file:

```

$ npx remotion render MyComp
+ out/MyComp.mp4
+ my-file.txt (12B)
```

It is allowed for a composition to emit multiple files.

However, the file names must be unique.

The component will get evaluated on every frame, which means if you want to emit just one file, only render it on one frame.

```

❌ Will generate an asset on every frame and throw an error because the file name is not unique
tsx

import {Artifact, useCurrentFrame} from 'remotion';

export const MyComp: React.FC = () => {
  const frame = useCurrentFrame();

  return frame === 0 ? <Artifact filename="my-file.txt" content="Hello World!" /> : null;
};
```

## API [​](https://www.remotion.dev/docs/artifact\#api "Direct link to API")

### `filename` [​](https://www.remotion.dev/docs/artifact\#filename "Direct link to filename")

A string that is the name of the file that will be emitted.

Use forward slashes only, even on Windows.

Must match the regex `/^([0-9a-zA-Z-!_.*'()/:&$@=;+,?]+)/g`.

### `content` [​](https://www.remotion.dev/docs/artifact\#content "Direct link to content")

A `string` or `Uint8Array` that is the content of the file that will be emitted. Don't consider an `Uint8Array` to be faster, because it needs to be serialized.

### `downloadBehavior?` [v4.0.296](https://github.com/remotion-dev/remotion/releases/v4.0.296) [​](https://www.remotion.dev/docs/artifact\#downloadbehavior "Direct link to downloadbehavior")

Only applies to serverless rendering.

How the output file should behave when accessed through the output link in the browser.

Either:

- `{"type": "play-in-browser"}` \- the default. The video will play in the browser.
- `{"type": "download", fileName: null}` or `{"type": "download", fileName: "download.mp4"}` \- a `Content-Disposition` header will be added which makes the browser download the file. You can optionally override the filename.

The default behavior is the same download behavior you defined for the main rendering output.

## `Artifact.Thumbnail` [v4.0.290](https://github.com/remotion-dev/remotion/releases/v4.0.290) [​](https://www.remotion.dev/docs/artifact\#artifactthumbnail "Direct link to artifactthumbnail")

A special symbol that if you pass it to the [`content`](https://www.remotion.dev/docs/artifact#content) prop, it will [emit the image data of the current frame as an artifact](https://www.remotion.dev/docs/artifacts#emitting-thumbnails).

```

Emitting the first frame as a thumbnail
tsx

import {Artifact, useCurrentFrame} from 'remotion';

export const MyComp: React.FC = () => {
  const frame = useCurrentFrame();
  return <>{frame === 0 ? <Artifact content={Artifact.Thumbnail} filename="thumbnail.jpeg" /> : null}</>;
};
```

See the [Emitting Thumbnails](https://www.remotion.dev/docs/artifacts#emitting-thumbnails) page for more important information.

## See also [​](https://www.remotion.dev/docs/artifact\#see-also "Direct link to See also")

- [Emitting Artifacts](https://www.remotion.dev/docs/artifacts)
- [Source code for this component](https://github.com/remotion-dev/remotion/blob/main/packages/core/src/Artifact.tsx)

- [API](https://www.remotion.dev/docs/artifact#api)
  - [`filename`](https://www.remotion.dev/docs/artifact#filename)
  - [`content`](https://www.remotion.dev/docs/artifact#content)
  - [`downloadBehavior?`](https://www.remotion.dev/docs/artifact#downloadbehavior)
- [`Artifact.Thumbnail`](https://www.remotion.dev/docs/artifact#artifactthumbnail)
- [See also](https://www.remotion.dev/docs/artifact#see-also)

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