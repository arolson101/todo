import { useQuery } from '@tanstack/react-query'
import { Text, View } from 'react-native'
import { Button } from '~/components/ui/button'
import { RouterError } from '~/components/ui/router-error'
import { RouterPending } from '~/components/ui/router-pending'
import { db, migrationsPromise, schema } from '~/db'
import { makeRoute } from '~/lib/router'

const route = makeRoute({
  path: 'todos',
  Component: TodosPage,
})

function TodosPage() {
  const {
    data: todos,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['todos'],
    queryFn: async () => {
      console.log('waiting for migrations...')
      await migrationsPromise
      console.log('getting todos...')
      return await db.query.todos.findMany()
    },
  })

  async function addTodo() {
    const added = await db
      .insert(schema.todos)
      .values({ text: `todo added at ${Date.now()}` })
      .returning()
    // console.log({ added })
    refetch()
  }

  if (isLoading) {
    // return <RouterPending />
    return <Text>Loading</Text>
  }

  if (isError) {
    // return <RouterError reset={() => {}} error={error as unknown as Error} />
    return <Text>Error: {error.message}</Text>
  }

  return (
    <View className='bg-background p-2'>
      <Text>Todos:</Text>
      <View>{todos?.map(todo => <Text key={todo.id}>{todo.text}</Text>)}</View>
      <Button onPress={addTodo}>
        <Text>Add Todo</Text>
      </Button>
    </View>
  )
}

export default route
