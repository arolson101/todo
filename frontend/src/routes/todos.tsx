import { api } from '@/lib/api'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/todos')({
  component: TodosPage,
})

function TodosPage() {
  const { data: todos } = api.todo.all.useQuery()

  return (
    <div className='p-2'>
      <p>Todos:</p>
      {todos && (
        <ul>
          {todos.map((todo) => (
            <li key={todo.id}>{todo.text}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
