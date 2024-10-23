import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { CreateTRPCClient } from '@trpc/client'
import { SessionContextValue } from 'next-auth/react'
import { RefObject } from 'react'
import { Helmet } from 'react-helmet-async'
import { Nav } from '~/components/nav'
import { AppRouter } from '~/lib/trpc'
import { htmlTitle } from '~shared/identity'

export interface RouterAppContext {
  trpc: CreateTRPCClient<AppRouter>
  sessionRef: RefObject<SessionContextValue>
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: () => {
    return (
      <>
        <Helmet>
          <title>{htmlTitle}</title>
        </Helmet>
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
    )
  },
})
