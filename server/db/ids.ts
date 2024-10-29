import { z } from 'zod'

export { SourceId, ChangeId } from '~shared/models/change'

export const UserId = z.string().brand<'UserId'>()
export type UserId = z.infer<typeof UserId>
