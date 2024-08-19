await Bun.build({
  entrypoints: ['./server/index.ts'],
  outdir: './dist',
  minify: true,
  sourcemap: 'linked',
})
