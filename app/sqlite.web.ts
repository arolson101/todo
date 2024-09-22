// import { createClient } from '@libsql/client';
import { _createClient, Client, createClient, ResultSet, Sqlite3Client } from '@libsql/client-wasm'
import sqlite3InitModule, { type Sqlite3Static } from '@libsql/libsql-wasm-experimental'
import { sql } from 'drizzle-orm'
// import sqlite3InitModule, { type Sqlite3Static } from '@sqlite.org/sqlite-wasm'
import { drizzle } from 'drizzle-orm/libsql'
import { migrate } from 'drizzle-orm/expo-sqlite/migrator'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

async function main() {
  const config = {
    url: 'file:local.db',
  }
  const client = await createClient(config)
  // const rs = await db.execute('SELECT * FROM users')
  // console.log(rs)

  const dz = drizzle(client, { schema: { users } })

  // migrate(dz, { journal: '', migrations: '' })

  const result = await dz.select().from(users).all()
  console.log(result)
}

main().catch(error => {
  console.log(error)
})

// const log = (...args: any[]) => {
//   console.log(...args)
// }
// const error = (...args: any[]) => {
//   console.error(...args)
// }

// const workerLog = (...args: any[]) => {
//   console.log(...args)
// }
// const workerError = (...args: any[]) => {
//   console.error(...args)
// }

const users = sqliteTable('users', {
  id: text('id'),
  textModifiers: text('text_modifiers')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  intModifiers: integer('int_modifiers', { mode: 'boolean' }).notNull().default(false),
})

// export const start = async function (sqlite3: Sqlite3Static) {
//   // log('Running SQLite3 version', sqlite3.version.libVersion)

//   const db = new sqlite3.oo1.JsStorageDb('local') // 'file:local?vfs=kvvs', 'ct')
//   const client = new Sqlite3Client(sqlite3, ':localStorage:', /*options,*/ db, 'number')

//   const dz = drizzle(client)
//   const result = await dz.select().from(users).all()
//   console.log(result)

//   // try {
//   //   log('Creating a table...')
//   //   db.exec('CREATE TABLE IF NOT EXISTS t(a,b)')
//   //   log('Insert some data using exec()...')
//   //   for (let i = 20; i <= 25; ++i) {
//   //     db.exec({
//   //       sql: 'INSERT INTO t(a,b) VALUES (?,?)',
//   //       bind: [i, i * 2],
//   //     })
//   //   }
//   //   log('Query data with exec()...')
//   //   db.exec({
//   //     sql: 'SELECT a FROM t ORDER BY a LIMIT 3',
//   //     callback: row => {
//   //       log(row)
//   //     },
//   //   })
//   // } finally {
//   db.close()
//   // }
// }

// log('Loading and initializing SQLite3 module...')
// sqlite3InitModule({
//   print: log,
//   printErr: error,
// }).then(sqlite3 => {
//   try {
//     log('Done initializing. Running demo...')
//     return start(sqlite3)
//   } catch (err) {
//     if (err instanceof Error) {
//       error(err.name, err.message)
//     }
//   }
// })

// // const worker = new Worker('/worker.js', { type: 'module' })
// // worker.onmessage = e => {
// //   e.data.type === 'log' ? workerLog(e.data.payload) : workerError(e.data.payload)
// // }
