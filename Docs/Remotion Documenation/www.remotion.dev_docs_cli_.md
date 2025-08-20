---
url: "https://www.remotion.dev/docs/cli/"
title: "Command line reference | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/cli/#__docusaurus_skipToContent_fallback)

On this page

## How to use [​](https://www.remotion.dev/docs/cli/\#how-to-use "Direct link to How to use")

You can run the CLI by installing `@remotion/cli` and running:

- `npx remotion` inside a npm project
- `yarn remotion` inside a Yarn project
- `pnpm exec remotion` inside a pnpm project.
- `bunx remotion` inside a Bun project

For brevity, in the documentation we always say `npx remotion`.

Inside an npm script, you don't need the `npx` prefix:

```

package.json
json

{
  "scripts": {
    "render": "remotion render"
  }
}
```

### Using Bun [v4.0.118](https://github.com/remotion-dev/remotion/releases/v4.0.118) [​](https://www.remotion.dev/docs/cli/\#using-bun "Direct link to using-bun")

By default, the `npx remotion` command is being executed using Node.

Even `bunx remotion` is using Node, unless you add the `--bun` flag.

To use Bun, replace `remotion` with `remotionb`.

```

package.json
json

{
  "scripts": {
    "render": "remotionb render"
  }
}
```

### Using Deno [v4.0.227](https://github.com/remotion-dev/remotion/releases/v4.0.227) [​](https://www.remotion.dev/docs/cli/\#using-deno "Direct link to using-deno")

Deno is not supported by Remotion.

If you like to experiment nonetheless, use `npx remotiond` to run the Deno version of the CLI.

```

package.json
json

{
  "scripts": {
    "render": "remotiond render"
  }
}
```

## Commands [​](https://www.remotion.dev/docs/cli/\#commands "Direct link to Commands")

The following commands are available - you can always run them using `npx remotion` or even without the `npx` prefix if you put the command inside an npm script.

[**studio** \\
\\
Start the Remotion Studio](https://www.remotion.dev/docs/cli/studio) [**render** \\
\\
Render video or audio](https://www.remotion.dev/docs/cli/render) [**still** \\
\\
Render a still image](https://www.remotion.dev/docs/cli/still) [**compositions** \\
\\
List available compositions](https://www.remotion.dev/docs/cli/compositions) [**lambda** \\
\\
Control Remotion Lambda](https://www.remotion.dev/docs/lambda/cli) [**bundle** \\
\\
Create a Remotion Bundle](https://www.remotion.dev/docs/cli/bundle) [**browser** \\
\\
Ensure Remotion has a browser to use](https://www.remotion.dev/docs/cli/browser) [**cloudrun** \\
\\
Control Remotion Cloud Run](https://www.remotion.dev/docs/cloudrun/cli) [**benchmark** \\
\\
Measure and optimize render time](https://www.remotion.dev/docs/cli/benchmark) [**versions** \\
\\
List and validate Remotion package versions](https://www.remotion.dev/docs/cli/versions) [**upgrade** \\
\\
Upgrade to a newer version](https://www.remotion.dev/docs/cli/upgrade) [**gpu** \\
\\
Print information about Chrome's usage of the GPU](https://www.remotion.dev/docs/cli/gpu) [**ffmpeg** \\
\\
Execute an `ffmpeg` command](https://www.remotion.dev/docs/cli/ffmpeg) [**ffprobe** \\
\\
Execute an `ffprobe` command](https://www.remotion.dev/docs/cli/ffprobe) [**help** \\
\\
Show CLI commands](https://www.remotion.dev/docs/cli/help)

## Example command [​](https://www.remotion.dev/docs/cli/\#example-command "Direct link to Example command")

```

npx remotion render --codec=vp8 HelloWorld out/video.webm
```

## See also [​](https://www.remotion.dev/docs/cli/\#see-also "Direct link to See also")

- [Render your video](https://www.remotion.dev/docs/render)
- [Configuration file](https://www.remotion.dev/docs/config)

- [How to use](https://www.remotion.dev/docs/cli/#how-to-use)
  - [Using Bun](https://www.remotion.dev/docs/cli/#using-bun)
  - [Using Deno](https://www.remotion.dev/docs/cli/#using-deno)
- [Commands](https://www.remotion.dev/docs/cli/#commands)
- [Example command](https://www.remotion.dev/docs/cli/#example-command)
- [See also](https://www.remotion.dev/docs/cli/#see-also)

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