import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import app from './hono'

app.use('*', serveStatic({ root: './public' }))
app.use('*', serveStatic({ path: './public/index.html' }))

serve({
  fetch: app.fetch,
  port: 3001,
})
