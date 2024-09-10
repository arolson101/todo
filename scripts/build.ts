import CopyBunPlugin from '@takinabradley/copybunplugin'
import type { BuildConfig } from 'bun'
import path from 'path'

const projectDir = (...paths: string[]) => path.join(import.meta.dir, '..', ...paths).replaceAll('\\', '/') + '/'

const config = {
  external: [],
  outdir: './dist',
  minify: true,
  sourcemap: 'linked',
  plugins: [
    CopyBunPlugin({
      patterns: [
        {
          from: projectDir('drizzle'),
          to: projectDir('dist', 'drizzle'),
        },
        {
          from: projectDir('drizzle', 'meta'),
          to: projectDir('dist', 'drizzle', 'meta'),
        },
      ],
    }),
  ],
} satisfies Partial<BuildConfig>

await Bun.build({
  ...config,
  entrypoints: ['./server/serve-bun.ts'],
  target: 'bun',
})

await Bun.build({
  ...config,
  entrypoints: ['./server/serve-node.ts'],
  target: 'node',
})
