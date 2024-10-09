import { authHandler, verifyAuth } from '@hono/auth-js'
import { trpcServer } from '@hono/trpc-server'
import { renderTrpcPanel } from '@metamorph/trpc-panel'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { appRouter } from './api'
import { createTRPCContext } from './api/trpc'
import { authConfig } from './auth/config'
import { env, type Environment } from './env'

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
    onError(opts) {
      const { error, type, path, input, ctx, req } = opts
      console.error('Error:', error)
    },
  }),
)

// if (env.NODE_ENV === 'development') {
//   app.use('/api/panel', async (c) =>
//     c.html(renderTrpcPanel(appRouter, { url: 'http://localhost:3000/api/trpc', transformer: 'superjson' })),
//   )
// }

export default app
