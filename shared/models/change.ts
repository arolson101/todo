import { z } from 'zod'

export const SourceId = z.string().brand<'SourceId'>()
export type SourceId = z.infer<typeof SourceId>

export const ChangeId = z.coerce.number().brand<'ChangeId'>()
export type ChangeId = z.infer<typeof ChangeId>

export const ChangeSchema = z.object({
  docType: z.string(),
  docId: z.string(),
  update: z.string(),
})

export type ChangeSchema = z.infer<typeof ChangeSchema>
