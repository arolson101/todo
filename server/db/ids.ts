import { z } from 'zod'

export const UserId = z.string().brand<'UserId'>()
export type UserId = z.infer<typeof UserId>

export const ChangeId = z.number().brand<'ChangeId'>()
export type ChangeId = z.infer<typeof ChangeId>

export const SourceId = z.string().brand<'SourceId'>()
export type SourceId = z.infer<typeof SourceId>
