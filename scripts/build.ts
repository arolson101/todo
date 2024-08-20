import CopyBunPlugin from '@takinabradley/copybunplugin'
import path from 'path'

const projectDir = (...paths: string[]) => path.join(import.meta.dir, '..', ...paths).replaceAll('\\', '/') + '/'

await Bun.build({
  entrypoints: ['./server/index.ts'],
  target: 'bun',
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
})
