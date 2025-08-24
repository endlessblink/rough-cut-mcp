---
url: "https://www.remotion.dev/docs/angular"
title: "Using Remotion in Angular | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/angular#__docusaurus_skipToContent_fallback)

On this page

This guide explains how to integrate Remotion into an **Angular** project.

## Install required packages [​](https://www.remotion.dev/docs/angular\#install-required-packages "Direct link to Install required packages")

Install Remotion and necessary dependencies:

- npm
- pnpm
- yarn
- bun

```

Use npm as the package manager
bash

npm i remotion @remotion/player @remotion/cli @remotion/zod-types react react-dom zod
npm i --save-dev @types/react @types/react-dom
```

## Create a Remotion folder [​](https://www.remotion.dev/docs/angular\#create-a-remotion-folder "Direct link to Create a Remotion folder")

For better separation, create a folder to hold your Remotion files:

```

plaintext

src/app/remotion
```

Copy the contents of your Remotion project or a starter template (e.g., HelloWorld) into this new folder. This will help separate Remotion related files from the rest of your Angular codebase.

## Copy `remotion.config.ts` [​](https://www.remotion.dev/docs/angular\#copy-remotionconfigts "Direct link to copy-remotionconfigts")

Copy the `remotion.config.ts` file to the root directory of your Angular project, placing it at the same level as `package.json`.

This configuration file is necessary for Remotion to recognize and compile your project settings.

## Configure TypeScript for JSX [​](https://www.remotion.dev/docs/angular\#configure-typescript-for-jsx "Direct link to Configure TypeScript for JSX")

To enable JSX support in Angular, update the `tsconfig.json` file by setting `"jsx": "react"` under `compilerOptions`. This configuration allows Angular to interpret JSX syntax used in Remotion's React components.

```

tsconfig.json
json

{
  "compilerOptions": {
    "jsx": "react",
    "skipLibCheck": true // Recommended to avoid errors with certain libraries
    // other options
  }
}
```

note

The `"skipLibCheck": true` setting is also recommended to prevent compatibility issues with certain library types.

## Create a React wrapper component for Angular [​](https://www.remotion.dev/docs/angular\#create-a-react-wrapper-component-for-angular "Direct link to Create a React wrapper component for Angular")

To embed Remotion components in Angular, create a **wrapper component**:

1. In your `remotion` folder, create a file named `PlayerViewWrapper.tsx`.
2. Ensure each `.tsx` file imports React explicitly at the top of the file:

```

PlayerViewWrapper.tsx
tsx

import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  signal,
  Signal,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterOutlet} from '@angular/router';
import React from 'react';
import {createRoot, Root} from 'react-dom/client';
import {PlayerRef} from '@remotion/player';
import {myCompSchema, PlayerView} from './PlayerView';
import {z} from 'zod';

const rootDomID: string = 'reactCounterWrapperId';

@Component({
  selector: 'app-player-view',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: ` <div id="${rootDomID}" #${rootDomID}></div>`,
})
export class PlayerViewWrapper implements AfterViewInit, OnDestroy {
  @ViewChild(rootDomID, {static: false}) containerRef: ElementRef | undefined;
  @Input({required: true}) data: Signal<z.infer<typeof myCompSchema>> = signal({
    titleText: 'Welcome to Remotion',
    titleColor: '#000000',
    logoColor1: '#91EAE4',
    logoColor2: '#86A8E7',
  });
  @Output() onPaused = new EventEmitter<void>();
  playerRef: WritableSignal<PlayerRef | undefined> = signal(undefined);

  private root?: Root;

  constructor() {
    effect(() => {
      this.render();
    });
  }

  ngAfterViewInit() {
    this.root = createRoot(this.getRootDomNode());
    this.render();
    this.playerRef()?.play();
  }

  ngOnDestroy(): void {
    this.root?.unmount();
  }

