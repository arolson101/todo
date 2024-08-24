import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { sri } from 'vite-plugin-sri3'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tsconfigPaths(),
    TanStackRouterVite(),
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
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
