// https://github.com/oven-sh/bun/issues/1723
// import 'compression-streams-polyfill'
import { serveStatic } from 'hono/bun'
// import { compress } from 'hono/compress'
import app from './hono'

// app.use(compress())
app.use('*', serveStatic({ root: './public' }))
app.use('*', serveStatic({ path: './public/index.html' }))

export default app

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason)
})
