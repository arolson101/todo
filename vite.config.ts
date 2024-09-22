import react from '@vitejs/plugin-react'
import { defineConfig, UserConfig } from 'vite'
import { createHtmlPlugin } from 'vite-plugin-html'
import plainText from 'vite-plugin-plain-text'
import reactNativeWeb from 'vite-plugin-react-native-web'
import { sri } from 'vite-plugin-sri3'
import topLevelAwait from 'vite-plugin-top-level-await'
import tsconfigPaths from 'vite-tsconfig-paths'
import app from './app.json'

// https://tamagui.dev/docs/intro/installation
const extensions = ['.web.tsx', '.tsx', '.web.ts', '.ts', '.web.jsx', '.jsx', '.web.js', '.js', '.css', '.json', '.mjs']

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const development = mode === 'development'
  return {
    plugins: [
      tsconfigPaths(),
      react({
        jsxRuntime: 'automatic',
        jsxImportSource: 'nativewind',
        babel: {
          // plugins: ['babel-plugin-react-compiler'],
        },
      }),
      reactNativeWeb(),
      createHtmlPlugin({
        minify: true,
        entry: 'index.web.ts',
        template: 'index.html',
        inject: {
          data: app,
        },
      }),
      topLevelAwait(),
      sri(),
      plainText(['**/*.sql'], { namedExport: false }),
    ],
    define: {},
    resolve: {
      extensions,
    },
    optimizeDeps: {
      exclude: ['@sqlite.org/sqlite-wasm', '@libsql/client-wasm'],
      esbuildOptions: {
        resolveExtensions: extensions,
        // https://github.com/vitejs/vite-plugin-react/issues/192#issuecomment-1627384670
        jsx: 'automatic',
        // need either this or the plugin below
        loader: { '.js': 'jsx' },
      },
    },
    build: {
      outDir: './dist/public',
      emptyOutDir: true,
    },
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
      },
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
      },
    },
  } satisfies UserConfig
})
