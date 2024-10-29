import { nanoid } from 'nanoid'
import { useY } from 'react-yjs'
import * as Y from 'yjs'
import { TodoId, TodoListId } from '~/db/ids'
import { Todo, TodoValues } from '~/db/types'
import { YProxy, yproxy } from './yproxy'

export type YTodo = YProxy<Todo>

function todoFactory(id: TodoId, listId: TodoListId, ymap: Y.Map<any>): YTodo {
  const t = yproxy<YTodo>(ymap, { id, listId }, ['title', 'completed'])
  return t
}

export class YTodoList {
  #ydoc: Y.Doc
  #id: TodoListId
  #ymap: Y.Map<any>
  #name: Y.Text
  #idsInOrder: Y.Array<TodoId>

  constructor(ydoc?: Y.Doc) {
    this.#ydoc = ydoc ?? new Y.Doc()
    this.#id = TodoListId.parse(nanoid())
    this.#ymap = this.#ydoc.getMap()
    this.#name = this.#ydoc.getText('name')
    this.#idsInOrder = this.#ydoc.getArray('idsInOrder')
  }

  get ydoc() {
    return this.#ydoc
  }

  get id() {
    return this.#id
  }

  get name(): string {
    const name = this.#name.toJSON()
    return name
  }

  set name(value: string) {
    this.#ydoc.transact(() => {
      this.#name.delete(0, this.#name.length)
      this.#name.insert(0, value)
    })
  }

  add(values: TodoValues) {
    this.#ydoc.transact(() => {
      const id = TodoId.parse(nanoid())
      const ymap = this.#ymap.set(id, new Y.Map<any>())
      const todo = todoFactory(id, this.#id, ymap)
      if (typeof values.title !== 'undefined') {
        todo.title = values.title
      }
      if (typeof values.completed !== 'undefined') {
        todo.completed = values.completed
      }
      this.#idsInOrder.push([id])
    })
  }

  get(id: TodoId) {
    return todoFactory(id, this.#id, this.#ymap.get(id))
  }

  del(id: TodoId) {
    this.#ydoc.transact(() => {
      const idx = this.#idsInOrder.toArray().indexOf(id)
      this.#idsInOrder.delete(idx)
      this.#ymap.delete(id)
    })
  }

  get todos() {
    return this.#idsInOrder.map(id => this.get(id))
  }

  useTodos() {
    const idsInOrder = useY(this.#idsInOrder)
    return idsInOrder.map(id => this.get(id))
  }

  useName() {
    return useY(this.#name)
  }

  destroy() {
    this.#ydoc.destroy()
  }
}
