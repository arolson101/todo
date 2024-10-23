import { count, eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import * as Y from 'yjs'
import { StateCreator } from 'zustand'
import { appDb, schema } from '~/db'
import { TodoId, TodoListId } from '~/db/ids'
import { Todo, TodoValues } from '~/db/types'

export type YTodoList = {
  ydoc: Y.Doc
  ymap: Y.Map<any>
  yname: Y.Text
  yitems: Y.Array<TodoId>
  ychildren: Y.Map<any>

  id: TodoListId
  name: string
  items: TodoId[]
  todos: Record<TodoId, Todo>
}
const todoListKey = (key: keyof YTodoList) => key
const todoKey = (key: keyof Todo) => key

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

    async removeTodo(id: TodoId) {
      const currentList = await removeTodo(get().currentList, id)
      set({ currentList })
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
    const defaultTodo = createTodoList('To Do')
    const id = defaultTodo.id
    const name = defaultTodo.name
    const ydoc = Y.encodeStateAsUpdateV2(defaultTodo.ydoc)
    await appDb //
      .insert(schema.todoLists)
      .values({ id, name, ydoc })
  }

  const lists = await appDb.query.todoLists.findMany({
    where: (todoLists, { isNotNull }) => isNotNull(todoLists.deleted),
    columns: { id: true, name: true },
  })
  console.assert(lists.length > 0)

  return lists
}

function createTodoList(defaultName?: string): YTodoList {
  const ydoc = new Y.Doc()
  const id = TodoListId.parse(nanoid())
  const ymap = ydoc.getMap()
  ydoc.transact(() => {
    ymap.set(todoListKey('yname'), new Y.Text(defaultName))
    ymap.set(todoListKey('yitems'), new Y.Array<TodoId>())
    ymap.set(todoListKey('ychildren'), new Y.Map<any>())
  })
  return finishTodoList(id, ydoc)
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

  return finishTodoList(id, ydoc)
}

function finishTodoList(id: TodoListId, ydoc: Y.Doc): YTodoList {
  const ymap = ydoc.getMap()
  const yname = ymap.get(todoListKey('yname')) as Y.Text
  const yitems = ymap.get(todoListKey('yitems')) as Y.Array<TodoId>
  const ychildren = ymap.get(todoListKey('ychildren')) as Y.Map<any>

  const name = yname.toJSON()
  const items = yitems.toArray()
  const todos = {} as Record<TodoId, Todo>
  for (const todoId of items) {
    todos[todoId] = getTodoFromDoc(ychildren, id, todoId)
  }

  return {
    ydoc,
    ymap,
    yname,
    yitems,
    ychildren,

    id,
    name,
    items,
    todos,
  }
}

function getTodoFromDoc(ychildren: Y.Map<any>, listId: TodoListId, id: TodoId): Todo {
  console.assert(ychildren.has(id))
  const ymap = ychildren.get(id) as Y.Map<any>
  const title = (ymap.get(todoKey('title')) as Y.Text).toJSON()
  const completed = ymap.get(todoKey('completed')) as Todo['completed']
  return {
    id,
    listId,
    title,
    completed,
  }
}

async function addTodoToList(list: YTodoList, values: TodoValues) {
  // update the ydoc
  const todo = list.ydoc.transact(() => {
    const id = TodoId.parse(nanoid())
    list.yitems.push([id])

    const ymap = list.ychildren.set(id, new Y.Map())
    const title = ymap.set(todoKey('title'), new Y.Text(values.title)).toJSON()
    const completed = ymap.set(todoKey('completed'), false)
    const listId = list.id

    const todo: Todo = {
      id,
      listId,
      title,
      completed,
    }
    return todo
  })

  await appDb.transaction(async tx => {
    // write todo
    await tx
      .insert(schema.todos) //
      .values(todo)

    // write updated crdt
    const ydoc = Y.encodeStateAsUpdateV2(list.ydoc)
    await tx
      .update(schema.todoLists) //
      .set({ ydoc })
      .where(eq(schema.todoLists.id, list.id))
  })

  const items = list.yitems.toArray()
  const nextList = {
    ...list,
    todos: {
      ...list.todos,
      [todo.id]: todo,
    },
    items,
  }

  return nextList
}

async function setTodoCompleted(list: YTodoList, id: TodoId, completed: boolean): Promise<YTodoList> {
  const ymap = list.ychildren.get(id) as Y.Map<any>
  ymap.set(todoKey('completed'), completed)

  await appDb.transaction(async tx => {
    // write todo
    await tx
      .update(schema.todos) //
      .set({ completed })
      .where(eq(schema.todos.id, id))

    // write updated crdt
    const ydoc = Y.encodeStateAsUpdateV2(list.ydoc)
    await tx
      .update(schema.todoLists) //
      .set({ ydoc })
      .where(eq(schema.todoLists.id, list.id))
  })

  return {
    ...list,
    todos: {
      ...list.todos,
      [id]: {
        ...list.todos[id],
        completed,
      },
    },
  }
}

async function removeTodo(list: YTodoList, id: TodoId): Promise<YTodoList> {
  list.ydoc.transact(() => {
    const idx = list.yitems.toArray().indexOf(id)
    list.yitems.delete(idx)
    list.ychildren.delete(id)
  })

  await appDb.transaction(async tx => {
    // remove todo
    await tx //
      .delete(schema.todos)
      .where(eq(schema.todos.id, id))

    // write updated crdt
    const ydoc = Y.encodeStateAsUpdateV2(list.ydoc)
    await tx //
      .update(schema.todoLists)
      .set({ ydoc })
      .where(eq(schema.todoLists.id, list.id))
  })

  const todos = { ...list.todos }
  delete todos[id]

  return {
    ...list,
    todos,
  }
}
