import { createRouter } from '@tanstack/react-router'
import { createTRPCClient } from '@trpc/client'
import { RouterError } from '~/components/ui/router-error'
import { RouterPending } from '~/components/ui/router-pending'
import { AppRouter, getTrpcLinks } from '~/lib/trpc'
import { routeTree } from './routeTree.gen'

// Create a new router instance
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultPendingComponent: RouterPending,
  defaultErrorComponent: RouterError,
  context: {
    trpc: createTRPCClient<AppRouter>({
      links: getTrpcLinks(),
    }),
    session: undefined!,
  },
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
