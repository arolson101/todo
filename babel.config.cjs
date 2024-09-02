module.exports = {
  presets: ['module:@react-native/babel-preset', 'nativewind/babel'],
  plugins: [
    ['tsconfig-paths-module-resolver'],
    [
      'module:react-native-dotenv',
      {
        allowlist: ['BASE_URL'], // see @env.d.ts
      },
    ],
  ],
}
