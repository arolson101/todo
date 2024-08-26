import { authHandler } from '@hono/auth-js'
import { trpcServer } from '@hono/trpc-server'
import { renderTrpcPanel } from '@metamorph/trpc-panel'
import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import { logger } from 'hono/logger'
import { appRouter } from './api'
import { createTRPCContext } from './api/trpc'
import { authConfig } from './auth/config'
import { env, type Environment } from './env'

export { authHandler, verifyAuth } from '@hono/auth-js'

const app = new Hono<Environment>()

if (env.NODE_ENV === 'development') {
  app.use('*', logger())
}

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

if (env.NODE_ENV === 'development') {
  app.use('/api/panel', async (c) =>
    c.html(renderTrpcPanel(appRouter, { url: 'http://localhost:3000/api/trpc', transformer: 'superjson' })),
  )
}

app.use('*', serveStatic({ root: './public' }))
app.use('*', serveStatic({ path: './public/index.html' }))

export default app
