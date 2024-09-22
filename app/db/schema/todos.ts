import { AppTodoId } from '~/db/ids'
import { _bool, _idNum, _text, createTable } from './_util'

export const todos = createTable('todos', {
  id: _idNum<AppTodoId>('id'),
  text: _text('text'),
  completed: _bool('completed', false),
})
