import { z } from 'zod'

export const AppTodoId = z.coerce.number().brand<'AppTodoId'>()
export type AppTodoId = z.infer<typeof AppTodoId>
