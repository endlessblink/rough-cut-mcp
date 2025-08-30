[Skip to main content](https://www.remotion.dev/docs/gif/gif#__docusaurus_skipToContent_fallback)

On this page

_Part of the [`@remotion/gif`](https://www.remotion.dev/docs/gif) package_

Displays a GIF that synchronizes with Remotions [`useCurrentFrame()`](https://www.remotion.dev/docs/use-current-frame).

```

tsx

import {Gif} from '@remotion/gif';

export const MyComponent: React.FC = () => {
  const {width, height} = useVideoConfig();
  const ref = useRef<HTMLCanvasElement>(null);

  return (
    <Gif
      ref={ref}
      src="https://media.giphy.com/media/3o72F7YT6s0EMFI0Za/giphy.gif"
      width={width}
      height={height}
      fit="fill"
      playbackRate={2}
    />
  );
};
```

## Props [​](https://www.remotion.dev/docs/gif/gif\#props "Direct link to Props")

### `src` [​](https://www.remotion.dev/docs/gif/gif\#src "Direct link to src")

_required_

The source of the GIF. Can be an URL or a local image - see [Importing assets](https://www.remotion.dev/docs/assets).

note

Remote GIFs need to support [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).

More info

- Remotion's origin is usually `http://localhost:3000`, but it
may be different if rendering on Lambda or the port is busy.

- You can [disable CORS](https://www.remotion.dev/docs/chromium-flags#--disable-web-security)
during renders.


### `width` [​](https://www.remotion.dev/docs/gif/gif\#width "Direct link to width")

The display width.

### `height` [​](https://www.remotion.dev/docs/gif/gif\#height "Direct link to height")

The display height.

### `fit` [​](https://www.remotion.dev/docs/gif/gif\#fit "Direct link to fit")

Must be one of these values:

- `'fill'`: The GIF will completely fill the container, and will be stretched if necessary. ( _default_)
- `'contain'`: The GIF is scaled to fit the box, while aspect ratio is maintained.
- `'cover'`: The GIF completely fills the container and maintains it's aspect ratio. It will be cropped if necessary.

### `onLoad` [​](https://www.remotion.dev/docs/gif/gif\#onload "Direct link to onload")

Callback that gets called once the GIF has loaded and finished processing. As its only argument, the callback gives the following object:

- `width`: Width of the GIF file in pixels.
- `height`: Height of the GIF file in pixels.
- `delays`: Array of timestamps of type `number` containing position of each frame.
- `frames`: Array of frames of type [`ImageData`](https://developer.mozilla.org/en-US/docs/Web/API/ImageData)

### `style` [​](https://www.remotion.dev/docs/gif/gif\#style "Direct link to style")

Allows to pass in custom CSS styles. You may not pass `width` and `height`, instead use the props `width` and `height` to set the size of the GIF.

### `loopBehavior` [v3.3.4](https://github.com/remotion-dev/remotion/releases/v3.3.4) [​](https://www.remotion.dev/docs/gif/gif\#loopbehavior "Direct link to loopbehavior")

The looping behavior of the GIF. Can be one of these values:

- `'loop'`: The GIF will loop infinitely. ( _default_)
- `'pause-after-finish'`: The GIF will play once and then show the last frame.
- `'unmount-after-finish'`: The GIF will play once and then unmount. Note that if you attach a `ref`, it will become `null` after the GIF has finished playing.

### `ref` [v3.3.88](https://github.com/remotion-dev/remotion/releases/v3.3.88) [​](https://www.remotion.dev/docs/gif/gif\#ref "Direct link to ref")

You can add a [React ref](https://react.dev/learn/manipulating-the-dom-with-refs) to `<Gif>`. If you use TypeScript, you need to type it with `HTMLCanvasElement`.

### playbackRate [v4.0.44](https://github.com/remotion-dev/remotion/releases/v4.0.44) [​](https://www.remotion.dev/docs/gif/gif\#playbackrate "Direct link to playbackrate")

The `playbackRate` prop controls the playback speed of the GIF animation within your Remotion video. It enables you to adjust how fast or slow the GIF animation plays, allowing for precise synchronization with your video content.

Default: 1 (Normal speed)
Values:

- `1`: Plays the GIF at normal speed.
- `< 1`: Slows down the GIF speed (e.g., 0.5 plays it at half speed).
- `> 1:` Speeds up the GIF speed (e.g., 2.0 plays it at double speed).

## Differences to `<AnimatedImage>` [​](https://www.remotion.dev/docs/gif/gif\#differences-to-animatedimage "Direct link to differences-to-animatedimage")

- `<Gif>` does not support animated AVIF and WebP images.
- `<Gif>` works in Safari as well since it uses a JavaScript-based GIF decoder.
- `<Gif>` supports the [`onLoad`](https://www.remotion.dev/docs/gif/gif#onload) prop.

## See also [​](https://www.remotion.dev/docs/gif/gif\#see-also "Direct link to See also")

- [`<AnimatedImage>`](https://www.remotion.dev/docs/animatedimage)
- [`getGifDurationInSeconds()`](https://www.remotion.dev/docs/gif/get-gif-duration-in-seconds)
- [Source code for this component](https://github.com/remotion-dev/remotion/blob/main/packages/gif/src/Gif.tsx)

- [Props](https://www.remotion.dev/docs/gif/gif#props)
  - [`src`](https://www.remotion.dev/docs/gif/gif#src)
  - [`width`](https://www.remotion.dev/docs/gif/gif#width)
  - [`height`](https://www.remotion.dev/docs/gif/gif#height)
  - [`fit`](https://www.remotion.dev/docs/gif/gif#fit)
  - [`onLoad`](https://www.remotion.dev/docs/gif/gif#onload)
  - [`style`](https://www.remotion.dev/docs/gif/gif#style)
  - [`loopBehavior`](https://www.remotion.dev/docs/gif/gif#loopbehavior)
  - [`ref`](https://www.remotion.dev/docs/gif/gif#ref)
  - [playbackRate](https://www.remotion.dev/docs/gif/gif#playbackrate)
- [Differences to `<AnimatedImage>`](https://www.remotion.dev/docs/gif/gif#differences-to-animatedimage)
- [See also](https://www.remotion.dev/docs/gif/gif#see-also)

Remotion

![Logo](https://raw.githubusercontent.com/remotion-dev/brand/refs/heads/main/logo.svg)

Remotion

You may ask your questions about the Remotion documentation and the bot answers it based on the documentation. Go through the sources for better answers appropriately.

QUICK QUESTIONS

How to install it?

How to setup Remotion Lambda?

Why is my composition flickering?

Powered by [CrawlChat](https://crawlchat.app/?ref=powered-by-remotion)