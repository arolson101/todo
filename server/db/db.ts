import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import { env } from '~server/env'
import * as schema from './schema'

async function runMigrations() {
  console.log('applying migrations...')
  const migrationClient = postgres(env.DATABASE_URL, { max: 1 })
  await migrate(drizzle(migrationClient), { migrationsFolder: './drizzle' })
  await migrationClient.end()
  console.log('migrations applied')
}

// await runMigrations()

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined
}

export const conn = globalForDb.conn ?? postgres(env.DATABASE_URL)
if (env.NODE_ENV !== 'production') globalForDb.conn = conn

export const db = drizzle(conn, { schema })
export type DbType = typeof db
