---
url: "https://www.remotion.dev/docs/animated-emoji/animated-emoji"
title: "<AnimatedEmoji> | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/animated-emoji/animated-emoji#__docusaurus_skipToContent_fallback)

On this page

_Part of the [`@remotion/animated-emoji`](https://www.remotion.dev/docs/animated-emoji) package._ _available from v4.0.187_

Displays an animated emoji from [Google Fonts Animated Emoji](https://googlefonts.github.io/noto-emoji-animation/).

note

**Self-hosting**: To load the assets, you need to copy the videos from the `public` folder of [`remotion-dev/animated-emoji`](https://github.com/remotion-dev/animated-emoji) into the `public` folder of your Remotion project.

## Example [​](https://www.remotion.dev/docs/animated-emoji/animated-emoji\#example "Direct link to Example")

```

Animation.tsx
tsx

import {AnimatedEmoji} from "@remotion/animated-emoji";

export const MyAnimation: React.FC = () => {
  return <AnimatedEmoji emoji="blush" />;
};
```

## Props [​](https://www.remotion.dev/docs/animated-emoji/animated-emoji\#props "Direct link to Props")

### `emoji` [​](https://www.remotion.dev/docs/animated-emoji/animated-emoji\#emoji "Direct link to emoji")

See animated versions [here](https://googlefonts.github.io/noto-emoji-animation/).

By default, no emoji assets are included. Copy them from the `public` folder of [`@remotion/animated-emoji`](https://www.remotion.dev/docs/animated-emoji) into the `public` folder of your Remotion project.

| `name` | Preview |
| --- | --- |
| smile | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f600/emoji.svg) |
| smile-with-big-eyes | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f603/emoji.svg) |
| grin | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f604/emoji.svg) |
| grinning | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f601/emoji.svg) |
| laughing | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f606/emoji.svg) |
| grin-sweat | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f605/emoji.svg) |
| joy | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f602/emoji.svg) |
| rofl | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f923/emoji.svg) |
| loudly-crying | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f62d/emoji.svg) |
| wink | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f609/emoji.svg) |
| kissing | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f617/emoji.svg) |
| kissing-smiling-eyes | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f619/emoji.svg) |
| kissing-closed-eyes | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f61a/emoji.svg) |
| kissing-heart | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f618/emoji.svg) |
| heart-face | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f970/emoji.svg) |
| heart-eyes | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f60d/emoji.svg) |
| star-struck | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f929/emoji.svg) |
| partying-face | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f973/emoji.svg) |
| melting | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1fae0/emoji.svg) |
| upside-down-face | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f643/emoji.svg) |
| slightly-happy | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f642/emoji.svg) |
| happy-cry | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f972/emoji.svg) |
| holding-back-tears | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f979/emoji.svg) |
| blush | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f60a/emoji.svg) |
| warm-smile | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/263a_fe0f/emoji.svg) |
| relieved | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f60c/emoji.svg) |
| smirk | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f60f/emoji.svg) |
| drool | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f924/emoji.svg) |
| yum | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f60b/emoji.svg) |
| stuck-out-tongue | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f61b/emoji.svg) |
| squinting-tongue | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f61d/emoji.svg) |
| winky-tongue | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f61c/emoji.svg) |
| zany-face | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f92a/emoji.svg) |
| woozy | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f974/emoji.svg) |
| pensive | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f614/emoji.svg) |
| pleading | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f97a/emoji.svg) |
| grimacing | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f62c/emoji.svg) |
| expressionless | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f611/emoji.svg) |
| neutral-face | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f610/emoji.svg) |
| mouth-none | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f636/emoji.svg) |
| face-in-clouds | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f636_200d_1f32b_fe0f/emoji.svg) |
| dotted-line-face | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1fae5/emoji.svg) |
| zipper-face | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f910/emoji.svg) |
| salute | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1fae1/emoji.svg) |
| thinking-face | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f914/emoji.svg) |
| shushing-face | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f92b/emoji.svg) |
| hand-over-mouth | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1fae2/emoji.svg) |
| smiling-eyes-with-hand-over-mouth | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f92d/emoji.svg) |
| yawn | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f971/emoji.svg) |
| hug-face | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f917/emoji.svg) |
| peeking | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1fae3/emoji.svg) |
| screaming | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f631/emoji.svg) |
| raised-eyebrow | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f928/emoji.svg) |
| monocle | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f9d0/emoji.svg) |
| unamused | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f612/emoji.svg) |
| rolling-eyes | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f644/emoji.svg) |
| exhale | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f62e_200d_1f4a8/emoji.svg) |
| triumph | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f624/emoji.svg) |
| angry | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f620/emoji.svg) |
| rage | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f621/emoji.svg) |
| cursing | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f92c/emoji.svg) |
| sad | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f61e/emoji.svg) |
| sweat | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f613/emoji.svg) |
| worried | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f61f/emoji.svg) |
| concerned | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f625/emoji.svg) |
| cry | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f622/emoji.svg) |
| big-frown | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/2639_fe0f/emoji.svg) |
| frown | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f641/emoji.svg) |
| diagonal-mouth | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1fae4/emoji.svg) |
| slightly-frowning | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f615/emoji.svg) |
| anxious-with-sweat | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f630/emoji.svg) |
| scared | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f628/emoji.svg) |
| anguished | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f627/emoji.svg) |
| gasp | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f626/emoji.svg) |
| mouth-open | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f62e/emoji.svg) |
| surprised | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f62f/emoji.svg) |
| astonished | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f632/emoji.svg) |
| flushed | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f633/emoji.svg) |
| mind-blown | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f92f/emoji.svg) |
| scrunched-mouth | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f616/emoji.svg) |
| scrunched-eyes | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f623/emoji.svg) |
| weary | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f629/emoji.svg) |
| distraught | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f62b/emoji.svg) |
| x-eyes | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f635/emoji.svg) |
| dizzy-face | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f635_200d_1f4ab/emoji.svg) |
| shaking-face | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1fae8/emoji.svg) |
| cold-face | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f976/emoji.svg) |
| hot-face | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f975/emoji.svg) |
| sick | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f922/emoji.svg) |
| vomit | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f92e/emoji.svg) |
| sleep | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f634/emoji.svg) |
| sleepy | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f62a/emoji.svg) |
| sneeze | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f927/emoji.svg) |
| thermometer-face | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f912/emoji.svg) |
| bandage-face | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f915/emoji.svg) |
| mask | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f637/emoji.svg) |
| liar | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f925/emoji.svg) |
| halo | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f607/emoji.svg) |
| cowboy | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f920/emoji.svg) |
| money-face | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f911/emoji.svg) |
| nerd-face | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f913/emoji.svg) |
| sunglasses-face | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f60e/emoji.svg) |
| disguise | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f978/emoji.svg) |
| clown | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f921/emoji.svg) |
| imp-smile | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f608/emoji.svg) |
| imp-frown | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f47f/emoji.svg) |
| ghost | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f47b/emoji.svg) |
| skull | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f480/emoji.svg) |
| jack-o-lantern | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f383/emoji.svg) |
| poop | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f4a9/emoji.svg) |
| robot | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f916/emoji.svg) |
| alien | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f47d/emoji.svg) |
| sun-with-face | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f31e/emoji.svg) |
| moon-face-first-quarter | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f31b/emoji.svg) |
| moon-face-last-quarter | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f31c/emoji.svg) |
| see-no-evil-monkey | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f648/emoji.svg) |
| hear-no-evil-monkey | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f649/emoji.svg) |
| speak-no-evil-monkey | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f64a/emoji.svg) |
| smiley-cat | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f63a/emoji.svg) |
| smile-cat | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f638/emoji.svg) |
| joy-cat | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f639/emoji.svg) |
| heart-eyes-cat | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f63b/emoji.svg) |
| smirk-cat | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f63c/emoji.svg) |
| kissing-cat | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f63d/emoji.svg) |
| scream-cat | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f640/emoji.svg) |
| crying-cat-face | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f63f/emoji.svg) |
| pouting-cat | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f63e/emoji.svg) |
| glowing-star | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f31f/emoji.svg) |
| sparkles | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/2728/emoji.svg) |
| collision | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f4a5/emoji.svg) |
| fire | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f525/emoji.svg) |
| 100 | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f4af/emoji.svg) |
| party-popper | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f389/emoji.svg) |
| red-heart | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/2764_fe0f/emoji.svg) |
| orange-heart | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f9e1/emoji.svg) |
| yellow-heart | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f49b/emoji.svg) |
| green-heart | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f49a/emoji.svg) |
| light-blue-heart | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1fa75/emoji.svg) |
| blue-heart | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f499/emoji.svg) |
| purple-heart | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f49c/emoji.svg) |
| brown-heart | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f90e/emoji.svg) |
| black-heart | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f5a4/emoji.svg) |
| grey-heart | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1fa76/emoji.svg) |
| white-heart | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f90d/emoji.svg) |
| pink-heart | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1fa77/emoji.svg) |
| cupid | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f498/emoji.svg) |
| gift-heart | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f49d/emoji.svg) |
| sparkling-heart | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f496/emoji.svg) |
| heart-grow | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f497/emoji.svg) |
| beating-heart | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f493/emoji.svg) |
| revolving-hearts | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f49e/emoji.svg) |
| two-hearts | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f495/emoji.svg) |
| love-letter | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f48c/emoji.svg) |
| heart-box | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f49f/emoji.svg) |
| heart-exclamation-point | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/2763_fe0f/emoji.svg) |
| bandaged-heart | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/2764_fe0f_200d_1fa79/emoji.svg) |
| broken-heart | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f494/emoji.svg) |
| fire-heart | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/2764_fe0f_200d_1f525/emoji.svg) |
| kiss | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f48b/emoji.svg) |
| footprints | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f463/emoji.svg) |
| anatomical-heart | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1fac0/emoji.svg) |
| blood | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1fa78/emoji.svg) |
| microbe | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f9a0/emoji.svg) |
| eyes | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f440/emoji.svg) |
| eye | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f441_fe0f/emoji.svg) |
| biting-lip | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1fae6/emoji.svg) |
| leg-mechanical | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f9bf/emoji.svg) |
| arm-mechanical | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f9be/emoji.svg) |
| muscle | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f4aa/emoji.svg) |
| muscle-skin-tone-1 | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f4aa_1f3fb/emoji.svg) |
| muscle-skin-tone-2 | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f4aa_1f3fc/emoji.svg) |
| muscle-skin-tone-3 | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f4aa_1f3fd/emoji.svg) |
| muscle-skin-tone-4 | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f4aa_1f3fe/emoji.svg) |
| muscle-skin-tone-5 | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f4aa_1f3ff/emoji.svg) |
| clap | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f44f/emoji.svg) |
| clap-skin-tone-1 | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f44f_1f3fb/emoji.svg) |
| clap-skin-tone-2 | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f44f_1f3fc/emoji.svg) |
| clap-skin-tone-3 | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f44f_1f3fd/emoji.svg) |
| clap-skin-tone-4 | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f44f_1f3fe/emoji.svg) |
| clap-skin-tone-5 | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f44f_1f3ff/emoji.svg) |
| thumbs-up | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f44d/emoji.svg) |
| thumbs-up-skin-tone-1 | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f44d_1f3fb/emoji.svg) |
| thumbs-up-skin-tone-2 | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f44d_1f3fc/emoji.svg) |
| thumbs-up-skin-tone-3 | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f44d_1f3fd/emoji.svg) |
| thumbs-up-skin-tone-4 | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f44d_1f3fe/emoji.svg) |
| thumbs-up-skin-tone-5 | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f44d_1f3ff/emoji.svg) |
| thumbs-down | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f44e/emoji.svg) |
| thumbs-down-skin-tone-1 | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f44e_1f3fb/emoji.svg) |
| thumbs-down-skin-tone-2 | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f44e_1f3fc/emoji.svg) |
| thumbs-down-skin-tone-3 | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f44e_1f3fd/emoji.svg) |
| thumbs-down-skin-tone-4 | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f44e_1f3fe/emoji.svg) |
| thumbs-down-skin-tone-5 | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f44e_1f3ff/emoji.svg) |
| raising-hands | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f64c/emoji.svg) |
| raising-hands-skin-tone-1 | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f64c_1f3fb/emoji.svg) |
| raising-hands-skin-tone-2 | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f64c_1f3fc/emoji.svg) |
| raising-hands-skin-tone-3 | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f64c_1f3fd/emoji.svg) |
| raising-hands-skin-tone-4 | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f64c_1f3fe/emoji.svg) |
| raising-hands-skin-tone-5 | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f64c_1f3ff/emoji.svg) |
| wave | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f44b/emoji.svg) |
| wave-skin-tone-1 | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f44b_1f3fb/emoji.svg) |
| wave-skin-tone-2 | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f44b_1f3fc/emoji.svg) |
| wave-skin-tone-3 | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f44b_1f3fd/emoji.svg) |
| wave-skin-tone-4 | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f44b_1f3fe/emoji.svg) |
| wave-skin-tone-5 | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f44b_1f3ff/emoji.svg) |
| victory | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/270c_fe0f/emoji.svg) |
| victory-skin-tone-1 | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/270c_1f3fb/emoji.svg) |
| victory-skin-tone-2 | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/270c_1f3fc/emoji.svg) |
| victory-skin-tone-3 | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/270c_1f3fd/emoji.svg) |
| victory-skin-tone-4 | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/270c_1f3fe/emoji.svg) |
| victory-skin-tone-5 | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/270c_1f3ff/emoji.svg) |
| crossed-fingers | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f91e/emoji.svg) |
| crossed-fingers-skin-tone-1 | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f91e_1f3fb/emoji.svg) |
| crossed-fingers-skin-tone-2 | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f91e_1f3fc/emoji.svg) |
| crossed-fingers-skin-tone-3 | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f91e_1f3fd/emoji.svg) |
| crossed-fingers-skin-tone-4 | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f91e_1f3fe/emoji.svg) |
| crossed-fingers-skin-tone-5 | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f91e_1f3ff/emoji.svg) |
| index-finger | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/261d_fe0f/emoji.svg) |
| index-finger-skin-tone-1 | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/261d_1f3fb/emoji.svg) |
| index-finger-skin-tone-2 | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/261d_1f3fc/emoji.svg) |
| index-finger-skin-tone-3 | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/261d_1f3fd/emoji.svg) |
| index-finger-skin-tone-4 | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/261d_1f3fe/emoji.svg) |
| index-finger-skin-tone-5 | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/261d_1f3ff/emoji.svg) |
| folded-hands | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f64f/emoji.svg) |
| folded-hands-skin-tone-1 | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f64f_1f3fb/emoji.svg) |
| folded-hands-skin-tone-2 | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f64f_1f3fc/emoji.svg) |
| folded-hands-skin-tone-3 | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f64f_1f3fd/emoji.svg) |
| folded-hands-skin-tone-4 | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f64f_1f3fe/emoji.svg) |
| folded-hands-skin-tone-5 | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f64f_1f3ff/emoji.svg) |
| dancer-woman | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f483/emoji.svg) |
| dancer-woman-skin-tone-1 | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f483_1f3fb/emoji.svg) |
| dancer-woman-skin-tone-2 | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f483_1f3fc/emoji.svg) |
| dancer-woman-skin-tone-3 | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f483_1f3fd/emoji.svg) |
| dancer-woman-skin-tone-4 | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f483_1f3fe/emoji.svg) |
| dancer-woman-skin-tone-5 | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f483_1f3ff/emoji.svg) |
| rose | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f339/emoji.svg) |
| wilted-flower | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f940/emoji.svg) |
| fallen-leaf | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f342/emoji.svg) |
| plant | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f331/emoji.svg) |
| leaves | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f343/emoji.svg) |
| luck | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f340/emoji.svg) |
| snowflake | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/2744_fe0f/emoji.svg) |
| volcano | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f30b/emoji.svg) |
| sunrise | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f305/emoji.svg) |
| sunrise-over-mountains | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f304/emoji.svg) |
| rainbow | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f308/emoji.svg) |
| bubbles | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1fae7/emoji.svg) |
| ocean | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f30a/emoji.svg) |
| wind-face | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f32c_fe0f/emoji.svg) |
| tornado | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f32a_fe0f/emoji.svg) |
| electricity | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/26a1/emoji.svg) |
| droplet | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f4a7/emoji.svg) |
| rain-cloud | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f327_fe0f/emoji.svg) |
| cloud-with-lightning | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f329_fe0f/emoji.svg) |
| dizzy | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f4ab/emoji.svg) |
| comet | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/2604_fe0f/emoji.svg) |
| globe-showing-europe-africa | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f30d/emoji.svg) |
| globe-showing-americas | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f30e/emoji.svg) |
| globe-showing-asia-australia | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f30f/emoji.svg) |
| cow-face | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f42e/emoji.svg) |
| unicorn | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f984/emoji.svg) |
| lizard | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f98e/emoji.svg) |
| dragon | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f409/emoji.svg) |
| t-rex | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f996/emoji.svg) |
| dinosaur | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f995/emoji.svg) |
| turtle | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f422/emoji.svg) |
| crocodile | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f40a/emoji.svg) |
| snake | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f40d/emoji.svg) |
| frog | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f438/emoji.svg) |
| rabbit | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f407/emoji.svg) |
| rat | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f400/emoji.svg) |
| poodle | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f429/emoji.svg) |
| dog | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f415/emoji.svg) |
| guide-dog | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f9ae/emoji.svg) |
| service-dog | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f415_200d_1f9ba/emoji.svg) |
| pig | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f416/emoji.svg) |
| racehorse | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f40e/emoji.svg) |
| donkey | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1facf/emoji.svg) |
| ox | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f402/emoji.svg) |
| goat | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f410/emoji.svg) |
| kangaroo | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f998/emoji.svg) |
| tiger | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f405/emoji.svg) |
| monkey | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f412/emoji.svg) |
| gorilla | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f98d/emoji.svg) |
| orangutan | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f9a7/emoji.svg) |
| chipmunk | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f43f_fe0f/emoji.svg) |
| otter | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f9a6/emoji.svg) |
| bat | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f987/emoji.svg) |
| bird | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f426/emoji.svg) |
| black-bird | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f426_200d_2b1b/emoji.svg) |
| rooster | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f413/emoji.svg) |
| hatching-chick | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f423/emoji.svg) |
| baby-chick | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f424/emoji.svg) |
| hatched-chick | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f425/emoji.svg) |
| eagle | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f985/emoji.svg) |
| peace | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f54a_fe0f/emoji.svg) |
| goose | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1fabf/emoji.svg) |
| peacock | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f99a/emoji.svg) |
| seal | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f9ad/emoji.svg) |
| shark | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f988/emoji.svg) |
| dolphin | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f42c/emoji.svg) |
| whale | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f433/emoji.svg) |
| blowfish | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f421/emoji.svg) |
| crab | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f980/emoji.svg) |
| octopus | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f419/emoji.svg) |
| jellyfish | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1fabc/emoji.svg) |
| spider | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f577_fe0f/emoji.svg) |
| snail | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f40c/emoji.svg) |
| ant | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f41c/emoji.svg) |
| mosquito | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f99f/emoji.svg) |
| cockroach | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1fab3/emoji.svg) |
| fly | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1fab0/emoji.svg) |
| bee | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f41d/emoji.svg) |
| lady-bug | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f41e/emoji.svg) |
| butterfly | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f98b/emoji.svg) |
| bug | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f41b/emoji.svg) |
| worm | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1fab1/emoji.svg) |
| paw-prints | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f43e/emoji.svg) |
| tomato | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f345/emoji.svg) |
| cooking | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f373/emoji.svg) |
| spaghetti | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f35d/emoji.svg) |
| steaming-bowl | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f35c/emoji.svg) |
| popcorn | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f37f/emoji.svg) |
| hot-beverage | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/2615/emoji.svg) |
| clinking-beer-mugs | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f37b/emoji.svg) |
| clinking-glasses | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f942/emoji.svg) |
| bottle-with-popping-cork | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f37e/emoji.svg) |
| wine-glass | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f377/emoji.svg) |
| tropical-drink | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f379/emoji.svg) |
| construction | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f6a7/emoji.svg) |
| police-car-light | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f6a8/emoji.svg) |
| bicycle | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f6b2/emoji.svg) |
| flying-saucer | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f6f8/emoji.svg) |
| rocket | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f680/emoji.svg) |
| airplane-departure | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f6eb/emoji.svg) |
| airplane-arrival | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f6ec/emoji.svg) |
| roller-coaster | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f3a2/emoji.svg) |
| camping | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f3d5_fe0f/emoji.svg) |
| confetti-ball | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f38a/emoji.svg) |
| balloon | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f388/emoji.svg) |
| birthday-cake | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f382/emoji.svg) |
| wrapped-gift | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f381/emoji.svg) |
| fireworks | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f386/emoji.svg) |
| pinata | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1fa85/emoji.svg) |
| mirror-ball | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1faa9/emoji.svg) |
| soccer-ball | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/26bd/emoji.svg) |
| baseball | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/26be/emoji.svg) |
| softball | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f94e/emoji.svg) |
| tennis | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f3be/emoji.svg) |
| badminton | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f3f8/emoji.svg) |
| lacrosse | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f94d/emoji.svg) |
| cricket-game | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f3cf/emoji.svg) |
| field-hockey | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f3d1/emoji.svg) |
| ice-hockey | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f3d2/emoji.svg) |
| direct-hit | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f3af/emoji.svg) |
| flying-disc | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f94f/emoji.svg) |
| boomerang | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1fa83/emoji.svg) |
| kite | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1fa81/emoji.svg) |
| ping-pong | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f3d3/emoji.svg) |
| bowling | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f3b3/emoji.svg) |
| die | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f3b2/emoji.svg) |
| slot-machine | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f3b0/emoji.svg) |
| camera-flash | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f4f8/emoji.svg) |
| violin | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f3bb/emoji.svg) |
| drum | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f941/emoji.svg) |
| maracas | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1fa87/emoji.svg) |
| battery-full | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f50b/emoji.svg) |
| battery-low | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1faab/emoji.svg) |
| money-with-wings | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f4b8/emoji.svg) |
| balance-scale | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/2696_fe0f/emoji.svg) |
| light-bulb | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f4a1/emoji.svg) |
| graduation-cap | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f393/emoji.svg) |
| umbrella | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/2602_fe0f/emoji.svg) |
| gem-stone | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f48e/emoji.svg) |
| gear | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/2699_fe0f/emoji.svg) |
| pencil | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/270f_fe0f/emoji.svg) |
| alarm-clock | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/23f0/emoji.svg) |
| bellhop-bell | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f6ce_fe0f/emoji.svg) |
| bell | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f514/emoji.svg) |
| crystal-ball | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f52e/emoji.svg) |
| aries | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/2648/emoji.svg) |
| taurus | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/2649/emoji.svg) |
| gemini | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/264a/emoji.svg) |
| cancer | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/264b/emoji.svg) |
| leo | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/264c/emoji.svg) |
| virgo | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/264d/emoji.svg) |
| libra | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/264e/emoji.svg) |
| scorpio | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/264f/emoji.svg) |
| sagittarius | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/2650/emoji.svg) |
| capricorn | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/2651/emoji.svg) |
| aquarius | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/2652/emoji.svg) |
| pisces | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/2653/emoji.svg) |
| ophiuchus | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/26ce/emoji.svg) |
| exclamation | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/2757/emoji.svg) |
| question | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/2753/emoji.svg) |
| exclamation-question-mark | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/2049_fe0f/emoji.svg) |
| exclamation-double | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/203c_fe0f/emoji.svg) |
| cross-mark | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/274c/emoji.svg) |
| sos | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f198/emoji.svg) |
| phone-off | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f4f4/emoji.svg) |
| check-mark | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/2705/emoji.svg) |
| new | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f195/emoji.svg) |
| free | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f193/emoji.svg) |
| up | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f199/emoji.svg) |
| cool | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f192/emoji.svg) |
| litter | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f6ae/emoji.svg) |
| musical-notes | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f3b6/emoji.svg) |
| plus-sign | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/2795/emoji.svg) |
| chequered-flag | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f3c1/emoji.svg) |
| triangular-flag | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f6a9/emoji.svg) |
| black-flag | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f3f4/emoji.svg) |
| white-flag | ![](https://fonts.gstatic.com/s/e/notoemoji/latest/1f3f3_fe0f/emoji.svg) |

### `scale?` [​](https://www.remotion.dev/docs/animated-emoji/animated-emoji\#scale "Direct link to scale")

Change the resolution of the videos to load.

By default `1`.

|     |     |
| --- | --- |
| `0.5` | 512x512px |
| `1` | 1024x1024px |
| `2` | 2048x2048px |

### `calculateSrc?` [​](https://www.remotion.dev/docs/animated-emoji/animated-emoji\#calculatesrc "Direct link to calculatesrc")

Customize the location where the videos are loaded.

This is the default function:

```

calculate-src.ts
tsx

import {staticFile} from "remotion";
import type {CalculateEmojiSrc} from "@remotion/animated-emoji";

export const defaultCalculateEmojiSrc: CalculateEmojiSrc = ({
  emoji,
  scale,
  format,
}) => {
  const extension = format === "hevc" ? "mp4" : "webm";

  return staticFile(`${emoji}-${scale}x.${extension}`);
};
```

## See also [​](https://www.remotion.dev/docs/animated-emoji/animated-emoji\#see-also "Direct link to See also")

- [`@remotion/animated-emoji`](https://www.remotion.dev/docs/animated-emoji)
- [`getAvailableEmojis()`](https://www.remotion.dev/docs/animated-emoji/get-available-emoji)

- [Example](https://www.remotion.dev/docs/animated-emoji/animated-emoji#example)
- [Props](https://www.remotion.dev/docs/animated-emoji/animated-emoji#props)
  - [`emoji`](https://www.remotion.dev/docs/animated-emoji/animated-emoji#emoji)
  - [`scale?`](https://www.remotion.dev/docs/animated-emoji/animated-emoji#scale)
  - [`calculateSrc?`](https://www.remotion.dev/docs/animated-emoji/animated-emoji#calculatesrc)
- [See also](https://www.remotion.dev/docs/animated-emoji/animated-emoji#see-also)

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