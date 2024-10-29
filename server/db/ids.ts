import { z } from 'zod'

export { ChangeId } from '~shared/models/change'

export const UserId = z.string().brand<'UserId'>()
export type UserId = z.infer<typeof UserId>

export const SourceId = z.string().brand<'SourceId'>()
export type SourceId = z.infer<typeof SourceId>
