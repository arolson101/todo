import GitHub from '@auth/core/providers/github'
import Passkey from '@auth/core/providers/passkey'
import { type AuthConfig, authHandler, initAuthConfig, verifyAuth } from '@hono/auth-js'
import { type Context, Hono } from 'hono'
import type { Environment } from './env'

export const authConfig = initAuthConfig(getAuthConfig)

function getAuthConfig(c: Context<Environment>): AuthConfig {
  return {
    secret: c.env.AUTH_SECRET,
    providers: [Passkey({ name: 'Passkey Name' })],
    experimental: { enableWebAuthn: true },
  }
}

export { authHandler, verifyAuth }
