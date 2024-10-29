import { create } from 'zustand'
import { createSyncSlice, SyncSlice } from './slices/sync-slice'
import { createTodoListSlice, TodoListSlice } from './slices/todo-list-slice'

type InitState = 'uninitialized' | 'initializing' | 'initialized'

export type AppState = TodoListSlice &
  SyncSlice & {
    initState: InitState
    isInitialized: boolean
    init: () => Promise<void>
  }

export const useAppStore = create<AppState>()((set, get, ...rest) => {
  return {
    ...createSyncSlice(set, get, ...rest),
    ...createTodoListSlice(set, get, ...rest),

    initState: 'uninitialized',
    isInitialized: false,

    async init() {
      if (get().initState !== 'uninitialized') {
        return
      }
      set({ initState: 'initializing' })

      await Promise.allSettled([
        get().initSync(), //
        get().initTodoListSlice(),
      ])

      set({ initState: 'initialized', isInitialized: true })
    },
  }
})
