import Credentials from '@auth/core/providers/credentials'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { type AuthConfig, authHandler, initAuthConfig, verifyAuth } from '@hono/auth-js'
import { type Context } from 'hono'
import { z } from 'zod'
import { db } from '@server/db/db'
import * as tables from '@server/db/schema/auth'
import type { Environment } from '@server/env'

export const authConfig = initAuthConfig(getAuthConfig)

export const credentialsSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' }) //
    .min(1, 'Email is required')
    .email('Invalid email'),
  password: z
    .string({ required_error: 'Password is required' }) //
    .min(1, 'Password is required')
    .min(8, 'Password must be more than 8 characters')
    .max(32, 'Password must be less than 32 characters'),
})

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
    providers: [
      Credentials({
        // You can specify which fields should be submitted, by adding keys to the `credentials` object.
        // e.g. domain, username, password, 2FA token, etc.
        credentials: {
          email: {},
          password: {},
        },
        authorize: async (credentials) => {
          const { email, password } = credentialsSchema.parse(credentials)

          const user = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.email, email),
          })

          if (!user) {
            // No user found, so this is their first attempt to login
            // meaning this is also the place you could do registration
            throw new Error('User not found.')
          }

          const verified = await Bun.password.verify(password, user.passwordHash ?? '')
          if (!verified) {
            throw new Error('Wrong password.')
          }

          // return user object with their profile data
          return user
        },
      }),
    ],
    experimental: { enableWebAuthn: true },
  }
}

export { authHandler, verifyAuth }
