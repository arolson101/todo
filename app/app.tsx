import { SessionProvider } from '@hono/auth-js/react'
import { RouterProvider } from '@tanstack/react-router'
import { ThemeProvider } from '~/components/theme-provider'
import { TRPCReactProvider } from '~/components/trpc-react-provider'
import './app.css'
import { router } from './router'

export function App() {
  return (
    <SessionProvider>
      <TRPCReactProvider>
        <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
          <RouterProvider router={router} />
        </ThemeProvider>
      </TRPCReactProvider>
    </SessionProvider>
  )
}
