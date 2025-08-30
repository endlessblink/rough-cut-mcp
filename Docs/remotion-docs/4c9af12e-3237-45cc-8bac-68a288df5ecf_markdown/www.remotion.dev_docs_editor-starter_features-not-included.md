[Skip to main content](https://www.remotion.dev/docs/editor-starter/features-not-included#__docusaurus_skipToContent_fallback)

On this page

The Remotion Editor Starter aims to include only the obvious features that every video editor needs.

Certain features may:

- require a too opinionated implementation or
- be too complex for buyers to understand and adopt or
- not be essential.

We design the Editor Starter to be a starting point for developers wanting to build apps with video editing capabilities, not a complete product.

Our focus is to give you something simple that you are able to understand and iterate on.

This means that if you want the include certain features, you will have to implement them yourself.

The following list is an **incomplete** list of features that **we do not include**.

## Keyframing and animation [​](https://www.remotion.dev/docs/editor-starter/features-not-included\#keyframing-and-animation "Direct link to Keyframing and animation")

The properties of a layer are static and are not animated over time.

Should you want to include support for keyframes, we recommend that you replace the value type of a property with an array of keyframes and interpolate between them using the [`interpolate`](https://www.remotion.dev/docs/interpolate) function.

Consider that most video editors allow you to edit the timing as well, you can achieve it using the [`Easing`](https://www.remotion.dev/docs/easing) functions.

## Transitions [​](https://www.remotion.dev/docs/editor-starter/features-not-included\#transitions "Direct link to Transitions")

No transition support is included in the Editor Starter.

If you would like to include support for transitions, we recommend that you first detect whether items on a track are adjacent (similar to what the [rolling edits](https://www.remotion.dev/docs/editor-starter/features#rolling-edits) feature does).
If items are adjacent, you can replace their normal rendering and render them in a [`<TransitionSeries>`](https://www.remotion.dev/docs/transitions/transitionseries) instead.

## Project management [​](https://www.remotion.dev/docs/editor-starter/features-not-included\#project-management "Direct link to Project management")

You are responsible for building an interface for the user to manage their projects.

Each instance of `<Editor />` is an isolated editor experience.

State is loaded through the [`loadState()`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter+loadState&type=code) function if the [Save button](https://www.remotion.dev/docs/editor-starter/features#save-button) is enabled, or through [`getInitialState()`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter%20getInitialState&type=code) otherwise.

State is saved through the [`saveState()`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter+saveState&type=code) function if the [Save button](https://www.remotion.dev/docs/editor-starter/features#save-button) feature is enabled, or not at all otherwise.

If you want an user to allow to work on multiple projects, we foresee that you change these functions to properly load and save the corresponding projects and identify the current project for example through a URL parameter.

## Auto-save [​](https://www.remotion.dev/docs/editor-starter/features-not-included\#auto-save "Direct link to Auto-save")

We only [provide a feature](https://www.remotion.dev/docs/editor-starter/features#save-and-load) to manually save the state of the editor to local storage.

Should you want to include an auto-save functionality, we recommend that you use the [`useFullState()`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter+useFullState&type=code) hook to get the full state of the editor and use an `useEffect` to run code when the state changes.

See [the logic of `<SaveButton />`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter+SaveButton&type=code) to see an example of [`useFullState()`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter+useFullState&type=code).

## Mobile support [​](https://www.remotion.dev/docs/editor-starter/features-not-included\#mobile-support "Direct link to Mobile support")

The Editor Starter is not optimized for use on phones.

We foresee that you offer your video editing interface only for desktop users.

## Multiple frame rates [​](https://www.remotion.dev/docs/editor-starter/features-not-included\#multiple-frame-rates "Direct link to Multiple frame rates")

The frame rate of the editor starter is fixed to 30 fps by default, set by the [`DEFAULT_FPS`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter+DEFAULT_FPS&type=code) constant.

If you would like to have a different default frame rate, you can change the constant.

If you want to support multiple frame rates, you need to mutate the state so that `undoableState.fps` changes to your desire. In addition, when you change the frame rate dynamically, you need to convert the items to the new frame rate.

For example, each item has a `from` and `durationInFrames` property which is expressed in frames and needs to be converted to the new frame rate.

## Authentication [​](https://www.remotion.dev/docs/editor-starter/features-not-included\#authentication "Direct link to Authentication")

There is no login, authentication, authorization or user management included in the Editor Starter.

We foresee that you mount the `<Editor />` component in a page that is shown only if the user is logged in if you desire to have a login flow.

Make sure to add adequate protection to the asset uploading, captioning and rendering endpoints that come with the template, as we have not added any protection to them.

## Arbitrary fonts [​](https://www.remotion.dev/docs/editor-starter/features-not-included\#arbitrary-fonts "Direct link to Arbitrary fonts")

Our Font Picker is fully based on Google Fonts and by default only includes the most popular fonts.

If you would like to allow users to upload their own fonts or provide other fonts for your users, you need to refactor the Editor Starter to load the correct fonts during preview and rendering.

[`@remotion/fonts`](https://www.remotion.dev/docs/fonts-api) is a good way to achieve this.

You also need to refactor the Font Picker to show the additional fonts from additional sources and may need to adjust the logic for [loading the dropdown preview font](https://www.remotion.dev/docs/editor-starter/features#font-family-preview) and for [loading the preview font when hovering over a font](https://www.remotion.dev/docs/editor-starter/features#hover-to-preview-font-family).

## Captioning long audio files [​](https://www.remotion.dev/docs/editor-starter/features-not-included\#captioning-long-audio-files "Direct link to Captioning long audio files")

Currently, we use the OpenAI Whisper API to caption audio files, which is limited to audio files up to 25MB in size.

It is left up to you to decide how to handle long audio files.

See: [Captioning - Limits](https://www.remotion.dev/docs/editor-starter/captioning#limits)

## Light mode [​](https://www.remotion.dev/docs/editor-starter/features-not-included\#light-mode "Direct link to Light mode")

There is only one theme, a dark one.

## Snapping [​](https://www.remotion.dev/docs/editor-starter/features-not-included\#snapping "Direct link to Snapping")

There is no magnetic "snapping" feature out of the box that aligns items based on the position of other items or the canvas bounds.

## See also [​](https://www.remotion.dev/docs/editor-starter/features-not-included\#see-also "Direct link to See also")

- [Features included in the Editor Starter](https://www.remotion.dev/docs/editor-starter/features)

- [Keyframing and animation](https://www.remotion.dev/docs/editor-starter/features-not-included#keyframing-and-animation)
- [Transitions](https://www.remotion.dev/docs/editor-starter/features-not-included#transitions)
- [Project management](https://www.remotion.dev/docs/editor-starter/features-not-included#project-management)
- [Auto-save](https://www.remotion.dev/docs/editor-starter/features-not-included#auto-save)
- [Mobile support](https://www.remotion.dev/docs/editor-starter/features-not-included#mobile-support)
- [Multiple frame rates](https://www.remotion.dev/docs/editor-starter/features-not-included#multiple-frame-rates)
- [Authentication](https://www.remotion.dev/docs/editor-starter/features-not-included#authentication)
- [Arbitrary fonts](https://www.remotion.dev/docs/editor-starter/features-not-included#arbitrary-fonts)
- [Captioning long audio files](https://www.remotion.dev/docs/editor-starter/features-not-included#captioning-long-audio-files)
- [Light mode](https://www.remotion.dev/docs/editor-starter/features-not-included#light-mode)
- [Snapping](https://www.remotion.dev/docs/editor-starter/features-not-included#snapping)
- [See also](https://www.remotion.dev/docs/editor-starter/features-not-included#see-also)

Remotion

![Logo](https://raw.githubusercontent.com/remotion-dev/brand/refs/heads/main/logo.svg)

Remotion

You may ask your questions about the Remotion documentation and the bot answers it based on the documentation. Go through the sources for better answers appropriately.

QUICK QUESTIONS

How to install it?

How to setup Remotion Lambda?

Why is my composition flickering?

Powered by [CrawlChat](https://crawlchat.app/?ref=powered-by-remotion)

Ask AI