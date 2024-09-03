import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Nav } from '~/components/nav'
import { makeRoute, Outlet } from '~/lib/router'
import { pages } from './_pages'

export default makeRoute({
  path: '/',
  Component: () => (
    <>
      <Nav />
      <hr />
      <Outlet />
      {process.env.DEV && (
        <>
          <ReactQueryDevtools />
        </>
      )}
    </>
  ),
  children: Object.values(pages),
})
