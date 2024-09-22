import type { MigrationMeta } from 'drizzle-orm/migrator'
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core'
import * as schema from './schema'

// a type that both satisfies both web and react-native databases
export type SqliteType = BaseSQLiteDatabase<'async', any, typeof schema>

interface MigrationConfig {
  journal: {
    entries: { idx: number; when: number; tag: string; breakpoints: boolean }[]
  }
  migrations: Record<string, string>
}

export function readMigrationFiles({ journal, migrations }: MigrationConfig): MigrationMeta[] {
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
