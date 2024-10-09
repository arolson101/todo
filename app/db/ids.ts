import { z } from 'zod'

export const TodoId = z.string().brand<'TodoId'>()
export type TodoId = z.infer<typeof TodoId>
