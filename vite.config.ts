import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { createHtmlPlugin } from 'vite-plugin-html'
import reactNativeWeb from 'vite-plugin-react-native-web'
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
      sri(),
    ],
    define: {
    },
    resolve: {
      extensions,
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
