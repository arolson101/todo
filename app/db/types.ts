import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'
import { TodoId, TodoListId } from '~/db/ids'
import * as schema from './schema'

export const Todo = createSelectSchema(schema.todos, { id: TodoId })
export type Todo = z.infer<typeof Todo>
export const TodoValues = createInsertSchema(schema.todos).omit({ id: true, listId: true })
export type TodoValues = z.infer<typeof TodoValues>

export const TodoList = createSelectSchema(schema.todoLists, { id: TodoListId })
export type TodoList = z.infer<typeof TodoList>
export const TodoListValues = createInsertSchema(schema.todoLists).omit({ id: true, deleted: true })
export type TodoListValues = z.infer<typeof TodoListValues>
