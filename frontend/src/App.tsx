import { ThemeProvider } from '@/components/theme-provider'
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query'
import { useState } from 'react'
import { Button } from './components/ui/button'
import { api } from './lib/api'

// Create a client
const queryClient = new QueryClient()

async function getTodos() {
  const res = await api.todos.$get()
  if (!res.ok) {
    throw new Error('server error')
  }
  const data = await res.json()
  return data
}

const QueryTest = () => {
  const { isPending, error, data } = useQuery({
    queryKey: ['todos'],
    queryFn: getTodos,
  })

  return (
    <>
      <p>Todos:</p>
      {data && (
        <ul>
          {data.posts.map((post) => (
            <li key={post.id}>{post.text}</li>
          ))}
        </ul>
      )}
    </>
  )
}

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
          <h1 className='text-3xl font-bold underline'>Hello world!</h1>
          <Button onClick={() => setCount(count - 1)}>-</Button> {count}{' '}
          <Button onClick={() => setCount(count + 1)}>+</Button>
          <hr />
          <QueryTest />
        </ThemeProvider>
      </QueryClientProvider>
    </>
  )
}

export default App
