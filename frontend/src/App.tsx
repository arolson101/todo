import { ThemeProvider } from '@/components/theme-provider'
import { useState } from 'react'
import { Button } from './components/ui/button'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
        <h1 className='text-3xl font-bold underline'>Hello world!</h1>
        <Button onClick={() => setCount(count - 1)}>-</Button> {count}{' '}
        <Button onClick={() => setCount(count + 1)}>+</Button>
      </ThemeProvider>
    </>
  )
}

export default App
