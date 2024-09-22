import { compress } from 'bun-compression'
import { serveStatic } from 'hono/bun'
import app from './hono'

// https://github.com/oven-sh/bun/issues/1723
// import { compress } from 'hono/compress'

app.use(compress())
app.use('*', serveStatic({ root: './public' }))
app.use('*', serveStatic({ path: './public/index.html' }))

export default app

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason)
})
