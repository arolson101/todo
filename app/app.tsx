import { View } from 'react-native'
import { Text } from 'react-native'
import { AuthProvider } from '~/components/providers/auth-provider'
// import { RouterProvider } from '~/components/router-provider'
import { ThemeProvider } from '~/components/providers/theme-provider'
import { TRPCReactProvider } from '~/components/providers/trpc-react-provider'
import './global.css'

export function App() {
  return (
    <AuthProvider>
      <TRPCReactProvider>
        <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
          <View className='h-10 w-10 bg-blue-500' />
          {/* // <RouterProvider /> */}
        </ThemeProvider>
      </TRPCReactProvider>
    </AuthProvider>
  )
}
