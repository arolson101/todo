import { authHandler } from '@hono/auth-js'
import { initAuthConfig } from '@hono/auth-js'
import { trpcServer } from '@hono/trpc-server'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { trpcEndpoint } from '~shared/identity'
import { appRouter } from './api'
import { createTRPCContext } from './api/trpc'
import { getAuthConfig } from './auth/config'
import { type Environment } from './env'

const app = new Hono<Environment>()

if (process.env.NODE_ENV === 'development') {
  app.use('*', logger())
}

app.use('*', initAuthConfig(getAuthConfig))
app.use('/api/auth/*', authHandler())

app.use(
  `${trpcEndpoint}/*`,
  trpcServer({
    endpoint: trpcEndpoint,
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
