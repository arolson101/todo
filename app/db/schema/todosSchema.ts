import { TodoId, TodoListId } from '~/db/ids'
import { _bool, _idNano, _refidStr, _text, _timestamp, createTable } from './_util'
import { todoLists } from './todoListsSchema'

export const todos = createTable('todos', {
  id: _idNano<TodoId>('id'),
  listId: _refidStr<TodoListId>('list_id', () => todoLists.id),
  title: _text('title'),
  completed: _bool('completed', false),
})
