import {
  createTRPCClient,
  createTRPCReact,
  createWSClient,
  loggerLink,
  splitLink,
  unstable_httpBatchStreamLink,
  wsLink,
} from '@trpc/react-query'
import { type inferRouterInputs, type inferRouterOutputs } from '@trpc/server'
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

const wsClient = createWSClient({
  url: `${getWsUrl()}api/trpc`,
})

export const getTrpcLinks = () => {
  const opts = {
    transformer: SuperJSON,
  }
  return [
    loggerLink({
      enabled: (op) => import.meta.env.DEV || (op.direction === 'down' && op.result instanceof Error),
    }),

    splitLink({
      condition: (op) => op.type === 'subscription',
      true: wsLink({ ...opts, client: wsClient }),
      false: unstable_httpBatchStreamLink({ ...opts, url: `${getBaseUrl()}/api/trpc` }),
    }),
  ]
}

function getBaseUrl() {
  if (typeof window !== 'undefined') return window.location.origin
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return `http://localhost:${process.env.PORT ?? 3000}`
}

function getWsUrl() {
  const url = new URL(getBaseUrl())
  url.protocol = url.protocol === 'https' ? 'wss' : 'ws'
  url.port = '3001'
  return url.toString()
}

export const client = createTRPCClient<AppRouter>({
  links: getTrpcLinks(),
})
