[Skip to main content](https://www.remotion.dev/docs/editor-starter/setup#__docusaurus_skipToContent_fallback)

On this page

After obtaining the Editor Starter, you should [fork](https://github.com/remotion-dev/editor-starter/fork) it to your own account.

Once you have forked the repository, you can clone it to your local machine, and install the dependencies by doing the following:

## Start a new project [​](https://www.remotion.dev/docs/editor-starter/setup\#start-a-new-project "Direct link to Start a new project")

If you are starting a new project, you can stay in your repository and install dependencies:

```

npm i
```

Run the app using:

```

npm run dev
```

The app may be deployed like any other React Router 7 app, for example by connecting the repository to [Vercel](https://vercel.com/).

## Copying into an existing project [​](https://www.remotion.dev/docs/editor-starter/setup\#copying-into-an-existing-project "Direct link to Copying into an existing project")

If you already have a project, you can copy the `src/editor` folder into your existing project.

The following instructions were tested on a new Next.js project with Tailwind and TypeScript enabled, but it should work with any React framework.

[1](https://www.remotion.dev/docs/editor-starter/setup#1)

Install the [dependencies](https://www.remotion.dev/docs/editor-starter/dependencies).

[2](https://www.remotion.dev/docs/editor-starter/setup#2)

Copy the `src/editor` folder into your existing project.

[3](https://www.remotion.dev/docs/editor-starter/setup#3)

Mount the editor in your app. For example, in Next.js, in `page/app.tsx`:

```

page/app.tsx
ts

import { Editor } from "./editor/editor";

export default function Home() {
  return <Editor />;
}
```

[4](https://www.remotion.dev/docs/editor-starter/setup#4)

Set up the [backend routes](https://www.remotion.dev/docs/editor-starter/backend-routes).

## Setting up asset uploads [​](https://www.remotion.dev/docs/editor-starter/setup\#setting-up-asset-uploads "Direct link to Setting up asset uploads")

If the user drops in any assets, you can configure them to be uploaded to an S3 bucket.

See [Asset uploads](https://www.remotion.dev/docs/editor-starter/asset-uploads) for more information.

## Setting up rendering [​](https://www.remotion.dev/docs/editor-starter/setup\#setting-up-rendering "Direct link to Setting up rendering")

See [Rendering](https://www.remotion.dev/docs/editor-starter/rendering) for how to setup the Remotion Lambda integration.

## Setting up captions [​](https://www.remotion.dev/docs/editor-starter/setup\#setting-up-captions "Direct link to Setting up captions")

You can setup AI transcription for audio and video assets. See [Captioning](https://www.remotion.dev/docs/editor-starter/captioning) on how to set it up.

- [Start a new project](https://www.remotion.dev/docs/editor-starter/setup#start-a-new-project)
- [Copying into an existing project](https://www.remotion.dev/docs/editor-starter/setup#copying-into-an-existing-project)
- [Setting up asset uploads](https://www.remotion.dev/docs/editor-starter/setup#setting-up-asset-uploads)
- [Setting up rendering](https://www.remotion.dev/docs/editor-starter/setup#setting-up-rendering)
- [Setting up captions](https://www.remotion.dev/docs/editor-starter/setup#setting-up-captions)

Remotion

![Logo](https://raw.githubusercontent.com/remotion-dev/brand/refs/heads/main/logo.svg)

Remotion

You may ask your questions about the Remotion documentation and the bot answers it based on the documentation. Go through the sources for better answers appropriately.

QUICK QUESTIONS

How to install it?

How to setup Remotion Lambda?

Why is my composition flickering?

Powered by [CrawlChat](https://crawlchat.app/?ref=powered-by-remotion)