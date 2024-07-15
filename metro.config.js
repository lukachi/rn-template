// Learn more https://docs.expo.io/guides/customizing-metro
/**
 * @type {import('expo/metro-config').MetroConfig}
 */
const { getDefaultConfig } = require('expo/metro-config')

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // [Web-only]: Enables CSS support in Metro.
  isCSSEnabled: true,
})

/** @type {import('expo/metro-config').MetroConfig} */
module.exports = (async () => {
  const {
    resolver: { sourceExts },
  } = config;

  const modifiedConfig = {
    ...config,
    resolver: {
      ...config.resolver,
      sourceExts: [...sourceExts, 'mjs'],
    },
  };

  // return withNativeWind(modifiedConfig, { input: './global.css', inlineRem: 16 });
  return modifiedConfig
})();
