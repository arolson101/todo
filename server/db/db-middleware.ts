import { createMiddleware } from 'hono/factory'
import { connectDb, type DbType } from './db'

declare module 'hono' {
  interface ContextVariableMap {
    db: DbType
  }
}

export const dbMiddleware = createMiddleware(async (c, next) => {
  const env = c.get('env')
  const db = await connectDb(env)
  c.set('db', db)
  await next()
})
