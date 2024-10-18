import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './app/db/schema/index.ts',
  out: './app/db/drizzle',
  dialect: 'sqlite',
  driver: 'expo', // need this so that migrations are imported into migrations.js
})
