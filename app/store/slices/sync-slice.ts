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
import { ChangeId, ChangeSchema, SourceId } from '~shared/models/change'
import { TodoListSlice } from './todo-list-slice'
import { YTodoList } from './ytodolist'

export interface SyncSlice {
  lastEventId: ChangeId | undefined
  sourceId: SourceId
  isSyncing: boolean
  syncError: Error | undefined
  streamChangeSubscription: Unsubscribable | undefined

  initSync(): Promise<any>
  startSync(): void
  syncUpdateV2(todoList: YTodoList, update: Uint8Array, origin: any): Promise<any>
  syncDb(): void
}

export const REMOTE_ORIGIN = 'remote'
const THROTTLE_UPDATE_TIME_MS = 1
const MAX_UPDATE_COUNT = 20
const TODO_LIST_DOC_TYPE = 'TodoList'

export const createSyncSlice: StateCreator<SyncSlice & TodoListSlice, [], [], SyncSlice> = (set, get) => ({
  sourceId: null!,
  lastEventId: undefined,
  isSyncing: false,
  syncError: undefined,
  streamChangeSubscription: undefined,

  async initSync() {
    const sourceId = SourceId.parse(localStorage.getItem('sourceId') ?? nanoid())
    localStorage.setItem('sourceId', sourceId)

    const { data: lastEventId } = ChangeId.safeParse(localStorage.getItem('lastEventId'))

    set({ sourceId, lastEventId })
  },

  async startSync() {
    const { isSyncing, lastEventId, sourceId, streamChangeSubscription: oldSubcription } = get()
    if (isSyncing) return
    set({ isSyncing: true })

    get().syncDb()

    oldSubcription?.unsubscribe()

    const streamChangeSubscription = client.changes.streamChanges.subscribe(
      { lastEventId, sourceId },
      {
        async onData([id, data]) {
          await appDb.transaction(async tx => {
            const todoListUpdates = data.filter(update => update.docType === TODO_LIST_DOC_TYPE)
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
                Y.applyUpdateV2(ydoc, update, REMOTE_ORIGIN)
              }

              await tx //
                .update(schema.todoLists)
                .set({ ydoc })
                .where(eq(schema.todoLists.id, listId))
            }

            localStorage.setItem('lastEventId', id.toString())
            set({ lastEventId: ChangeId.parse(id) })
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

  async syncUpdateV2(todoList: YTodoList, update: Uint8Array, origin: any) {
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
      if (origin !== REMOTE_ORIGIN) {
        await tx //
          .insert(schema.todoListUpdates)
          .values({ listId: todoList.id, update })
      }

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
    const changes = [] as ChangeSchema[]
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
          changes.push({ update, docType: TODO_LIST_DOC_TYPE, docId: listId })
          changeIds.push(...updateRows.map(row => row.id))
        }
      }
    })

    if (changes.length) {
      const { sourceId } = get()
      const ok = await client.changes.send.mutate({
        changes,
        sourceId,
      })

      if (ok) {
        await appDb //
          .delete(schema.todoListUpdates)
          .where(inArray(schema.todoListUpdates.id, changeIds))
      }
    }
  }, THROTTLE_UPDATE_TIME_MS),
})
