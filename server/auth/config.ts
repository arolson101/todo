import { Auth, type AuthConfig, createActionURL, setEnvDefaults } from '@auth/core'
import CredentialsProvider from '@auth/core/providers/credentials'
import type { Session } from '@auth/core/types'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
// TODO: stop using universal-middleware and directly integrate server middlewares instead. (Bati generates boilerplates that use universal-middleware https://github.com/magne4000/universal-middleware to make Bati's internal logic easier. This is temporary and will be removed soon.)
import type { Get, UniversalHandler, UniversalMiddleware } from '@universal-middleware/core'
import { db } from '~server/db/db'
import * as tables from '~server/db/schema/auth'
import { env } from '~server/env'
import { providers } from './providers'

export const authConfig = {
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
}

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
export const authjsSessionMiddleware: Get<[], UniversalMiddleware> = () => async (request, context) => {
  try {
    return {
      ...context,
      session: await getSession(request, authConfig),
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
export const authjsHandler = (() => async (request) => {
  return Auth(request, authConfig)
}) satisfies Get<[], UniversalHandler>
