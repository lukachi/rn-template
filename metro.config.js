// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const { mergeConfig } = require('@react-native/metro-config');
const { withNativeWind: _withNativewind } = require('nativewind/metro');
const {
  wrapWithReanimatedMetroConfig,
} = require('react-native-reanimated/metro-config');

/**
 *
 * @param {InputConfigT} config
 * @returns {InputConfigT}
 */
const withSvgTransformer = (config) => {
  const { resolver, transformer } = config;

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

const withNativeWind = (config) => {
  // Override resolver to handle missing nativewind/jsx-dev-runtime
  const originalResolver = config.resolver.resolverMainFields || ['react-native', 'browser', 'main'];

  config.resolver = {
    ...config.resolver,
    resolverMainFields: originalResolver,
    resolveRequest: (context, moduleName, platform) => {
      if (moduleName === 'nativewind/jsx-dev-runtime') {
        return {
          filePath: require.resolve('react/jsx-dev-runtime'),
          type: 'sourceFile',
        };
      }
      // Use the default resolver for all other modules
      return context.resolveRequest(context, moduleName, platform);
    },
  };
  return _withNativewind(config);
}

module.exports = (() => {
  let config = getDefaultConfig(__dirname)

  return mergeConfig(
    withSvgTransformer(config),
    wrapWithReanimatedMetroConfig(config),
    withNativeWind(config)
  )
})()
