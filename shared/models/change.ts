import { z } from 'zod'

export const ChangeId = z.number().brand<'ChangeId'>()
export type ChangeId = z.infer<typeof ChangeId>

export const changeSchema = z.object({
  docType: z.string(),
  docId: z.string(),
  update: z.string(),
})

export type ChangeSchema = z.infer<typeof changeSchema>
