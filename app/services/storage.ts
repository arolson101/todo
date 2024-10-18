import { useLiveQuery } from 'dexie-react-hooks'
import { eq } from 'drizzle-orm'
import { useState } from 'react'
import { appDb, schema } from '~/db'
import { TodoId } from '~/db/ids'
import { Todo } from '~/db/types'

function liveQuery<T>(fcn: () => Promise<T>) {
  return {
    useLiveQuery: () => useLiveQuery(fcn),
  }
}

function mutation<T>(fcn: (t: T) => Promise<any>) {
  return {
    useMutation: () => {
      const [error, setError] = useState<Error | undefined>()
      const [isPending, setIsPending] = useState(false)

      async function mutateAsync(data: T) {
        try {
          setIsPending(true)
          setError(undefined)
          await fcn(data)
        } catch (err) {
          if (err instanceof Error) {
            setError(err)
          } else {
            setError(new Error(err?.toString()))
          }
        } finally {
          setIsPending(false)
        }
      }

      return { error, isPending, mutateAsync }
    },
  }
}

export const storage = {
  todo: {
    all: liveQuery(async () => {
      return await appDb.query.todos //
        .findMany({
          where: (todo, { eq }) => eq(todo.deleted, false),
        })
    }),

    create: mutation<string>(async (title) => {
      console.log('create', { title })
      const res = await appDb //
        .insert(schema.todos)
        .values({ title })

      console.log('create returned', { res })
    }),

    setCompleted: mutation<{
      id: TodoId //
      completed: Todo['completed']
    }>(async ({ id, completed }) => {
      const res = await appDb //
        .update(schema.todos)
        .set({ completed })
        .where(eq(schema.todos.id, id))

      console.log('setCompleted returned', { res })
    }),

    remove: mutation<TodoId>(async (id) => {
      const res = await appDb //
        .update(schema.todos)
        .set({ deleted: true })
        .where(eq(schema.todos.id, id))

      console.log('remove returned', { res })
    }),
  },
}
