import { create } from 'zustand'
import { createTodoSlice, TodoSlice } from './slices/todo-slice'

export type AppState = TodoSlice & {
  init(): void
}

export const useAppStore = create<AppState>()((set, get, ...rest) => ({
  ...createTodoSlice(set, get, ...rest),

  init() {
    get().initTodos()
  },
}))
