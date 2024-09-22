// https://github.com/drizzle-team/drizzle-orm/blob/main/drizzle-orm/src/libsql/migrator.ts
// https://github.com/drizzle-team/drizzle-orm/blob/main/drizzle-orm/src/op-sqlite/migrator.ts
import type { MigrationMeta } from 'drizzle-orm/migrator'
import { sql } from 'drizzle-orm/sql'
import { SqliteType } from './sqlite-type'
import * as schema from './schema'
import { OPSQLiteDatabase } from 'drizzle-orm/op-sqlite'

interface MigrationConfig {
  journal: {
    entries: { idx: number; when: number; tag: string; breakpoints: boolean }[]
  }
  migrations: Record<string, string>
}

function readMigrationFiles({ journal, migrations }: MigrationConfig): MigrationMeta[] {
  const migrationQueries: MigrationMeta[] = []

  for (const journalEntry of journal.entries) {
    const query = migrations[`m${journalEntry.idx.toString().padStart(4, '0')}`]

    if (!query) {
      throw new Error(`Missing migration: ${journalEntry.tag}`)
    }

    try {
      const result = query.split('--> statement-breakpoint').map(it => {
        return it
      })

      migrationQueries.push({
        sql: result,
        bps: journalEntry.breakpoints,
        folderMillis: journalEntry.when,
        hash: '',
      })
    } catch {
      throw new Error(`Failed to parse migration: ${journalEntry.tag}`)
    }
  }

  return migrationQueries
}

export async function migrate(db: OPSQLiteDatabase<typeof schema>, config: MigrationConfig) {
  const migrations = readMigrationFiles(config)
  const migrationsTable = '__drizzle_migrations'

  const migrationTableCreate = sql`
		CREATE TABLE IF NOT EXISTS ${sql.identifier(migrationsTable)} (
			id SERIAL PRIMARY KEY,
			hash text NOT NULL,
			created_at numeric
		)
	`
  const x = await db.run(migrationTableCreate)

  const dbMigrations = await db.values<[number, string, string]>(
    sql`SELECT id, hash, created_at FROM ${sql.identifier(migrationsTable)} ORDER BY created_at DESC LIMIT 1`,
  )

  await db.transaction(async tx => {
    const lastDbMigration = dbMigrations[0] ?? undefined

    for (const migration of migrations) {
      if (!lastDbMigration || Number(lastDbMigration[2])! < migration.folderMillis) {
        for (const stmt of migration.sql) {
          await tx.run(sql.raw(stmt))
        }

        await tx.run(
          sql`INSERT INTO ${sql.identifier(
            migrationsTable,
          )} ("hash", "created_at") VALUES(${migration.hash}, ${migration.folderMillis})`,
        )
      }
    }
  })
}
