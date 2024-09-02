import { createTRPCClient, createTRPCReact, loggerLink, unstable_httpBatchStreamLink } from '@trpc/react-query'
import { type inferRouterInputs, type inferRouterOutputs } from '@trpc/server'
import { Platform } from 'react-native'
import SuperJSON from 'superjson'
import type { AppRouter } from '~server/api'

export { AppRouter }

export const api = createTRPCReact<AppRouter>()

/**
 * Inference helper for inputs.
 *
 * @example type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<AppRouter>

/**
 * Inference helper for outputs.
 *
 * @example type HelloOutput = RouterOutputs['example']['hello']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>

export const getTrpcLinks = () => [
  loggerLink({
    enabled: op => process.env.NODE_ENV === 'development' || (op.direction === 'down' && op.result instanceof Error),
  }),
  unstable_httpBatchStreamLink({
    transformer: SuperJSON,
    url: getBaseUrl() + '/api/trpc',
  }),
]

function getBaseUrl() {
  const baseUrl = Platform.select({ native: process.env.BASE_URL })
  if (baseUrl) return baseUrl

  if (typeof window !== 'undefined') return window.location.origin
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return `http://localhost:${process.env.PORT ?? 3000}`
}

export const trpc = createTRPCClient<AppRouter>({
  links: getTrpcLinks(),
})
