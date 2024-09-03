import { RouterProvider as ReactRouterProvider } from '~/lib/router'
import { createRouter } from '~/lib/router'
import root from '~/routes/_route'

export const router = createRouter([root])

export function RouterProvider() {
  return <ReactRouterProvider router={router} />
}
