import { count, eq, notInArray } from 'drizzle-orm'
import { fromUint8Array, toUint8Array } from 'js-base64'
import throttle from 'throttleit'
import * as Y from 'yjs'
import { StateCreator } from 'zustand'
import { appDb, schema } from '~/db'
import { TodoListId } from '~/db/ids'
import { client } from '~/lib/trpc'
import { ChangeSchema } from '~shared/models/change'
import { YTodoList } from './todo-list'
import { TodoListSlice } from './todo-list-slice'

export interface SyncSlice {
  changeId: number
  sourceId: '123'

  initSync(): Promise<any>
  onUpdateV2: (todoList: YTodoList) => (update: Uint8Array) => Promise<any>
  onData(data: ChangeSchema[]): Promise<void>
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
    const { onData } = get()
    client.changes.streamChanges.subscribe({ changeId, sourceId }, { onData })

    set({ sourceId, changeId })
  },

  async onData(data: ChangeSchema[]) {
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
          // TODO
          // changeId = entry.changeId

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
    await appDb.transaction(async tx => {
      const listIdRows = await appDb //
        .selectDistinct({ listId: schema.todoListUpdates.listId })
        .from(schema.todoListUpdates)

      const listIds = listIdRows.map(row => row.listId)
      const changes = [] as ChangeSchema[]

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
          const updateRows = await tx.query.todoListUpdates //
            .findMany({
              where: (todoListIdUpdate, { eq }) => eq(todoListIdUpdate.listId, listId),
              columns: { update: true },
              offset,
              limit: MAX_UPDATE_COUNT,
            })

          const update = Y.mergeUpdatesV2(updateRows.map(row => row.update))
          changes.push({ update: fromUint8Array(update), docType: TodoList, docId: listId })
        }
      }

      const { sourceId } = get()
      client.changes.send.query({
        changes,
        sourceId,
      })
    })
  }, 15 * 1000),
})
