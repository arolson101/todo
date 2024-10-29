import { z } from 'zod'

export const SourceId = z.string().brand<'SourceId'>()
export type SourceId = z.infer<typeof SourceId>

export const ChangeId = z.number().brand<'ChangeId'>()
export type ChangeId = z.infer<typeof ChangeId>

export const ClientChangeSchema = z.object({
  docType: z.string(),
  docId: z.string(),
  update: z.string(),
})

export type ClientChangeSchema = z.infer<typeof ClientChangeSchema>

export const ServerChangeSchema = ClientChangeSchema.merge(
  z.object({
    changeId: ChangeId,
  }),
)

export type ServerChangeSchema = z.infer<typeof ServerChangeSchema>
