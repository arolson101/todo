import migrations from './drizzle/migrations'
import { migrate } from './migrator'
import * as schema from './schema'
import { db } from './sqlite'

export const migrationsPromise = migrate(db, migrations) //
  .catch(reason => {
    console.error(reason.cause, reason)
  })

export { db, schema }
