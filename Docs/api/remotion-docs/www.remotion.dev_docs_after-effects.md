---
url: "https://www.remotion.dev/docs/after-effects"
title: "Import from After Effects | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/after-effects#__docusaurus_skipToContent_fallback)

On this page

If you are a After Effects user, you might find it useful to convert your After Effects compositions to Remotion compositions. You can use the [`@remotion/lottie`](https://www.remotion.dev/docs/lottie) package for this.

note

Remotion compositions got their name because After Effects coined this term!

### Install the Bodymovin plugin [​](https://www.remotion.dev/docs/after-effects\#install-the-bodymovin-plugin "Direct link to Install the Bodymovin plugin")

- Make sure After Effects is closed.
- Go to [this site](https://aescripts.com/learn/zxp-installer/) and download the ZXP installer for your platform.
- Click [here](https://github.com/airbnb/lottie-web/blob/master/build/extension/bodymovin.zxp?raw=true) to download the latest Bodymovin plugin.
- Open the ZXP installer and drag the bodymovin file into it.

### Create a composition [​](https://www.remotion.dev/docs/after-effects\#create-a-composition "Direct link to Create a composition")

Open After Effects and create a new project and then click `New composition`.

![](https://pub-646d808d9cb240cea53bedc76dd3cd0c.r2.dev/new-composition.png)

### Create your animation [​](https://www.remotion.dev/docs/after-effects\#create-your-animation "Direct link to Create your animation")

Design your animation in After Effects. In this basic example, we used the rounded rectangle tool to draw a blue rounded square and then opened the transform menu and clicked the stopwatch icon to set keyframes for position and rotation to create a simple entrance effect.

![](https://pub-646d808d9cb240cea53bedc76dd3cd0c.r2.dev/animation.png)

### Allow export as JSON [​](https://www.remotion.dev/docs/after-effects\#allow-export-as-json "Direct link to Allow export as JSON")

In the After Effects menu, go to `Preferences -> Scripting & Expressions...`. Enable the first option: `Allow Scripts to Write Files and Access Network`. You only need to do this once.

![](https://pub-646d808d9cb240cea53bedc76dd3cd0c.r2.dev/scripting.png)

### Open the Bodymovin plugin [​](https://www.remotion.dev/docs/after-effects\#open-the-bodymovin-plugin "Direct link to Open the Bodymovin plugin")

In the After Effects menu, go to `Window -> Extensions -> Bodymovin`.

![](https://pub-646d808d9cb240cea53bedc76dd3cd0c.r2.dev/bodymovin.png)

### Export the animation as JSON [​](https://www.remotion.dev/docs/after-effects\#export-the-animation-as-json "Direct link to Export the animation as JSON")

First, select the composition

1

. Then press the export icon

2

. You will be prompted for a location to save the JSON file.
Click Render

3

to write the file.

![](https://pub-646d808d9cb240cea53bedc76dd3cd0c.r2.dev/bodymovin-tutorial.png)

### Import the file into Remotion [​](https://www.remotion.dev/docs/after-effects\#import-the-file-into-remotion "Direct link to Import the file into Remotion")

Copy the file into the Remotion project. The recommended way is to put the JSON inside the `public/` folder of Remotion (create it if necessary) and then load it using [`staticFile()`](https://www.remotion.dev/docs/staticfile):

```

Animation.tsx
tsx

import {Lottie, LottieAnimationData} from '@remotion/lottie';
import {useEffect, useState} from 'react';
import {cancelRender, continueRender, delayRender, staticFile} from 'remotion';

const Balloons = () => {
  const [handle] = useState(() => delayRender('Loading Lottie animation'));

  const [animationData, setAnimationData] = useState<LottieAnimationData | null>(null);

  useEffect(() => {
    fetch(staticFile('animation.json'))
      .then((data) => data.json())
      .then((json) => {
        setAnimationData(json);
        continueRender(handle);
      })
      .catch((err) => {
        cancelRender(err);
        console.log('Animation failed to load', err);
      });
  }, [handle]);

  if (!animationData) {
    return null;
  }

  return <Lottie animationData={animationData} />;
};
```

## Finetuning [​](https://www.remotion.dev/docs/after-effects\#finetuning "Direct link to Finetuning")

It is advised to make your composition [the same size and duration](https://www.remotion.dev/docs/lottie/getlottiemetadata) as the original composition in After Effects. Congrats, you're playing an After Effects animation in Remotion! 🎉

![](https://pub-646d808d9cb240cea53bedc76dd3cd0c.r2.dev/result.gif)

## See also [​](https://www.remotion.dev/docs/after-effects\#see-also "Direct link to See also")

- [Using LottieFiles](https://www.remotion.dev/docs/lottie/lottiefiles)
- [`getLottieMetadata()`](https://www.remotion.dev/docs/lottie/getlottiemetadata)

- [Install the Bodymovin plugin](https://www.remotion.dev/docs/after-effects#install-the-bodymovin-plugin)
- [Create a composition](https://www.remotion.dev/docs/after-effects#create-a-composition)
- [Create your animation](https://www.remotion.dev/docs/after-effects#create-your-animation)
- [Allow export as JSON](https://www.remotion.dev/docs/after-effects#allow-export-as-json)
- [Open the Bodymovin plugin](https://www.remotion.dev/docs/after-effects#open-the-bodymovin-plugin)
- [Export the animation as JSON](https://www.remotion.dev/docs/after-effects#export-the-animation-as-json)
- [Import the file into Remotion](https://www.remotion.dev/docs/after-effects#import-the-file-into-remotion)
- [Finetuning](https://www.remotion.dev/docs/after-effects#finetuning)
- [See also](https://www.remotion.dev/docs/after-effects#see-also)

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