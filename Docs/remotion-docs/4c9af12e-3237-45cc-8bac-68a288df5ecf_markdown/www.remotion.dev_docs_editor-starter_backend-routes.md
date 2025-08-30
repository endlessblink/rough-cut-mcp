[Skip to main content](https://www.remotion.dev/docs/editor-starter/backend-routes#__docusaurus_skipToContent_fallback)

On this page

Some backend endpoints must be implemented by for all features to work.

The default implementation uses the React Router 7 framework.

### `POST /api/captions` [​](https://www.remotion.dev/docs/editor-starter/backend-routes\#post-apicaptions "Direct link to post-apicaptions")

Used to generate captions for a video based on an audio file.

- [Reference implementation using React Router 7](https://github.com/remotion-dev/editor-starter/blob/main/src/routes/api/captions.ts)
- [Implementation using Next.js](https://gist.github.com/MehmetAdemi/545f0fcdf2f8b8f9edbbc5146bde0a74)
- [See usages](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter%20%2Fapi%2Fcaptions&type=code)

### `GET /api/font/:name` [​](https://www.remotion.dev/docs/editor-starter/backend-routes\#get-apifontname "Direct link to get-apifontname")

Returns the metadata for a specific font, such as available weights and styles and their corresponding Google Fonts URLs.

This information is provided by the backend because the metadata of all default fonts would be more than 10MB.

- [Reference implementation using React Router 7](https://github.com/remotion-dev/editor-starter/blob/main/src/routes/api/font.ts)
- [Implementation using Next.js](https://gist.github.com/MehmetAdemi/4ddefd93123d718cbfdbc3190d2e8434)
- [See usages](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter%20%2Fapi%2Ffont&type=code)

### `POST /api/upload` [​](https://www.remotion.dev/docs/editor-starter/backend-routes\#post-apiupload "Direct link to post-apiupload")

Needed to create a presigned URL for uploading a file to S3.

- [Reference implementation using React Router 7](https://github.com/remotion-dev/editor-starter/blob/main/src/routes/api/upload.ts)
- [Implementation using Next.js](https://gist.github.com/MehmetAdemi/a1c83d97fcaf2c773c2913dbd2471de0)
- [See usages](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter%20%2Fapi%2Fupload&type=code)

### `POST /api/render` [​](https://www.remotion.dev/docs/editor-starter/backend-routes\#post-apirender "Direct link to post-apirender")

Triggers a render on Remotion Lambda.

- [Reference implementation using React Router 7](https://github.com/remotion-dev/editor-starter/blob/main/src/routes/api/render.ts)
- [Implementation using Next.js](https://gist.github.com/MehmetAdemi/a96784de92ee91e4907bdedb20e6b90c)
- [See usages](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter%20%2Fapi%2Frender&type=code)

### `POST /api/progress` [​](https://www.remotion.dev/docs/editor-starter/backend-routes\#post-apiprogress "Direct link to post-apiprogress")

Gets the current progress of a render on Remotion Lambda.

- [Reference implementation using React Router 7](https://github.com/remotion-dev/editor-starter/blob/main/src/routes/api/progress.ts)
- [Implementation using Next.js](https://gist.github.com/MehmetAdemi/15c21e1b847e5e79e7df7b2c4d5dc494)
- [See usages](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter%20%2Fapi%2Fprogress&type=code)

- [`POST /api/captions`](https://www.remotion.dev/docs/editor-starter/backend-routes#post-apicaptions)
- [`GET /api/font/:name`](https://www.remotion.dev/docs/editor-starter/backend-routes#get-apifontname)
- [`POST /api/upload`](https://www.remotion.dev/docs/editor-starter/backend-routes#post-apiupload)
- [`POST /api/render`](https://www.remotion.dev/docs/editor-starter/backend-routes#post-apirender)
- [`POST /api/progress`](https://www.remotion.dev/docs/editor-starter/backend-routes#post-apiprogress)

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