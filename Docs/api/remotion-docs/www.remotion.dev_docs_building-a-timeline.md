---
url: "https://www.remotion.dev/docs/building-a-timeline"
title: "Build a timeline-based video editor | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/building-a-timeline#__docusaurus_skipToContent_fallback)

On this page

This document describes on a high-level how the [Remotion Player](https://www.remotion.dev/player) can be synchronized with a timeline.

Read this document for guidance on building a video editor with the following characteristics:

- Multiple tracks that overlay each other
- Items can be arbitrarily placed on a track
- Items can be of different types (e.g. video, audio, text, etc.)

## Get the `<Timeline>` component [​](https://www.remotion.dev/docs/building-a-timeline\#get-the-timeline-component "Direct link to get-the-timeline-component")

We offer a copy-pasteable `<Timeline>` component that follows Remotion's best practices and also already handles zoom.

If you want to save time and get a head start, you can [purchase it in the Remotion Store](https://www.remotion.pro/timeline).

You can also build your own timeline component.

The following steps will use the same approach we used to build our Timeline component.

## Watch the "Build a video editor in React" talk [​](https://www.remotion.dev/docs/building-a-timeline\#watch-the-build-a-video-editor-in-react-talk "Direct link to Watch the \"Build a video editor in React\" talk")

Watch the talk "Build a video editor in React" by Jonny Burger, the creator of Remotion [here](https://www.youtube.com/watch?v=gYf_FWZGHng).

You'll receive an outline of how to build a timeline, canvas, captioning and exporting functionality in just 30 minutes.

## Build your own timeline [​](https://www.remotion.dev/docs/building-a-timeline\#build-your-own-timeline "Direct link to Build your own timeline")

![](https://www.remotion.dev/img/timelineitems.png)

[1](https://www.remotion.dev/docs/building-a-timeline#1)

Define a TypeScript type `Item` defining the different item types. Create another one for defining the shape of a `Track`:

```

types.ts
tsx

type BaseItem = {
  from: number;
  durationInFrames: number;
  id: string;
};

export type SolidItem = BaseItem & {
  type: 'solid';
  color: string;
};

export type TextItem = BaseItem & {
  type: 'text';
  text: string;
  color: string;
};

export type VideoItem = BaseItem & {
  type: 'video';
  src: string;
};

export type Item = SolidItem | TextItem | VideoItem;

export type Track = {
  name: string;
  items: Item[];
};
```

[2](https://www.remotion.dev/docs/building-a-timeline#2)

Create a component that can render a list of tracks.

```

remotion/Main.tsx
tsx

import type {Track, Item} from './types';
import React from 'react';
import {AbsoluteFill, Sequence, OffthreadVideo} from 'remotion';

const ItemComp: React.FC<{
  item: Item;
}> = ({item}) => {
  if (item.type === 'solid') {
    return <AbsoluteFill style={{backgroundColor: item.color}} />;
  }

  if (item.type === 'text') {
    return <h1>{item.text}</h1>;
  }

  if (item.type === 'video') {
    return <OffthreadVideo src={item.src} />;
  }

  throw new Error(`Unknown item type: ${JSON.stringify(item)}`);
};

const Track: React.FC<{
  track: Track;
}> = ({track}) => {
  return (
    <AbsoluteFill>
      {track.items.map((item) => {
        return (
          <Sequence key={item.id} from={item.from} durationInFrames={item.durationInFrames}>
            <ItemComp item={item} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export const Main: React.FC<{
  tracks: Track[];
}> = ({tracks}) => {
  return (
    <AbsoluteFill>
      {tracks.map((track) => {
        return <Track track={track} key={track.name} />;
      })}
    </AbsoluteFill>
  );
};
```

tip

In CSS, the elements that are rendered at the bottom appear at the top. See: [Layers](https://www.remotion.dev/docs/layers)

[3](https://www.remotion.dev/docs/building-a-timeline#3)

Keep a state of tracks each containing an array of items.

Render
a [`<Player />`](https://www.remotion.dev/docs/player/player) component and pass the `tracks` as [`inputProps`](https://www.remotion.dev/docs/player/player#inputprops).

```

Editor.tsx
tsx

import React, {useMemo, useState} from 'react';
import {Player} from '@remotion/player';
import type {Item} from './types';
import {Main} from './remotion/Main';

type Track = {
  name: string;
  items: Item[];
};

export const Editor = () => {
  const [tracks, setTracks] = useState<Track[]>([\
    {name: 'Track 1', items: []},\
    {name: 'Track 2', items: []},\
  ]);

  const inputProps = useMemo(() => {
    return {
      tracks,
    };
  }, [tracks]);

  return (
    <>
      <Player component={Main} fps={30} inputProps={inputProps} durationInFrames={600} compositionWidth={1280} compositionHeight={720} />
    </>
  );
};
```

[4](https://www.remotion.dev/docs/building-a-timeline#4)

Build a timeline component: You now have access to the `tracks` state and can update it using the `setTracks` function.

We do not currently provide samples how to build a timeline component, since everybody has different needs and styling preferences.

An opinionated sample implementation is [available for purchase in the Remotion Store](https://www.remotion.pro/timeline).

```

remotion/Timeline.tsx
tsx

const Editor: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>([\
    {name: 'Track 1', items: []},\
    {name: 'Track 2', items: []},\
  ]);

  const inputProps = useMemo(() => {
    return {
      tracks,
    };
  }, [tracks]);

  return (
    <>
      <Player component={Main} fps={30} inputProps={inputProps} durationInFrames={600} compositionWidth={1280} compositionHeight={720} />
      <Timeline tracks={tracks} setTracks={setTracks} />
    </>
  );
};
```

## See also [​](https://www.remotion.dev/docs/building-a-timeline\#see-also "Direct link to See also")

- [Layers](https://www.remotion.dev/docs/layers)

- [Get the `<Timeline>` component](https://www.remotion.dev/docs/building-a-timeline#get-the-timeline-component)
- [Watch the "Build a video editor in React" talk](https://www.remotion.dev/docs/building-a-timeline#watch-the-build-a-video-editor-in-react-talk)
- [Build your own timeline](https://www.remotion.dev/docs/building-a-timeline#build-your-own-timeline)
- [See also](https://www.remotion.dev/docs/building-a-timeline#see-also)

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