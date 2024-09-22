import { open } from '@op-engineering/op-sqlite'
import { drizzle } from 'drizzle-orm/op-sqlite'
import { dbFileName } from '~shared/identity'
import * as schema from './schema'
import { SqliteType } from './sqlite-type'

const opsqlite = open({
  name: dbFileName,
})

if ((globalThis as any).opsqlite) {
  ;(globalThis as any).opsqlite.close()
}
;(globalThis as any).opsqlite = opsqlite

export const db: SqliteType = drizzle(opsqlite, { schema })
