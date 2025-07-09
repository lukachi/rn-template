module.exports = (api) => {
  api.cache(true)
  return {
    presets: [
      ['babel-preset-expo', {
        jsxRuntime: 'automatic',
        jsxImportSource: "nativewind"
      }],
      'nativewind/babel',
    ],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@assets': './assets',
            '@modules': './modules',
            '@env': './src/core/env.js',

            'crypto': 'crypto-browserify',
            'stream': 'readable-stream',
            '@iden3/js-crypto': '@iden3/js-crypto/dist/browser/esm/index.js',
            '@iden3/js-merkletree': '@iden3/js-merkletree/dist/browser/esm/index.js',
          },
          extensions: [
            '.ios.ts',
            '.android.ts',
            '.ts',
            '.ios.tsx',
            '.android.tsx',
            '.tsx',
            '.jsx',
            '.js',
            '.json',
          ],
        },
      ],
      ['react-native-worklets-core/plugin'],
      // NOTE: this is only necessary if you are using reanimated for animations
      ['react-native-reanimated/plugin', {
        processNestedWorklets: true
      }],
    ],
  }
}
