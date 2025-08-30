[Skip to main content](https://www.remotion.dev/docs/cloudrun/permissions#__docusaurus_skipToContent_fallback)

On this page

EXPERIMENTAL

Cloud Run is in [Alpha status and not actively being developed.](https://www.remotion.dev/docs/cloudrun/status)

This document describes the necessary permissions for Remotion Cloud Run and explains to those interested why the permissions are necessary.

For a step by step guide on how to set up permissions, [follow the setup guide](https://www.remotion.dev/docs/cloudrun/setup).

## Service Account permissions [​](https://www.remotion.dev/docs/cloudrun/permissions\#service-account-permissions "Direct link to Service Account permissions")

This policy should be assigned to the **Remotion Service Account**. Following the automated setup, this is achieved by creating a custom role with the title _Remotion API Service Account_, and assigning that role to the Remotion Service Account.

To view and manually edit roles in your GCP project, go to the [Roles page within IAM admin](https://console.cloud.google.com/iam-admin/roles).

To view and manually edit permissions/roles assigned to Users or Service Accounts in your GCP project, go to the [IAM page within IAM Admin](https://console.cloud.google.com/iam-admin/iam).

Show full Remotion API Service Account permissions list for the latest Remotion Cloud Run version.

```
iam.serviceAccounts.actAs
run.operations.get
run.routes.invoke
run.services.create
run.services.get
run.services.delete
run.services.list
run.services.update
storage.buckets.create
storage.buckets.get
storage.buckets.list
storage.objects.create
storage.objects.delete
storage.objects.list
logging.logEntries.list

```

info

You can always get the suitable permission file for your Remotion Cloud Run version by typing `npx remotion cloudrun permissions`.

The following table is a breakdown of why Remotion Cloud Run requires the permissions it does.

| Permission | Reason |
| --- | --- |
| `iam.serviceAccounts.actAs` | `When deploying, act as the default service account, which will grant further permissions required during deployment.` |
| `run.operations.get` | `Required during deployment to confirm that deployment was successful.` |
| `run.routes.invoke` | `Invoke the deployed Cloud Run services to perform a render.` |
| `run.services.create` | `Deploy new, and edit existing, Cloud Run services.` |
| `run.services.get` | `` |
| `run.services.delete` | `` |
| `run.services.list` | `Get a list of existing Cloud Run services, to ensure no unintended overwriting.` |
| `run.services.update` | `Update a Cloud Run service, for example providing it with more memory or CPU.` |
| `storage.buckets.create` | `Create the storage bucket to store the bundled site and render output.` |
| `storage.buckets.get` | `` |
| `storage.buckets.list` | `Get a list of existing Cloud Storage resources, to ensure no unintended overwriting of storage buckets.` |
| `storage.objects.create` | `Create new objects in storage. This could be bundled sites, or renders, or logs.` |
| `storage.objects.delete` | `` |
| `storage.objects.list` | `` |
| `logging.logEntries.list` | `Used by the CLI to fetch recent logs if the Cloud Run service crashes, to assist in debugging the root cause.` |

## Validation [​](https://www.remotion.dev/docs/cloudrun/permissions\#validation "Direct link to Validation")

There are two ways in which you can test if the permissions for the service account have been correctly set up. Either you execute the following command:

```

bash

npx remotion cloudrun permissions
```

or if you want to validate it programmatically, using the [`testPermissions()`](https://www.remotion.dev/docs/cloudrun/testpermissions) function.

## See also [​](https://www.remotion.dev/docs/cloudrun/permissions\#see-also "Direct link to See also")

- [Set up guide](https://www.remotion.dev/docs/cloudrun/setup)
- [`testPermissions()`](https://www.remotion.dev/docs/cloudrun/testpermissions)

- [Service Account permissions](https://www.remotion.dev/docs/cloudrun/permissions#service-account-permissions)
- [Validation](https://www.remotion.dev/docs/cloudrun/permissions#validation)
- [See also](https://www.remotion.dev/docs/cloudrun/permissions#see-also)

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