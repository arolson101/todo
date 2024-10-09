import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { type AuthConfig, initAuthConfig } from '@hono/auth-js'
import { db } from '~server/db/db'
import * as tables from '~server/db/schema/auth'
import { env } from '~server/env'
import { providers } from './providers'

const getAuthConfig = () =>
  ({
    adapter: DrizzleAdapter(db, {
      usersTable: tables.users,
      accountsTable: tables.accounts,
      sessionsTable: tables.sessions,
      verificationTokensTable: tables.verificationTokens,
      authenticatorsTable: tables.authenticators,
    }),
    redirectProxyUrl: `${env.BASE_URL}/api/auth`,
    secret: env.AUTH_SECRET,
    providers,
    trustHost: true,
    experimental: { enableWebAuthn: true },
    pages: {
      signIn: '/signin',
      signOut: '/signout',
    },
    logger: {
      debug: console.log,
      warn: console.warn,
      error: console.error,
    },
    // debug: c.env.NODE_ENV === 'development',
  }) satisfies AuthConfig

export const authConfig = initAuthConfig(getAuthConfig)
