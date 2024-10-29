import { index } from 'drizzle-orm/sqlite-core'
import { TodoListChangeId, TodoListId } from '~/db/ids'
import { _array, _blob, _bool, _idNano, _idNum, _refidStr, _text, _timestamp, createTable } from './_util'
import { ydoc } from './types/ydoc-type'

export const todoLists = createTable('todo_list', {
  id: _idNano<TodoListId>('id'),
  baseDoc: ydoc('base_doc'),
  ydoc: ydoc('ydoc').notNull(),
  modified: _bool('modified', true),
  name: _text('name'),
  deleted: _bool('deleted', false),
})

export const todoListUpdates = createTable(
  'todo_list_updates',
  {
    id: _idNum<TodoListChangeId>('id'),
    listId: _refidStr<TodoListId>('list_id', () => todoLists.id).notNull(),
    update: _blob('update').notNull(),
  },
  table => {
    return {
      listIdIdx: index('list_id_idx').on(table.listId),
    }
  },
)
