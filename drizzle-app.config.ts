import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './app/db/schema/index.ts',
  out: './app/db/drizzle',
  dialect: 'sqlite', // 'postgresql' | 'mysql' | 'sqlite'
  driver: 'expo',
})
