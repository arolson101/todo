import { useLiveQuery } from 'dexie-react-hooks'
import { nanoid } from 'nanoid'
import { useState } from 'react'
import { db } from '~/db/db'
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
      return await db.todos //
        .where('deleted')
        .notEqual(1)
        .toArray()
    }),

    create: mutation<string>(async (title) => {
      console.log('create', { title })
      const res = await db.todos.add({
        id: TodoId.parse(nanoid()),
        deleted: 0,
        title,
        completed: false,
      })
      console.log('create returned', { res })

    }),

    setCompleted: mutation<{
      id: TodoId //
      completed: Todo['completed']
    }>(async ({ id, completed }) => {
      await db.todos.update(id, { completed })
    }),

    remove: mutation<TodoId>(async (id) => {
      await db.todos.update(id, { deleted: 1 })
    }),
  },
}
