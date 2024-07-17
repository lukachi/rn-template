import {
  colors,
  fontFamily,
  typography,
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
    "./src/ui/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors,
      fontFamily,
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
