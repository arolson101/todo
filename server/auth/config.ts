import { Auth, type AuthConfig, createActionURL, setEnvDefaults } from '@auth/core'
import Github from '@auth/core/providers/github'
import type { Session } from '@auth/core/types'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import type { Get, UniversalHandler, UniversalMiddleware } from '@universal-middleware/core'
import { db } from '~server/db/db'
import * as tables from '~server/db/schema/auth'
import { env } from '~server/env'

export const authjsConfig = (endpoint: string) =>
  ({
    // basePath: endpoint,
    basePath: "/api/auth",
    adapter: DrizzleAdapter(db, {
      usersTable: tables.users,
      accountsTable: tables.accounts,
      sessionsTable: tables.sessions,
      verificationTokensTable: tables.verificationTokens,
      authenticatorsTable: tables.authenticators,
    }),
    // redirectProxyUrl: `${env.BASE_URL}${endpoint}`,
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
      // debug: console.log,
      warn: console.warn,
      error: console.error,
    },
    // debug: env.NODE_ENV === 'development',
  }) satisfies AuthConfig

/**
 * Retrieve Auth.js session from Request
 */
export async function getSession(req: Request, config: Omit<AuthConfig, 'raw'>): Promise<Session | null> {
  setEnvDefaults(process.env, config)
  const requestURL = new URL(req.url)
  const url = createActionURL('session', requestURL.protocol, req.headers, process.env, config)

  const response = await Auth(new Request(url, { headers: { cookie: req.headers.get('cookie') ?? '' } }), config)

  const { status = 200 } = response

  const data = await response.json()

  if (!data || !Object.keys(data).length) return null
  if (status === 200) return data
  throw new Error(data.message)
}

/**
 * Add Auth.js session to context
 * @link {@see https://authjs.dev/getting-started/session-management/get-session}
 **/
export const authjsSessionMiddleware: Get<[endpoint: string], UniversalMiddleware> =
  (endpoint) => async (request, context) => {
    try {
      return {
        ...context,
        session: await getSession(request, authjsConfig(endpoint)),
      }
    } catch (error) {
      console.debug('authjsSessionMiddleware:', error)
      return {
        ...context,
        session: null,
      }
    }
  }

/**
 * Auth.js route
 * @link {@see https://authjs.dev/getting-started/installation}
 **/
export const authjsHandler = ((endpoint) => async (request) => {
  return Auth(request, authjsConfig(endpoint))
}) satisfies Get<[endpoint: string], UniversalHandler>
