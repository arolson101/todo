import { trpcServer } from '@hono/trpc-server'
import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import { logger } from 'hono/logger'
import { appRouter } from './api'
import { type Environment } from './env'

const app = new Hono<Environment>()

app.use('*', logger())

app.use(
  '/api/trpc/*',
  trpcServer({
    endpoint: '/api/trpc',
    router: appRouter,
  }),
)

app.use('*', serveStatic({ root: './public' }))
app.use('*', serveStatic({ path: './public/index.html' }))

export default app
