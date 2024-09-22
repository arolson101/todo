import { _createClient, createClient } from '@libsql/client-wasm'
import { migrate } from 'drizzle-orm/expo-sqlite/migrator'
import { drizzle } from 'drizzle-orm/libsql'
import migrations from './drizzle/migrations'
import * as schema from './schema'

async function main() {
  const client = await createClient({ url: 'file::localStorage:' })
  const db = drizzle(client, { schema })

  // HACK- migrate from `drizzle-orm/libsql/migrator` uses 'node:fs', so use the one from expo-sqlite instead
  await migrate(db as any, migrations)

  const result = await db.select().from(schema.users).all()
  console.log(result)
}

main().catch(error => {
  console.log(error)
})
