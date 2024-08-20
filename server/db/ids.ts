import { z } from 'zod'

export const UserId = z.string().brand<'UserId'>()
export type UserId = z.infer<typeof UserId>

export const TodoId = z.coerce.number().brand<'TodoId'>()
export type TodoId = z.infer<typeof TodoId>
