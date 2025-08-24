---
url: "https://www.remotion.dev/docs/chromium-flags"
title: "Chromium flags | Remotion | Make videos programmatically"
---

[Skip to main content](https://www.remotion.dev/docs/chromium-flags#__docusaurus_skipToContent_fallback)

On this page

We allow you to set the following flags in Chromium and Google Chrome since Remotion 2.6.5:

## `--disable-web-security` [​](https://www.remotion.dev/docs/chromium-flags\#--disable-web-security "Direct link to --disable-web-security")

This will most notably disable CORS among other security features.

note

Remotion will automatically append the `--user-data-dir` flag.

### Via Node.JS APIs [​](https://www.remotion.dev/docs/chromium-flags\#via-nodejs-apis "Direct link to Via Node.JS APIs")

In [`getCompositions()`](https://www.remotion.dev/docs/renderer/get-compositions), [`renderStill()`](https://www.remotion.dev/docs/renderer/render-still#disablewebsecurity), [`renderMedia()`](https://www.remotion.dev/docs/renderer/render-media#disablewebsecurity), [`renderFrames()`](https://www.remotion.dev/docs/renderer/render-frames#disablewebsecurity), [`getCompositionsOnLambda()`](https://www.remotion.dev/docs/lambda/getcompositionsonlambda#disablewebsecurity), [`renderStillOnLambda()`](https://www.remotion.dev/docs/lambda/renderstillonlambda#disablewebsecurity) and [`renderMediaOnLambda()`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#disablewebsecurity), you can pass [`chromiumOptions.disableWebSecurity`](https://www.remotion.dev/docs/renderer/render-still#disablewebsecurity).

### Via CLI flag [​](https://www.remotion.dev/docs/chromium-flags\#via-cli-flag "Direct link to Via CLI flag")

Pass [`--disable-web-security`](https://www.remotion.dev/docs/cli/render#--disable-web-security) in one of the following commands: [`remotion render`](https://www.remotion.dev/docs/cli/render), [`remotion compositions`](https://www.remotion.dev/docs/cli/compositions), [`remotion still`](https://www.remotion.dev/docs/cli/still), [`remotion lambda render`](https://www.remotion.dev/docs/lambda/cli/render), [`remotion lambda still`](https://www.remotion.dev/docs/lambda/cli/still), [`remotion lambda compositions`](https://www.remotion.dev/docs/lambda/cli/compositions).

### Via config file [​](https://www.remotion.dev/docs/chromium-flags\#via-config-file "Direct link to Via config file")

Use [setChromiumDisableWebSecurity()](https://www.remotion.dev/docs/config#setchromiumdisablewebsecurity).

```

tsx

Config.setChromiumDisableWebSecurity(true);
```

note

Prior to `v3.3.39`, the option was called `Config.Puppeteer.setChromiumDisableWebSecurity()`.

## `--ignore-certificate-errors` [​](https://www.remotion.dev/docs/chromium-flags\#--ignore-certificate-errors "Direct link to --ignore-certificate-errors")

Results in invalid SSL certificates, such as self-signed ones, being ignored.

### Via Node.JS APIs [​](https://www.remotion.dev/docs/chromium-flags\#via-nodejs-apis-1 "Direct link to Via Node.JS APIs")

In [`getCompositions()`](https://www.remotion.dev/docs/renderer/get-compositions), [`renderStill()`](https://www.remotion.dev/docs/renderer/render-still#ignorecertificateerrors), [`renderMedia()`](https://www.remotion.dev/docs/renderer/render-media#ignorecertificateerrors), [`renderFrames()`](https://www.remotion.dev/docs/renderer/render-frames#ignorecertificateerrors), [`getCompositionsOnLambda()`](https://www.remotion.dev/docs/lambda/getcompositionsonlambda#disablewebsecurity), [`renderStillOnLambda()`](https://www.remotion.dev/docs/lambda/renderstillonlambda#ignorecertificateerrors) and [`renderMediaOnLambda()`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#ignorecertificateerrors), you can pass [`chromiumOptions.ignoreCertificateErrors`](https://www.remotion.dev/docs/renderer/render-still#ignorecertificateerrors).

### Via CLI flag [​](https://www.remotion.dev/docs/chromium-flags\#via-cli-flag-1 "Direct link to Via CLI flag")

Pass [`--ignore-certificate-errors`](https://www.remotion.dev/docs/cli/render#--ignore-certificate-errors) in one of the following commands: [`remotion render`](https://www.remotion.dev/docs/cli/render), [`remotion compositions`](https://www.remotion.dev/docs/cli/compositions), [`remotion still`](https://www.remotion.dev/docs/cli/still), [`remotion lambda render`](https://www.remotion.dev/docs/lambda/cli/render), [`remotion lambda still`](https://www.remotion.dev/docs/lambda/cli/still), [`remotion lambda compositions`](https://www.remotion.dev/docs/lambda/cli/compositions).

### Via config file [​](https://www.remotion.dev/docs/chromium-flags\#via-config-file-1 "Direct link to Via config file")

Use [setChromiumIgnoreCertificateErrors()](https://www.remotion.dev/docs/config#setchromiumignorecertificateerrors).

```

tsx

Config.setChromiumIgnoreCertificateErrors(true);
```

note

Prior to `v3.3.39`, the option was called `Config.Puppeteer.setChromiumIgnoreCertificateErrors()`.

## ~~`--disable-headless`~~ [​](https://www.remotion.dev/docs/chromium-flags\#--disable-headless "Direct link to --disable-headless")

Deprecated - will be removed in 5.0.0. With the migration to [Chrome Headless Shell](https://www.remotion.dev/docs/miscellaneous/chrome-headless-shell), this option is not functional anymore.

If disabled, the render will open an actual Chrome window where you can see the render happen. The default is headless mode.

### Via Node.JS APIs [​](https://www.remotion.dev/docs/chromium-flags\#via-nodejs-apis-2 "Direct link to Via Node.JS APIs")

In [`getCompositions()`](https://www.remotion.dev/docs/renderer/get-compositions), [`renderStill()`](https://www.remotion.dev/docs/renderer/render-still#headless), [`renderMedia()`](https://www.remotion.dev/docs/renderer/render-media#headless) and [`renderFrames()`](https://www.remotion.dev/docs/renderer/render-frames#headless), you can pass [`chromiumOptions.headless`](https://www.remotion.dev/docs/renderer/render-still#headless). You cannot set this option in Lambda.

### Via CLI flag [​](https://www.remotion.dev/docs/chromium-flags\#via-cli-flag-2 "Direct link to Via CLI flag")

Pass [`--disable-headless`](https://www.remotion.dev/docs/cli/render#--disable-headless) in one of the following commands: [`remotion compositions`](https://www.remotion.dev/docs/cli/compositions), [`remotion render`](https://www.remotion.dev/docs/cli/render), [`remotion still`](https://www.remotion.dev/docs/cli/still).

### Via config file [​](https://www.remotion.dev/docs/chromium-flags\#via-config-file-2 "Direct link to Via config file")

Use [setChromiumHeadlessMode()](https://www.remotion.dev/docs/config#setchromiumheadlessmode).

```

tsx

Config.setChromiumHeadlessMode(false);
```

note

Prior to `v3.3.39`, the option was called `Config.Puppeteer.setChromiumHeadlessMode()`.

## `--gl` [​](https://www.remotion.dev/docs/chromium-flags\#--gl "Direct link to --gl")

Changelog

- From Remotion v2.6.7 until v3.0.7, the default for Remotion Lambda was `swiftshader`, but from v3.0.8 the default is `swangle` (Swiftshader on Angle) since Chrome 101 added support for it.
- From Remotion v2.4.3 until v2.6.6, the default was `angle`, however it turns out to have a small memory leak that could crash long Remotion renders.

Select the OpenGL renderer backend for Chromium.

Accepted values:

- `"angle"`
- `"egl"`
- `"swiftshader"`
- `"swangle"`
- `"vulkan"` ( _from Remotion v4.0.41_)
- `"angle-egl"` ( _from Remotion v4.0.51_)

The default is `null`, letting Chrome decide, except on Lambda where the default is `"swangle"`

### Via Node.JS APIs [​](https://www.remotion.dev/docs/chromium-flags\#via-nodejs-apis-3 "Direct link to Via Node.JS APIs")

In [`getCompositions()`](https://www.remotion.dev/docs/renderer/get-compositions#chromiumoptions), [`renderStill()`](https://www.remotion.dev/docs/renderer/render-still#gl), [`renderMedia()`](https://www.remotion.dev/docs/renderer/render-media#gl), [`renderFrames()`](https://www.remotion.dev/docs/renderer/render-frames#gl), [`getCompositionsOnLambda()`](https://www.remotion.dev/docs/lambda/getcompositionsonlambda#gl), [`renderStillOnLambda()`](https://www.remotion.dev/docs/lambda/renderstillonlambda#gl) and [`renderMediaOnLambda()`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#gl), you can pass [`chromiumOptions.gl`](https://www.remotion.dev/docs/renderer/render-still#gl).

### Via CLI flag [​](https://www.remotion.dev/docs/chromium-flags\#via-cli-flag-3 "Direct link to Via CLI flag")

Pass [`--gl=swiftshader`](https://www.remotion.dev/docs/cli) in one of the following commands: [`remotion render`](https://www.remotion.dev/docs/cli/render), [`remotion compositions`](https://www.remotion.dev/docs/cli/compositions), [`remotion still`](https://www.remotion.dev/docs/cli/still), [`remotion lambda render`](https://www.remotion.dev/docs/lambda/cli/render), [`remotion lambda still`](https://www.remotion.dev/docs/lambda/cli/still), [`remotion lambda compositions`](https://www.remotion.dev/docs/lambda/cli/compositions).

### Via config file [​](https://www.remotion.dev/docs/chromium-flags\#via-config-file-3 "Direct link to Via config file")

```

tsx

Config.setChromiumOpenGlRenderer('swiftshader');
```

note

Prior to `v3.3.39`, the option was called `Config.Puppeteer.setChromiumOpenGlRenderer()`.

## `--user-agent` [v3.3.83](https://github.com/remotion-dev/remotion/releases/v3.3.83) [​](https://www.remotion.dev/docs/chromium-flags\#--user-agent "Direct link to --user-agent")

### Via Node.JS APIs [​](https://www.remotion.dev/docs/chromium-flags\#via-nodejs-apis-4 "Direct link to Via Node.JS APIs")

In [`getCompositions()`](https://www.remotion.dev/docs/renderer/get-compositions#chromiumoptions), [`renderStill()`](https://www.remotion.dev/docs/renderer/render-still#useragent), [`renderMedia()`](https://www.remotion.dev/docs/renderer/render-media#useragent), [`renderFrames()`](https://www.remotion.dev/docs/renderer/render-frames#useragent), [`getCompositionsOnLambda()`](https://www.remotion.dev/docs/lambda/getcompositionsonlambda#useragent), [`renderStillOnLambda()`](https://www.remotion.dev/docs/lambda/renderstillonlambda#useragent) and [`renderMediaOnLambda()`](https://www.remotion.dev/docs/lambda/rendermediaonlambda#chromiumoptions), you can pass [`chromiumOptions.userAgent`](https://www.remotion.dev/docs/renderer/render-still#useragent).

### Via CLI flag [​](https://www.remotion.dev/docs/chromium-flags\#via-cli-flag-4 "Direct link to Via CLI flag")

Pass [`--user-agent`](https://www.remotion.dev/docs/cli) in one of the following commands: [`remotion render`](https://www.remotion.dev/docs/cli/render), [`remotion compositions`](https://www.remotion.dev/docs/cli/compositions), [`remotion still`](https://www.remotion.dev/docs/cli/still), [`remotion lambda render`](https://www.remotion.dev/docs/lambda/cli/render), [`remotion lambda still`](https://www.remotion.dev/docs/lambda/cli/still), [`remotion lambda compositions`](https://www.remotion.dev/docs/lambda/cli/compositions).

## Need more flags? [​](https://www.remotion.dev/docs/chromium-flags\#need-more-flags "Direct link to Need more flags?")

Open a [GitHub issue](https://github.com/remotion-dev/remotion/issues/new?assignees=&labels=&template=feature_request.md&title=) to request it.

- [`--disable-web-security`](https://www.remotion.dev/docs/chromium-flags#--disable-web-security)
  - [Via Node.JS APIs](https://www.remotion.dev/docs/chromium-flags#via-nodejs-apis)
  - [Via CLI flag](https://www.remotion.dev/docs/chromium-flags#via-cli-flag)
  - [Via config file](https://www.remotion.dev/docs/chromium-flags#via-config-file)
- [`--ignore-certificate-errors`](https://www.remotion.dev/docs/chromium-flags#--ignore-certificate-errors)
  - [Via Node.JS APIs](https://www.remotion.dev/docs/chromium-flags#via-nodejs-apis-1)
  - [Via CLI flag](https://www.remotion.dev/docs/chromium-flags#via-cli-flag-1)
  - [Via config file](https://www.remotion.dev/docs/chromium-flags#via-config-file-1)
- [~~`--disable-headless`~~](https://www.remotion.dev/docs/chromium-flags#--disable-headless)
  - [Via Node.JS APIs](https://www.remotion.dev/docs/chromium-flags#via-nodejs-apis-2)
  - [Via CLI flag](https://www.remotion.dev/docs/chromium-flags#via-cli-flag-2)
  - [Via config file](https://www.remotion.dev/docs/chromium-flags#via-config-file-2)
- [`--gl`](https://www.remotion.dev/docs/chromium-flags#--gl)
  - [Via Node.JS APIs](https://www.remotion.dev/docs/chromium-flags#via-nodejs-apis-3)
  - [Via CLI flag](https://www.remotion.dev/docs/chromium-flags#via-cli-flag-3)
  - [Via config file](https://www.remotion.dev/docs/chromium-flags#via-config-file-3)
- [`--user-agent`](https://www.remotion.dev/docs/chromium-flags#--user-agent)
  - [Via Node.JS APIs](https://www.remotion.dev/docs/chromium-flags#via-nodejs-apis-4)
  - [Via CLI flag](https://www.remotion.dev/docs/chromium-flags#via-cli-flag-4)
- [Need more flags?](https://www.remotion.dev/docs/chromium-flags#need-more-flags)

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