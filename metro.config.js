// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const { mergeConfig } = require('metro-config');
const { withNativeWind } = require('nativewind/metro');

/**
 *
 * @param {InputConfigT} config
 * @returns {InputConfigT}
 */
const withSvgTransformer = (config) => {
  const { resolver, transformer } = config;

  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve("react-native-svg-transformer")
  };
  config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...resolver.sourceExts, "svg"]
  };

  return config;
}

const withCircomFilesAndPolyfills = (config) => {
  const { resolver } = config

  config.resolver = {
    ...resolver,
    assetExts: [
      ...resolver.assetExts,
      'wasm',
      'zkey',
      'dat',
      'pem',
    ],
    extraNodeModules: {
      crypto: require.resolve('react-native-crypto'),
      // buffer: require.resolve('buffer/'),
      fs: require.resolve('buffer/'),
      http: require.resolve('stream-http'),
      os: require.resolve('os-browserify/browser.js'),
      constants: require.resolve('constants-browserify'),
      path: require.resolve('path-browserify'),
      stream: require.resolve('readable-stream'),
    },
  }

  return config
}

module.exports = (() => {
  let config = getDefaultConfig(__dirname)

  return mergeConfig(
    withSvgTransformer(config),
    withCircomFilesAndPolyfills(config),
    withNativeWind(config, { input: './src/theme/global.css' })
  )
})()
