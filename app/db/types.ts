import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { TodoId } from '~/db/ids'
import * as schema from './schema'

export const Todo = createSelectSchema(schema.todos, { id: TodoId })
export type Todo = z.infer<typeof Todo>
export const TodoValues = createInsertSchema(schema.todos).omit({ id: true, deleted: true })
export type TodoValues = z.infer<typeof TodoValues>
