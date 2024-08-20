import { trpcServer } from '@hono/trpc-server'
import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import { logger } from 'hono/logger'
import { appRouter } from './api'
import { createTRPCContext } from './api/trpc'
import { authConfig, authHandler, verifyAuth } from './auth'
import { type Environment } from './env'

const app = new Hono<Environment>()

app.use('*', logger())

app.use('*', authConfig)
app.use('/api/auth/*', authHandler())

app.use(
  '/api/trpc/*',
  trpcServer({
    endpoint: '/api/trpc',
    router: appRouter,
    createContext: (_opts, c) => createTRPCContext(c),
  }),
)

app.use('*', serveStatic({ root: './public' }))
app.use('*', serveStatic({ path: './public/index.html' }))

export default app
