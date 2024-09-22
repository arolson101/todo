import { createClient } from '@libsql/client-wasm'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema'
import { SqliteType } from './sqlite-type'

const client = createClient({ url: 'file::localStorage:' })
export const db: SqliteType = drizzle(client, { schema })
