---
url: "https://www.remotion.dev/docs/cli/studio"
title: "npx remotion studio | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/cli/studio#__docusaurus_skipToContent_fallback)

On this page

_Alias: npx remotion preview_

Start the [Remotion Studio](https://www.remotion.dev/docs/studio).

```

bash

npx remotion studio <entry-point>?
```

You may pass an [entry point](https://www.remotion.dev/docs/terminology/entry-point) as an argument, otherwise it will be [determined](https://www.remotion.dev/docs/terminology/entry-point#which-entry-point-is-being-used).

## Flags [​](https://www.remotion.dev/docs/cli/studio\#flags "Direct link to Flags")

### `--props` [​](https://www.remotion.dev/docs/cli/studio\#--props "Direct link to --props")

[Input Props to pass to the selected composition of your video.](https://www.remotion.dev/docs/passing-props#passing-input-props-in-the-cli).

We don't recommend passing this flag when using the Studio - use [`defaultProps`](https://www.remotion.dev/docs/composition#defaultprops) instead.

Must be a serialized JSON string ( `--props='{"hello": "world"}'`) or a path to a JSON file ( `./path/to/props.json`).

From the root component the props can be read using [`getInputProps()`](https://www.remotion.dev/docs/get-input-props).

You may transform input props using [`calculateMetadata()`](https://www.remotion.dev/docs/calculate-metadata).

note

Inline JSON string isn't supported on Windows shells because it removes the `"` character, use a file name instead.

### `--config` [v1.2.0](https://github.com/remotion-dev/remotion/releases/v1.2.0) [​](https://www.remotion.dev/docs/cli/studio\#--config "Direct link to --config")

Specify a location for the Remotion config file.

### `--env-file` [v2.2.0](https://github.com/remotion-dev/remotion/releases/v2.2.0) [​](https://www.remotion.dev/docs/cli/studio\#--env-file "Direct link to --env-file")

Specify a location for a dotenv file - Default `.env`. [Read about how environment variables work in Remotion.](https://www.remotion.dev/docs/env-variables)

### `--log` [​](https://www.remotion.dev/docs/cli/studio\#--log "Direct link to --log")

[Set the log level](https://www.remotion.dev/docs/config#setlevel). Increase or decrease the amount of output. Acceptable values: `error`, `warn`, `info` ( _default_), `verbose`

### `--port` [​](https://www.remotion.dev/docs/cli/studio\#--port "Direct link to --port")

[Set a custom HTTP server port to start the server on](https://www.remotion.dev/docs/config#setstudioport). If not defined, Remotion will try to find a free port.

### `--public-dir` [v3.2.13](https://github.com/remotion-dev/remotion/releases/v3.2.13) [​](https://www.remotion.dev/docs/cli/studio\#--public-dir "Direct link to --public-dir")

The path of the URL where the bundle is going to be hosted. By default it is `/`, meaning that the bundle is going to be hosted at the root of the domain (e.g. `https://localhost:3000/`). If you are deploying to a subdirectory (e.g. `/sites/my-site/`), you should set this to the subdirectory.

### `--disable-keyboard-shortcuts` [v3.2.11](https://github.com/remotion-dev/remotion/releases/v3.2.11) [​](https://www.remotion.dev/docs/cli/studio\#--disable-keyboard-shortcuts "Direct link to --disable-keyboard-shortcuts")

[Disables all keyboard shortcuts in the Studio](https://www.remotion.dev/docs/config#setkeyboardshortcutsenabled).

### `--webpack-poll` [v3.3.11](https://github.com/remotion-dev/remotion/releases/v3.3.11) [​](https://www.remotion.dev/docs/cli/studio\#--webpack-poll "Direct link to --webpack-poll")

[Enables Webpack polling](https://www.remotion.dev/docs/config#setwebpackpollinginmilliseconds) instead of the file system event listeners for hot reloading. This is useful if you are inside a virtual machine or have a remote file system.
Pass a value in milliseconds, for example `--webpack-poll=1000`.

### `--no-open` [v3.3.19](https://github.com/remotion-dev/remotion/releases/v3.3.19) [​](https://www.remotion.dev/docs/cli/studio\#--no-open "Direct link to --no-open")

[Prevents Remotion from trying to open a browser](https://www.remotion.dev/docs/config#setshouldopenbrowser). This is useful if you use a different browser for Remotion than the operating system default.

### `--browser` [v3.3.79](https://github.com/remotion-dev/remotion/releases/v3.3.79) [​](https://www.remotion.dev/docs/cli/studio\#--browser "Direct link to --browser")

Specify the browser which should be used for opening tab - using the default browser by default.

Pass an absolute string or `"chrome"` to use Chrome.
If Chrome is selected as the browser and you are on macOS, Remotion will try to reuse an existing tab

For backwards compatibility, the `BROWSER` environment variable is also supported.

### `--browser-args` [v3.3.79](https://github.com/remotion-dev/remotion/releases/v3.3.79) [​](https://www.remotion.dev/docs/cli/studio\#--browser-args "Direct link to --browser-args")

A set of command line flags that should be passed to the browser. Pass them like this:

```

sh

npx remotion studio --browser-args="--disable-web-security"
```

### `--beep-on-finish` [v4.0.84](https://github.com/remotion-dev/remotion/releases/v4.0.84) [​](https://www.remotion.dev/docs/cli/studio\#--beep-on-finish "Direct link to --beep-on-finish")

[Plays a beep sound when the video is finished rendering](https://www.remotion.dev/docs/config#setbeeponfinish). This is useful if you are rendering a video in the background and want to be notified when it is finished.

```

sh

npx remotion studio --beep-on-finish
```

### `--ipv4` [v4.0.125](https://github.com/remotion-dev/remotion/releases/v4.0.125) [​](https://www.remotion.dev/docs/cli/studio\#--ipv4 "Direct link to --ipv4")

Forces the Studio to be bound to an IPv4 interface, even if a IPv6 interface is available.

```

sh

npx remotion studio --ipv4
```

### `--cross-site-isolation` [v4.1.0](https://github.com/remotion-dev/remotion/releases/v4.1.0) [​](https://www.remotion.dev/docs/cli/studio\#--cross-site-isolation "Direct link to --cross-site-isolation")

[Enable Cross-Site Isolation in the Studio](https://www.remotion.dev/docs/config#setenablecrosssiteisolation).

```

sh

npx remotion studio --enable-cross-site-isolation
```

- [Flags](https://www.remotion.dev/docs/cli/studio#flags)
  - [`--props`](https://www.remotion.dev/docs/cli/studio#--props)
  - [`--config`](https://www.remotion.dev/docs/cli/studio#--config)
  - [`--env-file`](https://www.remotion.dev/docs/cli/studio#--env-file)
  - [`--log`](https://www.remotion.dev/docs/cli/studio#--log)
  - [`--port`](https://www.remotion.dev/docs/cli/studio#--port)
  - [`--public-dir`](https://www.remotion.dev/docs/cli/studio#--public-dir)
  - [`--disable-keyboard-shortcuts`](https://www.remotion.dev/docs/cli/studio#--disable-keyboard-shortcuts)
  - [`--webpack-poll`](https://www.remotion.dev/docs/cli/studio#--webpack-poll)
  - [`--no-open`](https://www.remotion.dev/docs/cli/studio#--no-open)
  - [`--browser`](https://www.remotion.dev/docs/cli/studio#--browser)
  - [`--browser-args`](https://www.remotion.dev/docs/cli/studio#--browser-args)
  - [`--beep-on-finish`](https://www.remotion.dev/docs/cli/studio#--beep-on-finish)
  - [`--ipv4`](https://www.remotion.dev/docs/cli/studio#--ipv4)
  - [`--cross-site-isolation`](https://www.remotion.dev/docs/cli/studio#--cross-site-isolation)

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