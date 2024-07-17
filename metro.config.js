// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

/**
 * @typedef {import('expo/metro-config').InputConfigT} InputConfigT // FIXME
 */

/**
 *
 * @param {InputConfigT} config
 * @returns {InputConfigT}
 */
const withSvgTransformer = (config) => {
  const { transformer, resolver } = config;

  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve("react-native-svg-transformer/expo")
  };
  config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...resolver.sourceExts, "svg"]
  };

  return config;
}

let config = getDefaultConfig(__dirname, { isCSSEnabled: true })

config = withSvgTransformer(config)

module.exports = withNativeWind(config, { input: './src/theme/global.css' })
