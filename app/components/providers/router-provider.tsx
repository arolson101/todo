import { RouterProvider as ReactRouterProvider } from '~/lib/router'
import { router } from '~/router'

export function RouterProvider() {
  return <ReactRouterProvider router={router} />
}
