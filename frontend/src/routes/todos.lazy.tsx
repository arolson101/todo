import { api } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/todos')({
  component: TodosPage,
})

async function getTodos() {
  const res = await api.todos.$get()
  if (!res.ok) {
    throw new Error('server error')
  }
  const data = await res.json()
  return data
}

function TodosPage() {
  const { isPending, error, data } = useQuery({
    queryKey: ['todos'],
    queryFn: getTodos,
  })

  return (
    <div className='p-2'>
      <p>Todos:</p>
      {data && (
        <ul>
          {data.todos.map((todo) => (
            <li key={todo.id}>{todo.text}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
