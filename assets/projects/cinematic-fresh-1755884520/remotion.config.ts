import { Config } from '@remotion/cli/config';

// Set the image format for videos
Config.setVideoImageFormat('jpeg');

// Allow output files to be overwritten
Config.setOverwriteOutput(true);

// Disable cache to avoid stale content
Config.setCachingEnabled(false);

// Webpack overrides to handle Node.js modules and fix HMR
Config.overrideWebpackConfig((config) => {
  return {
    ...config,
    cache: false, // Completely disable webpack cache
    resolve: {
      ...config.resolve,
      fallback: {
        ...config.resolve?.fallback,
        // These Node.js modules aren't needed in the browser
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        buffer: false,
        util: false,
        assert: false,
        process: false,
      },
    },
  };
});