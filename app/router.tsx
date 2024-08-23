import { AppRouter, getTrpcLinks } from '@/lib/trpc'
import { createRouter } from '@tanstack/react-router'
import { createTRPCClient } from '@trpc/client'
import { RouterPending } from './components/ui/router-pending'
import { routeTree } from './routeTree.gen'

// Create a new router instance
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultPendingComponent: RouterPending,
  context: {
    trpc: createTRPCClient<AppRouter>({
      links: getTrpcLinks(),
    }),
  },
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
