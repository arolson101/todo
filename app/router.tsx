import { Spinner } from '@/components/ui/spinner'
import { AppRouter, getTrpcLinks } from '@/lib/trpc'
import { createRouter } from '@tanstack/react-router'
import { createTRPCClient } from '@trpc/client'
import { routeTree } from './routeTree.gen'

// Create a new router instance
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultPendingComponent: () => (
    <div className={`p-2 text-2xl`}>
      <Spinner />
    </div>
  ),
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
