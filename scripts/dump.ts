import { execute } from '@getvim/execute'
import { env } from '@server/env'

async function main() {
  const url = new URL(env.DATABASE_URL)

  process.env.PGPASSWORD = url.password
  const backupFile = 'dump.sql'
  const database = url.pathname.substring(1) // remove '/' from beginning of path

  const cmd = `pg_dump -U ${url.username} -h ${url.hostname} -p ${url.port} -f ${backupFile} -d ${database}`
  console.log(cmd)
  await execute(cmd)
}

await main()
