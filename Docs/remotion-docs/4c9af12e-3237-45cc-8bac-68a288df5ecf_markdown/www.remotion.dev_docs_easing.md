[Skip to main content](https://www.remotion.dev/docs/easing#__docusaurus_skipToContent_fallback)

On this page

The `Easing` module implements common easing functions. You can use it with the [`interpolate()`](https://www.remotion.dev/docs/interpolate) API.

You can find a visualization of some common easing functions at [http://easings.net/](http://easings.net/)

### Predefined animations [​](https://www.remotion.dev/docs/easing\#predefined-animations "Direct link to Predefined animations")

The `Easing` module provides several predefined animations through the following methods:

- [`back`](https://www.remotion.dev/docs/easing#back) provides a basic animation where the object goes slightly back before moving forward
- [`bounce`](https://www.remotion.dev/docs/easing#bounce) provides a bouncing animation
- [`ease`](https://www.remotion.dev/docs/easing#ease) provides a basic inertial animation
- [`elastic`](https://www.remotion.dev/docs/easing#elastic) provides a basic spring interaction

### Standard functions [​](https://www.remotion.dev/docs/easing\#standard-functions "Direct link to Standard functions")

Three standard easing functions are provided:

- [`linear`](https://www.remotion.dev/docs/easing#linear)
- [`quad`](https://www.remotion.dev/docs/easing#quad)
- [`cubic`](https://www.remotion.dev/docs/easing#cubic)

The [`poly`](https://www.remotion.dev/docs/easing#poly) function can be used to implement quartic, quintic, and other higher power functions.

### Additional functions [​](https://www.remotion.dev/docs/easing\#additional-functions "Direct link to Additional functions")

Additional mathematical functions are provided by the following methods:

- [`bezier`](https://www.remotion.dev/docs/easing#bezier) provides a cubic bezier curve
- [`circle`](https://www.remotion.dev/docs/easing#circle) provides a circular function
- [`sin`](https://www.remotion.dev/docs/easing#sin) provides a sinusoidal function
- [`exp`](https://www.remotion.dev/docs/easing#exp) provides an exponential function

The following helpers are used to modify other easing functions.

- [`in`](https://www.remotion.dev/docs/easing#ineasing) runs an easing function forwards
- [`inOut`](https://www.remotion.dev/docs/easing#inout) makes any easing function symmetrical
- [`out`](https://www.remotion.dev/docs/easing#out) runs an easing function backwards

## Example [​](https://www.remotion.dev/docs/easing\#example "Direct link to Example")

```

tsx

import { Easing, interpolate } from "remotion";

const MyVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const interpolated = interpolate(frame, [0, 100], [0, 1], {
    easing: Easing.bezier(0.8, 0.22, 0.96, 0.65),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        transform: `scale(${interpolated})`,
        backgroundColor: "red",
      }}
    />
  );
};
```

* * *

# Reference

## Methods [​](https://www.remotion.dev/docs/easing\#methods "Direct link to Methods")

### `step0` [​](https://www.remotion.dev/docs/easing\#step0 "Direct link to step0")

```

jsx

static step0(n): number
```

A stepping function, returns 1 for any positive value of `n`.

* * *

### `step1` [​](https://www.remotion.dev/docs/easing\#step1 "Direct link to step1")

```

jsx

static step1(n): number
```

A stepping function, returns 1 if `n` is greater than or equal to 1.

* * *

### `linear` [​](https://www.remotion.dev/docs/easing\#linear "Direct link to linear")

```

jsx

static linear(t): number
```

A linear function, `f(t) = t`. Position correlates to elapsed time one to one.

[http://cubic-bezier.com/#0,0,1,1](http://cubic-bezier.com/#0,0,1,1)

* * *

### `ease` [​](https://www.remotion.dev/docs/easing\#ease "Direct link to ease")

```

jsx

static ease(t): number
```

A basic inertial interaction, similar to an object slowly accelerating to speed.

[http://cubic-bezier.com/#.42,0,1,1](http://cubic-bezier.com/#.42,0,1,1)

* * *

### `quad` [​](https://www.remotion.dev/docs/easing\#quad "Direct link to quad")

```

jsx

static quad(t): number
```

A quadratic function, `f(t) = t * t`. Position equals the square of elapsed time.

[http://easings.net/#easeInQuad](http://easings.net/#easeInQuad)

* * *

### `cubic` [​](https://www.remotion.dev/docs/easing\#cubic "Direct link to cubic")

```

jsx

static cubic(t): number
```

A cubic function, `f(t) = t * t * t`. Position equals the cube of elapsed time.

[http://easings.net/#easeInCubic](http://easings.net/#easeInCubic)

* * *

### `poly()` [​](https://www.remotion.dev/docs/easing\#poly "Direct link to poly")

```

jsx

static poly(n): (t) => number
```

A power function. Position is equal to the Nth power of elapsed time.

n = 4: [http://easings.net/#easeInQuart](http://easings.net/#easeInQuart) n = 5: [http://easings.net/#easeInQuint](http://easings.net/#easeInQuint)

* * *

### `sin` [​](https://www.remotion.dev/docs/easing\#sin "Direct link to sin")

```

jsx

static sin(t): number
```

A sinusoidal function.

[http://easings.net/#easeInSine](http://easings.net/#easeInSine)

* * *

### `circle` [​](https://www.remotion.dev/docs/easing\#circle "Direct link to circle")

```

jsx

static circle(t): number
```

A circular function.

[http://easings.net/#easeInCirc](http://easings.net/#easeInCirc)

* * *

### `exp` [​](https://www.remotion.dev/docs/easing\#exp "Direct link to exp")

```

jsx

static exp(t): number
```

An exponential function.

[http://easings.net/#easeInExpo](http://easings.net/#easeInExpo)

* * *

### `elastic()` [​](https://www.remotion.dev/docs/easing\#elastic "Direct link to elastic")

```

jsx

static elastic(bounciness): (t) =>  number
```

A basic elastic interaction, similar to a spring oscillating back and forth.

Default bounciness is 1, which overshoots a little bit once. 0 bounciness doesn't overshoot at all, and bounciness of N > 1 will overshoot about N times.

[http://easings.net/#easeInElastic](http://easings.net/#easeInElastic)

* * *

### `back()` [​](https://www.remotion.dev/docs/easing\#back "Direct link to back")

```

jsx

static back(s): (t) => number
```

Use with `Animated.parallel()` to create a basic effect where the object animates back slightly as the animation starts.

* * *

### `bounce` [​](https://www.remotion.dev/docs/easing\#bounce "Direct link to bounce")

```

jsx

static bounce(t): number
```

Provides a basic bouncing effect.

[http://easings.net/#easeInBounce](http://easings.net/#easeInBounce)

See an example of how you might use it below

```

jsx

interpolate(0.5, [0, 1], [0, 1], {
  easing: Easing.bounce,
});
```

* * *

### `bezier()` [​](https://www.remotion.dev/docs/easing\#bezier "Direct link to bezier")

```

jsx

static bezier(x1, y1, x2, y2) => (t): number
```

Provides a cubic bezier curve, equivalent to CSS Transitions' `transition-timing-function`.

A useful tool to visualize cubic bezier curves can be found at [http://cubic-bezier.com/](http://cubic-bezier.com/)

```

jsx

interpolate(0.5, [0, 1], [0, 1], {
  easing: Easing.bezier(0.5, 0.01, 0.5, 1),
});
```

* * *

### `in(easing)` [​](https://www.remotion.dev/docs/easing\#ineasing "Direct link to ineasing")

```

jsx

static in(easing: (t: number) => number): (t: number) => number;
```

Runs an easing function forwards.

```

jsx

{
  easing: Easing.in(Easing.ease);
}
```

* * *

### `out()` [​](https://www.remotion.dev/docs/easing\#out "Direct link to out")

```

jsx

static out(easing: (t: number) => number): (t: number) => number;
```

Runs an easing function backwards.

```

jsx

{
  easing: Easing.out(Easing.ease);
}
```

* * *

### `inOut()` [​](https://www.remotion.dev/docs/easing\#inout "Direct link to inout")

```

jsx

static inOut(easing: (t: number) => number): (t: number) => number;
```

```

jsx

{
  easing: Easing.inOut(Easing.ease);
}
```

Makes any easing function symmetrical. The easing function will run forwards for half of the duration, then backwards for the rest of the duration.

## Credits [​](https://www.remotion.dev/docs/easing\#credits "Direct link to Credits")

The Easing API is the exact same as the one from [React Native](https://reactnative.dev/docs/easing) and the documentation has been copied over. Credit goes to them for this excellent API.

## See also [​](https://www.remotion.dev/docs/easing\#see-also "Direct link to See also")

- [Source code for this helper](https://github.com/remotion-dev/remotion/blob/main/packages/core/src/easing.ts)

CONTRIBUTORS

[![kaf-lamed-beyt](https://github.com/kaf-lamed-beyt.png)\\
\\
**kaf-lamed-beyt** \\
\\
Improved function signatures](https://github.com/kaf-lamed-beyt)

- [Predefined animations](https://www.remotion.dev/docs/easing#predefined-animations)
- [Standard functions](https://www.remotion.dev/docs/easing#standard-functions)
- [Additional functions](https://www.remotion.dev/docs/easing#additional-functions)
- [Example](https://www.remotion.dev/docs/easing#example)
- [Methods](https://www.remotion.dev/docs/easing#methods)
  - [`step0`](https://www.remotion.dev/docs/easing#step0)
  - [`step1`](https://www.remotion.dev/docs/easing#step1)
  - [`linear`](https://www.remotion.dev/docs/easing#linear)
  - [`ease`](https://www.remotion.dev/docs/easing#ease)
  - [`quad`](https://www.remotion.dev/docs/easing#quad)
  - [`cubic`](https://www.remotion.dev/docs/easing#cubic)
  - [`poly()`](https://www.remotion.dev/docs/easing#poly)
  - [`sin`](https://www.remotion.dev/docs/easing#sin)
  - [`circle`](https://www.remotion.dev/docs/easing#circle)
  - [`exp`](https://www.remotion.dev/docs/easing#exp)
  - [`elastic()`](https://www.remotion.dev/docs/easing#elastic)
  - [`back()`](https://www.remotion.dev/docs/easing#back)
  - [`bounce`](https://www.remotion.dev/docs/easing#bounce)
  - [`bezier()`](https://www.remotion.dev/docs/easing#bezier)
  - [`in(easing)`](https://www.remotion.dev/docs/easing#ineasing)
  - [`out()`](https://www.remotion.dev/docs/easing#out)
  - [`inOut()`](https://www.remotion.dev/docs/easing#inout)
- [Credits](https://www.remotion.dev/docs/easing#credits)
- [See also](https://www.remotion.dev/docs/easing#see-also)

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