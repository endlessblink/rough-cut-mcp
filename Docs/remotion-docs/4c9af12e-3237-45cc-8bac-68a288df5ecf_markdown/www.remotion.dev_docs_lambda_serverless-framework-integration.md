[Skip to main content](https://www.remotion.dev/docs/lambda/serverless-framework-integration#__docusaurus_skipToContent_fallback)

On this page

This guide will show you how to use Remotion with [Serverless Framework (serverless.com)](https://www.serverless.com/).

To supplement this guide, two projects have been created. The [remotion-app](https://github.com/alexfernandez803/remotion-serverless/tree/main/remotion-app) contains a Remotion composition and utility scripts for deploying and deleting Remotion Lambda infrastructure in AWS.

The [serverless-app](https://github.com/alexfernandez803/remotion-serverless/tree/main/serverless-app) contains a Serverless project that deploys two Lambda functions. The [render\_handler](https://github.com/alexfernandez803/remotion-serverless/blob/main/serverless-app/render_handler.ts) function, when invoked, will call the deployed Remotion Lambda function to render a video. The [progress\_handler](https://github.com/alexfernandez803/remotion-serverless/blob/main/serverless-app/progress_handler.ts) function tracks the progress of the render.

Both functions are configured to be invoked through [API Gateway](https://aws.amazon.com/api-gateway/) and are secured by [Cognito](https://aws.amazon.com/cognito/). The API Gateway and Cognito setup is automatically created by the Serverless deployment script upon execution of `serverless deploy`.
This assumes that you have knowledge in using [Serverless Framework](https://www.serverless.com/) and understand the syntax of [serverless.yml](https://www.serverless.com/framework/docs/providers/aws/guide/serverless.yml).

## remotion-app [​](https://www.remotion.dev/docs/lambda/serverless-framework-integration\#remotion-app "Direct link to remotion-app")

This contains instructions for setting up and installing the `remotion` Lambda to your AWS account. This deployment is designed to be executed on your local machine.

### Prequisites [​](https://www.remotion.dev/docs/lambda/serverless-framework-integration\#prequisites "Direct link to Prequisites")

- Make sure that your local AWS profile is able to deploy to AWS, or follow this [guide](https://www.remotion.dev/docs/lambda/setup) to set up a user for your local machine.

### Setup [​](https://www.remotion.dev/docs/lambda/serverless-framework-integration\#setup "Direct link to Setup")

#### 1\. Clone or download the project [​](https://www.remotion.dev/docs/lambda/serverless-framework-integration\#1-clone-or-download-the-project "Direct link to 1. Clone or download the project")

The project can be found at [`remotion-serverless project`](https://github.com/alexfernandez803/remotion-serverless).

```

bash

git clone https://github.com/alexfernandez803/remotion-serverless
```

#### 2\. Go to `remotion-serverless` and traverse to the `remotion-app` directory [​](https://www.remotion.dev/docs/lambda/serverless-framework-integration\#2-go-to-remotion-serverless-and-traverse-to-the-remotion-app-directory "Direct link to 2-go-to-remotion-serverless-and-traverse-to-the-remotion-app-directory")

```

bash

cd remotion-serverless && cd remotion-app
```

#### 3\. Install dependencies [​](https://www.remotion.dev/docs/lambda/serverless-framework-integration\#3-install-dependencies "Direct link to 3. Install dependencies")

- npm
- yarn
- pnpm

```

bash

npm i
```

#### 4\. Configure credentials [​](https://www.remotion.dev/docs/lambda/serverless-framework-integration\#4-configure-credentials "Direct link to 4. Configure credentials")

An `.env` file needs to be added to the directory to configure the AWS credentials that the project will use for deployment.

```

.env
bash

AWS_KEY_1=
AWS_SECRET_1=
```

You can use multiple accounts if you would like to do load-balancing.

```

.env
bash

AWS_KEY_1=
AWS_SECRET_1=
AWS_KEY_2=
AWS_SECRET_2=
```

The `AWS_KEY_*` and `AWS_SECRET_*` represent the AWS account credentials that are allowed to deploy the Remotion Lambda function.

#### 5\. Deploy the Lambda function [​](https://www.remotion.dev/docs/lambda/serverless-framework-integration\#5-deploy-the-lambda-function "Direct link to 5. Deploy the Lambda function")

The project has the deployment script configured in [package.json](https://github.com/alexfernandez803/remotion-serverless/blob/main/remotion-app/package.json).

```

package.json
json

{
  // ...
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "deploy-fn": "ts-node src/infra/deploy-lambda-fn.ts",
    "delete-fn": "ts-node src/infra/delete-lambda-fn.ts",
    "render-fn": "ts-node src/infra/local-render-fn.ts"
  }
}
```

- npm
- yarn
- pnpm

```

bash

npm run deploy-fn
```

This will execute the [deploy function](https://github.com/alexfernandez803/remotion-serverless/blob/main/remotion-app/src/infra/deploy-lambda-fn.ts) that will deploy the Remotion Lambda to your AWS account.

```

deployment logs
bash

Found 1 accounts. Deploying...
Ensured function="remotion-render-3-3-78-mem2048mb-disk2048mb-240sec" to region="ap-southeast-2" in account 1
entryPoint /xxxx/code/remotion-serverless/remotion-app/src/index.tsx
Deployed site to region="ap-southeast-2" in account 1 with bucket="remotionlambda-apsoutheast2-xxxxx" under serveUrl="https://remotionlambda-apsoutheast2-xxxxx.s3.ap-southeast-2.amazonaws.com/sites/remotion-render-app-3.3.78/index.html"

```

#### 6\. (Optional) Delete the lambda function if not needed. [​](https://www.remotion.dev/docs/lambda/serverless-framework-integration\#6-optional-delete-the-lambda-function-if-not-needed "Direct link to 6. (Optional) Delete the lambda function if not needed.")

- npm
- yarn
- pnpm

```

bash

npm run delete-fn
```

This will execute the [delete function](https://github.com/alexfernandez803/remotion-serverless/blob/main/remotion-app/src/infra/delete-lambda-fn.ts) which removes the Remotion Lambda function from your AWS account.

## serverless-app [​](https://www.remotion.dev/docs/lambda/serverless-framework-integration\#serverless-app "Direct link to serverless-app")

This contains instructions for setting up and installing Lambda services [render\_handler](https://github.com/alexfernandez803/remotion-serverless/blob/main/serverless-app/render_handler.ts) and [progress\_handler](https://github.com/alexfernandez803/remotion-serverless/blob/main/serverless-app/progress_handler.ts) to your AWS account. This guide is designed to be executed on your local machine.

### Context [​](https://www.remotion.dev/docs/lambda/serverless-framework-integration\#context "Direct link to Context")

This application has been created by an application example from [serverless examples repo](https://github.com/serverless/examples/tree/v3/aws-node-http-api-typescript) and bootstrapped the application using this command.

```

serverless
bash

serverless --template-url=https://github.com/serverless/examples/tree/v3/aws-node-http-api-typescript
```

After creating the `serverless` application, update it to the latest version by navigating to the application directory using the terminal.

```

bash

npm update
```

### Prerequisites [​](https://www.remotion.dev/docs/lambda/serverless-framework-integration\#prerequisites "Direct link to Prerequisites")

- AWS deployment profile on your local machine, to configure an AWS deployment profile on your local machine, follow the guide provided by the [serverless website](https://www.serverless.com/framework/docs/providers/aws/guide/credentials).
- To install Serverless, follow this [guide](https://www.serverless.com/framework/docs/getting-started).
- Register for an [serverless account](https://app.serverless.com/), this give you a dashboard that has features such as function lambda invocations.
- Create an [organization](https://www.serverless.com/console/docs/product/create-org) on your serverless account to associate your `lambda` applications.
- A AWS policy created named `remotion-executionrole-policy` which is created from this [guide](https://www.remotion.dev/docs/lambda/without-iam/#1-create-role-policy).

### Setup [​](https://www.remotion.dev/docs/lambda/serverless-framework-integration\#setup-1 "Direct link to Setup")

#### 1\. Clone or download the project [​](https://www.remotion.dev/docs/lambda/serverless-framework-integration\#1-clone-or-download-the-project-1 "Direct link to 1. Clone or download the project")

The project can be found at [`remotion-serverless project`](https://github.com/alexfernandez803/remotion-serverless).

If not done in the previous step, clone the project using:

```

bash

git clone https://github.com/alexfernandez803/remotion-serverless
```

#### 2\. Go to `remotion-serverless` and traverse to `serverless-app` directory [​](https://www.remotion.dev/docs/lambda/serverless-framework-integration\#2-go-to-remotion-serverless-and-traverse-to-serverless-app-directory "Direct link to 2-go-to-remotion-serverless-and-traverse-to-serverless-app-directory")

```

bash

cd remotion-serverless && cd serverless-app
```

#### 3\. Install dependencies [​](https://www.remotion.dev/docs/lambda/serverless-framework-integration\#3-install-dependencies-1 "Direct link to 3. Install dependencies")

- npm
- yarn
- pnpm

```

bash

npm i
```

#### 4\. Configure the serverless execution role [​](https://www.remotion.dev/docs/lambda/serverless-framework-integration\#4-configure-the-serverless-execution-role "Direct link to 4. Configure the serverless execution role")

Each of the function is assigned with a role named `remotionLambdaServerlessRole` as both function has the same access patterns to the Remotion Lambda.

#### Steps [​](https://www.remotion.dev/docs/lambda/serverless-framework-integration\#steps "Direct link to Steps")

- Go to AWS account IAM Roles section
- Click "Create role".
- Under "Use cases", select "Lambda". Click next.
- Under "Permissions policies", filter for `remotion-executionrole-policy` and click the checkbox to assign this policy. This `policy` should have been created, if not, follow this [guide](https://www.remotion.dev/docs/lambda/without-iam/#1-create-role-policy) in setting this up.
- Additionally, still in "Permission policies" clear the filter and filter again for `AWSLambdaBasicExecutionRole`. Click the checkbox and click next.
- In the final step, name the role `remotionLambdaServerlessRole` exactly. You can leave the other fields as is.
- Click "Create role" to confirm.

This steps creates a role named `remotionLambdaServerlessRole` with permissions from `remotion-executionrole-policy` and `AWSLambdaBasicExecutionRole` which allows the lambda function to create Cloudwatch logs. The role is referenced by the two functions in the [serverless.yml](https://github.com/alexfernandez803/remotion-serverless/blob/main/serverless-app/serverless.yml#L78) file, which enables the two Lambda functions to render video and check the progress of the render.

#### 5\. Login into serverless [​](https://www.remotion.dev/docs/lambda/serverless-framework-integration\#5-login-into-serverless "Direct link to 5. Login into serverless")

From the `serverless-app` directory, execute the `serverless` command.

```

bash

 serverless login
```

Follow the prompt, select `Serverless Framework Dashboard`, this will log you into the serverless website so that your application can have a dashboard.

#### 6\. Initialize the serverless project [​](https://www.remotion.dev/docs/lambda/serverless-framework-integration\#6-initialize-the-serverless-project "Direct link to 6. Initialize the serverless project")

From the `serverless-app` directory, execute the `serverless` command.

```

bash

 serverless
```

This will setup your project for deployment.

```

serverless
bash

 serverless
Running "serverless" from node_modules

Your service is configured with Serverless Dashboard and is ready to be deployed.

? Do you want to deploy now? (Y/n)

```

Select 'n' for the answer of the prompt.

#### 7\. Deploy the serverless project [​](https://www.remotion.dev/docs/lambda/serverless-framework-integration\#7-deploy-the-serverless-project "Direct link to 7. Deploy the serverless project")

From the `serverless-app` directory.

```

serverless deploy
bash

 serverless deploy
```

```

deploy response
bash

serverless deploy

Running "serverless" from node_modules

Deploying api-render-video to stage dev (ap-southeast-2)
Compiling with Typescript...
Using local tsconfig.json - tsconfig.json
Typescript compiled.

✔ Service deployed to stack api-render-video-dev (101s)

dashboard: https://app.serverless.com/changeme/apps/aws-remotion-serverless/api-render-video/dev/ap-southeast-2
endpoints:
  POST - https://XXXXX.execute-api.ap-southeast-2.amazonaws.com/dev/render
  GET - https://XXXXX.execute-api.ap-southeast-2.amazonaws.com/dev/render/{renderId}
functions:
  render: api-render-video-dev-render (44 MB)
  render_progress: api-render-video-dev-render_progress (44 MB)
```

The serverless application is configured to be associated in `changeme` organization dashboard from [serverless dashboard](https://app.serverless.com/).

```

serverless.yml
bash

org: changeme
app: aws-remotion-serverless
service: api-render-video
....
```

#### 8\. Remove the serverless project from your AWS account, if not needed anymore [​](https://www.remotion.dev/docs/lambda/serverless-framework-integration\#8-remove-the-serverless-project-from-your-aws-account-if-not-needed-anymore "Direct link to 8. Remove the serverless project from your AWS account, if not needed anymore")

From the `serverless-app` directory.

```

bash

 serverless remove
```

### Interacting with the API [​](https://www.remotion.dev/docs/lambda/serverless-framework-integration\#interacting-with-the-api "Direct link to Interacting with the API")

The API requires an authorization token to interact with it. To obtain the token, first go to the serverless dashboard to retrieve outputs such as `UserPoolRegion`, `UserPoolId`, and `UserPoolClientId`, which are used to authenticate with Cognito. If you do not have a frontend application, you can create a user and an authentication token manually for the API by following this [guide](https://www.remotion.dev/docs/lambda/without-iam/example#test-your-endpoint).

![](https://www.remotion.dev/img/serverless-com-integration-serverlesss-output.png)

From the guide, `YOUR_USER_POOL_CLIENT_ID` is `UserpoolClientId` and `YOUR_USER_POOL_ID` is the `UserPoolId`, the steps should be followed up to retrieving the `IdToken`.

The base API URL is `https://25w651t09g.execute-api.ap-southeast-2.amazonaws.com/dev/render` from the dashboard output `APIGatewayUrl`.

#### 1\. Render a video [​](https://www.remotion.dev/docs/lambda/serverless-framework-integration\#1-render-a-video "Direct link to 1. Render a video")

```

render video
bash

curl --location --request POST 'https://xxxxxxxx.execute-api.ap-southeast-2.amazonaws.com/dev/render' \
--header 'Authorization: Bearer eyJraWQiOiJMVVVVZGtIQ1JXWEEyWEEXXXXXXXXXjMKR1t5S-oA'
```

```

response
bash

{
    "message": "Video sent for rendering.",
    "renderId": "i9xnfrgXXXX",
    "bucketName": "remotionlambda-apsoutheast2-xxxxxxxx"
}
```

This will initiate the render of the video and provide output with the `renderId` and `bucketName`. The code for the Lambda function is located [here](https://github.com/alexfernandez803/remotion-serverless/blob/main/serverless-app/render_handler.ts).

#### 2\. Get the progress of the render [​](https://www.remotion.dev/docs/lambda/serverless-framework-integration\#2-get-the-progress-of-the-render "Direct link to 2. Get the progress of the render")

```

progress
bash

curl --location --request GET 'https://xxxxxxxx.execute-api.ap-southeast-2.amazonaws.com/dev/render/i9xnfrgXXXX?bucketName=remotionlambda-apsoutheast2-xxxxxxxx' \
--header 'Authorization: Bearer eyJraWQiOiJMVVVVZGtIQ1JXWEEXXXXXXXXXXXvaQ'
```

```

response
bash

{
    "message": "Render found.",
    "renderId": "i9xnfrgXXXX",
    "bucketName": "remotionlambda-apsoutheast2-xxxxxxxx",
    "finality": {
        "type": "success",
        "url": "https://s3.ap-southeast-2.amazonaws.com/remotionlambda-apsoutheast2-xxxxxxxx/renders/i9xnfrgXXXX/out.mp4"
    },
    "mediaUrl": "https://remotionlambda-apsoutheast2-xxxxxxxx.s3.ap-southeast-2.amazonaws.com/renders/i9xnfrgXXXX/out.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZ3B4C6O75ZTGPMJ4%2F20230128%2Fap-southeast-2%2Fs3%2Faws4_request&X-Amz-Date=20230128T073123Z&X-Amz-Expires=900&X-Amz-Security-Token=IQXXXXXXXXV%2BWIoTQ5CvZXcljmGUIOkllDRsnmrRGNYvY8IVn8FRQmt%2Bc8%2BJQdiG0ShI0y82jB2s%2BbkaPf%2FJNDrSjO5tBo8%2FXwtaP2z9PewUIND1yMm4TkOUMXXXXXn6j&X-Amz-Signature=0881241614cd6c778b1XXXXXX42941c&X-Amz-SignedHeaders=host&x-id=GetObject"
}
```

This API will provide the progress details of the render, indicating whether it is a `success` or `failure`. If the video render is completed, it will provide the `mediaUrl`, which is a pre-signed URL that makes the video downloadable. The code for the Lambda function is located [here](https://github.com/alexfernandez803/remotion-serverless/blob/main/serverless-app/progress_handler.ts).

## Notes [​](https://www.remotion.dev/docs/lambda/serverless-framework-integration\#notes "Direct link to Notes")

- The deployment of Remotion Lambda is configured to be deployed only to `ap-southeast-2` region to simplify the project, adjust this in the code at [region.ts](https://github.com/alexfernandez803/remotion-serverless/blob/main/remotion-app/src/infra/regions.ts).

## See also [​](https://www.remotion.dev/docs/lambda/serverless-framework-integration\#see-also "Direct link to See also")

- [Using Lambda without IAM user](https://www.remotion.dev/docs/lambda/without-iam)
- [Using Lambda with SQS](https://www.remotion.dev/docs/lambda/sqs)
- [Permissions](https://www.remotion.dev/docs/lambda/permissions)
- [Serverless Framework](https://www.serverless.com/framework/docs/getting-started)
- Some code is borrowed from [github-unwrapped-2021](https://github.com/remotion-dev/github-unwrapped-2021/tree/main/src)

- [remotion-app](https://www.remotion.dev/docs/lambda/serverless-framework-integration#remotion-app)
  - [Prequisites](https://www.remotion.dev/docs/lambda/serverless-framework-integration#prequisites)
  - [Setup](https://www.remotion.dev/docs/lambda/serverless-framework-integration#setup)
- [serverless-app](https://www.remotion.dev/docs/lambda/serverless-framework-integration#serverless-app)
  - [Context](https://www.remotion.dev/docs/lambda/serverless-framework-integration#context)
  - [Prerequisites](https://www.remotion.dev/docs/lambda/serverless-framework-integration#prerequisites)
  - [Setup](https://www.remotion.dev/docs/lambda/serverless-framework-integration#setup-1)
  - [Interacting with the API](https://www.remotion.dev/docs/lambda/serverless-framework-integration#interacting-with-the-api)
- [Notes](https://www.remotion.dev/docs/lambda/serverless-framework-integration#notes)
- [See also](https://www.remotion.dev/docs/lambda/serverless-framework-integration#see-also)

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