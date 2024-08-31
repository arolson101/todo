import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { createHtmlPlugin } from 'vite-plugin-html'
import { sri } from 'vite-plugin-sri3'
import tsconfigPaths from 'vite-tsconfig-paths'
import app from './app.json'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tsconfigPaths(),
    react({
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
    process: {
      env: {},
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
})
