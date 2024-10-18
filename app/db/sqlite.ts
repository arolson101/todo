import { createClient } from '@libsql/client-wasm'
import { drizzle } from 'drizzle-orm/libsql'
import migrations from './drizzle/migrations'
import { migrate } from './migrator'
import * as schema from './schema'

const client = createClient({ url: 'file::localStorage:' })
export const appDb = drizzle(client, { schema })
export type AppDbType = typeof appDb

await migrate(appDb, migrations) //
  .catch((reason) => {
    console.error(reason.cause, reason)
  })
