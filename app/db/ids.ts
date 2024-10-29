import { z } from 'zod'

export const TodoId = z.string().brand<'TodoId'>()
export type TodoId = z.infer<typeof TodoId>

export const TodoListId = z.string().brand<'TodoListId'>()
export type TodoListId = z.infer<typeof TodoListId>

export const TodoListChangeId = z.string().brand<'TodoListChangeId'>()
export type TodoListChangeId = z.infer<typeof TodoListChangeId>
