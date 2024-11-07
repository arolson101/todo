import { Unsubscribable } from '@trpc/server/observable'
import { count, eq, inArray, notInArray } from 'drizzle-orm'
import { fromUint8Array, toUint8Array } from 'js-base64'
import { nanoid } from 'nanoid'
import throttle from 'throttleit'
import * as Y from 'yjs'
import { StateCreator } from 'zustand'
import { appDb, schema } from '~/db'
import { TodoListChangeId, TodoListId } from '~/db/ids'
import { client } from '~/lib/trpc'
import { ChangeId, ClientChangeSchema, ServerChangeSchema, SourceId } from '~shared/models/change'
import { TodoListSlice } from './todo-list-slice'
import { YTodoList } from './ytodolist'

export interface SyncSlice {
  changeId: ChangeId
  sourceId: SourceId
  isSyncing: boolean
  syncError: Error | undefined
  streamChangeSubscription: Unsubscribable | undefined

  initSync(): Promise<any>
  startSync(): void
  syncUpdateV2(todoList: YTodoList, update: Uint8Array): Promise<any>
  syncDb(): void
}

const MAX_UPDATE_COUNT = 20
const TodoList = 'TodoList'

export const createSyncSlice: StateCreator<SyncSlice & TodoListSlice, [], [], SyncSlice> = (set, get) => ({
  sourceId: null!,
  changeId: null!,
  isSyncing: false,
  syncError: undefined,
  streamChangeSubscription: undefined,

  async initSync() {
    const sourceId = SourceId.parse(localStorage.getItem('sourceId') ?? nanoid())
    localStorage.setItem('sourceId', sourceId)

    const changeId = ChangeId.parse(parseInt(localStorage.getItem('changeId') ?? '0'))
    localStorage.setItem('changeId', changeId.toString())

    set({ sourceId, changeId })
  },

  async startSync() {
    const { isSyncing, changeId, sourceId, streamChangeSubscription: oldSubcription } = get()
    if (isSyncing) return
    set({ isSyncing: true })

    get().syncDb()

    if (oldSubcription) {
      console.log('oldSubcription')
    }

    oldSubcription?.unsubscribe()
    const streamChangeSubscription = client.changes.streamChanges.subscribe(
      { changeId, sourceId },
      {
        async onData(data: ServerChangeSchema[]) {
          // console.log('onData', data)
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
              const { todoList } = get()
              const ydoc = listId === todoList.id ? todoList.ydoc : row.ydoc

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

        onStopped() {
          console.log('sync onStopped')
          set({ isSyncing: false })
        },

        onComplete() {
          console.log('sync onComplete')
          set({ isSyncing: false })
        },

        onError(syncError) {
          console.error(syncError)
          set({ syncError, isSyncing: false })
        },
      },
    )

    set({ streamChangeSubscription })
  },

  async syncUpdateV2(todoList: YTodoList, update: Uint8Array) {
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
    // console.log('syncDb')

    const changes = [] as ClientChangeSchema[]
    const changeIds = [] as TodoListChangeId[]

    await appDb.transaction(async tx => {
      const listIdRows = await tx //
        .selectDistinct({ listId: schema.todoListUpdates.listId })
        .from(schema.todoListUpdates)

      const listIds = listIdRows.map(row => row.listId)

      for (const listId of listIds) {
        const [{ updateCount }] = await tx //
          .select({ updateCount: count() })
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
      console.log(`sending ${changes.length} changes`, changes)
      const { sourceId } = get()
      const ok = await client.changes.send.mutate({
        changes,
        sourceId,
      })

      if (ok) {
        console.log(`clearing ${changeIds.length} pending changes`, changeIds)
        await appDb //
          .delete(schema.todoListUpdates)
          .where(inArray(schema.todoListUpdates.id, changeIds))
      }
    }
  }, 15 * 1000),
})
