import { TRPCError } from '@trpc/server'
import { observable } from '@trpc/server/observable'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { ChangeId, SourceId, UserId } from '~server/db/ids'
import * as schema from '~server/db/schema'
import { Change, ChangeValues } from '~server/db/types'
import { zAsyncGenerator } from '~server/util/zAsyncGenerator'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc'

function delay(t: number) {
  return new Promise((resolve) => setTimeout(resolve, t))
}

export const changeRouter = createTRPCRouter({
  randomNumber: publicProcedure //
    .subscription(() => {
      let i = 0
      return observable<number>((emit) => {
        const int = setInterval(() => {
          i++
          console.log('randomNumber', i)
          emit.next(Math.random())
        }, 1000)
        return () => {
          console.log('unsubscribe')
          clearInterval(int)
        }
      })
    }),

  stream: publicProcedure //
    .subscription(async function* (opts) {
      let i = 0
      let aborted = false
      while (!opts.ctx.c.req.raw.signal.aborted) {
        i++
        console.log('stream', i)
        yield i
        await delay(1000)
      }
      console.log('finalized')
    }),

  send: protectedProcedure //
    .input(z.object({ changes: z.array(z.string()), sourceId: SourceId }))
    .query(async ({ input: { sourceId, changes }, ctx }) => {
      if (changes.length > 0) {
        const userId = UserId.parse(ctx.session.user.id)
        const values = changes.map((change) => ({
          change,
          sourceId,
          userId,
        })) satisfies Array<ChangeValues>
        const ret = await ctx.db //
          .insert(schema.changes)
          .values(values)
      }
    }),

  streamChanges: protectedProcedure //
    .input(z.object({ sourceId: SourceId, changeId: ChangeId.nullable() }))
    .output(
      // zAsyncGenerator({
      // yield:
      z.array(
        z.object({
          changeId: ChangeId,
          change: z.string(),
        }),
      ),
      // }),
    )
    .query(async ({ input: { changeId, sourceId }, ctx }) => {
      console.log('subscription called', { changeId, sourceId })
      if (changeId === -Infinity) {
        changeId = null
      }
      const userId = UserId.parse(ctx.session.user.id)
      const changes = await ctx.db.query.changes //
        .findMany({
          where: (change, { eq, and, gt, ne }) =>
            and(
              eq(change.userId, userId), //
              gt(change.changeId, changeId ?? 0),
              ne(change.sourceId, sourceId),
            ),
          columns: { changeId: true, change: true },
        })
      return changes
    }),
})
