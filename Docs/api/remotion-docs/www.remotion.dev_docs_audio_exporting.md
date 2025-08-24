---
url: "https://www.remotion.dev/docs/audio/exporting"
title: "Exporting Audio | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/audio/exporting#__docusaurus_skipToContent_fallback)

On this page

If you export your video from Remotion, the audio is automatically included.

Additionally, this page shows you can export the audio only, or omit the audio, and how the export process works.

## Audio Only [​](https://www.remotion.dev/docs/audio/exporting\#audio-only "Direct link to Audio Only")

Exporting as `mp3`, `aac` and `wav` is supported:

### Command Line [​](https://www.remotion.dev/docs/audio/exporting\#command-line "Direct link to Command Line")

To render only the audio via CLI, specify an extension when exporting via CLI:

```

sh

npx remotion render src/index.ts my-comp out/audio.mp3
```

or use the `--codec` flag to automatically choose a good output file name:

```

sh

npx remotion render src/index.ts my-comp --codec=mp3
```

### `renderMedia()` [​](https://www.remotion.dev/docs/audio/exporting\#rendermedia "Direct link to rendermedia")

To render only the audio via the server-side rendering APIs, use [`renderMedia()`](https://www.remotion.dev/docs/renderer/render-media) and set the [`codec`](https://www.remotion.dev/docs/renderer/render-media#codec) to an audio codec.

```

render.js
tsx

await renderMedia({
  composition,
  serveUrl: bundleLocation,
  codec: 'mp3',
  outputLocation,
  inputProps,
});
```

### `renderMediaOnLambda()` [​](https://www.remotion.dev/docs/audio/exporting\#rendermediaonlambda "Direct link to rendermediaonlambda")

To render only the audio via Lambda, use [`renderMediaOnLambda()`](https://www.remotion.dev/docs/lambda/rendermediaonlambda) and set the [`codec`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#codec) to an audio codec and [`imageFormat`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#imageformat) to `none`.

```

tsx

const {bucketName, renderId} = await renderMediaOnLambda({
  region: 'us-east-1',
  functionName: 'remotion-render-bds9aab',
  composition: 'MyVideo',
  serveUrl: 'https://remotionlambda-qg35eyp1s1.s3.eu-central-1.amazonaws.com/sites/bf2jrbfkw',
  inputProps: {},
  codec: 'mp3',
  imageFormat: 'none',
});
```

### Lambda CLI [​](https://www.remotion.dev/docs/audio/exporting\#lambda-cli "Direct link to Lambda CLI")

To render via the Lambda CLI, use the [`npx remotion lambda render`](https://www.remotion.dev/docs/lambda/cli/render) command and pass the [`--codec`](https://www.remotion.dev/docs/lambda/cli/render#--codec) flag:

```

sh

npx remotion lambda render --codec=mp3 https://remotionlambda-qg35eyp1s1.s3.eu-central-1.amazonaws.com/sites/bf2jrbfkw my-comp
```

## Excluding audio [​](https://www.remotion.dev/docs/audio/exporting\#excluding-audio "Direct link to Excluding audio")

### Command Line [​](https://www.remotion.dev/docs/audio/exporting\#command-line-1 "Direct link to Command Line")

Pass `--muted` to not export audio.

```

sh

npx remotion render --muted
```

### `renderMedia()` [​](https://www.remotion.dev/docs/audio/exporting\#rendermedia-1 "Direct link to rendermedia-1")

Pass [`muted: true`](https://www.remotion.dev/docs/renderer/render-media#muted) to [`renderMedia()`](https://www.remotion.dev/docs/renderer/render-media) to mute a render.

```

render.js
tsx

await renderMedia({
  composition,
  serveUrl: bundleLocation,
  codec: 'h264',
  muted: true,
  outputLocation,
  inputProps,
});
```

### `renderMediaOnLambda()` [​](https://www.remotion.dev/docs/audio/exporting\#rendermediaonlambda-1 "Direct link to rendermediaonlambda-1")

Pass [`muted: true`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#muted) to [`renderMediaOnLambda()`](https://www.remotion.dev/docs/lambda/rendermediaonlambda) to mute the render.

```

tsx

const {bucketName, renderId} = await renderMediaOnLambda({
  region: 'us-east-1',
  functionName: 'remotion-render-bds9aab',
  composition: 'MyVideo',
  serveUrl: 'https://remotionlambda-qg35eyp1s1.s3.eu-central-1.amazonaws.com/sites/bf2jrbfkw',
  inputProps: {},
  codec: 'h264',
  muted: true,
});
```

### Lambda CLI [​](https://www.remotion.dev/docs/audio/exporting\#lambda-cli-1 "Direct link to Lambda CLI")

Pass [`--muted`](https://www.remotion.dev/docs/lambda/cli/render#--muted) to [`npx remotion lambda render`](https://www.remotion.dev/docs/lambda/cli/render) to mute a render when using the Lambda Command Line.

```

sh

npx remotion lambda render --muted https://remotionlambda-qg35eyp1s1.s3.eu-central-1.amazonaws.com/sites/bf2jrbfkw my-comp
```

- [Audio Only](https://www.remotion.dev/docs/audio/exporting#audio-only)
  - [Command Line](https://www.remotion.dev/docs/audio/exporting#command-line)
  - [`renderMedia()`](https://www.remotion.dev/docs/audio/exporting#rendermedia)
  - [`renderMediaOnLambda()`](https://www.remotion.dev/docs/audio/exporting#rendermediaonlambda)
  - [Lambda CLI](https://www.remotion.dev/docs/audio/exporting#lambda-cli)
- [Excluding audio](https://www.remotion.dev/docs/audio/exporting#excluding-audio)
  - [Command Line](https://www.remotion.dev/docs/audio/exporting#command-line-1)
  - [`renderMedia()`](https://www.remotion.dev/docs/audio/exporting#rendermedia-1)
  - [`renderMediaOnLambda()`](https://www.remotion.dev/docs/audio/exporting#rendermediaonlambda-1)
  - [Lambda CLI](https://www.remotion.dev/docs/audio/exporting#lambda-cli-1)

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