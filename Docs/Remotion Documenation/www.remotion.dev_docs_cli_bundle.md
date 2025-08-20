---
url: "https://www.remotion.dev/docs/cli/bundle"
title: "npx remotion bundle | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/cli/bundle#__docusaurus_skipToContent_fallback)

On this page

_available from v4.0.89_

Creates a [Remotion Bundle](https://www.remotion.dev/docs/terminology/bundle) on the command line.

Equivalent to the [`bundle()`](https://www.remotion.dev/docs/bundle) Node.JS API.

```

bash

npx remotion bundle <serve-url|entry-file>?
```

You may pass a [Serve URL](https://www.remotion.dev/docs/terminology/serve-url) or an [entry point](https://www.remotion.dev/docs/terminology/entry-point) as the first argument, otherwise the entry point will be [determined](https://www.remotion.dev/docs/terminology/entry-point#which-entry-point-is-being-used).

## Flags [​](https://www.remotion.dev/docs/cli/bundle\#flags "Direct link to Flags")

### `--config` [​](https://www.remotion.dev/docs/cli/bundle\#--config "Direct link to --config")

Specify a location for the Remotion config file.

### `--log` [​](https://www.remotion.dev/docs/cli/bundle\#--log "Direct link to --log")

One of `trace`, `verbose`, `info`, `warn`, `error`.

Determines how much info is being logged to the console.

Default `info`.

### `--public-dir` [​](https://www.remotion.dev/docs/cli/bundle\#--public-dir "Direct link to --public-dir")

Define the location of the [`public/ directory`](https://www.remotion.dev/docs/terminology/public-dir). If not defined, Remotion will assume the location is the \`public\` folder in your Remotion root.

### `--out-dir` [​](https://www.remotion.dev/docs/cli/bundle\#--out-dir "Direct link to --out-dir")

Define the location of the resulting bundle. By default it is a folder called `./build`, adjacent to the [Remotion Root](https://www.remotion.dev/docs/terminology/remotion-root).

### `--public-path` [v4.0.127](https://github.com/remotion-dev/remotion/releases/v4.0.127) [​](https://www.remotion.dev/docs/cli/bundle\#--public-path "Direct link to --public-path")

The path of the URL where the bundle is going to be hosted. By default it is `/`, meaning that the bundle is going to be hosted at the root of the domain (e.g. `https://localhost:3000/`). If you are deploying to a subdirectory (e.g. `/sites/my-site/`), you should set this to the subdirectory.

### `--disable-git-source` [v4.0.182](https://github.com/remotion-dev/remotion/releases/v4.0.182) [​](https://www.remotion.dev/docs/cli/bundle\#--disable-git-source "Direct link to --disable-git-source")

Disables the Git Source being connected to the Remotion Studio. Clicking on stack traces and certain menu items will be disabled.

- [Flags](https://www.remotion.dev/docs/cli/bundle#flags)
  - [`--config`](https://www.remotion.dev/docs/cli/bundle#--config)
  - [`--log`](https://www.remotion.dev/docs/cli/bundle#--log)
  - [`--public-dir`](https://www.remotion.dev/docs/cli/bundle#--public-dir)
  - [`--out-dir`](https://www.remotion.dev/docs/cli/bundle#--out-dir)
  - [`--public-path`](https://www.remotion.dev/docs/cli/bundle#--public-path)
  - [`--disable-git-source`](https://www.remotion.dev/docs/cli/bundle#--disable-git-source)

Remotion