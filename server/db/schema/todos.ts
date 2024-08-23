import { index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import type { TodoId, UserId } from '~server/db/ids'
import { _bool, _idNum, _idUUID, _refidUUID, _text, _timestamp, createTable } from '~server/util/dbUtils'
import { users } from './auth'

export const todos = createTable(
  'todo',
  {
    id: _idNum<TodoId>('id'),
    userId: _refidUUID<UserId>('user_id', () => users.id),
    text: _text('text'),
    completed: _bool('completed', false),
  },
  (t) => ({
    user: index('todos_user_id').on(t.userId),
  }),
)

export const todosRelations = relations(todos, ({ one }) => ({
  user: one(users, {
    fields: [todos.userId],
    references: [users.id],
  }),
}))
