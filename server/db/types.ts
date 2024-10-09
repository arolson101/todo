import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import type { InferResultType } from '~server/util/dbUtils'
import { ChangeId, UserId } from './ids'
import * as schema from './schema'

export const User = createSelectSchema(schema.users, { id: UserId })
export type User = z.infer<typeof User>
export const UserValues = createInsertSchema(schema.users).omit({ id: true })
export type UserValues = z.infer<typeof UserValues>

export const Change = createSelectSchema(schema.changes, { changeId: ChangeId, userId: UserId })
export type Change = z.infer<typeof Change>
export const ChangeValues = createInsertSchema(schema.changes).omit({ changeId: true })
export type ChangeValues = z.infer<typeof ChangeValues>

export const UserWithTodos = User.extend({
  todos: z.array(Change),
})
export type UserWithTodos = InferResultType<'users', { todos: true }>

export const ChangeWithUser = Change.extend({
  user: User,
})
export type ChangeWithUser = InferResultType<'changes', { user: true }> //z.infer<typeof ChangeWithUser>;
