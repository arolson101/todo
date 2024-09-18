/** @type {import('prettier').Config} */
const config = {
  plugins: [
    '@trivago/prettier-plugin-sort-imports',
    'prettier-plugin-packagejson',
    'prettier-plugin-tailwindcss', // MUST come last
  ],
  importOrder: [
    'server-only', //
    'react-native-url-polyfill/(.*)$',
    '^@core/(.*)$',
    '<THIRD_PARTY_MODULES>',
    '^@server/(.*)$',
    '^@ui/(.*)$',
    '^[./]',
    '^(.*)\\.css$',
  ],
  arrowParens: 'avoid',
  importOrderSortSpecifiers: true,
  importOrderCaseInsensitive: true,
  semi: false,
  singleQuote: true,
  jsxSingleQuote: true,
}

export default config
