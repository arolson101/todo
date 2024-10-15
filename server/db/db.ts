import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import { env, type Environment } from '~server/env'
import * as schema from './schema'

async function runMigrations(env: Environment) {
  console.log('applying migrations...')
  const migrationClient = postgres(env.DATABASE_URL, { max: 1 })
  await migrate(drizzle(migrationClient), { migrationsFolder: './drizzle' })
  await migrationClient.end()
  console.log('migrations applied')
}

export async function connectDb(env: Environment) {
  // await runMigrations(env)

  const conn = postgres(env.DATABASE_URL)
  const db = drizzle(conn, {
    schema, //
    // logger: env.NODE_ENV !== 'production',
  })

  return db
}

export type DbType = Awaited<ReturnType<typeof connectDb>>
