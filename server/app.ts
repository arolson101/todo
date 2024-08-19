import { trpcServer } from '@hono/trpc-server'
import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import { logger } from 'hono/logger'
import { appRouter } from './api'

export const app = new Hono()

app.use('*', logger())

app.use(
  '/api/trpc/*',
  trpcServer({
    endpoint: '/api/trpc',
    router: appRouter,
  }),
)

app.use('*', serveStatic({ root: './frontend/dist' }))
app.use('*', serveStatic({ root: './frontend/dist/index.html' }))
