[Skip to main content](https://www.remotion.dev/docs/cloudrun/getorcreatebucket#__docusaurus_skipToContent_fallback)

On this page

EXPERIMENTAL

Cloud Run is in [Alpha status and not actively being developed.](https://www.remotion.dev/docs/cloudrun/status)

Creates a Cloud Storage bucket for Remotion Cloud Run in your GCP project. If one already exists, it will get returned instead.

**Only 1 bucket per region** is necessary for Remotion Cloud Run to function.

```

ts

import {getOrCreateBucket} from '@remotion/cloudrun';

const {bucketName, alreadyExisted} = await getOrCreateBucket({
  region: 'us-east1',
});

console.log(bucketName); // "remotioncloudrun-32df3p"
```

## Arguments [​](https://www.remotion.dev/docs/cloudrun/getorcreatebucket\#arguments "Direct link to Arguments")

An object with the following properties:

### `region` [​](https://www.remotion.dev/docs/cloudrun/getorcreatebucket\#region "Direct link to region")

The [GCP region](https://www.remotion.dev/docs/cloudrun/region-selection) which you want to create a bucket in.

### `updateBucketState?` [​](https://www.remotion.dev/docs/cloudrun/getorcreatebucket\#updatebucketstate "Direct link to updatebucketstate")

_optional_

Callback function that returns a state ( _string_) of operation. Used by the CLI to provide a progress update. State will be one of the following;

- Checking for existing bucket
- Creating new bucket
- Created bucket
- Using existing bucket

## Return value [​](https://www.remotion.dev/docs/cloudrun/getorcreatebucket\#return-value "Direct link to Return value")

A promise resolving to an object with the following properties:

### `bucketName` [​](https://www.remotion.dev/docs/cloudrun/getorcreatebucket\#bucketname "Direct link to bucketname")

The name of your bucket that was found or created.

### `alreadyExisted` [​](https://www.remotion.dev/docs/cloudrun/getorcreatebucket\#alreadyexisted "Direct link to alreadyexisted")

A boolean indicating whether the bucket already existed or was newly created.

## See also [​](https://www.remotion.dev/docs/cloudrun/getorcreatebucket\#see-also "Direct link to See also")

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/cloudrun/src/api/get-or-create-bucket.ts)
- [getServices()](https://www.remotion.dev/docs/cloudrun/getservices)

- [Arguments](https://www.remotion.dev/docs/cloudrun/getorcreatebucket#arguments)
  - [`region`](https://www.remotion.dev/docs/cloudrun/getorcreatebucket#region)
  - [`updateBucketState?`](https://www.remotion.dev/docs/cloudrun/getorcreatebucket#updatebucketstate)
- [Return value](https://www.remotion.dev/docs/cloudrun/getorcreatebucket#return-value)
  - [`bucketName`](https://www.remotion.dev/docs/cloudrun/getorcreatebucket#bucketname)
  - [`alreadyExisted`](https://www.remotion.dev/docs/cloudrun/getorcreatebucket#alreadyexisted)
- [See also](https://www.remotion.dev/docs/cloudrun/getorcreatebucket#see-also)

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