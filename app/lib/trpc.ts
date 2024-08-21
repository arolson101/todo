import { createTRPCReact, loggerLink, unstable_httpBatchStreamLink } from '@trpc/react-query'
import { type inferRouterInputs, type inferRouterOutputs } from '@trpc/server'
import SuperJSON from 'superjson'
import type { AppRouter } from '@server/api'

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
    enabled: (op) => import.meta.env.DEV || (op.direction === 'down' && op.result instanceof Error),
  }),
  unstable_httpBatchStreamLink({
    transformer: SuperJSON,
    url: getBaseUrl() + '/api/trpc',
  }),
]

function getBaseUrl() {
  if (typeof window !== 'undefined') return window.location.origin
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return `http://localhost:${process.env.PORT ?? 3000}`
}
