import { SessionProvider } from 'next-auth/react'
import { View } from 'react-native'
// import { RouterProvider } from '~/components/router-provider'
import { ThemeProvider } from '~/components/theme-provider'
import { TRPCReactProvider } from '~/components/trpc-react-provider'
import './app.css'

export function App() {
  return (
    <SessionProvider>
      <TRPCReactProvider>
        <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
          <View className='h-10 w-10 bg-blue-500' />
          {/* <RouterProvider /> */}
        </ThemeProvider>
      </TRPCReactProvider>
    </SessionProvider>
  )
}
