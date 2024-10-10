import type { AuthConfig } from '@auth/core'
import Github from '@auth/core/providers/github'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import type { Context } from 'hono'
import * as tables from '~server/db/schema/auth'

export function getAuthConfig(c: Context) {
  const db = c.get('db')
  const env = c.get('env')
  return {
    adapter: DrizzleAdapter(db, {
      usersTable: tables.users,
      accountsTable: tables.accounts,
      sessionsTable: tables.sessions,
      verificationTokensTable: tables.verificationTokens,
      authenticatorsTable: tables.authenticators,
    }),
    redirectProxyUrl: `${env.BASE_URL}/api/auth`,
    secret: env.AUTH_SECRET,
    providers: [
      // Passkey({ name: 'Passkey' }),
      Github({
        clientId: env.AUTH_GITHUB_ID, //
        clientSecret: env.AUTH_GITHUB_SECRET,
      }),
      // Google,
      // Credentials({
      //   // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      //   // e.g. domain, username, password, 2FA token, etc.
      //   credentials: {
      //     email: {},
      //     password: {},
      //   },
      //   authorize: async (credentials) => {
      //     const { email, password } = credentialsSchema.parse(credentials)

      //     const user = await db.query.users.findFirst({
      //       where: (users, { eq }) => eq(users.email, email),
      //     })

      //     if (!user) {
      //       // No user found, so this is their first attempt to login
      //       // meaning this is also the place you could do registration
      //       throw new Error('User not found.')
      //     }

      //     const verified = await Bun.password.verify(password, user.passwordHash ?? '')
      //     if (!verified) {
      //       throw new Error('Wrong password.')
      //     }

      //     // return user object with their profile data
      //     return user
      //   },
      // }),
    ],
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
    // debug: env.NODE_ENV === 'development',
  } satisfies AuthConfig
}
