import { index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm/relations'
import { _bool, _id, _refid, _text, createTable } from '../util/dbUtils'
import type { TodoId, UserId } from './ids'

export const users = createTable('users', {
  id: _id<UserId>('id'),
  name: _text('name'),
})

export const todos = createTable(
  'todos',
  {
    id: _id<TodoId>('id'),
    userId: _refid<UserId>('user_id', () => users.id),
    text: _text('text'),
    completed: _bool('completed', false),
  },
  (t) => ({
    user: index('todos_user_id').on(t.userId),
  }),
)

export const usersRelations = relations(users, ({ many }) => ({
  todos: many(todos),
}))

export const todosRelations = relations(todos, ({ one }) => ({
  user: one(users, {
    fields: [todos.userId],
    references: [users.id],
  }),
}))
