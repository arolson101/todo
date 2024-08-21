import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { type AuthConfig, initAuthConfig } from '@hono/auth-js'
import { type Context } from 'hono'
import { db } from '@server/db/db'
import * as tables from '@server/db/schema/auth'
import type { Environment } from '@server/env'
import { providers } from './providers'

function getAuthConfig(c: Context<Environment>): AuthConfig {
  return {
    adapter: DrizzleAdapter(db, {
      usersTable: tables.users,
      accountsTable: tables.accounts,
      sessionsTable: tables.sessions,
      verificationTokensTable: tables.verificationTokens,
      authenticatorsTable: tables.authenticators,
    }),
    secret: c.env.AUTH_SECRET,
    providers,
    experimental: { enableWebAuthn: true },
    pages: {
      signIn: '/signin'
    }
  }
}

export const authConfig = initAuthConfig(getAuthConfig)
