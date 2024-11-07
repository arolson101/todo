import { count, eq } from 'drizzle-orm'
import { StateCreator } from 'zustand'
import { appDb, schema } from '~/db'
import { TodoId, TodoListId } from '~/db/ids'
import { TodoValues } from '~/db/types'
import { SyncSlice } from './sync-slice'
import { YTodoList } from './ytodolist'

export interface TodoListSlice {
  lists: Array<{ id: TodoListId; name: string }>
  todoList: YTodoList

  initTodoList(): Promise<void>
  loadTodoList(id: TodoListId): Promise<void>
  createTodo(values: TodoValues): Promise<void>
  setTodoCompleted(id: TodoId, completed: boolean): Promise<void>
  removeTodo(id: TodoId): Promise<void>
}

export const createTodoListSlice: StateCreator<SyncSlice & TodoListSlice, [], [], TodoListSlice> = (set, get) => ({
  lists: [],
  todoList: null!,

  async initTodoList() {
    const [{ todoListCount }] = await appDb //
      .select({ todoListCount: count() })
      .from(schema.todoLists)

    if (todoListCount === 0) {
      const list = new YTodoList(TodoListId.parse('specialfirstid'))
      list.name = 'To Do'
      const { id, name, ydoc } = list
      await appDb //
        .insert(schema.todoLists)
        .values({ id, name, ydoc })
    }

    const lists = await appDb.query.todoLists.findMany({
      where: (todoLists, { isNotNull }) => isNotNull(todoLists.deleted),
      columns: { id: true, name: true },
    })
    console.assert(lists.length > 0)

    set({ lists })
    get().loadTodoList(lists[0].id)
  },

  async loadTodoList(id: TodoListId) {
    const res = await appDb.query.todoLists //
      .findFirst({
        where: (todoLists, { eq }) => eq(todoLists.id, id),
      })
    if (!res) {
      throw new Error(`no todo list with id ${id}`)
    }

    const todoList = new YTodoList(id, res.ydoc)
    todoList.ydoc.on('updateV2', async (update, _, ydoc) => {
      // save doc to db
      await appDb //
        .update(schema.todoLists)
        .set({ ydoc })
        .where(eq(schema.todoLists.id, id))

      get().syncUpdateV2(todoList, update)
    })

    // clean up old list
    get().todoList?.destroy()

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
