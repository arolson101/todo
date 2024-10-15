import { verifyAuth } from '@hono/auth-js'
import { zValidator } from '@hono/zod-validator'
import { and, eq } from 'drizzle-orm'
import { type Context, Hono } from 'hono'
import { stream, streamSSE, streamText } from 'hono/streaming'
import { z } from 'zod'
import { ChangeId, SourceId, UserId } from '~server/db/ids'
import * as schema from '~server/db/schema'
import type { ChangeValues } from '~server/db/types'

function delay(t: number) {
  return new Promise((resolve) => setTimeout(resolve, t))
}

async function getUserId(c: Context) {
  const auth = c.get('authUser')
  // const user = await getAuthUser(c)
  // const { session } = c.get('authUser')
  return UserId.parse(auth?.user?.id)
}

let id = 0

const app = new Hono() //
  .use('*', verifyAuth())

  .get(
    '/', //
    zValidator('param', z.object({ sourceId: SourceId, changeId: ChangeId.nullable() })),
    async (c) => {
      const userId = await getUserId(c)
      const db = c.get('db')
      let { changeId, sourceId } = c.req.valid('param')
      if (changeId === -Infinity) {
        changeId = null
      }
      return streamSSE(
        c, //
        async (stream) => {
          // while (!stream.aborted) {
          const changes = await db.query.changes //
            .findMany({
              where: (change, { eq, and, gt, ne }) =>
                and(
                  eq(change.userId, userId), //
                  gt(change.changeId, changeId ?? 0),
                  ne(change.sourceId, sourceId),
                ),
              columns: { changeId: true, change: true },
            })
          await stream.writeSSE({
            event: 'message',
            data: JSON.stringify(changes),
          })
          await stream.sleep(1000)
          // }
        },
      )
    },
  )

  .post(
    '/', //
    zValidator(
      'json', //
      z.object({ changes: z.array(z.string()), sourceId: SourceId }),
    ),
    async (c) => {
      const userId = await getUserId(c)
      const db = c.get('db')
      let { changes, sourceId } = c.req.valid('json')
      if (changes.length > 0) {
        const values = changes.map((change) => ({
          change,
          sourceId,
          userId,
        })) satisfies Array<ChangeValues>

        const ret = await db //
          .insert(schema.changes)
          .values(values)

        return c.json({ ok: true })
      }
    },
  )

export default app
