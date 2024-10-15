import { authHandler, initAuthConfig } from '@hono/auth-js'
import { type Context, Hono } from 'hono'
import { logger } from 'hono/logger'
import { stream, streamSSE, streamText } from 'hono/streaming'
import type { BlankEnv, BlankInput } from 'hono/types'
import changes from './api/changes'
import { getAuthConfig } from './auth/config'
import { dbMiddleware } from './db/db-middleware'
import { env, type Environment, envMiddleware } from './env'

const app = new Hono()

if (env.NODE_ENV === 'development') {
  app.use('*', logger())
}

app.use(
  '*', // middleware must be in this order
  envMiddleware,
  await dbMiddleware(env),
  initAuthConfig(getAuthConfig),
)
app.use('/api/auth/*', authHandler())

const apiRoute = app.route('/api/changes', changes)

export default app
export type AppType = typeof apiRoute
