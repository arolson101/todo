import { count, eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import * as Y from 'yjs'
import { StateCreator } from 'zustand'
import { appDb, schema } from '~/db'
import { TodoId, TodoListId } from '~/db/ids'
import { TodoValues } from '~/db/types'

export type YTodoList = {
  ydoc: Y.Doc
  id: TodoListId
  name: Y.Text
  items: Y.Array<TodoId>
  todos: Record<TodoId, YTodo>
}
const todoListKey = (key: keyof YTodoList) => key

export type YTodo = {
  id: TodoId
  ymap: Y.Map<TodoId | Y.Text | boolean>
  title: Y.Text
  completed: boolean
}
const todoKey = (key: keyof YTodo) => key

export interface TodoListSlice {
  lists: Array<{ id: TodoListId; name: string }>
  currentList: YTodoList

  loadTodoList(id: TodoListId): Promise<void>
  createTodo(values: TodoValues): Promise<void>
  setTodoCompleted(id: TodoId, completed: boolean): Promise<void>
  removeTodo(id: TodoId): Promise<void>
}

export const createTodoListSlice = await (async function init() {
  const lists = await loadLists()
  const idx = 0 // TODO: save this off as a setting
  const currentList = await loadTodoList(lists[idx].id)

  const slice: StateCreator<TodoListSlice> = (set, get) => ({
    lists,
    currentList,

    async loadTodoList(id: TodoListId): Promise<void> {
      const currentList = await loadTodoList(id)
      set({ currentList })
    },

    async createTodo(values: TodoValues) {
      const currentList = await addTodoToList(get().currentList, values)
      set({ currentList })
    },

    async setTodoCompleted(id: TodoId, completed: boolean) {
      const currentList = await setTodoCompleted(get().currentList, id, completed)
      set({ currentList })
    },

    async removeTodo(id: TodoId) {},
  })
  return slice
})()

// utiltity functions

async function loadLists() {
  const [{ count: todoListCount }] = await appDb //
    .select({ count: count() })
    .from(schema.todoLists)

  if (todoListCount === 0) {
    const defaultTodo = createList(undefined, 'To Do')
    await saveTodoList(defaultTodo, false)
  }

  const lists = await appDb.query.todoLists.findMany({
    where: (todoLists, { isNotNull }) => isNotNull(todoLists.deleted),
    columns: { id: true, name: true },
  })
  console.assert(lists.length > 0)

  return lists
}

function createList(ydoc = new Y.Doc(), defaultName?: string): YTodoList {
  const ymap = ydoc.getMap()
  const id = ymap.set(todoListKey('id'), TodoListId.parse(nanoid()))
  const name = ymap.set(todoListKey('name'), new Y.Text(defaultName))
  const items = ymap.set(todoListKey('items'), new Y.Array<TodoId>())
  const todos = {}
  return {
    ydoc,
    id,
    name,
    items,
    todos,
  }
}

async function addTodoToList(list: YTodoList, values: TodoValues) {
  const nextList = await appDb.transaction(async tx => {
    // update the ydoc
    const todo = list.ydoc.transact(() => {
      const id = TodoId.parse(nanoid())
      const ymap = list.ydoc.getMap(id) satisfies YTodo['ymap']
      ymap.set(todoKey('id'), id)
      const title = ymap.set(todoKey('title'), new Y.Text(values.title))
      const completed = ymap.set(todoKey('completed'), false)
      const todo: YTodo = {
        id,
        ymap,
        title,
        completed,
      }

      list.items.push([id])
      return todo
    })

    // write todo
    tx.insert(schema.todos) //
      .values({
        id: todo.id,
        listId: list.id,
        title: todo.title.toJSON(),
        completed: todo.completed,
      })

    // write updated crdt
    const ydoc = Y.encodeStateAsUpdateV2(list.ydoc)
    tx.update(schema.todoLists) //
      .set({ ydoc })
      .where(eq(schema.todoLists.id, list.id))

    const nextList = {
      ...list,
      todos: {
        ...list.todos,
        [todo.id]: todo,
      },
    }
    saveTodoList(nextList, true)
    return nextList
  })
  return nextList
}

async function setTodoCompleted(list: YTodoList, id: TodoId, completed: boolean) {
  const todo = list.todos[id]
  todo.completed = todo.ymap.set(todoKey('completed'), completed)

  appDb.transaction(async tx => {
    // write todo
    tx.update(schema.todos) //
      .set({ completed })
      .where(eq(schema.todos.id, id))

    // write updated crdt
    const ydoc = Y.encodeStateAsUpdateV2(list.ydoc)
    tx.update(schema.todoLists) //
      .set({ ydoc })
      .where(eq(schema.todoLists.id, list.id))
  })

  return list
}

async function saveTodoList(list: YTodoList, update: boolean) {
  const id = list.id
  const name = list.name.toJSON() as string
  const ydoc = Y.encodeStateAsUpdateV2(list.ydoc)
  if (update) {
    await appDb //
      .update(schema.todoLists)
      .set({ name, ydoc })
      .where(eq(schema.todoLists.id, id))
  } else {
    await appDb //
      .insert(schema.todoLists)
      .values({ id, name, ydoc })
  }
}

async function loadTodoList(id: TodoListId): Promise<YTodoList> {
  const doc = await appDb.query.todoLists //
    .findFirst({
      where: (todoLists, { eq }) => eq(todoLists.id, id),
      columns: { ydoc: true },
    })

  if (!doc) {
    throw new Error('no todo list with id ' + id)
  }

  const ydoc = new Y.Doc()
  Y.applyUpdateV2(ydoc, doc.ydoc)

  const list = createList(ydoc)
  return list
}
