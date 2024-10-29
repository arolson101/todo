import { create } from 'zustand'
import { createSyncSlice, SyncSlice } from './slices/sync-slice'
import { createTodoListSlice, TodoListSlice } from './slices/todo-list-slice'

export type AppState = TodoListSlice &
  SyncSlice & {
    init: () => Promise<void>
  }

export const useAppStore = create<AppState>()((set, get, ...rest) => {
  return {
    ...createSyncSlice(set, get, ...rest),
    ...createTodoListSlice(set, get, ...rest),

    async init() {
      Promise.allSettled([
        get().initSync(), //
        get().initTodoListSlice(),
      ])
    },
  }
})
