import { RouterError } from '~/components/ui/router-error'
import { RouterPending } from '~/components/ui/router-pending'
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
  // const todos = route.useLoaderData()
  const { data: todos, isLoading, isError, error } = api.todo.all.useQuery()

  if (isLoading) {
    return <RouterPending />
  }

  if (isError) {
    return <RouterError reset={() => {}} error={error as unknown as Error} />
  }

  return (
    <div className='p-2'>
      <p>Todos:</p>
      <ul>{todos?.map((todo) => <li key={todo.id}>{todo.text}</li>)}</ul>
    </div>
  )
}

export default route
