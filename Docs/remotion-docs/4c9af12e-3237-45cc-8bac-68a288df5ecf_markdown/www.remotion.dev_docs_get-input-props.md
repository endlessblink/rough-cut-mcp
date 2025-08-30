[Skip to main content](https://www.remotion.dev/docs/get-input-props#__docusaurus_skipToContent_fallback)

On this page

_Available from v2.0_.

Using this method, you can retrieve inputs that you pass in from the command line using [`--props`](https://www.remotion.dev/docs/cli), or the [`inputProps`](https://www.remotion.dev/docs/ssr) parameter if you are using the Node.JS APIs ( [`renderMedia()`](https://www.remotion.dev/docs/renderer/render-media), [`renderMediaOnLambda()`](https://www.remotion.dev/docs/lambda/rendermediaonlambda)).

This method is useful if you want to retrieve the input props in the [root component](https://www.remotion.dev/docs/terminology/root-file).

info

This method is not available when inside a Remotion Player. Instead, get the props as React props from the component you passed as the `component` prop to the player.

## You might not need this API [​](https://www.remotion.dev/docs/get-input-props\#you-might-not-need-this-api "Direct link to You might not need this API")

Prefer the following ways of getting your input props:

- A component that was rendered as a [composition](https://www.remotion.dev/docs/composition) will retrieve the input props as regular props.
- In the [root component](https://www.remotion.dev/docs/terminology/root-file), you can get the input props by using the [`calculateMetadata()`](https://www.remotion.dev/docs/calculate-metadata) function.

In both cases, you can type the props, which is better than using this API which returns a non-typesafe object.

## API [​](https://www.remotion.dev/docs/get-input-props\#api "Direct link to API")

Pass in a [parseable](https://www.remotion.dev/docs/cli) JSON representation using the `--props` flag to either `remotion studio` or `remotion render`:

```

bash

npx remotion render --props='{"hello": "world"}'
```

To simulate how it behaves, you can also pass props when using the Remotion Studio:

```

bash

npx remotion studio --props='{"hello": "world"}'
```

You may also specify a file containing JSON and Remotion will parse the file for you:

```

bash

npx remotion render --props=./path/to/props.json
```

You can then access the props anywhere in your Remotion project:

```

tsx

export const Root: React.FC = () => {
  const {hello} = getInputProps(); // "world"

  return <Composition {...config} />;
};
```

In this example, the props also get passed to the component of the composition with the id `my-composition`.

## See also [​](https://www.remotion.dev/docs/get-input-props\#see-also "Direct link to See also")

- [Source code for this function](https://github.com/remotion-dev/remotion/blob/main/packages/core/src/config/input-props.ts)
- [Dynamic duration, FPS & dimensions](https://www.remotion.dev/docs/dynamic-metadata)

- [You might not need this API](https://www.remotion.dev/docs/get-input-props#you-might-not-need-this-api)
- [API](https://www.remotion.dev/docs/get-input-props#api)
- [See also](https://www.remotion.dev/docs/get-input-props#see-also)

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