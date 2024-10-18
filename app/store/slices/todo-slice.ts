import { eq } from 'drizzle-orm'
import { StateCreator } from 'zustand'
import { appDb, schema } from '~/db'
import { TodoId } from '~/db/ids'
import { Todo, TodoValues } from '~/db/types'

export interface TodoSlice {
  todos: Todo[]
  todosInitialized: boolean

  initTodos(): Promise<void>
  createTodo(values: TodoValues): Promise<void>
  setTodoCompleted(id: TodoId, completed: boolean): Promise<void>
  removeTodo(id: TodoId): Promise<void>
}

export const createTodoSlice: StateCreator<TodoSlice> = (set, get) => ({
  todos: [],
  todosInitialized: false,

  async initTodos() {
    if (get().todosInitialized) {
      return
    }
    set({ todosInitialized: true })

    const todos = await appDb.query.todos //
      .findMany({
        where: (todo, { eq }) => eq(todo.deleted, false),
      })
    set({ todos })
  },

  async createTodo(values: TodoValues) {
    console.log('create', { values })
    const newTodo = await appDb //
      .insert(schema.todos)
      .values(values)
      .returning()

    console.log('create returned', newTodo)

    const todos = get().todos.concat(newTodo)
    set({ todos })
  },

  async setTodoCompleted(id: TodoId, completed: boolean) {
    const res = await appDb //
      .update(schema.todos)
      .set({ completed })
      .where(eq(schema.todos.id, id))
      .returning()

    console.log('setCompleted returned', { res })
    const todos = get().todos.map((todo) => (todo.id === id ? res[0] : todo))
    set({ todos })
  },

  async removeTodo(id: TodoId) {
    const res = await appDb //
      .update(schema.todos)
      .set({ deleted: true })
      .where(eq(schema.todos.id, id))

    console.log('remove returned', { res })

    const todos = get().todos.filter((todo) => todo.id !== id)
    set({ todos })
  },
})
