import { makeRoute } from '~/lib/router'
import { trpc } from '~/lib/trpc'

const route = makeRoute({
  path: 'todos',
  // beforeLoad({ context: { session } }) {
  //   if (session.status !== 'authenticated') {
  //     throw redirect({ to: '/signin', search: { error: true, redirect: window.location.href } })
  //   }
  // },
  loader: () => trpc.todo.all.query(),
  Component: TodosPage,
})

function TodosPage() {
  const todos = route.useLoaderData()

  return (
    <div className='p-2'>
      <p>Todos:</p>
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>{todo.text}</li>
        ))}
      </ul>
    </div>
  )
}

export default route
