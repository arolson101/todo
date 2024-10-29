import { SessionProvider } from 'next-auth/react'
import { useEffect } from 'react'
import { HelmetProvider } from 'react-helmet-async'
import { RouterProvider } from '~/components/router-provider'
import { ThemeProvider } from '~/components/theme-provider'
import { TRPCReactProvider } from '~/components/trpc-react-provider'
import './app.css'
import './db/sqlite'
import { useAppStore } from './store'

export function App() {
  const init = useAppStore(s => s.init)
  useEffect(() => {
    init()
  }, [init])

  return (
    <SessionProvider>
      <TRPCReactProvider>
        <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
          <HelmetProvider>
            <RouterProvider />
          </HelmetProvider>
        </ThemeProvider>
      </TRPCReactProvider>
    </SessionProvider>
  )
}
