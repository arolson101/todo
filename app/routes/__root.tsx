import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { SessionContextValue } from 'next-auth/react'
import { RefObject } from 'react'
import { Helmet } from 'react-helmet-async'
import { Nav } from '~/components/nav'
import { htmlTitle } from '~shared/identity'

export interface RouterAppContext {
  sessionRef: RefObject<SessionContextValue>
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: () => (
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
  ),
})
