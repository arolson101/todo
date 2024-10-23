import { create } from 'zustand'
import { createTodoListSlice, TodoListSlice } from './slices/todo-list-slice'

export type AppState = TodoListSlice

export const useAppStore = create<AppState>()((set, get, ...rest) => {
  return {
    ...createTodoListSlice(set, get, ...rest),
  }
})
