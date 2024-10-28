import { count, eq, inArray, notInArray } from 'drizzle-orm'
import { fromUint8Array, toUint8Array } from 'js-base64'
import React, { useEffect } from 'react'
import throttle from 'throttleit'
import * as Y from 'yjs'
import { appDb, schema } from '~/db'
import { api, client } from '~/lib/trpc'
import { YTodoList } from './todo-list'

const sourceId = '123'

export function SyncComponent({ children }: React.PropsWithChildren) {
  api.changes.streamChanges.useQuery({ sourceId })
  return <>children</>
}

export const onUpdateV2 = (todoList: YTodoList) => async (update: Uint8Array) => {
  await appDb.transaction(async tx => {
    // update list
    {
      const { name, ydoc, id } = todoList
      await tx //
        .update(schema.todoLists)
        .set({ name, ydoc, modified: true })
        .where(eq(schema.todoLists.id, id))
    }

    // save update
    await tx //
      .insert(schema.todoListUpdates)
      .values({ listId: todoList.id, update })

    // upsert todos
    for (const { id, useValues, ...set } of todoList.todos) {
      await tx //
        .insert(schema.todos)
        .values({ id, ...set })
        .onConflictDoUpdate({
          target: schema.todos.id,
          set,
        })
    }

    // remove orphaned todos
    await tx //
      .delete(schema.todos)
      .where(
        notInArray(
          schema.todos.id,
          todoList.todos.map(todo => todo.id),
        ),
      )
  })

  syncDb()
}

const MAX_UPDATE_COUNT = 20

export const syncDb = throttle(async () => {
  await appDb.transaction(async tx => {
    const listIdRows = await appDb //
      .selectDistinct({ listId: schema.todoListUpdates.listId })
      .from(schema.todoListUpdates)

    const listIds = listIdRows.map(row => row.listId)
    const changes = [] as string[]

    for (const listId of listIds) {
      const updateCountRow = await appDb //
        .select({ count: count() })
        .from(schema.todoListUpdates)
        .where(eq(schema.todoListUpdates.listId, listId))

      if (!updateCountRow || updateCountRow.length === 0) {
        throw new Error('no update count row!')
      }

      const updateCount = updateCountRow[0].count

      for (let offset = 0; offset < updateCount; offset += MAX_UPDATE_COUNT) {
        const updateRows = await appDb.query.todoListUpdates //
          .findMany({
            where: (todoListIdUpdate, { eq }) => eq(todoListIdUpdate.listId, listId),
            columns: { update: true },
            offset,
            limit: MAX_UPDATE_COUNT,
          })

        const update = Y.mergeUpdatesV2(updateRows.map(row => row.update))
        const change = fromUint8Array(update)
        changes.push(change)
      }
    }

    client.changes.send.query({ changes, sourceId })
  })
}, 15 * 1000)
