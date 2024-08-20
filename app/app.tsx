import { SessionProvider } from '@hono/auth-js/react'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import './app.css'
import { ThemeProvider } from './components/theme-provider'
import { TRPCReactProvider } from './components/trpc-react-provider'
import { routeTree } from './routeTree.gen'

// Create a new router instance
const router = createRouter({ routeTree })

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

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
