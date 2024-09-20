import CopyBunPlugin from '@takinabradley/copybunplugin'
import type { BuildConfig, BuildOutput } from 'bun'
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

function report(out: BuildOutput) {
  console.log(`${out.success ? '✅' : '❌'} built ${out.outputs[0].path}`)
  for (const log of out.logs) {
    switch (log.level) {
      case 'debug':
        console.debug(log.message)
        break
      case 'info':
        console.log(log.message)
        break
      case 'warning':
        console.warn(log.message)
        break
      case 'error':
        console.error(log.message)
        break
      case 'verbose':
        console.log(log.message)
        break
    }
  }
}

const bun = await Bun.build({
  ...config,
  entrypoints: ['./server/serve-bun.ts'],
  target: 'bun',
})
report(bun)

const node = await Bun.build({
  ...config,
  entrypoints: ['./server/serve-node.ts'],
  target: 'node',
})
report(node)
