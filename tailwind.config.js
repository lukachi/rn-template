import {
  animation,
  borderRadius,
  colors,
  fontFamily,
  typography,
  keyframes,
  spacing,
  cssVars,
} from './src/theme/config'
import plugin from "tailwindcss/plugin";

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  // NOTE: Update this to include the paths to all of your component files.
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/theme/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors,
      fontFamily,
      borderRadius,
      spacing,
      keyframes,
      animation,
    },
  },
  plugins: [
    ({addBase}) => addBase({
      ":root": {
        ...cssVars.light
      },
      ".dark:root": {
        ...cssVars.dark
      },
    }),

    plugin(({addUtilities}) => {
      addUtilities(typography, {
        variants: ["responsive", "hover"],
      })
    }),
  ],
}
