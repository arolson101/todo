import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import type { InferResultType } from '~server/util/dbUtils'
import { TodoId, UserId } from './ids'
import * as schema from './schema'

export const User = createSelectSchema(schema.users, { id: UserId })
export type User = z.infer<typeof User>
export const UserValues = createInsertSchema(schema.users).omit({ id: true })
export type UserValues = z.infer<typeof UserValues>

export const Todo = createSelectSchema(schema.todos, { id: TodoId, userId: UserId })
export type Todo = z.infer<typeof Todo>
export const TodoValues = createInsertSchema(schema.todos).omit({ id: true, userId: true })
export type TodoValues = z.infer<typeof TodoValues>

export const UserWithTodos = User.extend({
  todos: z.array(Todo),
})
export type UserWithTodos = InferResultType<'users', { todos: true }>

export const TodoWithUser = Todo.extend({
  user: User,
})
export type TodoWithUser = InferResultType<'todos', { user: true }> //z.infer<typeof TodoWithUser>;