  private getRootDomNode() {
    if (!this.containerRef || !this.containerRef.nativeElement) {
      throw new Error('Cannot get root element. This should not happen.');
    }
    return this.containerRef.nativeElement;
  }

  protected render() {
    if (!this.containerRef || !this.containerRef.nativeElement) {
      return;
    }

    this.root?.render(
      <PlayerView
        playerRefInstance={this.playerRef}
        data={this.data()}
        onPaused={() => this.onPaused.emit()}
      />,
    );
  }
}
```

This wrapper component will serve as the bridge between Angular and Remotion’s React components.

You can also pass an EventEmitter instead of a Signal.

## Create a wrapper for the Remotion player [​](https://www.remotion.dev/docs/angular\#create-a-wrapper-for-the-remotion-player "Direct link to Create a wrapper for the Remotion player")

1. In your `remotion` folder, create a file named `PlayerView.tsx`.
2. Ensure each `.tsx` file imports React explicitly at the top of the file:

This will get the reference to the player with `createRef`.

```

PlayerView.tsx
tsx

import React, {useEffect} from 'react';
import {Player, PlayerRef} from '@remotion/player';
import {z} from 'zod';
import {HelloWorld} from './HelloWorld';
import {zColor} from '@remotion/zod-types';
import {WritableSignal} from '@angular/core';

export const PlayerView: React.FC<{
  data: z.infer<typeof myCompSchema>;
  playerRefInstance: WritableSignal<PlayerRef | undefined>;
  onPaused?: () => void;
}> = ({data, playerRefInstance, onPaused}) => {
  const playerRef: React.RefObject<PlayerRef> = React.createRef();

  useEffect(() => {
    if (playerRef.current) {
      playerRefInstance.set(playerRef.current);

      // add callback when player pauses
      playerRef.current.addEventListener('pause', () => {
        onPaused?.();
      });
    }
  }, []);

  return (
    <Player
      ref={playerRef}
      component={HelloWorld}
      durationInFrames={150}
      fps={30}
      compositionHeight={1080}
      compositionWidth={1920}
      inputProps={data}
      controls
    />
  );
};
```

## Use the component in Angular [​](https://www.remotion.dev/docs/angular\#use-the-component-in-angular "Direct link to Use the component in Angular")

To display the Remotion player within an Angular template, add your new wrapper component wherever you'd like the player to appear:

```

html

<app-player-view [data]="data" (onPaused)="playerPaused()"></app-player-view>
```

This Angular component tag will render the Remotion Player, allowing you to pass data or configuration as needed through Angular's data binding.

You're now able to use the [`API`](https://www.remotion.dev/docs/player/player) of the player via `this.playerRef()`.

## See also [​](https://www.remotion.dev/docs/angular\#see-also "Direct link to See also")

- [Source code for this documentation](https://github.com/remotion-dev/angular-starter)
- [Integration into Svelte](https://www.remotion.dev/docs/svelte)
- [Integration into Vue.js](https://www.remotion.dev/docs/vue)

CONTRIBUTORS

[![dothem1337](https://github.com/dothem1337.png)\\
\\
**dothem1337** \\
\\
Author](https://github.com/dothem1337)

- [Install required packages](https://www.remotion.dev/docs/angular#install-required-packages)
- [Create a Remotion folder](https://www.remotion.dev/docs/angular#create-a-remotion-folder)
- [Copy `remotion.config.ts`](https://www.remotion.dev/docs/angular#copy-remotionconfigts)
- [Configure TypeScript for JSX](https://www.remotion.dev/docs/angular#configure-typescript-for-jsx)
- [Create a React wrapper component for Angular](https://www.remotion.dev/docs/angular#create-a-react-wrapper-component-for-angular)
- [Create a wrapper for the Remotion player](https://www.remotion.dev/docs/angular#create-a-wrapper-for-the-remotion-player)
- [Use the component in Angular](https://www.remotion.dev/docs/angular#use-the-component-in-angular)
- [See also](https://www.remotion.dev/docs/angular#see-also)

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