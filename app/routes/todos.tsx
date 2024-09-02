import { makeRoute } from '~/lib/router'
import { api, trpc } from '~/lib/trpc'

const route = makeRoute({
  path: 'todos',
  // beforeLoad({ context: { session } }) {
  //   if (session.status !== 'authenticated') {
  //     throw redirect({ to: '/signin', search: { error: true, redirect: window.location.href } })
  //   }
  // },
  // loader: () => trpc.todo.all.query(),
  Component: TodosPage,
})

function TodosPage() {
  const { data: todos, isLoading } = api.todo.all.useQuery()

  return (
    <div className='p-2'>
      <p>Todos:</p>
      {isLoading ? <div>Loading...</div> : null}
      <ul>{todos?.map(todo => <li key={todo.id}>{todo.text}</li>)}</ul>
    </div>
  )
}

export default route
