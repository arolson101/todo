import { count, eq, notInArray } from 'drizzle-orm'
import { StateCreator } from 'zustand'
import { appDb, schema } from '~/db'
import { TodoId, TodoListId } from '~/db/ids'
import { TodoValues } from '~/db/types'
import { YTodoList } from './todo-list'

export interface TodoListSlice {
  lists: Array<{ id: TodoListId; name: string }>
  todoList: YTodoList

  loadTodoList(id: TodoListId): Promise<void>
  createTodo(values: TodoValues): Promise<void>
  setTodoCompleted(id: TodoId, completed: boolean): Promise<void>
  removeTodo(id: TodoId): Promise<void>
}

export const createTodoListSlice = await (async function init() {
  const lists = await loadLists()
  const todoList = await loadTodoList(lists[0].id)

  const slice: StateCreator<TodoListSlice> = (set, get) => ({
    lists,
    todoList,

    async loadTodoList(id: TodoListId) {
      const todoList = await loadTodoList(id)
      set({ todoList })
    },

    async createTodo(values: TodoValues) {
      get().todoList.add(values)
    },

    async setTodoCompleted(id: TodoId, completed: boolean) {
      get().todoList.get(id).completed = completed
    },

    async removeTodo(id: TodoId) {
      get().todoList.del(id)
    },
  })
  return slice
})()

// utiltity functions

async function loadLists() {
  const [{ count: todoListCount }] = await appDb //
    .select({ count: count() })
    .from(schema.todoLists)

  if (todoListCount === 0) {
    const list = new YTodoList()
    list.name = 'To Do'
    const { id, name, ydoc } = list
    await appDb //
      .insert(schema.todoLists)
      .values({ id, name, ydoc, baseDoc: ydoc })
  }

  const lists = await appDb.query.todoLists.findMany({
    where: (todoLists, { isNotNull }) => isNotNull(todoLists.deleted),
    columns: { id: true, name: true },
  })
  console.assert(lists.length > 0)

  return lists
}

async function loadTodoList(id: TodoListId) {
  const res = await appDb.query.todoLists //
    .findFirst({
      where: (todoLists, { eq }) => eq(todoLists.id, id),
    })
  if (!res) {
    throw new Error(`no todo list with id ${id}`)
  }

  const todoList = new YTodoList(res.ydoc)
  todoList.ydoc.on('updateV2', async () => {
    await appDb.transaction(async tx => {
      // update list
      {
        const { name, ydoc } = todoList
        await tx //
          .update(schema.todoLists)
          .set({ name, ydoc })
          .where(eq(schema.todoLists.id, id))
      }

      // upsert todos
      for (const { id, ...set } of todoList.todos) {
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
  })
  return todoList
}
