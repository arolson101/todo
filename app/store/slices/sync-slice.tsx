import { count, eq, inArray, notInArray } from 'drizzle-orm'
import { fromUint8Array, toUint8Array } from 'js-base64'
import throttle from 'throttleit'
import * as Y from 'yjs'
import { StateCreator } from 'zustand'
import { appDb, schema } from '~/db'
import { TodoListChangeId, TodoListId } from '~/db/ids'
import { client } from '~/lib/trpc'
import { ClientChangeSchema, ServerChangeSchema } from '~shared/models/change'
import { TodoListSlice } from './todo-list-slice'
import { YTodoList } from './ytodolist'

export interface SyncSlice {
  changeId: number
  sourceId: '123'

  initSync(): Promise<any>
  onUpdateV2: (todoList: YTodoList) => (update: Uint8Array) => Promise<any>
  onServerChange(data: ServerChangeSchema[]): Promise<void>
  syncDb(): void
}

const MAX_UPDATE_COUNT = 20
const TodoList = 'TodoList'

export const createSyncSlice: StateCreator<SyncSlice & TodoListSlice, [], [], SyncSlice> = (set, get) => ({
  sourceId: '123',
  changeId: 0,

  async initSync() {
    const changeId = 0
    const sourceId = '123'

    // subscribe to changes
    const onData = get().onServerChange
    client.changes.streamChanges.subscribe({ changeId, sourceId }, { onData })

    set({ sourceId, changeId })
  },

  async onServerChange(data: ServerChangeSchema[]) {
    await appDb.transaction(async tx => {
      let changeId = get().changeId
      const todoListUpdates = data.filter(update => update.docType === TodoList)
      const groupedUpdates = Object.groupBy(todoListUpdates, update => update.docId)
      for (const [docId, updates] of Object.entries(groupedUpdates)) {
        if (!updates) continue

        const listId = TodoListId.parse(docId)
        const row = await tx.query.todoLists.findFirst({
          where: (todoLists, { eq }) => eq(todoLists.id, listId),
          columns: { ydoc: true },
        })

        if (!row) continue
        const ydoc = listId === get().todoList.id ? get().todoList.ydoc : row.ydoc

        for (const entry of updates) {
          const update = toUint8Array(entry.update)
          changeId = entry.changeId

          Y.applyUpdateV2(ydoc, update)
        }

        await tx //
          .update(schema.todoLists)
          .set({ ydoc })
          .where(eq(schema.todoLists.id, listId))
      }

      set({ changeId })
    })
  },

  onUpdateV2: (todoList: YTodoList) => async (update: Uint8Array) => {
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

    get().syncDb()
  },

  syncDb: throttle(async () => {
    const changes = [] as ClientChangeSchema[]
    const changeIds = [] as TodoListChangeId[]

    await appDb.transaction(async tx => {
      const listIdRows = await appDb //
        .selectDistinct({ listId: schema.todoListUpdates.listId })
        .from(schema.todoListUpdates)

      const listIds = listIdRows.map(row => row.listId)

      for (const listId of listIds) {
        const [{ count: updateCount }] = await appDb //
          .select({ count: count() })
          .from(schema.todoListUpdates)
          .where(eq(schema.todoListUpdates.listId, listId))

        for (let offset = 0; offset < updateCount; offset += MAX_UPDATE_COUNT) {
          const updateRows = await tx.query.todoListUpdates //
            .findMany({
              where: (todoListIdUpdate, { eq }) => eq(todoListIdUpdate.listId, listId),
              columns: { id: true, update: true },
              offset,
              limit: MAX_UPDATE_COUNT,
            })

          const mergedUpdates = Y.mergeUpdatesV2(updateRows.map(row => row.update))
          const update = fromUint8Array(mergedUpdates)
          changes.push({ update, docType: TodoList, docId: listId })
          changeIds.push(...updateRows.map(row => row.id))
        }
      }
    })

    if (changes.length) {
      console.log(`sending ${changes.length} changes`)
      const { sourceId } = get()
      const ok = await client.changes.send.mutate({
        changes,
        sourceId,
      })

      if (ok) {
        console.log(`clearing ${changeIds.length} pending changes`)
        await appDb //
          .delete(schema.todoListUpdates)
          .where(inArray(schema.todoListUpdates.id, changeIds))
      }
    }
  }, 15 * 1000),
})
