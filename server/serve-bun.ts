import { serveStatic } from 'hono/bun'
import app from './hono'

app.use('*', serveStatic({ root: './public' }))
app.use('*', serveStatic({ path: './public/index.html' }))

export default app

process.on('unhandledRejection', (reason, promise) => {
  console.log('unhandledRejection', { reason, promise })
})
