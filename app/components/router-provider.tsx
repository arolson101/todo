import { RouterProvider as TanstackRouterProvider } from '@tanstack/react-router'
import { useSession } from 'next-auth/react'
import { router } from '~/router'

export function RouterProvider() {
  const session = useSession()
  return <TanstackRouterProvider router={router} context={{ session }} />
}
