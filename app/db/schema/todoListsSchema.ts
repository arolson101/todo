import { TodoListId } from '~/db/ids'
import { _array, _blob, _bool, _idNano, _text, _timestamp, createTable } from './_util'

export const todoLists = createTable('todo_list', {
  id: _idNano<TodoListId>('id'),
  ydoc: _blob('ydoc').notNull(),
  name: _text('name'),
  deleted: _bool('deleted', false),
})
