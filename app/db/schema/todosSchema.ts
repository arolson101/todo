import { TodoId } from '~/db/ids'
import { _bool, _idNano, _text, _timestamp, createTable } from './_util'

export const todos = createTable('todos', {
  id: _idNano<TodoId>('id'),
  title: _text('title'),
  completed: _bool('completed', false),
  deleted: _bool('deleted', false),
})
