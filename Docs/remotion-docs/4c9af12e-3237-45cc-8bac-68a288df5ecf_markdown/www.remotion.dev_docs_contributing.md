[Skip to main content](https://www.remotion.dev/docs/contributing/#__docusaurus_skipToContent_fallback)

On this page

Issues and pull requests of all sorts are welcome!

For bigger projects, please coordinate with Jonny Burger ( [jonny@remotion.dev](mailto:jonny@remotion.dev), [Discord](https://remotion.dev/discord): `@jonnyburger`) to make sure your changes get merged.

Please note that since we charge for Remotion when companies are using it, this is a **commercial project**.

By sending pull requests, you agree that we can use your code changes in a commercial context.

Furthermore, also note that you **cannot redistribute** this project. Please see [LICENSE.md](https://remotion.dev/license) for what's allowed and what's not.

This project is released with a [Contributor Code of Conduct](https://remotion.dev/coc). By participating in this project you agree to abide by its terms.

## Setup [​](https://www.remotion.dev/docs/contributing/\#setup "Direct link to Setup")

[1](https://www.remotion.dev/docs/contributing/#1)

Remotion uses [`pnpm` v8.10.2](https://pnpm.io/) as the package manager for development in this repository. We recommend using Corepack so you get the same version of pnpm as we have.

```

sh

corepack enable
```

If you don't have `corepack`, install `pnpm@8.10.2` manually:

```

sh

npm i -g pnpm@8.10.2
```

Prefix with `sudo` if necessary.

The version must be `8.10.2`.

We use [Bun](https://bun.sh/) to speed up some parts of the build.

Install at least Bun 1.2.12 on your system - see [https://bun.sh/](https://bun.sh/) for instructions.

[2](https://www.remotion.dev/docs/contributing/#2)

Clone the Remotion repository:

```

sh

git clone --depth=1 https://github.com/remotion-dev/remotion.git && cd remotion
```

note

The full Git history of Remotion is large. To save time and disk space, we recommend adding `--depth=1` to only clone the most recent `main` branch.

[3](https://www.remotion.dev/docs/contributing/#3)

Install all dependencies:

```

sh

pnpm i
```

[4](https://www.remotion.dev/docs/contributing/#4)

Build the project initially:

```

sh

pnpm build
```

[5](https://www.remotion.dev/docs/contributing/#5)

Rebuild whenever a file changes:

```

sh

pnpm watch
```

[6](https://www.remotion.dev/docs/contributing/#6)

You can start making changes!

## Testing your changes [​](https://www.remotion.dev/docs/contributing/\#testing-your-changes "Direct link to Testing your changes")

You can start the Testbed using

```

sh

cd packages/example
pnpm run dev
```

You can render a test video using

```

sh

cd packages/example
pnpm exec remotion render
```

You can run tests using

```

sh

pnpm test
```

in either a subpackage to run tests for that package or in the root to run all tests.

## Running the `@remotion/player` testbed [​](https://www.remotion.dev/docs/contributing/\#running-the-remotionplayer-testbed "Direct link to running-the-remotionplayer-testbed")

You can test changes to [@remotion/player](https://remotion.dev/docs/player) by starting the Player testbed:

```

sh

cd packages/player-example
pnpm run dev
```

For information about testing Remotion components, please consult the [Testing Remotion components](https://www.remotion.dev/docs/testing) page. Issues and pull requests of all sorts are welcome!

## Running documentation [​](https://www.remotion.dev/docs/contributing/\#running-documentation "Direct link to Running documentation")

You can run the Docusaurus server that powers our docs using:

```

sh

cd packages/docs
pnpm start
```

## Running the CLI [​](https://www.remotion.dev/docs/contributing/\#running-the-cli "Direct link to Running the CLI")

You can test changes to the CLI by moving to `packages/examples` directory and using `pnpm exec` to execute the CLI:

```

sh

cd packages/examples
# Example - Get available compositions
pnpm exec remotion compositions
# Example - Render command
pnpm exec remotion render ten-frame-tester --output ../../out/video.mp4
```

## Testing Remotion Lambda [​](https://www.remotion.dev/docs/contributing/\#testing-remotion-lambda "Direct link to Testing Remotion Lambda")

In `packages/example`, there is a `runlambda.sh` script that will rebuild the code for the Lambda function, remove any deployed Lambda functions, deploy a new one and render a video.

You need to put you [AWS credentials](https://www.remotion.dev/docs/lambda/authentication) in a `.env` file of the `packages/example` directory.

```

sh

cd packages/example
sh ./runlambda.sh
```

note

This will delete any Lambda functions in your account!

## Testing Remotion Cloud Run [​](https://www.remotion.dev/docs/contributing/\#testing-remotion-cloud-run "Direct link to Testing Remotion Cloud Run")

In `packages/example`, there is a `runcloudrun.sh` script that will rebuild the code for the Cloud Run function, remove any deployed Cloud Run services, deploy a new one and render a video.

You need to put you [GCP credentials](https://www.remotion.dev/docs/cloudrun/generate-env) in a `.env` file of the `packages/example` directory.

```

sh

cd packages/example
sh ./runcloudrun.sh
```

note

This will delete any Cloud Run services in your account!

## Troubleshooting [​](https://www.remotion.dev/docs/contributing/\#troubleshooting "Direct link to Troubleshooting")

If your `pnpm build` throws errors, oftentimes it is because of caching issues. You can resolve many of these errors by running

```

ts

pnpm run clean
```

in the root directory. Make sure to beforehand kill any `pnpm watch` commands, as those might regenerate files as you clean them!

## Developing Rust parts [​](https://www.remotion.dev/docs/contributing/\#developing-rust-parts "Direct link to Developing Rust parts")

To develop the Rust parts of Remotion, see [here](https://www.remotion.dev/docs/contributing/rust).

## See also [​](https://www.remotion.dev/docs/contributing/\#see-also "Direct link to See also")

- [Implementing a new feature](https://www.remotion.dev/docs/contributing/feature)
- [Implementing a new option](https://www.remotion.dev/docs/contributing/option)
- [Writing documentation](https://www.remotion.dev/docs/contributing/docs)
- [How to take a bounty issue](https://www.remotion.dev/docs/contributing/bounty)
- [Formatting guidelines](https://www.remotion.dev/docs/contributing/formatting)
- [Authoring Remotion libraries](https://www.remotion.dev/docs/authoring-packages)

- [Setup](https://www.remotion.dev/docs/contributing/#setup)
- [Testing your changes](https://www.remotion.dev/docs/contributing/#testing-your-changes)
- [Running the `@remotion/player` testbed](https://www.remotion.dev/docs/contributing/#running-the-remotionplayer-testbed)
- [Running documentation](https://www.remotion.dev/docs/contributing/#running-documentation)
- [Running the CLI](https://www.remotion.dev/docs/contributing/#running-the-cli)
- [Testing Remotion Lambda](https://www.remotion.dev/docs/contributing/#testing-remotion-lambda)
- [Testing Remotion Cloud Run](https://www.remotion.dev/docs/contributing/#testing-remotion-cloud-run)
- [Troubleshooting](https://www.remotion.dev/docs/contributing/#troubleshooting)
- [Developing Rust parts](https://www.remotion.dev/docs/contributing/#developing-rust-parts)
- [See also](https://www.remotion.dev/docs/contributing/#see-also)