import { AuthProvider } from './components/providers/auth-provider'
import { RouterProvider } from './components/providers/router-provider'
import { ThemeProvider } from './components/providers/theme-provider'
import { TRPCReactProvider } from './components/providers/trpc-react-provider'
import { Window } from './components/ui/window'
import './global.css'
import './sqlite'

export function App() {
  return (
    <AuthProvider>
      <TRPCReactProvider>
        <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
          <Window>
            <RouterProvider />
          </Window>
        </ThemeProvider>
      </TRPCReactProvider>
    </AuthProvider>
  )
}
