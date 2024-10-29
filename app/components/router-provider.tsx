import { RouterProvider as TanstackRouterProvider } from '@tanstack/react-router'
import { useSession } from 'next-auth/react'
import { useEffect, useRef } from 'react'
import { router } from '~/router'
import { useAppStore } from '~/store'

export function RouterProvider() {
  // routes' `beforeLoad` seems to use a cached context rather than the most up-to-date version
  const session = useSession()
  const sessionRef = useRef<typeof session>(session)
  sessionRef.current = session

  const startSync = useAppStore(state => state.startSync)
  useEffect(() => {
    startSync()
  }, [session, startSync])

  return <TanstackRouterProvider router={router} context={{ sessionRef }} />
}
