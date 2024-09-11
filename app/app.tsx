import { SessionProvider } from 'next-auth/react'
import { HelmetProvider } from 'react-helmet-async'
import { RouterProvider } from '~/components/router-provider'
import { ThemeProvider } from '~/components/theme-provider'
import { TRPCReactProvider } from '~/components/trpc-react-provider'
import './app.css'

export function App() {
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
