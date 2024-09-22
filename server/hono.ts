import { authHandler } from '@hono/auth-js'
import { initAuthConfig } from '@hono/auth-js'
import { trpcServer } from '@hono/trpc-server'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { secureHeaders } from 'hono/secure-headers'
import { trpcEndpoint } from '~shared/identity'
import { appRouter } from './api'
import { createTRPCContext } from './api/trpc'
import { getAuthConfig } from './auth/config'
import { dbMiddleware } from './db/db-middleware'
import { env, envMiddleware } from './env'

export { authHandler, verifyAuth } from '@hono/auth-js'

const app = new Hono()
app.use(
  secureHeaders({
    // https://sqlite.org/wasm/doc/trunk/persistence.md#coop-coep
    crossOriginEmbedderPolicy: 'require-corp',
    crossOriginOpenerPolicy: 'same-origin',
  }),
)

if (env.NODE_ENV === 'development') {
  app.use('*', logger())
}

app.use(
  '*', // middleware must be in this order
  envMiddleware,
  dbMiddleware,
  initAuthConfig(getAuthConfig),
)
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
