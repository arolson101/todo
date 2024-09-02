import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Nav } from '~/components/nav'
import { makeRoute, Outlet } from '~/lib/router'
import about from './about'
import index from './index'
import signin from './signin'
import signout from './signout'
import todos from './todos'

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
  children: [
    index, //
    about,
    todos,
    signin,
    signout,
  ],
})
