import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { compress } from 'hono/compress'
import app from './hono'

app.use(compress())
app.use('*', serveStatic({ root: './public' }))
app.use('*', serveStatic({ path: './public/index.html' }))

const port = process.env.NODE_ENV !== 'production' ? 3001 : 3000

serve({
  fetch: app.fetch,
  port,
})
