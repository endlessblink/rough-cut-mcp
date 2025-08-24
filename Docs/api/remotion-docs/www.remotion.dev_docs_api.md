---
url: "https://www.remotion.dev/docs/api"
title: "API overview | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/api#__docusaurus_skipToContent_fallback)

[**Command line** \\
\\
Reference for the `npx remotion` commands](https://www.remotion.dev/docs/cli) [**Configuration file** \\
\\
Reference for the `remotion.config.ts` file](https://www.remotion.dev/docs/config)

## remotion

Core APIs: `useCurrentFrame()`, `interpolate()`, etc.

[**<Composition>** \\
\\
Define a video](https://www.remotion.dev/docs/composition) [**<Still>** \\
\\
Define a still](https://www.remotion.dev/docs/still) [**<Folder>** \\
\\
Organize compositions in the Studio sidebar](https://www.remotion.dev/docs/folder) [**registerRoot()** \\
\\
Initialize a Remotion project](https://www.remotion.dev/docs/register-root) [**useCurrentFrame()** \\
\\
Obtain the current time](https://www.remotion.dev/docs/use-current-frame) [**useVideoConfig()** \\
\\
Get the duration, dimensions and FPS of a composition](https://www.remotion.dev/docs/use-video-config) [**interpolate()** \\
\\
Map a range of values to another](https://www.remotion.dev/docs/interpolate) [**spring()** \\
\\
Physics-based animation primitive](https://www.remotion.dev/docs/spring) [**interpolateColors()** \\
\\
Map a range of values to colors](https://www.remotion.dev/docs/interpolate-colors) [**measureSpring()** \\
\\
Determine the duration of a spring](https://www.remotion.dev/docs/measure-spring) [**Easing** \\
\\
Customize animation curve of `interpolate()`](https://www.remotion.dev/docs/easing) [**<Img>** \\
\\
Render an `<img>` tag and wait for it to load](https://www.remotion.dev/docs/img) [**<Video>** \\
\\
Synchronize a `<video>` with Remotion's time](https://www.remotion.dev/docs/video) [**<Audio>** \\
\\
Synchronize `<audio>` with Remotion's time](https://www.remotion.dev/docs/audio) [**<OffthreadVideo>** \\
\\
Alternative to `<Video>`](https://www.remotion.dev/docs/offthreadvideo) [**<AnimatedImage>** \\
\\
Disply a GIF, AVIF or animated WebP image](https://www.remotion.dev/docs/animatedimage) [**<IFrame>** \\
\\
Render an `<iframe>` tag and wait for it to load](https://www.remotion.dev/docs/iframe) [**<Sequence>** \\
\\
Time-shifts it's children](https://www.remotion.dev/docs/sequence) [**<Series>** \\
\\
Display contents after another](https://www.remotion.dev/docs/series) [**<Freeze>** \\
\\
Freeze some content in time](https://www.remotion.dev/docs/freeze) [**<Loop>** \\
\\
Play some content repeatedly](https://www.remotion.dev/docs/loop) [**delayRender()** \\
\\
Block a render from continuing](https://www.remotion.dev/docs/delay-render) [**continueRender()** \\
\\
Unblock a render](https://www.remotion.dev/docs/continue-render) [**cancelRender()** \\
\\
Abort an error](https://www.remotion.dev/docs/cancel-render) [**getInputProps()** \\
\\
Receive the user-defined input data](https://www.remotion.dev/docs/get-input-props) [**getRemotionEnvironment()** \\
\\
Determine if you are currently previewing or rendering](https://www.remotion.dev/docs/get-remotion-environment) [**staticFile()** \\
\\
Access file from `public/` folder](https://www.remotion.dev/docs/staticfile) [**<AbsoluteFill>** \\
\\
Position content absolutely and in full size](https://www.remotion.dev/docs/absolute-fill) [**VERSION** \\
\\
Get the current version of Remotion](https://www.remotion.dev/docs/version)

## @remotion/video

An experimental `<NewVideo />` tag for embedding videos.

[**<NewVideo>** \\
\\
Tag for reliable and accurate video embedding](https://www.remotion.dev/docs/video)

## @remotion/bundler

Create a Webpack bundle from Node.JS

[**bundle()** \\
\\
Create a Webpack bundle](https://www.remotion.dev/docs/bundle)

## @remotion/player

Play a Remotion video in the browser.

[**<Player>** \\
\\
Embed a Remotion composition in a web app](https://www.remotion.dev/docs/player/player) [**<Thumbnail>** \\
\\
Embed a still in a web app](https://www.remotion.dev/docs/player/thumbnail)

## @remotion/lambda

Render videos and stills on AWS Lambda

[**estimatePrice()** \\
\\
Estimate the price of a render](https://www.remotion.dev/docs/lambda/estimateprice) [**deployFunction()** \\
\\
Create a new function in AWS Lambda](https://www.remotion.dev/docs/lambda/deployfunction) [**deleteFunction()** \\
\\
Delete a function in AWS Lambda](https://www.remotion.dev/docs/lambda/deletefunction) [**getFunctionInfo()** \\
\\
Gets information about a function](https://www.remotion.dev/docs/lambda/getfunctioninfo) [**getFunctions()** \\
\\
Lists available Remotion Lambda functions](https://www.remotion.dev/docs/lambda/getfunctions) [**getCompositionsOnLambda()** \\
\\
Gets list of compositions inside a Lambda function](https://www.remotion.dev/docs/lambda/getcompositionsonlambda) [**deleteSite()** \\
\\
Delete a bundle from S3](https://www.remotion.dev/docs/lambda/deletesite) [**deploySite()** \\
\\
Bundle and upload a site to S3](https://www.remotion.dev/docs/lambda/deploysite) [**getAwsClient()** \\
\\
Access the AWS SDK directly](https://www.remotion.dev/docs/lambda/getawsclient) [**getRegions()** \\
\\
Get all available regions](https://www.remotion.dev/docs/lambda/getregions) [**getSites()** \\
\\
Get all available sites](https://www.remotion.dev/docs/lambda/getsites) [**downloadMedia()** \\
\\
Download a render artifact from S3](https://www.remotion.dev/docs/lambda/downloadmedia) [**getUserPolicy()** \\
\\
Get the policy JSON for your AWS user](https://www.remotion.dev/docs/lambda/getuserpolicy) [**getRolePolicy()** \\
\\
Get the policy JSON for your AWS role](https://www.remotion.dev/docs/lambda/getrolepolicy) [**getOrCreateBucket()** \\
\\
Ensure a Remotion S3 bucket exists](https://www.remotion.dev/docs/lambda/getorcreatebucket) [**getRenderProgress()** \\
\\
Query the progress of a render](https://www.remotion.dev/docs/lambda/getrenderprogress) [**presignUrl()** \\
\\
Make a private file public to those with the link](https://www.remotion.dev/docs/lambda/presignurl) [**renderMediaOnLambda()** \\
\\
Trigger a video or audio render](https://www.remotion.dev/docs/lambda/rendermediaonlambda) [**renderStillOnLambda()** \\
\\
Trigger a still render](https://www.remotion.dev/docs/lambda/renderstillonlambda) [**simulatePermissions()** \\
\\
Ensure permissions are correctly set up](https://www.remotion.dev/docs/lambda/simulatepermissions) [**speculateFunctionName()** \\
\\
Get the lambda function name based on its configuration](https://www.remotion.dev/docs/lambda/speculatefunctionname) [**validateWebhookSignature()** \\
\\
Validate an incoming webhook request is authentic](https://www.remotion.dev/docs/lambda/validatewebhooksignature) [**appRouterWebhook()** \\
\\
Handle incoming webhooks specifically for the Next.js app router](https://www.remotion.dev/docs/lambda/approuterwebhook) [**pagesRouterWebhook()** \\
\\
Handle incoming webhooks specifically for the Next.js pages router](https://www.remotion.dev/docs/lambda/pagesrouterwebhook) [**expressWebhook()** \\
\\
Handle incoming webhooks specifically for Express.js](https://www.remotion.dev/docs/lambda/expresswebhook)

## @remotion/cloudrun

Render videos and stills on GCP Cloud Run

[**getServiceInfo()** \\
\\
Gets information about a service](https://www.remotion.dev/docs/cloudrun/getserviceinfo) [**deployService()** \\
\\
Create a new service in GCP Cloud Run](https://www.remotion.dev/docs/cloudrun/deployservice) [**deleteService()** \\
\\
Delete a service in GCP Cloud Run](https://www.remotion.dev/docs/cloudrun/deleteservice) [**getServices()** \\
\\
Lists available Remotion Cloud Run services](https://www.remotion.dev/docs/cloudrun/getservices) [**speculateServiceName()** \\
\\
Speculate a service name based on its configuration](https://www.remotion.dev/docs/cloudrun/speculateservicename) [**getRegions()** \\
\\
Get all available regions](https://www.remotion.dev/docs/cloudrun/getregions) [**deploySite()** \\
\\
Bundle and upload a site to Cloud Storage](https://www.remotion.dev/docs/cloudrun/deploysite) [**deleteSite()** \\
\\
Delete a bundle from Cloud Storage](https://www.remotion.dev/docs/cloudrun/deletesite) [**getSites()** \\
\\
Get all available sites from Cloud Storage](https://www.remotion.dev/docs/cloudrun/getsites) [**getOrCreateBucket()** \\
\\
Ensure a Remotion Cloud Storage bucket exists](https://www.remotion.dev/docs/cloudrun/getorcreatebucket) [**renderMediaOnCloudrun()** \\
\\
Trigger a video or audio render](https://www.remotion.dev/docs/cloudrun/rendermediaoncloudrun) [**renderStillOnCloudrun()** \\
\\
Trigger a still render](https://www.remotion.dev/docs/cloudrun/renderstilloncloudrun) [**testPermissions()** \\
\\
Ensure permissions are correctly set up in GCP](https://www.remotion.dev/docs/cloudrun/testpermissions)

## @remotion/captions

Common operations for subtitles.

[**Caption** \\
\\
An object shape for captions](https://www.remotion.dev/docs/captions/caption) [**parseSrt()** \\
\\
Parse a .srt file into a `Caption` array](https://www.remotion.dev/docs/captions/parse-srt) [**serializeSrt()** \\
\\
Serialize a .srt file into a `Caption` array](https://www.remotion.dev/docs/captions/serialize-srt) [**createTikTokStyleCaptions()** \\
\\
Structure the captions for TikTok-style display](https://www.remotion.dev/docs/captions/create-tiktok-style-captions)

## @remotion/gif

Include a GIF in your video.

[**<Gif>** \\
\\
Render a GIF](https://www.remotion.dev/docs/gif/gif) [**getGifDurationInSeconds()** \\
\\
Get the runtime of a GIF](https://www.remotion.dev/docs/gif/get-gif-duration-in-seconds) [**preloadGif()** \\
\\
Prepare a GIF for displaying in the Player](https://www.remotion.dev/docs/gif/preload-gif)

## @remotion/media-utils

Obtain info about video and audio.

[**audioBufferToDataUrl()** \\
\\
Serialize an audio buffer](https://www.remotion.dev/docs/audio-buffer-to-data-url) [**getAudioData()** \\
\\
Get metadata of an audio source](https://www.remotion.dev/docs/get-audio-data) [**getAudioDurationInSeconds()** \\
\\
Get the duration of an audio source](https://www.remotion.dev/docs/get-audio-duration-in-seconds) [**getVideoMetadata()** \\
\\
Get metadata of a video source](https://www.remotion.dev/docs/get-video-metadata) [**getWaveformPortion()** \\
\\
Trims audio data into a waveform](https://www.remotion.dev/docs/get-waveform-portion) [**useAudioData()** \\
\\
`getAudioData()` as a hook](https://www.remotion.dev/docs/use-audio-data) [**useWindowedAudioData()** \\
\\
Optimized for fetching only current data, works only with `.wav`](https://www.remotion.dev/docs/use-windowed-audio-data) [**visualizeAudio()** \\
\\
Process a music waveform for visualization](https://www.remotion.dev/docs/visualize-audio) [**visualizeAudioWaveform()** \\
\\
Process a voice waveform for visualization](https://www.remotion.dev/docs/media-utils/visualize-audio-waveform) [**createSmoothSvgPath()** \\
\\
Turn waveform points into a smooth SVG path](https://www.remotion.dev/docs/media-utils/create-smooth-svg-path)

## @remotion/animation-utils

Obtain info about video and audio.

[**makeTransform()** \\
\\
Create a value for the CSS `transform` property](https://www.remotion.dev/docs/animation-utils/make-transform) [**interpolateStyles()** \\
\\
Map a range of values to CSS `style` values](https://www.remotion.dev/docs/animation-utils/interpolate-styles)

## @remotion/tailwind

Webpack override for using TailwindCSS v3

[**enableTailwind()** \\
\\
Override the Webpack config to enable TailwindCSS](https://www.remotion.dev/docs/tailwind/enable-tailwind)

## @remotion/tailwind-v4

Webpack override for using TailwindCSS v4

[**enableTailwind()** \\
\\
Override the Webpack config to enable TailwindCSS](https://www.remotion.dev/docs/tailwind-v4/enable-tailwind)

## @remotion/enable-scss

Webpack override for enabling SASS/SCSS

[**enableScss()** \\
\\
Override the Webpack config to enable SCSS](https://www.remotion.dev/docs/enable-scss/enable-scss)

## @remotion/three

Create 3D videos using React Three Fiber

[**<ThreeCanvas>** \\
\\
A wrapper for React Three Fiber' Canvas](https://www.remotion.dev/docs/three-canvas) [**useVideoTexture(** \\
\\
Use a video in React Three Fiber](https://www.remotion.dev/docs/use-video-texture) [**useOffthreadVideoTexture()** \\
\\
Use an <OffthreadVideo> in React Three Fiber](https://www.remotion.dev/docs/use-offthread-video-texture)

## @remotion/skia

Low-level graphics using React Native Skia

[**enableSkia()** \\
\\
Webpack override for enabling Skia](https://www.remotion.dev/docs/skia/enable-skia) [**<SkiaCanvas>** \\
\\
React Native Skia <Canvas> wrapper](https://www.remotion.dev/docs/skia/skia-canvas)

## @remotion/lottie

Include a Lottie animation in your video

[**<Lottie>** \\
\\
Embed a Lottie animation in Remotion](https://www.remotion.dev/docs/lottie/lottie) [**getLottieMetadata()** \\
\\
Get metadata of a Lottie animation](https://www.remotion.dev/docs/lottie/getlottiemetadata) [**staticFile()** \\
\\
Load Lottie animations from a static file](https://www.remotion.dev/docs/lottie/staticfile)

## @remotion/preload

Preload media for the Player

[**preloadVideo()** \\
\\
Preload a video source](https://www.remotion.dev/docs/preload/preload-video) [**preloadAudio()** \\
\\
Preload an audio source](https://www.remotion.dev/docs/preload/preload-audio) [**preloadFont()** \\
\\
Preload a font](https://www.remotion.dev/docs/preload/preload-font) [**preloadImage()** \\
\\
Preload an image](https://www.remotion.dev/docs/preload/preload-image) [**resolveRedirect()** \\
\\
Get the definitive URL after all redirects](https://www.remotion.dev/docs/preload/preload-audio)

## @remotion/renderer

Render video, audio and stills from Node.JS or Bun

[**getCompositions()** \\
\\
List available compositions](https://www.remotion.dev/docs/renderer/get-compositions) [**selectComposition()** \\
\\
Get a composition](https://www.remotion.dev/docs/renderer/select-composition) [**renderMedia()** \\
\\
Render a video or audio](https://www.remotion.dev/docs/renderer/render-media) [**renderFrames()** \\
\\
Render a series of images](https://www.remotion.dev/docs/renderer/render-frames) [**renderStill()** \\
\\
Render a single image](https://www.remotion.dev/docs/renderer/render-still) [**stitchFramesToVideo()** \\
\\
Turn images into a video](https://www.remotion.dev/docs/renderer/stitch-frames-to-video) [**openBrowser()** \\
\\
Open a Chrome browser to reuse across renders](https://www.remotion.dev/docs/renderer/open-browser) [**ensureBrowser()** \\
\\
Open a Chrome browser to reuse across renders](https://www.remotion.dev/docs/renderer/ensure-browser) [**makeCancelSignal()** \\
\\
Create token to later cancel a render](https://www.remotion.dev/docs/renderer/make-cancel-signal) [**getVideoMetadata()** \\
\\
Get metadata from a video file in Node.js](https://www.remotion.dev/docs/renderer/get-video-metadata) [**getSilentParts()** \\
\\
Obtain silent portions of a video or audio](https://www.remotion.dev/docs/renderer/get-silent-parts) [**combineChunks()** \\
\\
Combine chunks of partial renders](https://www.remotion.dev/docs/renderer/combine-chunks) [**ensureFfmpeg()** \\
\\
Check for ffmpeg binary and install if not existing](https://www.remotion.dev/docs/renderer/ensure-ffmpeg) [**ensureFfprobe()** \\
\\
Check for ffprobe binary and install if not existing](https://www.remotion.dev/docs/renderer/ensure-ffprobe) [**getCanExtractFramesFast()** \\
\\
Probes for fast extraction for <OffthreadVideo>](https://www.remotion.dev/docs/renderer/get-can-extract-frames-fast)

## @remotion/paths

Manipulate and obtain info about SVG paths

[**getLength()** \\
\\
Obtain length of an SVG path](https://www.remotion.dev/docs/paths/get-length) [**cutPath()** \\
\\
Cut an SVG path at a specified length](https://www.remotion.dev/docs/paths/cut-path) [**getPointAtLength()** \\
\\
Get coordinates at a certain point of an SVG path](https://www.remotion.dev/docs/paths/get-point-at-length) [**getTangentAtLength()** \\
\\
Gets tangents `x` and `y` of a point which is on an SVG path](https://www.remotion.dev/docs/paths/get-tangent-at-length) [**reversePath()** \\
\\
Switch direction of an SVG path](https://www.remotion.dev/docs/paths/reverse-path) [**normalizePath()** \\
\\
Replace relative with absolute coordinates](https://www.remotion.dev/docs/paths/normalize-path) [**interpolatePath()** \\
\\
Interpolates between two SVG paths](https://www.remotion.dev/docs/paths/interpolate-path) [**evolvePath()** \\
\\
Animate an SVG path](https://www.remotion.dev/docs/paths/evolve-path) [**translatePath()** \\
\\
Translates the position of an path against X/Y coordinates](https://www.remotion.dev/docs/paths/translate-path) [**warpPath()** \\
\\
Remap the coordinates of a path](https://www.remotion.dev/docs/paths/warp-path) [**scalePath()** \\
\\
Grow or shrink the size of the path](https://www.remotion.dev/docs/paths/scale-path) [**getBoundingBox()** \\
\\
Get the bounding box of a SVG path](https://www.remotion.dev/docs/paths/get-bounding-box) [**resetPath()** \\
\\
Translates an SVG path to `(0, 0)`](https://www.remotion.dev/docs/paths/reset-path) [**extendViewBox()** \\
\\
Widen an SVG viewBox in all directions](https://www.remotion.dev/docs/paths/extend-viewbox) [**getSubpaths()** \\
\\
Split SVG path into its parts](https://www.remotion.dev/docs/paths/get-subpaths) [**parsePath()** \\
\\
Parse a string into an array of instructions](https://www.remotion.dev/docs/paths/parse-path) [**serializeInstructions()** \\
\\
Turn an array of instructions into a SVG path](https://www.remotion.dev/docs/paths/serialize-instructions) [**reduceInstructions()** \\
\\
Reduce the amount of instruction types](https://www.remotion.dev/docs/paths/reduce-instructions)

## @remotion/noise

Generate noise effects

[**noise2D()** \\
\\
Create 2D noise](https://www.remotion.dev/docs/noise/noise-2d) [**noise3D()** \\
\\
Create 3D noise](https://www.remotion.dev/docs/noise/noise-3d) [**noise4D()** \\
\\
Create 4D noise](https://www.remotion.dev/docs/noise/noise-4d)

## @remotion/shapes

Generate SVG shapes

[**makeRect()** \\
\\
Generate SVG Path for a rect](https://www.remotion.dev/docs/shapes/make-rect) [**<Rect/>** \\
\\
Render a rect](https://www.remotion.dev/docs/shapes/rect) [**makeCircle()** \\
\\
Generate SVG Path for a circle](https://www.remotion.dev/docs/shapes/make-circle) [**<Circle/>** \\
\\
Render a circle](https://www.remotion.dev/docs/shapes/circle) [**makeHeart()** \\
\\
Generate SVG Path for a heart](https://www.remotion.dev/docs/shapes/make-heart) [**<Heart/>** \\
\\
Render a heart](https://www.remotion.dev/docs/shapes/heart) [**makePie()** \\
\\
Generate SVG Path for a pie](https://www.remotion.dev/docs/shapes/make-pie) [**<Pie/>** \\
\\
Render a pie](https://www.remotion.dev/docs/shapes/pie) [**makeEllipse()** \\
\\
Generate SVG Path for a ellipse](https://www.remotion.dev/docs/shapes/make-ellipse) [**<Ellipse/>** \\
\\
Render a ellipse](https://www.remotion.dev/docs/shapes/ellipse) [**makeTriangle()** \\
\\
Generate SVG Path for a triangle](https://www.remotion.dev/docs/shapes/make-triangle) [**<Triangle/>** \\
\\
Render a triangle](https://www.remotion.dev/docs/shapes/triangle) [**makeStar()** \\
\\
Generate SVG Path for a star](https://www.remotion.dev/docs/shapes/make-star) [**<Star/>** \\
\\
Render a star](https://www.remotion.dev/docs/shapes/star) [**makePolygon()** \\
\\
Generate SVG Path for a polygon](https://www.remotion.dev/docs/shapes/make-polygon) [**<Polygon/>** \\
\\
Render a polygon](https://www.remotion.dev/docs/shapes/polygon)

## @remotion/studio

APIs for controlling theRemotion Studio

[**getStaticFiles()** \\
\\
Get a list of files in the `public` folder](https://www.remotion.dev/docs/studio/get-static-files) [**watchPublicFolder()** \\
\\
Listen to changes in the public folder](https://www.remotion.dev/docs/studio/watch-public-folder) [**watchStaticFile()** \\
\\
Listen to changes of a static file](https://www.remotion.dev/docs/studio/watch-static-file) [**writeStaticFile()** \\
\\
Save content to a file in the public directory](https://www.remotion.dev/docs/studio/write-static-file) [**saveDefaultProps()** \\
\\
Save default props to the root file](https://www.remotion.dev/docs/studio/save-default-props) [**updateDefaultProps()** \\
\\
Update default props in the Props editor](https://www.remotion.dev/docs/studio/update-default-props) [**deleteStaticFile()** \\
\\
Delete a file from the public directory](https://www.remotion.dev/docs/studio/delete-static-file) [**restartStudio()** \\
\\
Restart the Studio Server.](https://www.remotion.dev/docs/studio/restart-studio) [**play()** \\
\\
Start playback in the timeline](https://www.remotion.dev/docs/studio/play) [**pause()** \\
\\
Pause playback in the timeline](https://www.remotion.dev/docs/studio/pause) [**toggle()** \\
\\
Toggle playback in the timeline](https://www.remotion.dev/docs/studio/toggle) [**seek()** \\
\\
Jump to a position in the timeline](https://www.remotion.dev/docs/studio/seek) [**goToComposition()** \\
\\
Select a composition in the composition selector](https://www.remotion.dev/docs/studio/go-to-composition) [**focusDefaultPropsPath()** \\
\\
Scrolls to a specific field in the default props editor](https://www.remotion.dev/docs/studio/focus-default-props-path) [**reevaluateComposition()** \\
\\
Re-runs calculateMetadata() on the current composition](https://www.remotion.dev/docs/studio/reevaluate-composition) [**visualControl()** \\
\\
Create a control in the right sidebar of the Studio](https://www.remotion.dev/docs/studio/visual-control)

## @remotion/transitions

Transition between scenes

### Components

[**`<TransitionSeries>`** \\
\\
A `<Series>` with transitions inbetween](https://www.remotion.dev/docs/transitions/transitionseries)

### Timings

[**`springTiming()`** \\
\\
Transition with a `spring()`](https://www.remotion.dev/docs/transitions/timings/springtiming) [**`linearTiming()`** \\
\\
Transition linearly with optional Easing](https://www.remotion.dev/docs/transitions/timings/lineartiming)

### Presentations

Hover over an effect to see the preview.

[A\\
\\
B\\
\\
**`fade()`** \\
\\
Animate the opacity of the scenes](https://www.remotion.dev/docs/transitions/presentations/fade) [A\\
\\
B\\
\\
**`slide()`** \\
\\
Slide in and push out the previous scene](https://www.remotion.dev/docs/transitions/presentations/slide) [A\\
\\
B\\
\\
**`wipe()`** \\
\\
Slide over the previous scene](https://www.remotion.dev/docs/transitions/presentations/wipe) [A\\
\\
B\\
\\
**`flip()`** \\
\\
Rotate the previous scene](https://www.remotion.dev/docs/transitions/presentations/flip) [A\\
\\
B\\
\\
**`clockWipe()`** \\
\\
Reveal the new scene in a circular movement](https://www.remotion.dev/docs/transitions/presentations/clock-wipe) [A\\
\\
B\\
\\
**`iris()`** \\
\\
Reveal the scene through a circular mask from center](https://www.remotion.dev/docs/transitions/presentations/iris) [A\\
\\
B\\
\\
**`cube()`** \\
\\
Paid\\
\\
Rotate both scenes with 3D perspective](https://www.remotion.dev/docs/transitions/presentations/cube) [A\\
\\
B\\
\\
**`none()`** \\
\\
Have no visual effect.](https://www.remotion.dev/docs/transitions/presentations/none)

## @remotion/layout-utils

Layout helpers

[**measureText()** \\
\\
Get dimensions of text](https://www.remotion.dev/docs/layout-utils/measure-text) [**fillTextBox()** \\
\\
Find line breaks and overflows in a text box](https://www.remotion.dev/docs/layout-utils/fill-text-box) [**fitText()** \\
\\
Get font size to fit text in a box](https://www.remotion.dev/docs/layout-utils/fit-text) [**fitTextOnNLines()** \\
\\
Get font size to fit text on n lines](https://www.remotion.dev/docs/layout-utils/fit-text-on-n-lines)

## @remotion/install-whisper-cpp

Whisper.cpp installation and transcription

[**installWhisperCpp()** \\
\\
Install the whisper.cpp software](https://www.remotion.dev/docs/install-whisper-cpp/install-whisper-cpp) [**downloadWhisperModel()** \\
\\
Download a Whisper model](https://www.remotion.dev/docs/install-whisper-cpp/download-whisper-model) [**transcribe()** \\
\\
Transcribe an audio file](https://www.remotion.dev/docs/install-whisper-cpp/transcribe) [**toCaptions()** \\
\\
Converts the output from `transcribe()` into an array of `Caption` objects](https://www.remotion.dev/docs/install-whisper-cpp/to-captions)

## @remotion/openai-whisper

Work with transcriptions from OpenAI Whisper

[**openAiWhisperApiToCaptions()** \\
\\
Turn OpenAI Whisper API transcriptions into an array of `Caption`](https://www.remotion.dev/docs/openai-whisper/openai-whisper-api-to-captions)

## @remotion/animated-emoji

Google Fonts Animated Emojis as Remotion Components

[**<AnimatedEmoji>** \\
\\
Component for rendering an animated emoji.](https://www.remotion.dev/docs/animated-emoji/animated-emoji) [**getAvailableEmoji()** \\
\\
Get a list of available emoji.](https://www.remotion.dev/docs/animated-emoji/get-available-emoji)

## @remotion/google-fonts

Load Google Fonts onto a page.

[**loadFont()** \\
\\
Load a Google Font](https://www.remotion.dev/docs/google-fonts/load-font) [**getAvailableFonts()** \\
\\
Static list of available fonts](https://www.remotion.dev/docs/google-fonts/get-available-fonts) [**getInfo()** \\
\\
Metadata about a specific font](https://www.remotion.dev/docs/google-fonts/get-info) [**loadFontFromInfo()** \\
\\
Load a Google Font based on metadata](https://www.remotion.dev/docs/google-fonts/load-font-from-info)

## @remotion/rive

Embed Rive animations in Remotion

[**<RemotionRiveCanvas>** \\
\\
Render a Rive animation](https://www.remotion.dev/docs/rive/remotionrivecanvas)

## @remotion/zod-types

Zod types enabling Remotion Studio UI

[**zColor()** \\
\\
A Zod Type for colors](https://www.remotion.dev/docs/zod-types/z-color) [**zTextarea()** \\
\\
A Zod Type for multiple-line text in a textarea](https://www.remotion.dev/docs/zod-types/z-textarea) [**zMatrix()** \\
\\
A Zod Type for editing matrices](https://www.remotion.dev/docs/zod-types/z-matrix)

## @remotion/motion-blur

Apply motion blur effects to components

[**<Trail>** \\
\\
Add a trail effect to children](https://www.remotion.dev/docs/motion-blur/trail) [**<CameraMotionBlur>** \\
\\
Add a natural camera motion blur effect to children](https://www.remotion.dev/docs/motion-blur/camera-motion-blur)

## @remotion/fonts

Load font files onto a page.

[**loadFont()** \\
\\
Load a font from a URL or a local file](https://www.remotion.dev/docs/fonts-api/load-font)

## @remotion/media-parser

A pure JavaScript library for parsing video files

[**parseMedia()** \\
\\
Parse a media file.](https://www.remotion.dev/docs/media-parser/parse-media) [**downloadAndParseMedia()** \\
\\
Download and parse a media file.](https://www.remotion.dev/docs/media-parser/download-and-parse-media) [**parseMediaOnWebWorker()** \\
\\
Parse a media file in the browser on a separate thread.](https://www.remotion.dev/docs/media-parser/parse-media-on-web-worker) [**parseMediaOnServerWorker()** \\
\\
Parse a media file on the server on a separate thread.](https://www.remotion.dev/docs/media-parser/parse-media-on-server-worker) [**mediaParserController()** \\
\\
Pause, resume and abort the parsing.](https://www.remotion.dev/docs/media-parser/media-parser-controller) [**hasBeenAborted()** \\
\\
Determine from an error if the parsing has been aborted.](https://www.remotion.dev/docs/media-parser/has-been-aborted) [**WEBCODECS\_TIMESCALE** \\
\\
The global timescale ( `1_000_000`) of WebCodecs as a constant.](https://www.remotion.dev/docs/media-parser/webcodecs-timescale)

## @remotion/webcodecs

Converting media using WebCodecs

[**convertMedia()** \\
\\
Converts a video using WebCodecs and Media Parser](https://www.remotion.dev/docs/webcodecs/convert-media) [**getAvailableContainers()** \\
\\
Get a list of containers `@remotion/webcodecs` supports.](https://www.remotion.dev/docs/webcodecs/get-available-containers) [**webcodecsController()** \\
\\
Pause, resume and abort the conversion.](https://www.remotion.dev/docs/webcodecs/webcodecs-controller) [**canReencodeVideoTrack()** \\
\\
Determine if a video track can be re-encoded](https://www.remotion.dev/docs/webcodecs/can-reencode-video-track) [**canReencodeAudioTrack()** \\
\\
Determine if a audio track can be re-encoded](https://www.remotion.dev/docs/webcodecs/can-reencode-audio-track) [**canCopyVideoTrack()** \\
\\
Determine if a video track can be copied without re-encoding](https://www.remotion.dev/docs/webcodecs/can-copy-video-track) [**canCopyAudioTrack()** \\
\\
Determine if a audio track can be copied without re-encoding](https://www.remotion.dev/docs/webcodecs/can-copy-audio-track) [**getDefaultAudioCodec()** \\
\\
Gets the default audio codec for a container if no other audio codec is specified.](https://www.remotion.dev/docs/webcodecs/get-default-audio-codec) [**getDefaultVideoCodec()** \\
\\
Gets the default video codec for a container if no other audio codec is specified.](https://www.remotion.dev/docs/webcodecs/get-default-video-codec) [**defaultOnAudioTrackHandler()** \\
\\
The default track transformation function for audio tracks.](https://www.remotion.dev/docs/webcodecs/default-on-audio-track-handler) [**defaultOnVideoTrackHandler()** \\
\\
The default track transformation function for video tracks.](https://www.remotion.dev/docs/webcodecs/default-on-video-track-handler) [**getAvailableAudioCodecs()** \\
\\
Get the audio codecs that can fit in a container.](https://www.remotion.dev/docs/webcodecs/get-available-audio-codecs) [**getAvailableVideoCodecs()** \\
\\
Get the video codecs that can fit in a container.](https://www.remotion.dev/docs/webcodecs/get-available-video-codecs) [**convertAudioData()** \\
\\
Change the format or sample rate of an `AudioData` object.](https://www.remotion.dev/docs/webcodecs/convert-audiodata) [**createAudioDecoder()** \\
\\
Create an `AudioDecoder` object.](https://www.remotion.dev/docs/webcodecs/create-audio-decoder) [**createVideoDecoder()** \\
\\
Create a `VideoDecoder` object.](https://www.remotion.dev/docs/webcodecs/create-video-decoder) [**extractFrames()** \\
\\
Extract frames from a video at specific timestamps.](https://www.remotion.dev/docs/webcodecs/extract-frames) [**getPartialAudioData()** \\
\\
Extract audio data from a specific time window of a media file.](https://www.remotion.dev/docs/webcodecs/get-partial-audio-data) [**rotateAndResizeVideoFrame()** \\
\\
Rotate and resize a video frame.](https://www.remotion.dev/docs/webcodecs/rotate-and-resize-video-frame) [**webFsWriter** \\
\\
Writer that saves to browser file system using File System Access API.](https://www.remotion.dev/docs/webcodecs/web-fs-writer) [**bufferWriter** \\
\\
Writer that saves to an in-memory resizable ArrayBuffer.](https://www.remotion.dev/docs/webcodecs/buffer-writer)

## @remotion/licensing

Report and query company license usage

[**registerUsagePoint()** \\
\\
Register a cloud render or WebCodecs conversion](https://www.remotion.dev/docs/licensing/register-usage-point) [**getUsage()** \\
\\
Query usage of company license](https://www.remotion.dev/docs/licensing/get-usage)

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