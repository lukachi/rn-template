/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./src/app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        inter: [
          'PlaywriteCU-ExtraLight',
          'PlaywriteCU-Light',
          'PlaywriteCU-Regular',
          'PlaywriteCU-Thin',
          'Roboto-Black',
          'Roboto-BlackItalic',
          'Roboto-Bold',
          'Roboto-BoldItalic',
          'Roboto-Italic',
          'Roboto-Light',
          'Roboto-LightItalic',
          'Roboto-Medium',
          'Roboto-MediumItalic',
          'Roboto-Regular',
          'Roboto-Thin',
          'Roboto-ThinItalic',
        ],
      },
    },
  },
  plugins: [],
}
