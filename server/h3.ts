import { createApp, createRouter, defineEventHandler, fromNodeMiddleware, toWebHandler } from 'h3'
import { createServer as createViteServer } from 'vite'

const app = createApp()
const router = createRouter()
app.use(router)

const vite = await createViteServer({
  server: { middlewareMode: true },
  // appType: 'custom', // don't include Vite's default HTML handling middlewares
})

app.use(fromNodeMiddleware(vite.middlewares))
// router.get(
//   '/',
//   defineEventHandler((event) => {
//     return { message: '⚡️ Tadaa!' }
//   }),
// )

const server = Bun.serve({
  port: 3000,
  fetch: toWebHandler(app) as any,
})

console.log(`h3 listening on ${server.url}`)
