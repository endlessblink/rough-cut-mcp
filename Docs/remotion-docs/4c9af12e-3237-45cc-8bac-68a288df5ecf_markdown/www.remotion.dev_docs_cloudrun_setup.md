[Skip to main content](https://www.remotion.dev/docs/cloudrun/setup#__docusaurus_skipToContent_fallback)

On this page

EXPERIMENTAL

Cloud Run is in [Alpha status and not actively being developed.](https://www.remotion.dev/docs/cloudrun/status)

## 1\. Install `@remotion/cloudrun` [​](https://www.remotion.dev/docs/cloudrun/setup\#1-install-remotioncloudrun "Direct link to 1-install-remotioncloudrun")

- npm
- yarn
- pnpm
- bun

```

npm i --save-exact @remotion/cloudrun@4.0.340Copy
```

This assumes you are currently using v4.0.340 of Remotion.

Also update `remotion` and all `` `@remotion/*` `` packages to the same version.

Remove all `^` character in front of the version numbers of it as it can lead to a version conflict.

## 2\. Create a GCP project [​](https://www.remotion.dev/docs/cloudrun/setup\#2-create-a-gcp-project "Direct link to 2. Create a GCP project")

Navigate to the [Manage Resources](https://console.cloud.google.com/cloud-resource-manager?walkthrough_id=resource-manager--create-project&start_index=1#step_index=1) screen in Google Cloud Console.

- On the Select organization drop-down list at the top of the page, select the organization resource in which you want to create a project. If you are a free trial user, skip this step, as this list does not appear.
- Click Create Project.
- In the New Project window that appears, enter a project name and select a billing account as applicable. A project name can contain only letters, numbers, single quotes, hyphens, spaces, or exclamation points, and must be between 4 and 30 characters.
- Enter the parent organization or folder resource in the Location box. That resource will be the hierarchical parent of the new project. If No organization is an option, you can select it to create your new project as the top level of its own resource hierarchy.
- When you're finished entering new project details, click Create.

## 3\. Enable billing in the GCP Project [​](https://www.remotion.dev/docs/cloudrun/setup\#3-enable-billing-in-the-gcp-project "Direct link to 3. Enable billing in the GCP Project")

In order to enable the Cloud Run API, billing must be enabled in this project. Navigate to the [Billing](https://console.cloud.google.com/billing) screen in Google Cloud Console. Follow the on-screen prompts to create a billing account, and then link the new project to this billing account.

## 4\. Setup Permissions / APIs / Service Account in GCP [​](https://www.remotion.dev/docs/cloudrun/setup\#4-setup-permissions--apis--service-account-in-gcp "Direct link to 4. Setup Permissions / APIs / Service Account in GCP")

info

[Google Cloud Shell](https://cloud.google.com/shell) is a browser-based command-line interface (CLI) for managing resources and applications hosted on GCP. It provides a virtual machine with pre-installed command-line tools and utilities, including the Google Cloud SDK and Terraform. Through this shell you can access your projects, resources, and services directly in the browser. The following steps pull in a script to enable necessary APIs, resources and permissions in your project.

1. Navigate to the [Dashboard](https://console.cloud.google.com/home/dashboard) and ensure your new project selected in the top drop-down. Then, in the top right hand corner of the screen, click the Activate Cloud Shell icon
![](https://www.remotion.dev/img/cloudrun/selectCloudShell.jpg)
2. Within the Cloud Shell, type the following command and follow the prompts.



```

bash

curl -L https://github.com/remotion-dev/remotion/raw/main/packages/cloudrun/src/gcpInstaller/gcpInstaller.tar | tar -x -C . && node install.mjs
```


- Select [1](https://www.remotion.dev/docs/cloudrun/setup#1) to setup this project for Remotion Cloud Run, or to run the setup again for an update.
- Select [2](https://www.remotion.dev/docs/cloudrun/setup#2) to generate a new .env file, or manage keys already created, and [follow these steps instead](https://www.remotion.dev/docs/cloudrun/generate-env).

3. When prompted to apply the plan, type `yes`. When prompted to generate the .env files, type `yes`.

4. Run the following command to view the environment variables. Copy them into your local `.env` file (create it if it doesn't exist):



```

bash

cat .env
```

5. Remove the .env file from the virtual machine:



```

bash

rm .env
```


## 5\. Optional: Validate the permission setup [​](https://www.remotion.dev/docs/cloudrun/setup\#5-optional-validate-the-permission-setup "Direct link to 5. Optional: Validate the permission setup")

From within your code base, run the following command to validate the permissions are setup correctly in GCP. As long as your GCP project was setup with a matching Remotion version, this should pass.

```

npx remotion cloudrun permissions
```

* * *

For the following steps, you may execute them on the CLI, or programmatically using the Node.JS APIs.

## 6\. Deploy a service [​](https://www.remotion.dev/docs/cloudrun/setup\#6-deploy-a-service "Direct link to 6. Deploy a service")

- CLI
- Node.JS

Deploy a service that can render videos into your GCP project by executing the following command:

```

bash

npx remotion cloudrun services deploy
```

The service consists of necessary binaries and JavaScript code that can take a [serve URL](https://www.remotion.dev/docs/terminology/serve-url) and make renders from it. A service is bound to the Remotion version, if you upgrade Remotion, you [need to deploy a new service](https://www.remotion.dev/docs/cloudrun/upgrading). A service does not include your Remotion code, it will be deployed in the next step instead.

A [`Cloud Run URL`](https://www.remotion.dev/docs/terminology/cloud-run-url) will be printed, providing unique endpoint for accessing the deployed service and performing a render. Alternatively you can use the [`Service Name`](https://www.remotion.dev/docs/terminology/service-name), that is also printed, for accessing the deployed service and performing a render.

## 7\. Deploy a site [​](https://www.remotion.dev/docs/cloudrun/setup\#7-deploy-a-site "Direct link to 7. Deploy a site")

- CLI
- Node.JS

Run the following command to deploy your Remotion project to a Cloud Storage bucket. Pass as the last argument the [entry point](https://www.remotion.dev/docs/terminology/entry-point) of the project.

```

bash

npx remotion cloudrun sites create src/index.ts --site-name=my-video
```

A [`serveUrl`](https://www.remotion.dev/docs/terminology/serve-url) will be printed pointing to the deployed project.

When you update your Remotion code in the future, redeploy your site. Pass the same [`--site-name`](https://www.remotion.dev/docs/lambda/cli/sites/create#--site-name) to overwrite the previous deploy. If you don't pass [`--site-name`](https://www.remotion.dev/docs/lambda/cli/sites/create#--site-name), a unique URL will be generated on every deploy.

## 8\. Render a video or still [​](https://www.remotion.dev/docs/cloudrun/setup\#8-render-a-video-or-still "Direct link to 8. Render a video or still")

- CLI
- Node.JS

- Render Media
- Render Still

- `<serve-url | site-name>` The serve URL was returned during step 7, site deployment. If using a serve url from a Cloud Storage bucket, you can pass the site-name instead.
- `<composition-id>` Pass in the [ID of the composition](https://www.remotion.dev/docs/composition) you'd like to render.

- Render using Cloud Run Url
- Render using Service Name

- `<cloud-run-url>` The Cloud Run URL was returned during step 6, service deployment.

```

bash

npx remotion cloudrun render <serve-url | site-name> <composition-id> --cloud-run-url=<cloud-run-url>
```

Progress will be printed until the video finished rendering. Congrats! You rendered your first video using Remotion Cloudrun 🚀

## Next steps [​](https://www.remotion.dev/docs/cloudrun/setup\#next-steps "Direct link to Next steps")

- Select [which region(s)](https://www.remotion.dev/docs/cloudrun/region-selection) you want to run Remotion Cloud Run in.
- Familiarize yourself with the CLI and the Node.JS APIs (list in sidebar).
- Learn how to [upgrade Remotion Cloud Run](https://www.remotion.dev/docs/cloudrun/upgrading).
- Before going live, go through the [Production checklist](https://www.remotion.dev/docs/cloudrun/checklist).

- [1\. Install `@remotion/cloudrun`](https://www.remotion.dev/docs/cloudrun/setup#1-install-remotioncloudrun)
- [2\. Create a GCP project](https://www.remotion.dev/docs/cloudrun/setup#2-create-a-gcp-project)
- [3\. Enable billing in the GCP Project](https://www.remotion.dev/docs/cloudrun/setup#3-enable-billing-in-the-gcp-project)
- [4\. Setup Permissions / APIs / Service Account in GCP](https://www.remotion.dev/docs/cloudrun/setup#4-setup-permissions--apis--service-account-in-gcp)
- [5\. Optional: Validate the permission setup](https://www.remotion.dev/docs/cloudrun/setup#5-optional-validate-the-permission-setup)
- [6\. Deploy a service](https://www.remotion.dev/docs/cloudrun/setup#6-deploy-a-service)
- [7\. Deploy a site](https://www.remotion.dev/docs/cloudrun/setup#7-deploy-a-site)
- [8\. Render a video or still](https://www.remotion.dev/docs/cloudrun/setup#8-render-a-video-or-still)
- [Next steps](https://www.remotion.dev/docs/cloudrun/setup#next-steps)

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