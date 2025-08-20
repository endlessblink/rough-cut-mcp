---
url: "https://www.remotion.dev/docs/brownfield"
title: "Installing Remotion in an existing project | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/brownfield#__docusaurus_skipToContent_fallback)

On this page

Remotion can be installed into existing projects, such as [Next.JS](https://nextjs.org/), [React Router](https://reactrouter.com/), [Vite](https://vitejs.dev/guide/) or [Create React App](https://create-react-app.dev/), as well as server-only projects that run on Node.JS. Get started by adding the following packages:

- npm
- yarn
- pnpm
- bun

```

npm i --save-exact remotion@4.0.333 @remotion/cli@4.0.333Copy
```

This assumes you are currently using v4.0.333 of Remotion.

Also update `remotion` and all `` `@remotion/*` `` packages to the same version.

Remove all `^` character in front of the version numbers of it as it can lead to a version conflict.

- If you'd like to embed a Remotion video in your existing React app, install [`@remotion/player`](https://www.remotion.dev/docs/player/installation) as well.
- If you'd like to render a video using the Node.JS APIs, install [`@remotion/renderer`](https://www.remotion.dev/docs/renderer) as well.
- If you'd like to trigger a render on Remotion Lambda, install [`@remotion/lambda`](https://www.remotion.dev/docs/lambda/setup) as well.

## Setting up the folder structure [​](https://www.remotion.dev/docs/brownfield\#setting-up-the-folder-structure "Direct link to Setting up the folder structure")

Create a new folder for the Remotion files. It can be anywhere and assume any name, in this example we name it `remotion` and put it in the root of our project. Inside the folder you created, create 3 files:

```

remotion/Composition.tsx
tsx

export const MyComposition = () => {
  return null;
};
```

```

remotion/Root.tsx
tsx

import React from 'react';
import {Composition} from 'remotion';
import {MyComposition} from './Composition';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Empty"
        component={MyComposition}
        durationInFrames={60}
        fps={30}
        width={1280}
        height={720}
      />
    </>
  );
};
```

```

remotion/index.ts
ts

import { registerRoot } from "remotion";
import { RemotionRoot } from "./Root";

registerRoot(RemotionRoot);
```

The file that calls [`registerRoot()`](https://www.remotion.dev/docs/register-root) is now your Remotion [**entry point**](https://www.remotion.dev/docs/terminology/entry-point).

note

Watch out for import aliases in your `tsconfig.json` that will resolve `import {...} from "remotion"` to the `remotion` folder. We recommend to not use `paths` without a prefix.

## Starting the Studio [​](https://www.remotion.dev/docs/brownfield\#starting-the-studio "Direct link to Starting the Studio")

Start the Remotion Studio using the following command:

```

npx remotion studio remotion/index.ts
```

Replace `remotion/index.ts` with your entrypoint if necessary.

## Render a video [​](https://www.remotion.dev/docs/brownfield\#render-a-video "Direct link to Render a video")

Render our a video using

```

npx remotion render remotion/index.ts MyComp out.mp4
```

Replace the entrypoint, composition name and output filename with the values that correspond to your usecase.

## Install the ESLint Plugin [​](https://www.remotion.dev/docs/brownfield\#install-the-eslint-plugin "Direct link to Install the ESLint Plugin")

Remotion has an ESLint plugin that warns about improper usage of Remotion APIs. To add it to your existing project, install it:

- npm
- yarn
- pnpm

```

bash

npm i @remotion/eslint-plugin
```

This snippet will enable the recommended rules only for the Remotion files:

```

.eslintrc
json

{
  "plugins": ["@remotion"],
  "overrides": [\
    {\
      "files": ["remotion/*.{ts,tsx}"],\
      "extends": ["plugin:@remotion/recommended"]\
    }\
  ]
}
```

## Embed a Remotion video into your React app [​](https://www.remotion.dev/docs/brownfield\#embed-a-remotion-video-into-your-react-app "Direct link to Embed a Remotion video into your React app")

You can use the `<Player>` component to display a Remotion video in your React project. Read the [separate page](https://www.remotion.dev/docs/player/integration) about it for instructions.

- [Setting up the folder structure](https://www.remotion.dev/docs/brownfield#setting-up-the-folder-structure)
- [Starting the Studio](https://www.remotion.dev/docs/brownfield#starting-the-studio)
- [Render a video](https://www.remotion.dev/docs/brownfield#render-a-video)
- [Install the ESLint Plugin](https://www.remotion.dev/docs/brownfield#install-the-eslint-plugin)
- [Embed a Remotion video into your React app](https://www.remotion.dev/docs/brownfield#embed-a-remotion-video-into-your-react-app)

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