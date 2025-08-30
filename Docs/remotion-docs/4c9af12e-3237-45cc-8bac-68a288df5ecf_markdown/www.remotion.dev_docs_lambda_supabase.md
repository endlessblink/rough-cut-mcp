[Skip to main content](https://www.remotion.dev/docs/lambda/supabase#__docusaurus_skipToContent_fallback)

On this page

This page shows how to trigger a Remotion Lambda render from a Supabase Edge Function.

Other than that, the steps to use Remotion Lambda are the same as described in the [Remotion Lambda setup](https://www.remotion.dev/docs/lambda/setup).

## Invoking a Remotion Lambda render from Supabase Edge Functions [v4.0.265](https://github.com/remotion-dev/remotion/releases/v4.0.265) [​](https://www.remotion.dev/docs/lambda/supabase\#invoking-a-remotion-lambda-render-from-supabase-edge-functions "Direct link to invoking-a-remotion-lambda-render-from-supabase-edge-functions")

Install the `@remotion/lambda-client` package in your Supabase Edge Functions project:

```

bash

deno add @remotion/lambda-client@4.0.265
```

Replace `4.0.265` with the version of Remotion you are using.

Set the environment variable `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`:

```

supabase/functions/.env
bash

AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
```

```

supabase/functions/trigger-render.ts
tsx

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
// FIXME: Replace 4.0.265 with the version of Remotion you are using.
import {renderMediaOnLambda} from 'npm:@remotion/lambda-client@4.0.265';

Deno.serve(async (req) => {
  const {props} = await req.json();

  try {
    const response = await renderMediaOnLambda({
      serveUrl: 'https://remotion-helloworld.vercel.app',
      composition: 'HelloWorld',
      codec: 'h264',
      // FIXME: Replace with your AWS region
      region: 'eu-central-1',
      // FIXME: Add your function specs here
      functionName: speculateFunctionName({
        memorySizeInMb: 2048,
        diskSizeInMb: 2048,
        timeoutInSeconds: 120,
      }),
      inputProps: props,
    });

    return new Response(JSON.stringify(response), {headers: {'Content-Type': 'application/json'}});
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({error: (error as Error).message}), {headers: {'Content-Type': 'application/json'}, status: 500});
  }
});
```

Make sure to resolve the three FIXME comments.

## Storing your renders in Supabase Storage [v4.0.259](https://github.com/remotion-dev/remotion/releases/v4.0.259) [​](https://www.remotion.dev/docs/lambda/supabase\#storing-your-renders-in-supabase-storage "Direct link to storing-your-renders-in-supabase-storage")

Create a Supabase Storage bucket and set the environment variables `SUPABASE_ACCESS_KEY_ID`, `SUPABASE_SECRET_ACCESS_KEY`.

Use an [`s3OutputProvider`](https://www.remotion.dev/docs/lambda/custom-destination#saving-to-another-cloud) to store the rendered video in Supabase Storage:

```

tsx

const {bucketName, renderId, cloudWatchMainLogs} = await renderMediaOnLambda({
  serveUrl: 'https://remotion-helloworld.vercel.app',
  // FIXME: Add your function specs here
  functionName: speculateFunctionName({
    diskSizeInMb: 2048,
    memorySizeInMb: 2048,
    timeoutInSeconds: 120,
  }),
  composition: 'HelloWorld',
  // FIXME: Replace with your AWS region
  region: 'eu-central-1',
  codec: 'h264',
  outName: {
    // FIXME: Use the bucket name from your Supabase Storage settings
    bucketName: 'remotion-test-bucket',
    key: 'out.mp4',
    s3OutputProvider: {
      // FIXME: Use the endpoint from your Supabase Storage settings
      endpoint: 'https://kudbuxgvpedqabsivqjz.supabase.co/storage/v1/s3',
      // FIXME: Use the Access Key from your Supabase Storage settings
      accessKeyId: process.env.SUPABASE_ACCESS_KEY_ID ?? '',
      // FIXME: Use the Secret Access Key from your Supabase Storage settings
      secretAccessKey: process.env.SUPABASE_SECRET_ACCESS_KEY ?? '',
      // FIXME: Use the region from your Supabase Storage settings
      region: 'eu-central-1',
      forcePathStyle: true,
    },
  },
});
```

## See also [​](https://www.remotion.dev/docs/lambda/supabase\#see-also "Direct link to See also")

- [Using Remotion Lambda with R2](https://www.remotion.dev/docs/lambda/r2)

- [Invoking a Remotion Lambda render from Supabase Edge Functions](https://www.remotion.dev/docs/lambda/supabase#invoking-a-remotion-lambda-render-from-supabase-edge-functions)
- [Storing your renders in Supabase Storage](https://www.remotion.dev/docs/lambda/supabase#storing-your-renders-in-supabase-storage)
- [See also](https://www.remotion.dev/docs/lambda/supabase#see-also)