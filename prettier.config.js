/** @type {import('prettier').Config} */
const config = {
  plugins: [
    '@trivago/prettier-plugin-sort-imports',
    'prettier-plugin-tailwindcss', // MUST come last
  ],
  importOrder: [
    'server-only',
    '^@core/(.*)$',
    '<THIRD_PARTY_MODULES>',
    '^@server/(.*)$',
    '^@ui/(.*)$',
    '^[./]',
    '^(.*)\\.css$',
  ],
  importOrderSortSpecifiers: true,
  importOrderCaseInsensitive: true,
  semi: false,
  singleQuote: true,
  jsxSingleQuote: true,
}

export default config
