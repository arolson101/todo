import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import vike from 'vike/plugin'
import { defineConfig } from 'vite'
import { createHtmlPlugin } from 'vite-plugin-html'
import { sri } from 'vite-plugin-sri3'
import { htmlTitle } from './shared/identity'

const projectRootDir = resolve(__dirname)

// https://vitejs.dev/config/
export default defineConfig({
  // root: '.',
  plugins: [
    // vike(),
    TanStackRouterVite(),
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
        data: {
          title: htmlTitle,
        },
      },
    }),
    sri(),
  ],
  resolve: {
    alias: {
      '~': resolve(projectRootDir, 'app'),
      '~shared': resolve(projectRootDir, 'shared'),
      '~server': resolve(projectRootDir, 'server'),
    },
  },
  define: {
    process: {
      env: {},
    },
  },
  build: {
    outDir: './dist/public',
    emptyOutDir: true,
  },
})
