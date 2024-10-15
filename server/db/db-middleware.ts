import { createMiddleware } from 'hono/factory'
import type { Environment } from '~server/env'
import { connectDb, type DbType } from './db'

declare module 'hono' {
  interface ContextVariableMap {
    db: DbType
  }
}

export const dbMiddleware = async (env: Environment) => {
  const db = await connectDb(env)

  return createMiddleware(async (c, next) => {
    c.set('db', db)
    await next()
  })
}
