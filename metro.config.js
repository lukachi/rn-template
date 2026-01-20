// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config')
const { mergeConfig } = require('@react-native/metro-config')
const { withUniwindConfig } = require('uniwind/metro')
const { wrapWithReanimatedMetroConfig } = require('react-native-reanimated/metro-config')

/**
 *
 * @param {InputConfigT} config
 * @returns {InputConfigT}
 */
const withSvgTransformer = config => {
  const { resolver, transformer } = config

  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer/expo'),
  }
  config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...resolver.sourceExts, 'svg'],
  }

  return config
}

const withSqlFiles = config => {
  const newCfg = { ...config }
  newCfg.resolver.sourceExts.push('sql')

  return newCfg
}

module.exports = (() => {
  let config = getDefaultConfig(__dirname)

  return mergeConfig(
    withSvgTransformer(config),
    wrapWithReanimatedMetroConfig(config),
    withSqlFiles(config),
    withUniwindConfig(config, {
      cssEntryFile: './global.css',
      dtsFile: './src/uniwind-types.d.ts',
    }),
  )
})()
