import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { type AuthConfig, initAuthConfig } from '@hono/auth-js'
import { type Context } from 'hono'
import { db } from '~server/db/db'
import * as tables from '~server/db/schema/auth'
import type { Environment } from '~server/env'
import { providers } from './providers'

const getAuthConfig = (c: Context<Environment>) =>
  ({
    adapter: DrizzleAdapter(db, {
      usersTable: tables.users,
      accountsTable: tables.accounts,
      sessionsTable: tables.sessions,
      verificationTokensTable: tables.verificationTokens,
      authenticatorsTable: tables.authenticators,
    }),
    redirectProxyUrl: `${c.env.BASE_URL}/api/auth`,
    secret: c.env.AUTH_SECRET,
    providers,
    experimental: { enableWebAuthn: true },
    pages: {
      signIn: '/signin',
      signOut: '/signout',
    },
    // debug: c.env.NODE_ENV === 'development',
  }) satisfies AuthConfig

export const authConfig = initAuthConfig(getAuthConfig)
