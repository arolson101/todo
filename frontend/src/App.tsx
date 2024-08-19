import { ThemeProvider } from '@/components/theme-provider'
import { useEffect, useState } from 'react'
import { Button } from './components/ui/button'
import { api } from './lib/api'

function App() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    async function foo() {
      const res = await api.posts.$get()
      const json = await res.json()
      const posts = json.posts
    }

    foo()
  }, [])

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
