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
            '@env': './src/core/env.js',
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
      // NOTE: this is only necessary if you are using reanimated for animations
      'react-native-reanimated/plugin',
    ],
  }
}
