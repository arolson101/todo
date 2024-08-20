import CopyBunPlugin from '@takinabradley/copybunplugin'

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
          from: import.meta.dir + '/../drizzle/meta/',
          to: import.meta.dir + '/../dist/drizzle/meta/',
        },
        {
          from: import.meta.dir + '/../drizzle/',
          to: import.meta.dir + '/../dist/drizzle/',
        },
      ],
    }),
  ],
})
