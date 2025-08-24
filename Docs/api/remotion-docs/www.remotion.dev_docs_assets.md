---
url: "https://www.remotion.dev/docs/assets"
title: "Importing assets | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/assets#__docusaurus_skipToContent_fallback)

On this page

To import assets in Remotion, create a `public/` folder in your project and use [`staticFile()`](https://www.remotion.dev/docs/staticfile) to import it.

```

txt

my-video/
├─ node_modules/
├─ public/
│  ├─ logo.png
├─ src/
│  ├─ MyComp.tsx
│  ├─ Root.tsx
│  ├─ index.ts
├─ package.json
```

```

src/MyComp.tsx
tsx

import { Img, staticFile } from "remotion";

export const MyComp: React.FC = () => {
  return <Img src={staticFile("logo.png")} />;
};
```

## Using images [​](https://www.remotion.dev/docs/assets\#using-images "Direct link to Using images")

Use the [`<Img/>`](https://www.remotion.dev/docs/img) tag from Remotion.

```

MyComp.tsx
tsx

import { Img, staticFile } from "remotion";

export const MyComp: React.FC = () => {
  return <Img src={staticFile("logo.png")} />;
};
```

You can also pass a URL:

```

MyComp.tsx
tsx

import { Img } from "remotion";

export const MyComp: React.FC = () => {
  return <Img src="https://picsum.photos/id/237/200/300" />;
};
```

## Using image sequences [​](https://www.remotion.dev/docs/assets\#using-image-sequences "Direct link to Using image sequences")

If you have a series of images, for example exported from another program like After Effects or Rotato, you can interpolate the path to create a dynamic import.

```

txt

my-video/
├─ public/
│  ├─ frame1.png
│  ├─ frame2.png
│  ├─ frame3.png
├─ package.json
```

```

tsx

import { Img, staticFile, useCurrentFrame } from "remotion";

const MyComp: React.FC = () => {
  const frame = useCurrentFrame();

  return <Img src={staticFile(`/frame${frame}.png`)} />;
};
```

## Using videos [​](https://www.remotion.dev/docs/assets\#using-videos "Direct link to Using videos")

Use the [`<OffthreadVideo />`](https://www.remotion.dev/docs/offthreadvideo) or [`<Video />`](https://www.remotion.dev/docs/video) component to keep the timeline and your video in sync.

```

tsx

import { OffthreadVideo, staticFile } from "remotion";

export const MyComp: React.FC = () => {
  return <OffthreadVideo src={staticFile("vid.webm")} />;
};
```

Loading videos via URL is also possible:

```

tsx

import { OffthreadVideo } from "remotion";

export const MyComp: React.FC = () => {
  return (
    <OffthreadVideo src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" />
  );
};
```

See also: [Which video formats does Remotion support?](https://www.remotion.dev/docs/miscellaneous/video-formats)

## Using Audio [​](https://www.remotion.dev/docs/assets\#using-audio "Direct link to Using Audio")

Use the [`<Audio/ >`](https://www.remotion.dev/docs/audio) component.

```

tsx

import { Audio, staticFile } from "remotion";

export const MyComp: React.FC = () => {
  return <Audio src={staticFile("tune.mp3")} />;
};
```

Loading audio from an URL is also possible:

```

tsx

import { Audio } from "remotion";

export const MyComp: React.FC = () => {
  return (
    <Audio src="https://file-examples.com/storage/fe48a63c5264cbd519788b3/2017/11/file_example_MP3_700KB.mp3" />
  );
};
```

See the [audio guide](https://www.remotion.dev/docs/using-audio) for guidance on including audio.

## Using CSS [​](https://www.remotion.dev/docs/assets\#using-css "Direct link to Using CSS")

Put the .css file alongside your JavaScript source files and use an `import` statement.

```

txt

my-video/
├─ node_modules/
├─ src/
│  ├─ style.css
│  ├─ MyComp.tsx
│  ├─ Root.tsx
│  ├─ index.ts
├─ package.json
```

```

MyComp.tsx
tsx

import "./style.css";
```

note

Want to use SASS, Tailwind or similar? [See examples on how to override the Webpack configuration](https://www.remotion.dev/docs/webpack).

## Using Fonts [​](https://www.remotion.dev/docs/assets\#using-fonts "Direct link to Using Fonts")

[Read the separate page for fonts.](https://www.remotion.dev/docs/fonts)

## `import` statements [​](https://www.remotion.dev/docs/assets\#import-statements "Direct link to import-statements")

As an alternative way to import files, Remotion allows you to `import` or `require()` several types of files in your project:

- Images ( `.png`, `.svg`, `.jpg`, `.jpeg`, `.webp`, `.gif`, `.bmp`)
- Videos ( `.webm`, `.mov`, `.mp4`)
- Audio ( `.mp3`, `.wav`, `.aac`, `.m4a`)
- Fonts ( `.woff`, `.woff2`, `.otf`, `.ttf`, `.eot`)

For example:

```

MyComp.tsx
tsx

import { Img } from "remotion";
import logo from "./logo.png";

export const MyComp: React.FC = () => {
  return <Img src={logo} />;
};
```

### Caveats [​](https://www.remotion.dev/docs/assets\#caveats "Direct link to Caveats")

While this was previously the main way of importing files, we now recommend against it because of the following reasons:

- Only the above listed file extensions are supported.
- The maximum file size is 2GB.
- Dynamic imports such as `require('img' + frame + '.png')` are [funky](https://www.remotion.dev/docs/webpack-dynamic-imports).

Prefer importing using [`staticFile()`](https://www.remotion.dev/docs/staticfile) if possible.

## Dynamic duration based on assets [​](https://www.remotion.dev/docs/assets\#dynamic-duration-based-on-assets "Direct link to Dynamic duration based on assets")

To make your videos duration dependent based on your assets, see: [Dynamic duration, FPS & dimensions](https://www.remotion.dev/docs/dynamic-metadata)

## Files outside of the project [​](https://www.remotion.dev/docs/assets\#files-outside-of-the-project "Direct link to Files outside of the project")

Remotion runs in the browser, so it does not have access to arbitrary files on your computer.

It is also not possible to use the `fs` module from Node.js in the browser.

Instead, put assets in the `public/` folder and use [`getStaticFiles()`](https://www.remotion.dev/docs/getstaticfiles) to enumerate them.

See [why does Remotion does not support absolute paths](https://www.remotion.dev/docs/miscellaneous/absolute-paths).

## Adding assets after bundling [​](https://www.remotion.dev/docs/assets\#adding-assets-after-bundling "Direct link to Adding assets after bundling")

Before rendering, the code gets bundled using Webpack, and only bundled assets can be accessed afterwards.

For this reason, assets that are being added to the public folder after [`bundle()`](https://www.remotion.dev/docs/bundle) is called will not be accessible during render.

However, if you use the [server-side rendering APIs](https://www.remotion.dev/docs/ssr-node), you can add assets to the `public` folder that is inside the bundle after the fact.

## Use `<Img>`, `<Video>` and `<Audio>` [​](https://www.remotion.dev/docs/assets\#use-img-video-and-audio "Direct link to use-img-video-and-audio")

**Prefer [`<Img />`](https://www.remotion.dev/docs/img) or [`<Gif />`](https://www.remotion.dev/docs/gif)** over the native `<img>` tag, `<Image>` from Next.js and CSS `background-image`.

**Prefer [`<OffthreadVideo />`](https://www.remotion.dev/docs/offthreadvideo) or [`<Video />`](https://www.remotion.dev/docs/video)** over the native `<video>` tag.

**Prefer [`<Audio />`](https://www.remotion.dev/docs/audio)** over the native `<audio>` tag.

**Prefer [`<IFrame />`](https://www.remotion.dev/docs/iframe)** over the native `<iframe>` tag.

By using the components from Remotion, you ensure that:

[1](https://www.remotion.dev/docs/assets#1)

The assets are fully loaded before the the frame is rendered

[2](https://www.remotion.dev/docs/assets#2) The images and videos are synchronized with Remotion's timeline.

## See also [​](https://www.remotion.dev/docs/assets\#see-also "Direct link to See also")

- [staticFile()](https://www.remotion.dev/docs/staticfile)
- [getStaticFiles()](https://www.remotion.dev/docs/getstaticfiles)
- [watchStaticFile()](https://www.remotion.dev/docs/watchstaticfile)
- [Why Remotion does not support absolute paths](https://www.remotion.dev/docs/miscellaneous/absolute-paths)

- [Using images](https://www.remotion.dev/docs/assets#using-images)
- [Using image sequences](https://www.remotion.dev/docs/assets#using-image-sequences)
- [Using videos](https://www.remotion.dev/docs/assets#using-videos)
- [Using Audio](https://www.remotion.dev/docs/assets#using-audio)
- [Using CSS](https://www.remotion.dev/docs/assets#using-css)
- [Using Fonts](https://www.remotion.dev/docs/assets#using-fonts)
- [`import` statements](https://www.remotion.dev/docs/assets#import-statements)
  - [Caveats](https://www.remotion.dev/docs/assets#caveats)
- [Dynamic duration based on assets](https://www.remotion.dev/docs/assets#dynamic-duration-based-on-assets)
- [Files outside of the project](https://www.remotion.dev/docs/assets#files-outside-of-the-project)
- [Adding assets after bundling](https://www.remotion.dev/docs/assets#adding-assets-after-bundling)
- [Use `<Img>`, `<Video>` and `<Audio>`](https://www.remotion.dev/docs/assets#use-img-video-and-audio)
- [See also](https://www.remotion.dev/docs/assets#see-also)

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