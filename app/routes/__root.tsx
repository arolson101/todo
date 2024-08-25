import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { CreateTRPCClient } from '@trpc/client'
import { SessionContextValue } from 'next-auth/react'
import { Nav } from '~/components/nav'
import { AppRouter } from '~/lib/trpc'

export interface RouterAppContext {
  trpc: CreateTRPCClient<AppRouter>
  session: SessionContextValue
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: () => (
    <>
      <Nav />
      <hr />
      <Outlet />
      {import.meta.env.DEV && (
        <>
          <TanStackRouterDevtools />
          <ReactQueryDevtools />
        </>
      )}
    </>
  ),
})
