const reactNativeReactBridgeTransformer = require('react-native-react-bridge/lib/plugin')
const svgTransformer = require('react-native-svg-transformer')

module.exports.transform = function ({ src, filename, options }) {
  if (filename.endsWith('.svg')) {
    return svgTransformer.transform({ src, filename, options })
  } else {
    return reactNativeReactBridgeTransformer.transform({
      src,
      filename,
      options,
    })
  }
}
