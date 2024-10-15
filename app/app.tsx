import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'
import { HelmetProvider } from 'react-helmet-async'
import { RouterProvider } from '~/components/router-provider'
import { ThemeProvider } from '~/components/theme-provider'
import './app.css'

const queryClient = new QueryClient()

export function App() {
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
          <HelmetProvider>
            <RouterProvider />
          </HelmetProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  )
}
