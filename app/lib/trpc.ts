import {
  createTRPCClient,
  createTRPCReact,
  loggerLink,
  splitLink,
  unstable_httpBatchStreamLink,
  unstable_httpSubscriptionLink,
} from '@trpc/react-query'
import { type inferRouterInputs, type inferRouterOutputs } from '@trpc/server'
import SuperJSON from 'superjson'
import type { AppRouter } from '~server/api'
import { trpcEndpoint } from '~shared/identity'

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

export const getTrpcLinks = () => {
  const opts = {
    transformer: SuperJSON,
    url: getBaseUrl() + trpcEndpoint,
  }
  return [
    loggerLink({
      enabled: (op) => import.meta.env.DEV || (op.direction === 'down' && op.result instanceof Error),
    }),

    splitLink({
      // uses the httpSubscriptionLink for subscriptions
      condition: (op) => op.type === 'subscription',
      true: unstable_httpSubscriptionLink(opts),
      false: unstable_httpBatchStreamLink(opts),
    }),
  ]
}

function getBaseUrl() {
  if (typeof window !== 'undefined') return window.location.origin
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return `http://localhost:${process.env.PORT ?? 3000}`
}

export const client = createTRPCClient<AppRouter>({
  links: getTrpcLinks(),
})
