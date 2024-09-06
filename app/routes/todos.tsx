import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/todos')({
  beforeLoad({ context: { sessionRef } }) {
    if (sessionRef.current.status === 'unauthenticated') {
      throw redirect({ to: '/signin', search: { error: true, redirect: window.location.href } })
    }
  },
  loader: ({ context }) => context.trpc.todo.all.query(),
  component: TodosPage,
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
