import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/todos')({
  component: TodosPage,
  loader: ({ context }) => context.trpc.todo.all.query(),
})

function TodosPage() {
  const todos = Route.useLoaderData()

  return (
    <div className='p-2'>
      <p>Todos:</p>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>{todo.text}</li>
        ))}
      </ul>
    </div>
  )
}
