import app from './app'

const server = Bun.serve({
  hostname: 'localhost',
  fetch: app.fetch,
})

console.log(`bun listening on ${server.url}`)
