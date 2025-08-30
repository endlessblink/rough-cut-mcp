[Skip to main content](https://www.remotion.dev/docs/lambda/cli/sites/rmall#__docusaurus_skipToContent_fallback)

On this page

Remove all sites in the selected AWS region.

```

bash

npx remotion lambda sites rmall
```

Example output

```
Site abcdef in bucket remotionlambda-gc1w0xbfzl (14.7 MB): Delete? (Y/n): Y
Deleted sites/abcdef/052787b08233d85edebfc4ce4610944e.mp4
Deleted sites/abcdef/258.bundle.js
Deleted sites/abcdef/15.bundle.js
Deleted sites/abcdef/249.bundle.js.map
Deleted sites/abcdef/263.bundle.js
Deleted sites/abcdef/143.bundle.js
Deleted sites/abcdef/258.bundle.js.map
Deleted sites/abcdef/15.bundle.js.map
Deleted sites/abcdef/185.bundle.js.map
Deleted sites/abcdef/249.bundle.js
Deleted sites/abcdef/143.bundle.js.map
Deleted sites/abcdef/185.bundle.js
Deleted sites/abcdef/1f2d09019ff34eed846a5151b8561d5b.mp4
Deleted sites/abcdef/263.bundle.js.map
Deleted sites/abcdef/268.bundle.js
Deleted sites/abcdef/378.bundle.js.map
Deleted sites/abcdef/268.bundle.js.map
Deleted sites/abcdef/378.bundle.js
Deleted sites/abcdef/2b91c5234e41d3c36d4bf6df37876958.webm
Deleted sites/abcdef/450.bundle.js
Deleted sites/abcdef/46.bundle.js.map
Deleted sites/abcdef/46.bundle.js
Deleted sites/abcdef/450.bundle.js.map
Deleted sites/abcdef/534.bundle.js.map
Deleted sites/abcdef/569.bundle.js
Deleted sites/abcdef/3577958454aa99ad707b596f65151746.webm
Deleted sites/abcdef/534.bundle.js
Deleted sites/abcdef/575.bundle.js.map
Deleted sites/abcdef/575.bundle.js
Deleted sites/abcdef/569.bundle.js.map
Deleted sites/abcdef/801.bundle.js
Deleted sites/abcdef/7badbf53d3130d91b90c46181a2ecdc4.webm
Deleted sites/abcdef/801.bundle.js.map
Deleted sites/abcdef/873.bundle.js
Deleted sites/abcdef/98.bundle.js.map
Deleted sites/abcdef/bff822b868a2b87b31877f3606c9cc13.mp3
Deleted sites/abcdef/873.bundle.js.map
Deleted sites/abcdef/98.bundle.js
Deleted sites/abcdef/a2f36e3a48b4989e0da1fea9959fb35f.mp3
Deleted sites/abcdef/bundle.js
Deleted sites/abcdef/bundle.js.map
Deleted sites/abcdef/a7d87d9934059032eebb9c1536378a2a.webm
Deleted sites/abcdef/index.html
Deleted site abcdef and freed up 14.7 MB.

```

## `--region` [​](https://www.remotion.dev/docs/lambda/cli/sites/rmall\#--region "Direct link to --region")

The [AWS region](https://www.remotion.dev/docs/lambda/region-selection) to select. Both project and function should be in this region.

## `--yes`, `-y` [​](https://www.remotion.dev/docs/lambda/cli/sites/rmall\#--yes--y "Direct link to --yes--y")

Removes all sites without asking for confirmation.

```

npx remotion lambda sites rmall -y
```

## `--force-bucket-name` [v3.3.42](https://github.com/remotion-dev/remotion/releases/v3.3.42) [​](https://www.remotion.dev/docs/lambda/cli/sites/rmall\#--force-bucket-name "Direct link to --force-bucket-name")

Specify a specific bucket name to be used. [This is not recommended](https://www.remotion.dev/docs/lambda/multiple-buckets), instead let Remotion discover the right bucket automatically.

## `--force-path-style` [v4.0.202](https://github.com/remotion-dev/remotion/releases/v4.0.202) [​](https://www.remotion.dev/docs/lambda/cli/sites/rmall\#--force-path-style "Direct link to --force-path-style")

Passes `forcePathStyle` to the AWS S3 client. If you don't know what this is, you probably don't need it.

- [`--region`](https://www.remotion.dev/docs/lambda/cli/sites/rmall#--region)
- [`--yes`, `-y`](https://www.remotion.dev/docs/lambda/cli/sites/rmall#--yes--y)
- [`--force-bucket-name`](https://www.remotion.dev/docs/lambda/cli/sites/rmall#--force-bucket-name)
- [`--force-path-style`](https://www.remotion.dev/docs/lambda/cli/sites/rmall#--force-path-style)

Remotion

![Logo](https://raw.githubusercontent.com/remotion-dev/brand/refs/heads/main/logo.svg)

Remotion

You may ask your questions about the Remotion documentation and the bot answers it based on the documentation. Go through the sources for better answers appropriately.

QUICK QUESTIONS

How to install it?

How to setup Remotion Lambda?

Why is my composition flickering?

Powered by [CrawlChat](https://crawlchat.app/?ref=powered-by-remotion)