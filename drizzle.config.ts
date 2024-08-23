import { defineConfig } from 'drizzle-kit'
import { env } from '~server/env'

export default defineConfig({
  schema: './server/db/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql', // 'postgresql' | 'mysql' | 'sqlite'
  dbCredentials: {
    url: env.DATABASE_URL,
  },
})
