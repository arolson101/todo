import { useY } from 'react-yjs'
import * as Y from 'yjs'
import { create } from 'zustand'
import { createTodoListSlice, TodoListSlice } from './slices/todo-list-slice'

export type AppState = TodoListSlice

export const useAppStore = create<AppState>()((set, get, ...rest) => {
  return {
    ...createTodoListSlice(set, get, ...rest),
  }
})

export const useAppStoreY = <T extends Y.AbstractType<any>>(fcn: (state: AppState) => T) => useY(useAppStore(fcn))

export { useY }
