import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { createHtmlPlugin } from 'vite-plugin-html'
import { sri } from 'vite-plugin-sri3'
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
          plugins: ['babel-plugin-react-compiler'],
        },
      }),
      createHtmlPlugin({
        minify: true,
        entry: 'app/index.tsx',
        template: 'index.html',
        inject: {
          data: app,
        },
      }),
      sri(),
    ],
    define: {
      // https://github.com/bevacqua/dragula/issues/602#issuecomment-1296313369
      global: 'window',
      __DEV__: JSON.stringify(development),
      // https://tamagui.dev/docs/intro/installation
      DEV: JSON.stringify(development),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    },
    resolve: {
      extensions,
      alias: [{ find: 'react-native', replacement: 'react-native-web' }],
    },
    optimizeDeps: {
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
    },
  }
})
