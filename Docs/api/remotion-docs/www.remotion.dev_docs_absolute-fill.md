---
url: "https://www.remotion.dev/docs/absolute-fill"
title: "<AbsoluteFill> | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/absolute-fill#__docusaurus_skipToContent_fallback)

On this page

A helper component - it is an absolutely positioned `<div>` with the following styles:

```

Styles of AbsoluteFill
ts

const style: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
};
```

This component is useful for layering content on top of each other. For example, you can use it to create a full-screen video background:

```

Layer example
tsx

import {AbsoluteFill, OffthreadVideo} from 'remotion';

const MyComp = () => {
  return (
    <AbsoluteFill>
      <AbsoluteFill>
        <OffthreadVideo src="https://example.com/video.mp4" />
      </AbsoluteFill>
      <AbsoluteFill>
        <h1>This text is written on top!</h1>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
```

The layers that get rendered last appear on top - this is because of how HTML works.

## Adding a ref [​](https://www.remotion.dev/docs/absolute-fill\#adding-a-ref "Direct link to Adding a ref")

You can add a [React ref](https://react.dev/learn/manipulating-the-dom-with-refs) to an `<AbsoluteFill>` from version `v3.2.13` on. If you use TypeScript, you need to type it with `HTMLDivElement`:

```

tsx

const MyComp = () => {
  const ref = useRef<HTMLDivElement>(null);
  return <AbsoluteFill ref={ref}>{content}</AbsoluteFill>;
};
```

## TailwindCSS class detection [v4.0.249](https://github.com/remotion-dev/remotion/releases/v4.0.249) [​](https://www.remotion.dev/docs/absolute-fill\#tailwindcss-class-detection "Direct link to tailwindcss-class-detection")

This component has a `style` object, which has higher importance than `className`'s.

In order to make this behave like you expect (row layout):

```

tsx

<AbsoluteFill className="flex flex-row" />
```

We detect conflicting Tailwind classes and disable the corresponding inline styles if they are present from Remotion v4.0.249.

Review the source code below to see how we detect Tailwind classes.

## See also [​](https://www.remotion.dev/docs/absolute-fill\#see-also "Direct link to See also")

- [Source code for this component](https://github.com/remotion-dev/remotion/blob/main/packages/core/src/AbsoluteFill.tsx)

- [Adding a ref](https://www.remotion.dev/docs/absolute-fill#adding-a-ref)
- [TailwindCSS class detection](https://www.remotion.dev/docs/absolute-fill#tailwindcss-class-detection)
- [See also](https://www.remotion.dev/docs/absolute-fill#see-also)

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