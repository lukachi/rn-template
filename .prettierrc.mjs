/** @type {import("prettier").Options} */
const config = {
  tabWidth: 2,
  printWidth: 100,
  semi: false,
  singleQuote: true,
  jsxSingleQuote: true,
  arrowParens: 'avoid',
  trailingComma: 'all',

  useTabs: false,
  bracketSpacing: true,
  bracketSameLine: false,
  endOfLine: 'auto',
  quoteProps: 'as-needed',
  embeddedLanguageFormatting: 'auto',
  htmlWhitespaceSensitivity: 'css',
  plugins: ['prettier-plugin-tailwindcss'],
}

export default config
