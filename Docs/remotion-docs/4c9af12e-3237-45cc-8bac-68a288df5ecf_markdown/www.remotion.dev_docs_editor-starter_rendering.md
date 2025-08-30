[Skip to main content](https://www.remotion.dev/docs/editor-starter/rendering#__docusaurus_skipToContent_fallback)

On this page

Rendering videos to MP4 works using [Remotion Lambda](https://www.remotion.dev/docs/lambda), a distributed renderer on AWS Lambda.

## Setup [​](https://www.remotion.dev/docs/editor-starter/rendering\#setup "Direct link to Setup")

Follow the [Remotion Lambda setup instructions](https://www.remotion.dev/docs/lambda/setup) step-by-step to set up your AWS account.

note

If you have already setup [asset uploads](https://www.remotion.dev/docs/editor-starter/asset-uploads), you should skip steps 4 and 5 of the Remotion Lambda setup instructions.

Don't create a new user, but select the user you created before.

After that, fill in the following values in the `.env` file:

```

REMOTION_AWS_REGION=
REMOTION_AWS_ACCESS_KEY_ID=
REMOTION_AWS_SECRET_ACCESS_KEY=
REMOTION_AWS_BUCKET_NAME=
```

Now, you can deploy a Lambda function and create a site by running:

```

ts

bun deploy.ts
```

note

If you get an error `'MemorySize' value failed to satisfy constraint: Member must have value less than or equal to 3008`, you need to lower the memory size of your Lambda function by changing the [`MEM_SIZE_IN_MB`](https://github.com/search?q=repo%3Aremotion-dev%2Feditor-starter%20MEM_SIZE_IN_MB&type=code) variable to a lower value. You might be on the AWS free tier or have a low concurrency limit, which may hinder your ability to render many videos.

Alternatively, running the build command will also build the site and deploy it to your S3 bucket:

```

sh

npm run build
```

If the required AWS environment variables are not set, the build will still succeed and not throw an error—the deployment to S3 will simply be skipped.

You should re-execute the deployment whenever:

- You change the structure of the [state](https://www.remotion.dev/docs/editor-starter/state-management), e.g. add new fields or items
- You change how videos are rendered visually
- You upgrade to a new Remotion version

Running the deployment script if the infrastructure already exists will not do anything.

Therefore, you can run it as often as you want.

## Auto-deployment of AWS infrastructure [​](https://www.remotion.dev/docs/editor-starter/rendering\#auto-deployment-of-aws-infrastructure "Direct link to Auto-deployment of AWS infrastructure")

By default, the Lambda will be deployed in your deployment pipeline as well, so that it executes whenever you deploy your app.

That means whenever you deploy to e.g. Vercel, the site on S3 will be updated as well and a Lambda function will be created if none exists with your specified configuration.

This prevents you from forgetting to deploy whenever you make a change.

To make the deployment more robust, we recommend to separate production deployments from development deployments of the site, for example by giving the site a different name based on the `VERCEL_ENV` environment variable:

```

ts

export const SITE_NAME = process.env.VERCEL_ENV === 'production' ? 'remotion-editor-starter' : 'remotion-editor-starter-dev';
```

[You don't need to separate function deployments between production and development](https://www.remotion.dev/docs/lambda/naming-convention#i-need-to-separate-production-staging-and-development).

## Rendering [​](https://www.remotion.dev/docs/editor-starter/rendering\#rendering "Direct link to Rendering")

Is very simple: When no item is selected in the Editor Starter, a Render button shows up in the [inspector](https://www.remotion.dev/docs/editor-starter/tracks-items-assets#inspectors) (i.e., composition inspector).

The backend endpoint [`/api/render`](https://www.remotion.dev/docs/editor-starter/backend-routes#post-apirender) is invoked to trigger a render.

Once triggered, [`/api/progress`](https://www.remotion.dev/docs/editor-starter/backend-routes#get-apiprogress) is polled to check the progress of the render.

Once the render is done, it is being uploaded to your S3 bucket and is publicly available.

Tweak the params you pass to [`renderMediaOnLambda()`](https://www.remotion.dev/docs/lambda/rendermediaonlambda) to change various settings - for example the privacy settings, the output format, quality, etc.

## See also [​](https://www.remotion.dev/docs/editor-starter/rendering\#see-also "Direct link to See also")

- [Remotion Lambda](https://www.remotion.dev/docs/lambda)
- [Setup](https://www.remotion.dev/docs/editor-starter/setup)
- [Asset uploads](https://www.remotion.dev/docs/editor-starter/asset-uploads)

- [Setup](https://www.remotion.dev/docs/editor-starter/rendering#setup)
- [Auto-deployment of AWS infrastructure](https://www.remotion.dev/docs/editor-starter/rendering#auto-deployment-of-aws-infrastructure)
- [Rendering](https://www.remotion.dev/docs/editor-starter/rendering#rendering)
- [See also](https://www.remotion.dev/docs/editor-starter/rendering#see-also)

Remotion

![Logo](https://raw.githubusercontent.com/remotion-dev/brand/refs/heads/main/logo.svg)

Remotion

You may ask your questions about the Remotion documentation and the bot answers it based on the documentation. Go through the sources for better answers appropriately.

QUICK QUESTIONS

How to install it?

How to setup Remotion Lambda?

Why is my composition flickering?

Powered by [CrawlChat](https://crawlchat.app/?ref=powered-by-remotion)